import { ExtensionSDK } from '@looker/extension-sdk'
import { BIGQUERY_CONN, GOOGLE_CLIENT_ID, BQML_MODEL_DATASET_NAME, GCP_PROJECT } from '../constants'

export async function getBigQueryConnectionName(extensionSDK: ExtensionSDK) {
  try {
    const bigQueryConn = await extensionSDK.userAttributeGetItem(BIGQUERY_CONN)
    return bigQueryConn
  } catch (error) {
    try {
      // Hardcoded value for when the extension has not been installed via the marketplace
      return process.env.BIGQUERY_CONN
    } catch (err) {
      throw new Error("A big query connection name must be provided.")
    }
  }
}

export async function getGoogleClientID(extensionSDK: ExtensionSDK) {
  try {
    const googleClientId = await extensionSDK.userAttributeGetItem(GOOGLE_CLIENT_ID)
    return googleClientId
  } catch (error) {
    try {
      // Hardcoded value for when the extension has not been installed via the marketplace
      return process.env.GOOGLE_CLIENT_ID
    } catch (err) {
      throw new Error("A Google Client ID name must be provided.")
    }
  }
}

export async function getBqmlModelDatasetName(extensionSDK: ExtensionSDK) {
  try {
    const bqmlModelDatasetName = await extensionSDK.userAttributeGetItem(BQML_MODEL_DATASET_NAME)
    return bqmlModelDatasetName
  } catch (error) {
    try {
      // Hardcoded value for when the extension has not been installed via the marketplace
      return process.env.BQML_MODEL_DATASET_NAME
    } catch (err) {
      throw new Error("A Looker Temp Dataset Name name must be provided.")
    }
  }
}

export async function getGCPProject(extensionSDK: ExtensionSDK) {
  try {
    const gcpProject = await extensionSDK.userAttributeGetItem(GCP_PROJECT)
    return gcpProject
  } catch (error) {
    try {
      // Hardcoded value for when the extension has not been installed via the marketplace
      return process.env.GCP_PROJECT
    } catch (err) {
      throw new Error("A GCP Project name must be provided.")
    }
  }
}

export async function getAllUserAttributes(extensionSDK: ExtensionSDK) {
  const bigQueryConn = await getBigQueryConnectionName(extensionSDK)
  const googleClientId = await getGoogleClientID(extensionSDK)
  const gcpProject = await getGCPProject(extensionSDK)
  const bqmlModelDatasetName = await getBqmlModelDatasetName(extensionSDK)
  return {
    bigQueryConn,
    googleClientId,
    gcpProject,
    bqmlModelDatasetName
  }
}
