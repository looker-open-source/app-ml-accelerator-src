import React, { createContext, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BQMLContext } from './BQMLProvider'
import { useStore } from './StoreProvider'
import { JOB_STATUSES } from '../constants'
import { EVALUATE_CREATE_SQL_METHODS, getEvaluateDataSql } from '../services/modelTypes'
import { WizardContext } from './WizardProvider'

type IModelContext = {
  stopPolling?: () => void
  getModelEvalFuncData?: (
    evalFuncName: string
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
  const { pollJobStatus, cancelJob, getJob, queryJob } = useContext(BQMLContext)
  const { persistModelState } = useContext(WizardContext)
  const { jobStatus, job } = state.bqModel
  const [ polling, setPolling ] = useState(false)
  const [ pollCanceler, setPollCanceler ] = useState<{ cancel: () => void}>()
  const { gcpProject, bqmlModelDatasetName } = state.userAttributes

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
    dispatch({ type: 'setBQModel', data: { jobStatus: JOB_STATUSES.failed }})
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
      await persistModelState?.({ ...wizard }, tempBQModel)
      dispatch({
        type: 'addToStepData',
        step: 'step4',
        data: { complete: false }
      })
      dispatch({ type: 'setBQModel', data: { jobStatus: JOB_STATUSES.canceled }})
    } catch(error) {
      dispatch({type: 'addError', error: "Failed to cancel model creation: " + error})
      return { ok: false }
    }
  }

  // Create & Fetch Evaluate function data in BigQuery
  const getModelEvalFuncData = async (
    evalFuncName: string
  ) => {
    try {
      const { name: bqModelName, inputDataUID: uid, selectedFeatures } = state.bqModel

      // check if evaluate table already exists
      const selectSql = getEvaluateDataSql({ evalFuncName, gcpProject, bqmlModelDatasetName, bqModelName })
      if (!selectSql) { throw 'Failed to generate select sql' }

      const { ok, body } = await queryJob?.(selectSql)
      let queryResults = body

      if (!ok) {
        // if the evaluate table doesnt exist yet, create it and select from it again
        const createSql = EVALUATE_CREATE_SQL_METHODS[evalFuncName]({
          gcpProject,
          bqmlModelDatasetName,
          bqModelName,
          uid,
          selectedFeatures
        })
        if (!createSql) { throw 'Failed to generate create sql' }

        const { ok: createOk } = await queryJob?.(createSql)
        if (!createOk) { throw 'Failed to create evaluate table' }

        // fetch table results now that table is created
        const { ok: selectOk, body: selectBody } = await queryJob?.(selectSql)
        if (!selectOk) { throw 'Failed to fetch evaluate table data' }
        queryResults = selectBody
      }

      dispatch({ type: 'addToStepData', step: 'step4', data: {
        evaluateData: {
          ...state.wizard.steps.step4.evaluateData,
          [evalFuncName]: queryResults
        },
        complete: true
      }})
      return { ok: true, body: queryResults }
    } catch (error) {
      dispatch({type: 'addError', error: "Error fetching evaluation data: " + error})
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
