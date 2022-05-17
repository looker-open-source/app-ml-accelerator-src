import { Looker40SDK } from '@looker/sdk'
import { BIGQUERY_CONN, GOOGLE_CLIENT_ID, BQML_MODEL_DATASET_NAME, GCP_PROJECT } from '../constants'

export function getBigQueryConnectionName(userAttributes: any) {
  try {
    const bigQueryConn = userAttributes.find((ua: any) => ua.name === BIGQUERY_CONN)
    if (!bigQueryConn || !bigQueryConn.value) { throw 'Unable to find BigQuery Connection Name'}
    // const bigQueryConn = await extensionSDK.userAttributeGetItem(BIGQUERY_CONN)
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

export function getGoogleClientID(userAttributes: any) {
  try {
    const googleClientId = userAttributes.find((ua: any) => ua.name === GOOGLE_CLIENT_ID)
    if (!googleClientId || !googleClientId.value) { throw 'Unable to find Google Client ID'}
    // const bigQueryConn = await extensionSDK.user_attribute(googleClientId.id)
    return googleClientId.value
  } catch (error) {
    try {
      // Hardcoded value for when the extension has not been installed via the marketplace
      return process.env.GOOGLE_CLIENT_ID
    } catch (err) {
      throw new Error("A Google Client ID name must be provided.")
    }
  }
}

export function getBqmlModelDatasetName(userAttributes: any) {
  try {
    const bqmlModelDatasetName = userAttributes.find((ua: any) => ua.name === BQML_MODEL_DATASET_NAME)
    if (!bqmlModelDatasetName || !bqmlModelDatasetName.value) { throw 'Unable to find Dataset Name'}
    // const bqmlModelDatasetName = await extensionSDK.userAttributeGetItem(BQML_MODEL_DATASET_NAME)
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
    // const gcpProject = await extensionSDK.userAttributeGetItem(GCP_PROJECT)
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
  const { ok, value } = await coreSDK.user_attribute_user_values({ user_id: 89 })
  if (!ok) {
    throw 'Failed to retrieve user attributes'
  }

  const bigQueryConn = getBigQueryConnectionName(value)
  const googleClientId = getGoogleClientID(value)
  const gcpProject = getGCPProject(value)
  const bqmlModelDatasetName = getBqmlModelDatasetName(value)
  return {
    bigQueryConn,
    googleClientId,
    gcpProject,
    bqmlModelDatasetName
  }
}
