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
import { MODEL_TYPES } from '../services/modelTypes'
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
  const { pollJobStatus, cancelJob, getJob } = useContext(BQMLContext)
  const { persistWizardState } = useContext(WizardContext)
  const { jobStatus, job } = state.bqModel
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
      // make one initial request to get the current job state before it begins polling
      const { ok: jobOk, body: initialJobStatus } = await getJob?.({ jobId: job.jobId })
      if (!jobOk || initialJobStatus.status.errorResult) {
        handleJobError(jobOk, initialJobStatus.status.errorResult)
      }
      updateJobState(initialJobStatus)
      pollCanceler?.cancel()
      if (initialJobStatus.status.state === JOB_STATUSES.done) {
        return
      }

      const { promise, cancel } = pollJobStatus(job.jobId, 20000)
      console.log('setting canceler')
      setPollCanceler({ cancel })

      // this will wait here until the polling is finished
      // either the job status == done or polling has been canceled
      const { ok, body, canceled } = await promise

      if (canceled) { return }
      if (!ok || body.status.errorResult) {
        handleJobError(ok, body.status.errorResult)
      }
      updateJobState(body)
    } catch (error: any) {
      dispatch({ type: 'addError', error: "An error occurred while fetching the job status: " + error})
    } finally {
      setPolling(false)
    }
  }

  const handleJobError = (jobOk: boolean, error: any) => {
    dispatch({ type: 'addToStepData', step: 'step4', data: { complete: false }})
    dispatch({ type: 'setBQModel', data: { jobStatus: "FAILED" }})
    dispatch({ type: 'setNeedsSaving', value: true })
    throw jobOk ? error.message : 'Failed to retrieve job status'
  }

  const updateJobState = (body: any) => {
    dispatch({
      type: 'setBQModel',
      data: {
        jobStatus: body.status.state,
        job: {
          ...body.jobReference,
          startTime: body.statistics.startTime
        }
      }
    })
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
          [`${modelType.exploreName}.model_name`]: formatParameterFilter(bqModelName),
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
      dispatch({ type: 'addToStepData', step: 'step4', data: { complete: true }})
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


      const { wizard, bqModel } = state
      // create a copy of the bqModel state with the job added
      const tempBQModel = { ...bqModel, jobStatus: JOB_STATUSES.canceled }
      await persistWizardState?.({ ...wizard }, tempBQModel)
      dispatch({
        type: 'addToStepData',
        step: 'step4',
        data: { complete: false }
      })
      dispatch({ type: 'setBQModel', data: { jobStatus: JOB_STATUSES.canceled }})
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
