import React, { createContext, useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { BQMLContext } from './BQMLProvider'
import { useStore } from './StoreProvider'
import { formBQInputDataSQL, isArima, MODEL_TYPE_CREATE_METHOD } from '../services/modelTypes'
import { WizardContext } from './WizardProvider'
import { DEFAULT_ARIMA_HORIZON, JOB_STATUSES, WIZARD_STEPS } from '../constants'
import { wizardInitialState } from '../reducers/wizard'
import { BQModelState, WizardState } from '../types'
import { bqModelInitialState } from '../reducers/bqModel'
import { isBinaryClassifier } from '../services/summary'

type ISummaryContext = {
  getSummaryData?: (
    sql?: string,
    bqModelName?: string,
    targetField?: string,
    summaryUpToDate?: boolean
  ) => Promise<any>,
  createJob?: (sql: string) => Promise<any>,
  createBQMLModel?: (
    uid?: string,
    objective?: string,
    bqModelName?: string,
    targetField?: string,
    features?: string[],
    arimaTimeColumn?:  string,
    advancedSettings?: any,
    setIsLoading?: any,
    registerVertex?: boolean
  ) => Promise<any>
}

export const SummaryContext = createContext<ISummaryContext>({})

/**
 * Summary provider
 */
export const SummaryProvider = ({ children }: any) => {
  const history = useHistory()
  const { state, dispatch } = useStore()
  const { fetchSummary, saveSummary, saveInputData, persistModelState } = useContext(WizardContext)
  const {
    queryJob,
    queryJobAndWait,
    getJob
  } = useContext(BQMLContext)
  const { gcpProject, bqmlModelDatasetName } = state.userAttributes
  const [ previousBQValues, setPreviousBQValues ] = useState<any>({
    sql: null,
    model: null
  })

  /*
  * private method
  * create or replace BQML view
  */
  const createBQInputData = async (
    querySql: string | undefined,
    bqModelName: string | undefined,
    uid: string | undefined
  ) => {
    try {
      if (!bqmlModelDatasetName) {
        throw "User Attribute 'looker_temp_dataset_name' must be defined"
      }
      const sql = formBQInputDataSQL({
        sql: querySql,
        gcpProject,
        bqmlModelDatasetName,
        bqModelName,
        uid
      })
      if (!sql) {
        throw "Failed to create BigQuery View SQL statement"
      }
      const { ok, body } = await queryJobAndWait?.(sql, 3300, 3)
      return { ok, body }
    } catch (error) {
      return { ok: false }
    }
  }

  const createJob = async (sql: string) => {
    try {
      const { ok, body } = await queryJob?.(sql)
      if (!ok) {
        throw "Failed to create or replace bigQuery view"
      }
      return { ok, body }
    } catch(error) {
      return { ok: false }
    }
  }

  /**
   * Creates the Summary statistics table
   */
  const getSummaryData = async(
    querySql?: string,
    bqModelName?: string,
    targetField?: string,
    summaryUpToDate?: boolean
  ): Promise<any> => {
    try {
      if (!bqModelName || !targetField) {
        throw "Failed to fetch summary."
      }

      let inputDataUID = state.bqModel.inputDataUID

      // second condition here is for backwards compatibility with old models,
      // when a UID strategy was being used (rather than a/b alternation)
      if(!inputDataUID || (inputDataUID != "selected" && inputDataUID != "model_training")) {
        // Create "selected" table on first run
        setPreviousBQValues({
          sql: querySql,
          model: bqModelName
        })
        const result = await createBQInputData(querySql, bqModelName, "selected")
        if (!result.ok) {
          throw "Failed to create BQML View"
        }

        // initialize to start on "selected" table
        inputDataUID = "selected"
      }

      // in an effort to limit the number of calls to BigQuery
      // do not create the input_data table if it's already been created for this sql and model name
      if (querySql &&
        (querySql !== previousBQValues.sql || bqModelName !== previousBQValues.model || !summaryUpToDate)
      ) {
        // switch to whichever table is not currently locked to model to write new summary 'snapshot'
        inputDataUID = (inputDataUID === "model_training") ? "selected" : "model_training"
        setPreviousBQValues({
          sql: querySql,
          model: bqModelName
        })
        const result = await createBQInputData(querySql, bqModelName, inputDataUID)
        if (!result.ok) {
          throw "Failed to create BQML View"
        }
      }

      if (!inputDataUID) { throw 'Failed to retrieve UID for this input data table.' }

      const { ok, value } = await fetchSummary?.(bqModelName, targetField, inputDataUID)
      if (!ok || !value || (value.errors && value.errors.length > 0)) {
        throw "Failed to fetch summary."
      }
      const { step2, step3 } = state.wizard.steps
      saveSummary?.({ rawSummary: value, wizardState: state.wizard })
      saveInputData?.({
        query: step2.ranQuery,
        uid: inputDataUID,
        bqModelName: step3.bqModelName,
        target: step3.targetField || '',
        arimaTimeColumn: step3.arimaTimeColumn
      })
      return { ok, value }
    } catch(error) {
      setPreviousBQValues({ sql: null, model: null })
      dispatch({type: 'addError', error: "Failed to fetch summary.  Please try again."})
      return { ok: false }
    }
  }

  // build out the BQ Model state
  const buildBaseBQModel = (wizardState: WizardState, bqModel: BQModelState, jobState: any, features: string[], advancedSettings: any) => {
    const { step1, step3 } = wizardState.steps
    const inputDataQuery = {
      exploreName: step3.inputData?.exploreName,
      modelName: step3.inputData?.modelName,
      exploreLabel: step3.inputData?.exploreLabel,
      limit: step3.inputData?.limit,
      selectedFields: step3.inputData?.selectedFields,
      // default arima to sort ascending for time
      sorts: isArima(step1.objective || '') ? [step3.arimaTimeColumn] : step3.inputData?.sorts,
    }

    return {
      ...bqModel,
      inputDataQuery,
      inputDataUID: step3.inputData.uid,
      objective: step1.objective,
      binaryClassifier: isBinaryClassifier(step1.objective || '', step3),
      registerVertex: step3.registerVertex,
      name: step3.bqModelName,
      target: step3.targetField,
      arimaTimeColumn: step3.arimaTimeColumn,
      hasPredictions: false,
      predictSettings: {
        horizon: advancedSettings.horizon || '30'
      },
      selectedFeatures: [...features],
      advancedSettings: {...advancedSettings},
      applyQuery: { ...bqModelInitialState.applyQuery, ...inputDataQuery },
      ...jobState
    }
  }

  const createBQMLModel = async (
    uid?: string,
    objective?: string,
    bqModelName?: string,
    target?: string,
    features?: string[],
    arimaTimeColumn?: string,
    advancedSettings?: any,
    setIsLoading?: any,
    registerVertex?: boolean
  ) => {
    try {
      if (
        !uid ||
        !objective ||
        !gcpProject ||
        !bqmlModelDatasetName ||
        !target ||
        !bqModelName ||
        !features ||
        features.length <= 0 ||
        (isArima(objective) && !arimaTimeColumn)
      ) { return }

      const sql = MODEL_TYPE_CREATE_METHOD[objective]({
        uid,
        gcpProject,
        bqmlModelDatasetName,
        bqModelName,
        target,
        features,
        registerVertex,
        arimaTimeColumn,
        advancedSettings
      })
      if (!sql) {
        throw "Failed to create BigQuery Model SQL statement"
      }
      const response = createJob?.(sql) 
      // const { ok, body } = await createJob?.(sql)
      // if (!ok || !body.jobReference.jobId) {
      //   throw "Something went wrong, please try again."
      // }
      // await checkCreateModelSuccess(body.jobReference.jobId)

      // stubbing the jobState
      const jobState = {
        jobStatus: JOB_STATUSES.running,
        job: {
          projectId: gcpProject,
          jobId: "Looker SQL Runner Query",
          location: "GCP",
          startTime: new Date(),
        },
        // jobStatus: JOB_STATUSES.pending,
        // job: body.jobReference,
      }
      const { wizard, bqModel } = state
      const tempWizard = {
        ...wizard,
        unlockedStep: 4
      }
      const isModelCreate = !bqModel.name
      const tempBQModel = buildBaseBQModel(wizard, bqModel, jobState, features, advancedSettings)

      const { step1, step3 } = wizard.steps
      dispatch({
        type: 'setBQModel',
        data: { ...tempBQModel }
      })
      dispatch({
        type: 'addToStepData',
        step: 'step4',
        data: {
          evaluateData: {},
          complete: false
        }
      })
      dispatch({ type: 'setUnlockedStep', step: 4 })
      // everytime we create/update a model, we rehydrate step5 with the same params as the inputDataQuery
      dispatch({
        type: 'addToStepData',
        step: 'step5',
        data: {
          ...wizardInitialState.steps.step5,
          ...tempBQModel.inputDataQuery,
          sorts: isArima(step1.objective || '') ? [tempBQModel.arimaTimeColumn] : step3.inputData?.sorts,
          showPredictions: false,
          predictSettings: tempBQModel.predictSettings || {}
        }
      })

      await persistModelState?.({ wizardState: tempWizard, bqModel: tempBQModel, isModelCreate, isModelUpdate: true }).then(() => {
        // show spinner until model state is saved to bqml model info table then navigate to review page
        setIsLoading(false)
        history.push(`/ml/${bqModelName}/${WIZARD_STEPS['step4']}`)
      })

      return response // return the promise instead
      // return { ok, body }
    } catch (error) {
      dispatch({type: 'addError', error: "Failed to create model: " + error})
      return { ok: false }
    }
  }

  // fetch the Job by its id to ensure it was successful
  // some failures only reveal themselves from querying the job
  const checkCreateModelSuccess = async (jobId: string) => {
    const { ok, body } = await getJob?.({ jobId })
    if (body.status.errorResult) {
      throw body.status.errorResult.message
    }
    if (!ok) {
      throw "Something went wrong, please try again."
    }
  }

  return (
    <SummaryContext.Provider
      value={{
        getSummaryData,
        createJob,
        createBQMLModel
      }}
    >
      {children}
    </SummaryContext.Provider>
  )
}
