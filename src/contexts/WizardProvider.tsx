import React, { createContext, useContext, useEffect, useState } from 'react'
import { ExtensionContext2 } from '@looker/extension-sdk-react'
import { useStore } from './StoreProvider'
import { BQModelState, ResultsTableHeaderItem, Step2State, Step5State, WizardState } from '../types'
import { IQuery } from "@looker/sdk/lib/4.0/models"
import { BQMLContext } from './BQMLProvider'
import { useHistory, useParams } from 'react-router-dom'
import { buildWizardState } from '../services/modelState'
import { SUMMARY_EXPLORE, BQML_LOOKER_MODEL, WIZARD_STEPS } from '../constants'
import { mapAPIExploreToClientExplore } from '../services/explores'
import { getHeaderColumns } from '../services/resultsTable'
import { renameSummaryDataKeys } from '../services/summary'
import { formatParameterFilter } from '../services/string'
import { bqModelInitialState } from '../reducers/bqModel'
import { getBQInputDataSql } from '../services/modelTypes'
import { lookerToBqResults} from '../services/LookerToBQResults'
import { bqResultsToLookerFormat } from '../services/apply'
import { SaveSummaryProps } from '../types/summary'
import { SaveInputDataProps } from '../types/inputData'
import { cloneDeep } from 'lodash'
import { OauthContext } from './OauthProvider'
// import { calcElapsedTime } from '../services/time'

type PersistModelStateProps = {
  wizardState: WizardState,
  bqModel: BQModelState,
  isModelCreate?: boolean,
  isModelUpdate?: boolean,
  retry?: boolean
}

type IWizardContext = {
  loadingModel?: boolean,
  fetchExplore?: (modelName: string, exploreName: string, stepName: string) => Promise<any>,
  saveQueryToState?: (
    stepName: string,
    stepData: Step2State,
    results: any,
    exploreUrl?: string,
    tableHeaders?: ResultsTableHeaderItem[]) => void,
  createAndRunQuery?: (stepData: Step2State, type?: string) => Promise<any>,
  fetchSummary?: (bqModelName: string, targetField: string, uid: string) => Promise<any>,
  saveSummary?: (props: SaveSummaryProps) => void,
  saveInputData?: (props: SaveInputDataProps) => void,
  persistModelState?: (props: PersistModelStateProps) => Promise<any>
}

export const WizardContext = createContext<IWizardContext>({})

