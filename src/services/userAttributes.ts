import { Looker40SDK } from '@looker/sdk'
import { BIGQUERY_CONN, BQML_MODEL_DATASET_NAME, GCP_PROJECT } from '../constants'

export function getBigQueryConnectionName(userAttributes: any) {
  try {
    const bigQueryConn = userAttributes.find((ua: any) => ua.name === BIGQUERY_CONN)
    if (!bigQueryConn || !bigQueryConn.value) { throw 'Unable to find BigQuery Connection Name'}
    return bigQueryConn.value
  } catch (error) {
    try {
      // Hardcoded value for when the extension has not been installed via the marketplace
      return process.env.BIGQUERY_CONN
    } catch (err) {
      throw new Error("A big query connection name must be provided.")
    }
  }
}

export function getBqmlModelDatasetName(userAttributes: any) {
  try {
    const bqmlModelDatasetName = userAttributes.find((ua: any) => ua.name === BQML_MODEL_DATASET_NAME)
    if (!bqmlModelDatasetName || !bqmlModelDatasetName.value) { throw 'Unable to find Dataset Name'}
    return bqmlModelDatasetName.value
  } catch (error) {
    try {
      // Hardcoded value for when the extension has not been installed via the marketplace
      return process.env.BQML_MODEL_DATASET_NAME
    } catch (err) {
      throw new Error("A Looker Temp Dataset Name name must be provided.")
    }
  }
}

export function getGCPProject(userAttributes: any) {
  try {
    const gcpProject = userAttributes.find((ua: any) => ua.name === GCP_PROJECT)
    if (!gcpProject || !gcpProject.value) { throw 'Unable to find GCP Project'}
    return gcpProject.value
  } catch (error) {
    try {
      // Hardcoded value for when the extension has not been installed via the marketplace
      return process.env.GCP_PROJECT
    } catch (err) {
      throw new Error("A GCP Project name must be provided.")
    }
  }
}

export async function getAllUserAttributes(coreSDK: Looker40SDK, userId: number) {
    if (!userId) { throw 'Failed to retrieve user attributes because no user was specified' }
  // @ts-ignore
  const { ok, value } = await coreSDK.user_attribute_user_values({ user_id: userId })
  if (!ok) {
    throw 'Failed to retrieve user attributes'
  }

  const bigQueryConn = getBigQueryConnectionName(value)
  const gcpProject = getGCPProject(value)
  const bqmlModelDatasetName = getBqmlModelDatasetName(value)
  return {
    bigQueryConn,
    gcpProject,
    bqmlModelDatasetName
  }
}
