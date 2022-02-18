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
import { useParams } from 'react-router-dom'
import { BQMLContext } from './BQMLProvider'
import { useStore } from './StoreProvider'
import { BQML_LOOKER_MODEL, JOB_STATUSES } from '../constants'
import { ExtensionContext2 } from '@looker/extension-sdk-react'
import { modelIdGenerator, MODEL_TYPES } from '../services/modelTypes'
import { formatParameterFilter } from '../services/string'
import { WizardContext } from './WizardProvider'

type IModelContext = {
  stopPolling?: () => void
  getModelEvalFuncData?: (
    bqModelObjective: string,
    evalFuncName: string,
    bqModelName: string,
    ) => Promise<any>,
  cancelModelCreate?: () => Promise<any>
}

export const ModelContext = createContext<IModelContext>({})

/**
 * Model provider
 */
export const ModelProvider = ({ children }: any) => {
  const { modelNameParam } = useParams<any>()
  const { state, dispatch } = useStore()
  const { coreSDK } = useContext(ExtensionContext2)
  const { pollJobStatus, cancelJob } = useContext(BQMLContext)
  const { persistWizardState } = useContext(WizardContext)
  const { jobStatus, job } = state.wizard.steps.step4
  const [ polling, setPolling ] = useState(false)
  const [ pollCanceler, setPollCanceler ] = useState<{ cancel: () => void}>()

  // if a job is pending or running,
  // continuously short poll the job until its status is DONE
  useEffect(() => {
    if (!job || polling || !modelNameParam) { return }
    if (jobStatus !== JOB_STATUSES.done && jobStatus !== JOB_STATUSES.canceled) {
      getJobStatus()
    }
  }, [])

  const stopPolling = () => {
    if (!pollCanceler) { return }
    pollCanceler.cancel()
    setPolling(false)
  }

  // Starts a short poll of the job status
  // Ends when either the fetched job's status is "done" or is canceled with stopPolling method
  const getJobStatus = async () => {
    try {
      if (!job.jobId || !pollJobStatus) {
        throw "Missing jobid or failed instantiation of BQMLProvider"
      }
      setPolling(true)
      pollCanceler?.cancel()
      const { promise, cancel } = pollJobStatus(job.jobId, 20000)
      console.log('setting canceler')
      setPollCanceler({ cancel })

      // this will wait here until the polling is finished
      // either the job status == done or polling has been canceled
      const { ok, body, canceled } = await promise

      if (canceled) { return }
      if (!ok) {
        throw "Failed to retrieve job status"
      }
      if (body.status.errorResult) {
        dispatch({ type: 'addToStepData', step: 'step4', data: { jobStatus: "FAILED" }})
        throw body.status.errorResult.message
      }
      dispatch({
        type: 'addToStepData',
        step: 'step4',
        data: {
          jobStatus: body.status.state,
          job: body.jobReference
        }
      })
    } catch (error: any) {
      dispatch({ type: 'addError', error: "An error occurred while fetching the job status: " + error})
    } finally {
      setPolling(false)
    }
  }

  // Query looker for the big query evaluation data for the provided evaluation function
  const getModelEvalFuncData = async (
    bqModelObjective: string,
    evalFuncName: string,
    bqModelName: string
  ) => {
    try {
      const modelType = MODEL_TYPES[bqModelObjective]
      const evalFuncFields = modelType?.modelFields?.[evalFuncName]

      if (!evalFuncFields || evalFuncFields.length <= 0) {
        throw "Failed to find fields associated with this evaluate function."
      }

      // query the model table filtering on our modelID
      const { value: query } = await coreSDK.create_query({
        model:  BQML_LOOKER_MODEL,
        view: modelType.exploreName,
        fields: evalFuncFields,
        filters: {
          [`${modelType.exploreName}.model_name`]: formatParameterFilter(
            modelIdGenerator({ bqModelName, objective: bqModelObjective })
          ),
        }
      })
      const { ok, value } = await coreSDK.run_query({
        query_id: query.id,
        result_format: "json_detail",
      })
      if (!ok) { throw "Failed to run query" }
      if (value.errors && value.errors.length >= 1) {
        throw value.errors[0].message
      }
      return { ok, value }
    } catch (error) {
      dispatch({type: 'addError', error: "Error fetching evaluation data: " + error})
      return { ok: false }
    }
  }

  const cancelModelCreate = async () => {
    try{
      if (!job || !cancelJob) { throw "Refresh and try again." }
      const { ok } = await cancelJob({
        jobId: job.jobId,
        location: job.location
      })
      if (!ok) { throw "Refresh and try again."}
      stopPolling()

      // create a copy of the wizard state with the job added
      const { wizard } = state
      const wizardState = {
        ...wizard,
        steps: {
          ...wizard.steps,
          step4: {
            ...wizard.steps.step4,
            jobStatus: JOB_STATUSES.canceled
          }
        }
      }
      await persistWizardState?.(wizardState)
      dispatch({
        type: 'addToStepData',
        step: 'step4',
        data: { jobStatus: JOB_STATUSES.canceled }
      })
      dispatch({ type: 'setNeedsSaving', value: true })
    } catch(error) {
      dispatch({type: 'addError', error: "Failed to cancel model creation: " + error})
      return { ok: false }
    }
  }

  return (
    <ModelContext.Provider
      value={{
        stopPolling,
        getModelEvalFuncData,
        cancelModelCreate
      }}
    >
      {children}
    </ModelContext.Provider>
  )
}