export const WizardProvider = ({ children }: any) => {
  const history = useHistory()
  const { expiry, signIn } = useContext(OauthContext)
  const { modelNameParam } = useParams<any>()
  const { state, dispatch } = useStore()
  const { coreSDK: sdk } = useContext(ExtensionContext2)
  const { queryJobAndWait, getSavedModelState, createModelStateTable, insertOrUpdateModelState } = useContext(BQMLContext)
  const [ loadingModel, setLoadingModel ] = useState<boolean>(true)
  const { bqmlModelDatasetName } = state.userAttributes

  // on first load
  useEffect(() => {
    if (modelNameParam) {
      // load model from saved state
      setLoadingModel(true)
      loadModel().finally(() =>
        setLoadingModel(false)
      )
    } else {
      setLoadingModel(false)
    }
  }, [])

  // load a saved model
  // fetch any data needed to fill out wizard state
  const loadModel = async () => {
    try {
      if (expiry < new Date()) { await signIn(); }
      const savedModelState = await getSavedModelState?.(modelNameParam)
      if (!savedModelState) {
        history.push(`/ml/create/${WIZARD_STEPS['step1']}`)
        throw "That BQML Accelerator model doesn't exist or its owner has not shared it with you. If the URL is correct, ask the model owner to share the model."
      }
      const bqModel = { ...bqModelInitialState, ...cloneDeep(savedModelState.bqModel) }
      const loadedWizardState = buildWizardState(savedModelState)
      dispatch({ type: 'populateWizard', wizardState: loadedWizardState })
      dispatch({ type: 'setBQModel', data: bqModel })
      
      const { step2, step3, step5 } = loadedWizardState.steps
      if (!step2.modelName || !step2.exploreName) {
        throw "Failed to load model"
      }
    
      // Fetch and Populate Step2 Data
      const { value: exploreData } = await fetchExplore(step2.modelName, step2.exploreName, 'step2')
      if (exploreData) {
        const { ok, body } = await getBQInputData(bqModel.name, bqModel.inputDataUID, bqModel.inputDataQuery.limit) // ~4s to load //TODO
        if (!ok) {
          throw `Failed to load source query.  Please try re-running the query from the "${WIZARD_STEPS['step2']}" tab.`
        }
        const results = {
          data: bqResultsToLookerFormat(lookerToBqResults(body), step2.exploreName, exploreData),
          sql: ''
        }
        const headers = getHeaderColumns(
          step2.selectedFields,
          buildRanQuery(step2, results),
          exploreData
          )
          saveQueryToState('step2', step2, results, undefined, headers)
        } else {
          dispatch({ type: 'addError', error: 'Failed to retrieve explore data' })
        }
        
        // Fetch and Populate Step3 Data
        if (step3.bqModelName && step3.targetField) {
        const { ok, value } = await fetchSummary(step3.bqModelName, step3.targetField, bqModel.inputDataUID) // ~5s to load //TODO
        if (!ok || !value) { throw "Failed to load summmary" }
        saveSummary({
          rawSummary: value,
          wizardState: loadedWizardState,
          selectedFeatures: step3.selectedFeatures
        })
        saveInputData({
          query: bqModel.inputDataQuery,
          uid: bqModel.inputDataUID,
          bqModelName: bqModel.name,
          target: bqModel.target,
          arimaTimeColumn: bqModel.arimaTimeColumn
        })
      }
      if (step5.showPredictions && step5.modelName && step5.exploreName) {
        await fetchExplore(step5.modelName, step5.exploreName, 'step5')
      }
    } catch (error) {
      dispatch({type: 'addError', error: `${error}`})
    }
  }
  
  const buildRanQuery = (stepData: Step2State | Step5State, results: any, exploreUrl?: string) => {
    return {
      selectedFields: {
        ...stepData.selectedFields,
        predictions: []
      },
      data: results.data,
      rowCount: results.data.length >= 5000 ? '> 5000' : results?.data?.length,
      sql: results.sql,
      exploreUrl,
      exploreName: stepData.exploreName,
      modelName: stepData.modelName,
      exploreLabel: stepData.exploreLabel,
      limit: stepData.limit,
      sorts: stepData.sorts
    }
  }

  const saveQueryToState = (
    stepName: string,
    stepData: Step2State | Step5State,
    results: any,
    exploreUrl?: string,
    tableHeaders?: ResultsTableHeaderItem[]
  ) => {
    dispatch({
      type: 'addToStepData',
      step: stepName,
      data: {
        tableHeaders: tableHeaders || stepData.tableHeaders,
        ranQuery: buildRanQuery(stepData, results, exploreUrl)
      }
    })
  }

  const fetchExplore = async (modelName: string, exploreName: string, stepName: string) => {
    try {
      const { ok, value } = await sdk.lookml_model_explore(
        modelName,
        exploreName
      );
      if (!ok || !value) { throw 'Failed to fetch explore' }
      const newExploreData = mapAPIExploreToClientExplore(value)
      dispatch({
        type: 'addToStepData',
        step: stepName,
        data: { exploreData: newExploreData }
      })
      return { ok, value: newExploreData }
    } catch (error) {
      dispatch({type: 'addError', error: "Error loading explore " + error})
      return { ok: false }
    }
  }

  /*
  * Private method
  */
  const createBaseQuery = async (
    stepData: Step2State
  ): Promise<IQuery> => {
    const { dimensions, measures } = stepData.selectedFields
    const fields = [...dimensions, ...measures]
    const { value: baseQuery } = await sdk.create_query({
      model: stepData.modelName || undefined,
      view: stepData.exploreName || undefined,
      fields,
      filters: stepData.selectedFields.filters,
      limit: stepData.limit || "500",
      sorts: stepData.sorts || []
    })
    return baseQuery
  }

  const createAndRunQuery = async (
    stepData: Step2State,
    type?: string
  ) => {
    try {
      const baseQuery = await createBaseQuery(stepData)
      if (!baseQuery.client_id || !baseQuery.id || !stepData.modelName) {
        throw "Missing Parameters"
      }

      const { ok, value: results } = await sdk.run_query({
        query_id: baseQuery.id,
        limit: Number(stepData.limit) || 500,
        result_format: type ? type : "json_detail",
        apply_formatting: true
      })

      if (!ok) { throw "Failed to run query" }
      return { ok, results, exploreUrl: baseQuery.share_url }
    } catch (error) {
      dispatch({type: 'addError', error: "Error running query: " + error})
      return { ok: false }
    }
  }

  const fetchSummary = async (bqModelName: string, targetField: string, inputDataUID: string) => {
    try {
      // fetch explore to retrieve all field names
      const { value: explore } = await sdk.lookml_model_explore(BQML_LOOKER_MODEL, SUMMARY_EXPLORE)

      // query the summary table filtering on our newly created BQML data
      let queryId
      try {
        const { value: query } = await sdk.create_query({
          model:  BQML_LOOKER_MODEL,
          view: SUMMARY_EXPLORE,
          fields: explore.fields.dimensions.map((d: any) => d.name),
          filters: {
            [`${SUMMARY_EXPLORE}.input_data_view_name`]: `${formatParameterFilter(bqModelName || "")}^_input^_data^_${formatParameterFilter(inputDataUID || "")}`,
            [`${SUMMARY_EXPLORE}.target_field_name`]: formatParameterFilter(targetField || "")
          }
        })
        queryId = query.id
      } catch (err) {
        dispatch({type: 'addError', error: "Error fetchSummary create_query"})
      }

      try {
        const { ok, value } = await sdk.run_query({
          query_id: queryId,
          result_format: "json_detail",
          cache: false,
          apply_formatting: true
        })
        if (!ok) { throw "Failed to run query" }
        return { ok, value }
      } catch (err) {
        dispatch({type: 'addError', error: "Error fetchSummary run_query"})
      }
    } catch (error) {
      dispatch({type: 'addError', error: "Error fetching summary"})
      return { ok: false }
    }
  }

  const saveSummary = ({
    rawSummary,
    wizardState,
    selectedFeatures
  }: SaveSummaryProps) => {
    const { step2, step3 } = wizardState.steps
    const fields = (rawSummary.fields || {})
    const summaryData = renameSummaryDataKeys(rawSummary.data)
    const allFeatures = summaryData.map((d: any) => d["column_name"].value)
    const allValidFeatures = summaryData.filter(d => d.summary_status.status == 'ok').map((d: any) => d["column_name"].value)
    dispatch({
      type: 'addToStepData',
      step: 'step3',
      data: {
        allFeatures,
        selectedFeatures: selectedFeatures || [...allValidFeatures],
        advancedSettings: cloneDeep(step3.advancedSettings) || {},
        summary: {
          data: summaryData,
          fields: [...fields.dimensions, ...fields.measures]
        },
      }
    })
  }

  const saveInputData = ({
    query,
    uid,
    bqModelName,
    target,
    arimaTimeColumn
  }: SaveInputDataProps) => {
    const queryClone: any  = cloneDeep(query)
    dispatch({
      type: 'addToStepData',
      step: 'step3',
      data: {
        inputData: {
          exploreName: queryClone?.exploreName,
          modelName: queryClone?.modelName,
          exploreLabel: queryClone?.exploreLabel,
          limit: queryClone?.limit,
          selectedFields: queryClone?.selectedFields,
          sorts: queryClone?.sorts,
          uid,
          bqModelName,
          target,
          arimaTimeColumn,
        }
      }
    })
  }



  // Save bqModel state associated with the bqModelName
  // into a BQ table so we can reload past models
  const persistModelState = async ({
    wizardState,
    bqModel,
    isModelCreate = false,
    isModelUpdate = false,
    retry = false
  }: PersistModelStateProps) => {
    try {
      {
        const { ok, body } = await createModelStateTable?.()
        if (!ok) {
        // if (!ok || !body.jobComplete) {
          throw "Failed to create table"
        }
      }
      const { ok, body } = await insertOrUpdateModelState?.({ wizardState, bqModel, isModelCreate, isModelUpdate })
      if (!ok) {
        throw "Failed to save your model"
      }
      return { ok, body }
    } catch (error) {
      if (retry) {
        console.error("Failed to save model to BQ model state")
        return { ok: false }
      }
      // retry once
      persistModelState({ wizardState, bqModel, isModelCreate, isModelUpdate, retry: true })
    }
  }
  
  const getBQInputData = async (bqModelName: string, uid: string, limit?: string) => {
    try {
      if (expiry < new Date()) { await signIn(); }
      if (!bqmlModelDatasetName) { throw "No dataset provided" }
      const sql = getBQInputDataSql({
        bqmlModelDatasetName,
        bqModelName,
        uid,
        limit
      })
      const { ok, body } = await queryJobAndWait?.(sql)
      if (!ok) {
        throw `Unable to fetch from ${bqModelName}_input_data table (uid: ${uid}).`
      }
      return { ok, body }
    } catch (err: any) {
      dispatch({
        type: 'addError',
        error: 'Failed to get data - ' + err
      })
      return { ok: false }
    }
  }

  return (
    <WizardContext.Provider
      value={{
        loadingModel,
        fetchExplore,
        saveQueryToState,
        createAndRunQuery,
        fetchSummary,
        saveSummary,
        saveInputData,
        persistModelState
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}
