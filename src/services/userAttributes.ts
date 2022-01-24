import { BIGQUERY_CONN } from '../constants'

export async function getBigQueryConnectionName(extensionSDK) {
  try {
    const { value: result } = await extensionSDK.userAttributeGetItem(BIGQUERY_CONN)
    return result
  } catch (error) {
    try {
      debugger;
      // Hardcoded value for when the extension has not been installed via the marketplace
      return process.env.BIGQUERY_CONN
    } catch (err) {
      throw new Error("A big query connection name must be provided.")
    }
  }
}
