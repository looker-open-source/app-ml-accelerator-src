import React, { createContext, useContext, useState } from 'react'
import { ExtensionContext2 } from '@looker/extension-sdk-react'
import { OauthContext } from './OauthProvider'
import { useStore } from './StoreProvider'
import { poll } from '../services/common'
import { generateModelState } from '../services/modelState'
import { BQML_LOOKER_MODEL, JOB_STATUSES, MODEL_STATE_TABLE_COLUMNS } from '../constants'
import { BQModelState, WizardState } from '../types'
import { BigQueryModelMetadata } from '../types/BigQueryModel'

type insertOrUpdateModelStateProps = {
  wizardState: WizardState,
  bqModel: BQModelState,
  isModelCreate?: boolean,
  isModelUpdate?: boolean
}

type IBQMLContext = {
  expired?: boolean,
  setExpired?: (value: boolean) => void,
  queryJob?: (sql: string) => Promise<any>,
  queryJobAndWait?: (
    jobId: string,
    interval?: number,
    maxAttempts?: number
  ) => Promise<any>
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
  getModel?: (props: { modelName: string }) => Promise<any>,
  updateModel?: (props: { model: BigQueryModelMetadata, modelName: string }) => Promise<any>,
  deleteModel?: (props: { modelName: string }) => Promise<any>,
  deleteTable?: (props: { tableName: string }) => Promise<any>,
  createModelStateTable?: () => Promise<any>,
  insertOrUpdateModelState?: (props: insertOrUpdateModelStateProps) => Promise<any>,
  updateModelStateSharedWithEmails?: (bqModelName: string, sharedWithEmails: string[]) => Promise<any>
  deleteModelFromModelState?: (bqModelName: string) => Promise<any>
  getAllMySavedModels?: (hideError?: boolean) => Promise<any>,
  getSavedModelsSharedWithMe?: (hideError?: boolean) => Promise<any>,
  getSavedModelState?: (modelName: string) => Promise<any>,
  getSavedModelByName?: (modelName: string) => Promise<any>,
  getAllInputDataTables?: (modelName: string) => Promise<any>
}

export const BQMLContext = createContext<IBQMLContext>({})

/**
 * BQML provider that exposes a wrapper around the Google
 * BQML restful API.
 */
