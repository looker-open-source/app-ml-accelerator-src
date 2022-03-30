  /*
 * The MIT License (MIT)
 *
 * Copyright (c) 2021 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import React, { createContext, useContext, useEffect, useState } from 'react'
import { ExtensionContext2 } from '@looker/extension-sdk-react'
import { useStore } from './StoreProvider'
import { BQModelState, ResultsTableHeaderItem, Step2State, Step5State, WizardState } from '../types'
import { IQuery } from "@looker/sdk/lib/4.0/models"
import { BQMLContext } from './BQMLProvider'
import { useHistory, useParams } from 'react-router-dom'
import { buildWizardState } from '../services/modelState'
import { SUMMARY_EXPLORE, BQML_LOOKER_MODEL, WIZARD_STEPS, JOB_STATUSES } from '../constants'
import { mapAPIExploreToClientExplore } from '../services/explores'
import { getHeaderColumns } from '../services/resultsTable'
import { renameSummaryDataKeys } from '../services/summary'
import { formatParameterFilter } from '../services/string'
import { bqModelInitialState } from '../reducers/bqModel'

type IWizardContext = {
  loadingModel?: boolean,
  fetchExplore?: (modelName: string, exploreName: string, stepName: string) => Promise<any>,
  saveQueryToState?: (
    stepName: string,
    stepData: Step2State,
    results: any,
    exploreUrl?: string,
    tableHeaders?: ResultsTableHeaderItem[]) => void,
  createAndRunQuery?: (stepData: Step2State) => Promise<any>,
  fetchSummary?: (bqModelName: string, targetField: string) => Promise<any>,
  saveSummary?: (rawSummary: any, wizardState: WizardState) => void,
  persistModelState?: (wizardState: WizardState, bqModel: BQModelState, retry?: boolean) => Promise<any>
}

export const WizardContext = createContext<IWizardContext>({})

export const WizardProvider = ({ children }: any) => {
  const history = useHistory()
  const { modelNameParam } = useParams<any>()
  const { dispatch } = useStore()
  const { coreSDK: sdk } = useContext(ExtensionContext2)
  const { getSavedModelState, createModelStateTable, insertOrUpdateModelState } = useContext(BQMLContext)
  const [ loadingModel, setLoadingModel ] = useState<boolean>(true)

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
      const savedModelState = await getSavedModelState?.(modelNameParam)
      if (!savedModelState) {
        history.push(`/ml/create/${WIZARD_STEPS['step1']}`)
        throw `Model does not exist: ${modelNameParam}`
      }
      const bqModel = { ...bqModelInitialState, ...savedModelState.bqModel }
      const loadedWizardState = buildWizardState(savedModelState)
      dispatch({ type: 'populateWizard', wizardState: loadedWizardState })
      dispatch({ type: 'setBQModel', data: { ...savedModelState.bqModel }})

      const { step2, step3, step5 } = loadedWizardState.steps
      if (!step2.modelName || !step2.exploreName) {
        throw "Failed to load model"
      }

      // Fetch and Populate Step2 Data
      const { value: exploreData } = await fetchExplore(step2.modelName, step2.exploreName, 'step2')
      const { ok, results, exploreUrl } = await createAndRunQuery(step2)
      if (!ok) {
        throw `Failed to load source query.  Please try re-running the query from the "${WIZARD_STEPS['step2']}" tab.`
      }
      const headers = getHeaderColumns(
        step2.selectedFields,
        buildRanQuery(step2, results, exploreUrl),
        exploreData
      )
      saveQueryToState('step2', step2, results, exploreUrl, headers)

      // Fetch and Populate Step3 Data
      if (step3.bqModelName && step3.targetField) {
        const { ok, value } = await fetchSummary(step3.bqModelName, step3.targetField)
        if (!ok || !value) { throw "Failed to load summmary" }
        saveSummary(value, loadedWizardState, step3.selectedFeatures)
      }
      if (step5.showPredictions && step5.modelName && step5.exploreName) {
        await fetchExplore(step5.modelName, step5.exploreName, 'step5')
      }

      if (bqModel.jobStatus !== JOB_STATUSES.canceled) {
        dispatch({ type: 'setNeedsSaving', value: false })
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
      rowCount: results.data.length,
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
  ) => {
    try {
      const baseQuery = await createBaseQuery(stepData)
      if (!baseQuery.client_id || !baseQuery.id || !stepData.modelName) {
        throw "Missing Parameters"
      }

      const { ok, value: results } = await sdk.run_query({
        query_id: baseQuery.id,
        limit: Number(stepData.limit) || 500,
        result_format: "json_detail",
      })

      if (!ok) { throw "Failed to run query" }
      return { ok, results, exploreUrl: baseQuery.share_url }
    } catch (error) {
      dispatch({type: 'addError', error: "Error running query: " + error})
      return { ok: false }
    }
  }

  const fetchSummary = async (bqModelName: string, targetField: string) => {
    try {
      // fetch explore to retrieve all field names
      const { value: explore } = await sdk.lookml_model_explore(BQML_LOOKER_MODEL, SUMMARY_EXPLORE)

      // query the summary table filtering on our newly created BQML data
      const { value: query } = await sdk.create_query({
        model:  BQML_LOOKER_MODEL,
        view: SUMMARY_EXPLORE,
        fields: explore.fields.dimensions.map((d: any) => d.name),
        filters: {
          [`${SUMMARY_EXPLORE}.input_data_view_name`]: `${formatParameterFilter(bqModelName || "")}^_input^_data`,
          [`${SUMMARY_EXPLORE}.target_field_name`]: formatParameterFilter(targetField || "")
        }
      })

      const { ok, value } = await sdk.run_query({
        query_id: query.id,
        result_format: "json_detail",
        cache: false
      })
      if (!ok) { throw "Failed to run query" }
      return { ok, value }
    } catch (error) {
      dispatch({type: 'addError', error: "Error fetching summary"})
      return { ok: false }
    }
  }

  const saveSummary = (rawSummary: any, wizardState: WizardState, selectedFeatures?: string[]) => {
    const { step3 } = wizardState.steps
    const fields = (rawSummary.fields || {})
    const summaryData = renameSummaryDataKeys(rawSummary.data)
    const allFeatures = summaryData.map((d: any) => d["column_name"].value)
    dispatch({
      type: 'addToStepData',
      step: 'step3',
      data: {
        allFeatures,
        selectedFeatures: selectedFeatures || [...allFeatures],
        advancedSettings: step3.advancedSettings || {},
        summary: {
          data: summaryData,
          fields: [...fields.dimensions, ...fields.measures]
        }
      }
    })
  }

  // Save bqModel state associated with the bqModelName
  // into a BQ table so we can reload past models
  const persistModelState = async (wizardState: WizardState, bqModel: BQModelState, retry: boolean = false) => {
    try {
      {
        const { ok, body } = await createModelStateTable?.()
        if (!ok || !body.jobComplete) {
          throw "Failed to create table"
        }
      }
      const { ok, body } = await insertOrUpdateModelState?.(wizardState, bqModel)
      if (!ok) {
        throw "Failed to save your model"
      }
      dispatch({ type: 'setNeedsSaving', value: false })
      return { ok, body }
    } catch (error) {
      if (retry) {
        console.error("Failed to save model to BQ model state")
        return { ok: false }
      }
      // retry once
      persistModelState(wizardState, bqModel, true)
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
        persistModelState
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}
