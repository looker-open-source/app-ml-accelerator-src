import React, { createContext, useContext, useState } from 'react'
import { ExtensionContext2 } from '@looker/extension-sdk-react'
import { OauthContext } from './OauthProvider'
import { useStore } from './StoreProvider'
import { poll } from '../services/common'
import { generateModelState } from '../services/modelState'
import { BQML_LOOKER_MODEL, JOB_STATUSES, MODEL_STATE_TABLE_COLUMNS } from '../constants'
import { BQModelState, WizardState } from '../types'

type IBQMLContext = {
  expired?: boolean,
  setExpired?: (value: boolean) => void,
  queryJob?: (sql: string) => Promise<any>,
  cancelJob?: (props: { jobId: string, location: string }) => Promise<any>
  getJob?: (props: any) => Promise<any>,
  pollJobStatus?: (
    jobId: string,
    interval: number,
    maxAttempts?: number
  ) => {
    promise: Promise<any>,
    cancel: () => void
  },
  createModelStateTable?: () => Promise<any>,
  insertOrUpdateModelState?: (wizardState: WizardState, bqModel: BQModelState) => Promise<any>,
  updateModelStateSharedWithEmails?: (bqModelName: string, sharedWithEmails: string[]) => Promise<any>
  getAllMySavedModels?: (hideError?: boolean) => Promise<any>,
  getAllAccessibleSavedModels?: (hideError?: boolean) => Promise<any>,
  getSavedModelState?: (modelName: string) => Promise<any>
  getSavedModelByName?: (modelName: string) => Promise<any>
}

export const BQMLContext = createContext<IBQMLContext>({})

/**
 * BQML provider that exposes a wrapper around the Google
 * BQML restful API.
 */