export const BQMLProvider = ({ children }: any) => {
  const { token, expiry, signIn } = useContext(OauthContext)
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
  const invokeBQApi = async (pathname: string, requestBody?: any, forcedMethod?: 'PATCH' | 'DELETE') => {
    try {
      if (expiry < new Date()) { await signIn(); }
      const init: any = requestBody
        ? {
            method: forcedMethod || 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
          }
        : {
            method: forcedMethod || 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      setExpired(false)
      const { ok, status, body } = await extensionSDK.fetchProxy(
        `https://bigquery.googleapis.com/bigquery/v2/${pathname}`,
        init
      )
      if (status === 401) { //|| status === 404
        if (canExpire) {
          setCanExpire(false)
          setExpired(true)
          // dispatch({ type: 'addError', error: 'Unauthorized request to google api or session has expired.  Relogging in.' })
        }
      }
      return { ok, body, status }
    } catch (error) {
      // dispatch({ type: 'addError', error: "Failed to connect to BigQuery. Please refresh and try again." })
      return { ok: false }
    }
  }

  /**
   * Create job to build summary data
   */
  const queryJob = async (sql: string) => {
    console.log(`queryJob start at ${new Date()}`)
    const { value: query } = await coreSDK.create_sql_query({
      connection_name: "bigquery",
      sql: sql.replace(/\n/g, ' ')
    })
    const { ok, value } = await coreSDK.run_sql_query(query.slug, "json")
    console.log(sql)
    console.log(JSON.stringify( { ok, body: value }))
    // const result = await invokeBQApi(
    //   `projects/${gcpProject}/queries`,
    //   {
    //     query: sql.replace(/\n/g, ' '),
    //     useLegacySql: false,
    //     useQueryCache: false
    //   }
    // )
    console.log(`queryJob end at ${new Date()}`)
    return  { ok, body: value } // raname value to body 
    // return result
  }

  /**
   * Create job and if it doesnt complete, poll it until it does
   */
   const queryJobAndWait = async (sql: string, interval?: number, maxAttempts?: number) => {
     try {
      const { ok, body } = await queryJob(sql)
      // if (!body.jobComplete) {
      //   // poll job until we get a result
      //   const { promise } = pollJobStatus(
      //     body.jobReference.jobId,
      //     interval || 2000,
      //     maxAttempts
      //   )
      //   const result = await promise
      //   return result;
      // }

      return { ok, body }
    } catch (error) {
      return { ok: false, error }
    }
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

  /**
   * Fetch a model
   */
   const getModel = async ({ modelName }: { modelName: string }) => {
    if (!modelName) {
      throw "Failed fetch model because modelName was not provided"
    }
    // const result = await invokeBQApi(
    //   `projects/${gcpProject}/datasets/${bqmlModelDatasetName}/models/${modelName}`
    // )
    // return result
    const sql = `
      SELECT *, 
      '${gcpProject}' AS project_name, 
      '${bqmlModelDatasetName}' AS dataset_name 
      FROM ${bqmlModelDatasetName}.bqml_model_info
      WHERE model_name = '${modelName}'
    `
    return queryJob(sql)
  }

  /**
   * Patch a model
   */
    const updateModel = async ({ model, modelName }: { model: BigQueryModelMetadata, modelName: string }) => {
    if (!model || !modelName) {
      throw "Failed to save model because model was not provided"
    }
    const result = await invokeBQApi(
      `projects/${gcpProject}/datasets/${bqmlModelDatasetName}/models/${modelName}`,
      model,
      'PATCH'
    )
    return result
  }

   /**
   * Delete a model
   */
  const deleteModel = async ({ modelName }: { modelName: string }) => {
    if (!modelName) {
      throw "Failed to delete model because modelName was not provided"
    }
    // const result = await invokeBQApi(
    //   `projects/${gcpProject}/datasets/${bqmlModelDatasetName}/models/${modelName}`,
    //   undefined,
    //   'DELETE'
    // )
    // return result
    const sql = `DROP MODEL IF EXISTS ${bqmlModelDatasetName}.${modelName}`
    return queryJob(sql)
  }

  /**
  * Delete a model
  */
  const deleteTable = async ({ tableName }: { tableName: string }) => {
    if (!tableName) {
      throw "Failed to delete table because tableName was not provided"
    }
    // const result = await invokeBQApi(
    //   `projects/${gcpProject}/datasets/${bqmlModelDatasetName}/tables/${tableName}`,
    //   undefined,
    //   'DELETE'
    // )
    // return result
    const sql = `DROP TABLE IF EXISTS ${bqmlModelDatasetName}.${tableName}`
    return queryJob(sql)
  }

  const createModelStateTable = () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${bqmlModelDatasetName}.bqml_model_info
                  (model_name             STRING,
                   state_json             STRING,
                   created_by_email       STRING,
                   created_by_first_name  STRING,
                   created_by_last_name   STRING,
                   shared_with_emails     STRING,
                   model_created_at       INTEGER,
                   model_updated_at       INTEGER)
    `
    return queryJobAndWait(sql)
  }

  const insertOrUpdateModelState = ({
    wizardState,
    bqModel,
    isModelCreate = false,
    isModelUpdate = false
  }: insertOrUpdateModelStateProps) => {
    const  { name: bqModelName } = bqModel
    const { email: userEmail, firstName: firstName, lastName: lastName } = state.user
    const stateJson = JSON.stringify(generateModelState(wizardState, bqModel))

    let timeSql: string = ''
    let timestampCreate: string = ''
    let timestampUpdate: string = ''
    const now = new Date().getTime()
    if (isModelCreate) {
      timeSql += `, ${now} as model_created_at, ${now} as model_updated_at`
      timestampCreate = ', model_created_at, model_updated_at'
    }
    if (!isModelCreate && isModelUpdate) {
      timeSql +=`, ${now} as model_updated_at`
      timestampUpdate = ', model_updated_at=S.model_updated_at'
    }

    const sql = `
      MERGE ${bqmlModelDatasetName}.bqml_model_info AS T
          USING (SELECT '${bqModelName}' AS model_name
                  , '${stateJson}' as state_json
                  , '${userEmail}' as created_by_email
                  , '${firstName}' as created_by_first_name
                  , '${lastName}' as created_by_last_name
                  ${timeSql}
                ) AS S
          ON T.model_name = S.model_name
          WHEN MATCHED THEN
            UPDATE SET state_json=S.state_json ${timestampUpdate}
          WHEN NOT MATCHED THEN
            INSERT (model_name, state_json, created_by_first_name, created_by_last_name, created_by_email${timestampCreate})
            VALUES(model_name, state_json, created_by_first_name, created_by_last_name, created_by_email${timestampCreate})
    `
    return queryJobAndWait(sql)
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

  const deleteModelFromModelState = (bqModelName: string) => {
    const sql = `
      DELETE ${gcpProject}.${bqmlModelDatasetName}.bqml_model_info
      WHERE model_name = '${bqModelName}'
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
      cache: false
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

  // Get all models shared with the user
  const getSavedModelsSharedWithMe = async (hideError?: boolean) => {
    try {
      const { email: userEmail } = state.user
      if (!userEmail) { return { ok: false } }
      return await getSavedModels({
        [MODEL_STATE_TABLE_COLUMNS.sharedWithEmails]: `%"${userEmail}"%`
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
        error: 'Failed to retrieve model: '// + error
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
        queryJobAndWait,
        cancelJob,
        getJob,
        pollJobStatus,
        getModel,
        updateModel,
        deleteModel,
        deleteTable,
        createModelStateTable,
        insertOrUpdateModelState,
        updateModelStateSharedWithEmails,
        deleteModelFromModelState,
        getAllMySavedModels,
        getSavedModelsSharedWithMe,
        getSavedModelState,
        getSavedModelByName
      }}
    >
      {children}
    </BQMLContext.Provider>
  )
}
