import React, { createContext, useContext, useState } from 'react'
import { BQMLContext } from './BQMLProvider'
import { useStore } from './StoreProvider'
import { formBQInputDataSQL, isArima, MODEL_TYPE_CREATE_METHOD } from '../services/modelTypes'
import { WizardContext } from './WizardProvider'
import { JOB_STATUSES } from '../constants'
import { wizardInitialState } from '../reducers/wizard'
import { BQModelState, Step4State, WizardState } from '../types'
import { bqModelInitialState } from '../reducers/bqModel'
import { v4 as uuidv4 } from 'uuid';

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
    advancedSettings?: any
  ) => Promise<any>
}

export const SummaryContext = createContext<ISummaryContext>({})

/**
 * Summary provider
 */
export const SummaryProvider = ({ children }: any) => {
  const { state, dispatch } = useStore()
  const { fetchSummary, saveSummary, saveInputData, persistModelState } = useContext(WizardContext)
  const {
    queryJob,
    pollJobStatus,
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
        bqmlModelDatasetName,
        bqModelName,
        uid
      })
      if (!sql) {
        throw "Failed to create BigQuery View SQL statement"
      }
      const { ok, body } = await createJob(sql)
      if (!ok) { return { ok, body }}
      if (!body.jobComplete) {
        // Give it another 10s to get the job status in case BQ is taking a while to create the view
        if (!pollJobStatus) {
          throw "Failed to  finish creating bigQuery view"
        }
        const { promise } = pollJobStatus(
          body.jobReference.jobId,
          3300,
          3
        )
        const result = await promise
        return result;
      }
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
      // in an effort to limit the number of calls to BigQuery
      // do not create the input_data table if its alrady been created for this sql and model name
      if (querySql &&
        (querySql !== previousBQValues.sql || bqModelName !== previousBQValues.model || !summaryUpToDate)
      ) {
        inputDataUID = uuidv4().replace(/\-/g, '') // generate a new UID (uuid no hyphens) to save a new input_data table
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
    return {
      ...bqModel,
      inputDataQuery: {
        exploreName: step3.inputData?.exploreName,
        modelName: step3.inputData?.modelName,
        exploreLabel: step3.inputData?.exploreLabel,
        limit: step3.inputData?.limit,
        selectedFields: step3.inputData?.selectedFields,
        sorts: step3.inputData?.sorts,
      },
      inputDataUID: step3.inputData.uid,
      objective: step1.objective,
      name: step3.bqModelName,
      target: step3.targetField,
      arimaTimeColumn: step3.arimaTimeColumn,
      hasPredictions: false,
      selectedFeatures: features,
      advancedSettings: advancedSettings,
      applyQuery: { ...bqModelInitialState.applyQuery },
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
    advancedSettings?: any
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
        arimaTimeColumn,
        advancedSettings
      })
      if (!sql) {
        throw "Failed to create BigQuery Model SQL statement"
      }
      const { ok, body } = await createJob?.(sql)
      if (!ok || !body.jobReference.jobId) {
        throw "Something went wrong, please try again."
      }
      await checkCreateModelSuccess(body.jobReference.jobId)

      const jobState = {
        jobStatus: JOB_STATUSES.pending,
        job: body.jobReference,
      }
      const { wizard, bqModel } = state
      const tempWizard = {
        ...wizard,
        unlockedStep: 4
      }
      const tempBQModel = buildBaseBQModel(wizard, bqModel, jobState, features, advancedSettings)

      await persistModelState?.(tempWizard, tempBQModel)

      dispatch({
        type: 'setBQModel',
        data: { ...tempBQModel }
      })
      dispatch({
        type: 'addToStepData',
        step: 'step4',
        data: { complete: false }
      })
      dispatch({ type: 'setUnlockedStep', step: 4 })
      // everytime we create/update a model, we rehydrate step5 with the same params as the inputDataQuery
      dispatch({
        type: 'addToStepData',
        step: 'step5',
        data: {
          ...wizardInitialState.steps.step5,
          ...bqModel.inputDataQuery,
          showPredictions: false
        }
      })
      return { ok, body }
    } catch (error) {
      console.log({error})
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
