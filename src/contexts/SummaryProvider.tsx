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
import React, { createContext, useContext, useState } from 'react'
import { BQMLContext } from './BQMLProvider'
import { useStore } from './StoreProvider'
import { formBQViewSQL } from '../services/summary'
import { isArima, MODEL_TYPE_CREATE_METHOD } from '../services/modelTypes'
import { WizardContext } from './WizardProvider'
import { JOB_STATUSES } from '../constants'
import { wizardInitialState } from '../reducers/wizard'
import { WizardState } from '../types'
import { bqModelInitialState } from '../reducers/bqModel'

type ISummaryContext = {
  getSummaryData?: (
    sql?: string,
    bqModelName?: string,
    targetField?: string
  ) => Promise<any>,
  createJob?: (sql: string) => Promise<any>,
  createBQMLModel?: (
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
  const { fetchSummary, saveSummary, persistModelState } = useContext(WizardContext)
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
  const createBQMLView = async (
    querySql: string | undefined,
    bqModelName: string | undefined
  ) => {
    try {
      if (!bqmlModelDatasetName) {
        throw "User Attribute 'looker_temp_dataset_name' must be defined"
      }

      const sql = formBQViewSQL(querySql, bqmlModelDatasetName, bqModelName)
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
    targetField?: string
  ): Promise<any> => {
    try {
      if (!querySql || !bqModelName || !targetField) {
        throw "Failed to fetch summary."
      }
      // in an effort to limit the number of calls to BigQuery
      // do not create the BQ view if its alrady been created for this sql and model name
      if (querySql !== previousBQValues.sql || bqModelName !== previousBQValues.model) {
        setPreviousBQValues({ sql: querySql, model: bqModelName })
        const result = await createBQMLView(querySql, bqModelName)

        if (!result.ok) {
          throw "Failed to create BQML View"
        }
      }

      const { ok, value } = await fetchSummary?.(bqModelName, targetField)
      if (!ok || !value || (value.errors && value.errors.length > 0)) {
        throw "Failed to fetch summary."
      }
      saveSummary?.(value, state.wizard)
      saveBQModel(state.wizard)
      return { ok, value }
    } catch(error) {
      setPreviousBQValues({ sql: null, model: null })
      dispatch({type: 'addError', error: "Failed to fetch summary.  Please try again."})
      return { ok: false }
    }
  }

  // update bqModel state
  // we need a record of the source data when the summary was generated that isn't tied to the UI
  // since the user can change the UI values at any time and make it out of sync with what the model was created with
  const saveBQModel = (wizardState: WizardState) => {
    const { step1, step2, step3 } = wizardState.steps
    dispatch({
      type: 'setBQModel',
      data: {
        sourceQuery: {
          exploreName: step2.ranQuery?.exploreName,
          modelName: step2.ranQuery?.modelName,
          exploreLabel: step2.ranQuery?.exploreLabel,
          limit: step2.ranQuery?.limit,
          selectedFields: step2.ranQuery?.selectedFields,
          sorts: step2.ranQuery?.sorts,
        },
        objective: step1.objective,
        name: step3.bqModelName,
        target: step3.targetField,
        arimaTimeColumn: step3.arimaTimeColumn,
        advancedSettings: step3.advancedSettings || {},
        selectedFeatures: step3.selectedFeatures
      }
    })
  }

  const createBQMLModel = async (
    objective?: string,
    bqModelName?: string,
    target?: string,
    features?: string[],
    arimaTimeColumn?: string,
    advancedSettings?: any
  ) => {
    try {
      if (
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
      const tempBQModel = {
        ...bqModel,
        ...jobState,
        hasPredictions: false,
        selectedFeatures: features,
        advancedSettings: advancedSettings,
        applyQuery: { ...bqModelInitialState.applyQuery }
      }
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
      // everytime we create/update a model, we rehydrate step5 with the same params as the sourceQuery
      dispatch({
        type: 'addToStepData',
        step: 'step5',
        data: {
          ...wizardInitialState.steps.step5,
          ...bqModel.sourceQuery,
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
