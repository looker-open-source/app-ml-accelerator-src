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
import { WizardState } from '../types'

type ISummaryContext = {
  getSummaryData?: (
    sql: string | undefined,
    bqModelName: string | undefined,
    targetField: string | undefined
  ) => Promise<any>,
  createJob?: (sql: string) => Promise<any>,
  createBQMLModel?: (
    objective: string | undefined,
    bqModelName: string | undefined,
    targetField: string | undefined,
    arimaTimeColumn:  string | undefined
  ) => Promise<any>
}

export const SummaryContext = createContext<ISummaryContext>({})

/**
 * Summary provider
 */
export const SummaryProvider = ({ children }: any) => {
  const { state, dispatch } = useStore()
  const { fetchSummary, saveSummary } = useContext(WizardContext)
  const {
    queryJob,
    pollJobStatus,
    getJob,
    createModelStateTable,
    insertOrUpdateModelState
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
    if (!bqmlModelDatasetName) {
      throw "User Attribute 'looker_temp_dataset_name' must be defined"
    }

    const sql = formBQViewSQL(querySql, bqmlModelDatasetName, bqModelName)
    if (!sql) {
      throw "Failed to create BigQuery View SQL statement"
    }
    const { body } = await createJob(sql)
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
      await promise
    }
  }

  const createJob = async (sql: string) => {
    const { ok, body } = await queryJob?.(sql)
    if (!ok) {
      throw "Failed to create or replace bigQuery view"
    }
    return { ok, body }
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
        await createBQMLView(querySql, bqModelName)
      }

      const { ok, value } = await fetchSummary?.(bqModelName, targetField)
      if (!ok || !value) {
        throw "Failed to fetch summary."
      }
      saveSummary?.(value, state.wizard)
      return { ok, value }
    } catch(error) {
      dispatch({type: 'addError', error: "Failed to fetch summary.  Please try again."})
      return { ok: false }
    }
  }

  const createBQMLModel = async (
    objective: string | undefined,
    bqModelName: string | undefined,
    target: string | undefined,
    arimaTimeColumn: string | undefined
  ) => {
    try {
      if (
        !objective ||
        !gcpProject ||
        !bqmlModelDatasetName ||
        !target ||
        !bqModelName ||
        (isArima(objective) && !arimaTimeColumn)
      ) { return }

      // TODO:
      // CHECK THAT MODEL NAME IS NOT ALREADY TAKEN BY ANOTHER USER
      // IF ITS THEIR OWN EXISTING MODEL & NO modelNameParam,
      // PROMPT THE USER TO CONFIRM THEY WANT TO OVERWRITE THEIR OWN MODEL

      const sql = MODEL_TYPE_CREATE_METHOD[objective]({
        gcpProject,
        bqmlModelDatasetName,
        bqModelName,
        target,
        arimaTimeColumn
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
        job: body.jobReference
      }
      // create a copy of the wizard state with the job added
      const { wizard } = state
      const wizardState = {
        ...wizard,
        steps: {
          ...wizard.steps,
          step4: jobState
        }
      }
      await persistWizardState(wizardState)
      dispatch({
        type: 'addToStepData',
        step: 'step4',
        data: jobState
      })
      return { ok, body }
    } catch (error) {
      console.log({error})
      dispatch({type: 'addError', error: "Failed to create model: " + error})
      return { ok: false }
    }
  }

  // Save key information from the wizards state associated with the bqModelName
  // into a BQ table so we can reload past models
  const persistWizardState = async (wizardState: WizardState, retry: boolean = false) => {
    try {
      {
        const { ok, body } = await createModelStateTable?.()
        if (!ok || !body.jobComplete) {
          throw "Failed to create table"
        }
      }
      const { ok, body } = await insertOrUpdateModelState?.(wizardState)
      if (!ok) {
        throw "Failed to save your model"
      }
      dispatch({ type: 'setNeedsSaving', value: false })
    } catch (error) {
      if (retry) {
        console.error("Failed to save model to BQ model state")
        return
      }
      // retry once
      persistWizardState(wizardState, true)
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
