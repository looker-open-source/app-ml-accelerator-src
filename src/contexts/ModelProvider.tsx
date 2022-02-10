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
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { BQMLContext } from './BQMLProvider'
import { useStore } from './StoreProvider'
import { JOB_STATUSES } from '../constants'

type IModelContext = {
  saving?: boolean,
  stopPolling?: () => void
}

export const ModelContext = createContext<IModelContext>({})

/**
 * Model provider
 */
export const ModelProvider = ({ children }: any) => {
  const history = useHistory()
  const { url } = useRouteMatch()
  const { modelNameParam } = useParams<any>()
  const { state, dispatch } = useStore()
  const {
    pollJobStatus,
    createModelStateTable,
    insertOrUpdateModelState
  } = useContext(BQMLContext)
  const { needsSaving } = state.wizard
  const { bqModelName } = state.wizard.steps.step3
  const { jobStatus, job } = state.wizard.steps.step4
  const [ polling, setPolling ] = useState(false)
  const [ saving, setSaving ] = useState(false)
  const [ pollCanceler, setPollCanceler ] = useState<{ cancel: () => void}>()

  useEffect(() => {
    if (!job) { return }
    if (needsSaving && !saving) {
      persistWizardState()
    }
  })

  // if a job is pending or running,
  // continuously short poll the job until its status is DONE
  useEffect(() => {
    if (!job || polling || !modelNameParam) { return }
    if (jobStatus !== JOB_STATUSES.done) {
      console.log('getJobStatus')
      getJobStatus()
    }
  }, [modelNameParam])

  const stopPolling = () => {
    if (!pollCanceler) { return }
    console.log('canceling poll')
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

  // Save key information from the wizards state associated with the bqModelName
  // into a BQ table so we can reload past models
  const persistWizardState = async (retry: boolean = false) => {
    try {
      setSaving(true)
      {
        const { ok, body } = await createModelStateTable?.()
        if (!ok || !body.jobComplete) {
          throw "Failed to create table"
        }
      }
      const { ok, body } = await insertOrUpdateModelState?.()
      if (!ok) {
        throw "Failed to save your model"
      }

      if (!modelNameParam) {
        history.push(`${url}/${bqModelName}`)
      }
      dispatch({ type: 'setNeedsSaving', value: false })
      setSaving(false)
    } catch (error) {
      if (retry) {
        console.error("Failed to save model to BQ model state")
        return
      }
      // retry once
      persistWizardState(true)
    }
  }


  return (
    <ModelContext.Provider
      value={{
        saving,
        stopPolling,
      }}
    >
      {children}
    </ModelContext.Provider>
  )
}
