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
import { BQMLContext } from './BQMLProvider'
import { useStore } from './StoreProvider'
import { JOB_STATUSES } from '../constants'

type IModelContext = {
  cancelPoll?: (jobId: string) => void,
  cancelAllPolls?: () => void
}

export const ModelContext = createContext<IModelContext>({})

/**
 * Model provider
 */
export const ModelProvider = ({ children }: any) => {
  const { state, dispatch } = useStore()
  const { coreSDK: sdk } = useContext(ExtensionContext2)
  const { pollJobStatus } = useContext(BQMLContext)
  const { jobStatus, job } = state.wizard.steps.step4
  const [ polling, setPolling ] = useState(false)
  const [ hasError, setHasError ] = useState(false)
  const [ pollCancelers, setPollCancelers ] = useState<{[key: string]: () => void}>({})

  // if a job is pending or running,
  // continuously short poll the job until its status is DONE
  useEffect(() => {
    if (!jobStatus || jobStatus === JOB_STATUSES.done || polling || hasError) {
      return
    }
    getJobStatus()
  })

  const cancelPoll = (jobId: string) => {
    pollCancelers[jobId]?.()
  }

  const cancelAllPolls = () => {
    for (const key in pollCancelers) {
      pollCancelers[key]()
    }
  }

  const getJobStatus = async () => {
    try {
      if (!job.jobId || !pollJobStatus) {
        throw "Missing jobid or failed instantiation of BQ"
      }
      setPolling(true)
      const { promise, cancel } = pollJobStatus(job.jobId, 10000)
      setPollCancelers({
        [job.jobId]: cancel,
        ...pollCancelers
      })

      const { ok, body, canceled } = await promise
      if (canceled) { return }
      if (!ok) {
        throw "Failed to retrieve job status"
      }
      if (body.status.errorResult) {
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
      setPolling(false)
    } catch (error: any) {
      dispatch({ type: 'addError', error: "An error occurred while fetching the job status: " + error})
      setPolling(false)
      setHasError(true)
    }
  }


  return (
    <ModelContext.Provider
      value={{
        cancelPoll,
        cancelAllPolls
      }}
    >
      {children}
    </ModelContext.Provider>
  )
}
