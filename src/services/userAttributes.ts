import { ExtensionSDK } from '@looker/extension-sdk'
import { BIGQUERY_CONN, GOOGLE_CLIENT_ID } from '../constants'

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