export const BQMLProvider = ({ children }: any) => {
  const { token } = useContext(OauthContext)
  const { extensionSDK, coreSDK } = useContext(ExtensionContext2)
  const { state, dispatch } = useStore()
  const [expired, setExpired] = useState(false)
  const [ canExpire, setCanExpire ] = useState(true)
  const { gcpProject, bqmlModelDatasetName } = state.userAttributes

  /**
   * Low level invocation of the BigQuery API.
   * Performs primitive error handling.
   *
   * This is a private method.
   */
  const invokeBQApi = async (pathname: string, requestBody?: any) => {
    try {
      const init: any = requestBody
        ? {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
          }
        : {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      setExpired(false)
      const { ok, status, body } = await extensionSDK.fetchProxy(
        `https://bigquery.googleapis.com/bigquery/v2/${pathname}`,
        init
      )
      if (status === 401 || status === 404) {
        if (canExpire) {
          setCanExpire(false)
          setExpired(true)
          dispatch({ type: 'addError', error: 'Unauthorized request to google api.' })
        }
      }
      return { ok, body, status }
    } catch (error) {
      // setExpired(true)
      dispatch({ type: 'addError', error: "Failed to connect to BigQuery. Please refresh and try again." })
      return { ok: false }
    }
  }

  /**
   * Create job to build summary data
   */
  const queryJob = async (sql: string) => {
    const result = await invokeBQApi(
      `projects/${gcpProject}/queries`,
      {
        query: sql.replace(/\n/g, ' '),
        useLegacySql: false
      }
    )
    return result
  }

  /**
   * Cancel a job
   * location param is the location the job returns when fetching it (stored in state.bqModel.job.location)
   */
   const cancelJob = async ({ jobId, location }: { jobId: string, location: string }) => {
    if (!jobId) {
      throw "Failed fetch job because jobId was not provided"
    }
    const result = await invokeBQApi(
      `projects/${gcpProject}/jobs/${jobId}/cancel`,
      {
        location
      }
    )
    return result
  }

  /**
   * Fetch a job
   */
  const getJob = async ({ jobId }: { jobId: string }) => {
    if (!jobId) {
      throw "Failed fetch job because jobId was not provided"
    }
    const result = await invokeBQApi(
      `projects/${gcpProject}/jobs/${jobId}`
    )
    return result
  }

  const pollJobStatus = (jobId: string, interval: number, maxAttempts?: number) => {
    if (!getJob || !jobId) {
      throw "Failed to fetch job"
    }
    const { promise, cancel } = poll({
      fn: getJob,
      props: { jobId },
      validate: ({ok, body}) => (ok && body.status.state === JOB_STATUSES.done),
      interval,
      maxAttempts
    })
    return { promise, cancel }
  }

  const createModelStateTable = () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${bqmlModelDatasetName}.bqml_model_info
                  (model_name         STRING,
                   state_json         STRING,
                   created_by_email   STRING,
                   shared_with_emails   STRING)
    `
    return queryJob(sql)
  }

  const insertOrUpdateModelState = (wizardState: WizardState, bqModel: BQModelState) => {
    const  { name: bqModelName } = bqModel
    const { email: userEmail } = state.user
    const stateJson = JSON.stringify(generateModelState(wizardState, bqModel))

    const sql = `
      MERGE ${bqmlModelDatasetName}.bqml_model_info AS T
          USING (SELECT '${bqModelName}' AS model_name
                  , '${stateJson}' as state_json
                  , '${userEmail}' as created_by_email
                ) AS S
          ON T.model_name = S.model_name
          WHEN MATCHED THEN
            UPDATE SET state_json=S.state_json
          WHEN NOT MATCHED THEN
            INSERT (model_name, state_json, created_by_email)
            VALUES(model_name, state_json, created_by_email)
    `
    return queryJob(sql)
  }

  const updateModelStateSharedWithEmails = (bqModelName: string, sharedWithEmails: string[]) => {
    const sharedWithEmailsJson = JSON.stringify(sharedWithEmails)

    const sql = `
      MERGE ${bqmlModelDatasetName}.bqml_model_info AS T
          USING (SELECT '${bqModelName}' AS model_name
                  , '${sharedWithEmailsJson}' as shared_with_emails
                ) AS S
          ON T.model_name = S.model_name
          WHEN MATCHED THEN
            UPDATE SET shared_with_emails=S.shared_with_emails
    `
    return queryJob(sql)
  }

  const getSavedModels = async (
    filters: {[key: string]: string},
    fields?: string[]
  ) => {
    const { value: query } = await coreSDK.create_query({
      model:  BQML_LOOKER_MODEL,
      view: 'model_info',
      fields: fields || Object.values(MODEL_STATE_TABLE_COLUMNS),
      filters
    })
    const { ok, value } = await coreSDK.run_query({
      query_id: query.id,
      result_format: "json_detail",
    })
    if (!ok) {
      throw "Please try refreshing the page."
    }
    if (value.errors && value.errors.length >= 1) {
      throw value.errors[0].message
    }
    return { ok, value }
  }

  const getSavedModelByName = async (modelName: string) => {
    try {
      if (!modelName) { return { ok: false }}
      return await getSavedModels?.({
        [MODEL_STATE_TABLE_COLUMNS.modelName]: modelName
      }, [MODEL_STATE_TABLE_COLUMNS.modelName, MODEL_STATE_TABLE_COLUMNS.createdByEmail])
    } catch (error) {
      return { ok: false }
    }
  }

  const getAllMySavedModels = async (hideError?: boolean) => {
    try {
      const { email: userEmail } = state.user
      if (!userEmail) { return { ok: false } }
      return await getSavedModels({
        [MODEL_STATE_TABLE_COLUMNS.createdByEmail]: userEmail
      }, Object.values(MODEL_STATE_TABLE_COLUMNS))
    } catch (error) {
      if (!hideError) {
        dispatch({
          type: 'addError',
          error: 'Failed to retrieve model(s): ' + error
        })
      }
      return { ok: false }
    }
  }

  // Get all models user has access to
  const getAllAccessibleSavedModels = async (hideError?: boolean) => {
    try {
      const { email: userEmail } = state.user
      if (!userEmail) { return { ok: false } }
      return await getSavedModels({
        [MODEL_STATE_TABLE_COLUMNS.fullEmailList]: `%"${userEmail}"%`
      }, Object.values(MODEL_STATE_TABLE_COLUMNS))
    } catch (error) {
      if (!hideError) {
        dispatch({
          type: 'addError',
          error: 'Failed to retrieve model(s): ' + error
        })
      }
      return { ok: false }
    }
  }

  const getSavedModelState = async (modelName: string) => {
    try {
      const { email: userEmail } = state.user
      if (!modelName || !userEmail) { return { ok: false } }

      const { value } = await getSavedModels({
        [MODEL_STATE_TABLE_COLUMNS.modelName]: modelName
      })
      const savedData = value.data[0]

      // check if current user has access to model
      if (savedData[MODEL_STATE_TABLE_COLUMNS.createdByEmail]?.value !== userEmail &&
        !savedData[MODEL_STATE_TABLE_COLUMNS.sharedWithEmails]?.value.includes(`"${userEmail}"`)) {
          throw "You do not have access to this model."
      }
      const stateJson = savedData ? savedData[MODEL_STATE_TABLE_COLUMNS.stateJson].value : null
      if (!stateJson) {
        throw "Please try again."
      }
      return JSON.parse(stateJson)
    } catch (error) {
      dispatch({
        type: 'addError',
        error: 'Failed to retrieve model: ' + error
      })
      return false
    }
  }

  return (
    <BQMLContext.Provider
      value={{
        expired,
        setExpired,
        queryJob,
        cancelJob,
        getJob,
        pollJobStatus,
        createModelStateTable,
        insertOrUpdateModelState,
        updateModelStateSharedWithEmails,
        getAllMySavedModels,
        getAllAccessibleSavedModels,
        getSavedModelState,
        getSavedModelByName
      }}
    >
      {children}
    </BQMLContext.Provider>
  )
}
