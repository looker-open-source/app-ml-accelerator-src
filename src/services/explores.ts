import { Looker40SDK as LookerSDK } from "@looker/sdk"
import { ILookmlModel } from "@looker/sdk/lib/4.0/models"
import { compact } from 'lodash'

async function getBigQueryConnectionName(extensionSDK) {
  try {
    const { value: result } = await extensionSDK.userAttributeGetItem("bigquery_connection_name")
    return result
  } catch (error) {
    try {
      // Hardcoded value for when the extension has not been installed via the marketplace
      return process.env.BIGQUERY_CONN
    } catch (err) {
      throw new Error("A big query connection name must be provided.")
    }
  }
}

/*
* Fetch all explores and associated models and sort them
*/
export async function fetchSortedModelsAndExplores(extensionSDK: any, sdk: LookerSDK): Promise<any[]> {
  try {
    const connectionName = await getBigQueryConnectionName(extensionSDK)
    const { value: result } = await sdk.all_lookml_models({})
    const modelExplores = (result || [])
      .filter(
        (model: ILookmlModel) =>
          model.explores?.length &&
            model.label !== "System Activity" &&
            model.allowed_db_connection_names.indexOf(connectionName) >= 0
      )
      .sort(alphabeticSortByLabel)
      .map((model: ILookmlModel) => ({
        name: model.name,
        label: model.label,
        explores: compact((model.explores || [])
          .map((view) => {
            if (view.hidden) { return null }
            return {
              name: view.name,
              label: view.label,
            }
          }))
          .sort(alphabeticSortByLabel),
      }))
    return modelExplores
  } catch (error) {
      throw new Error(error)
  }
}

function alphabeticSortByLabel(obj1: any, obj2: any) {
  const label1 = obj1.label.toLowerCase()
  const label2 = obj2.label.toLowerCase()
  return label1 < label2 ? -1 : 1
}

/*
* returns a filtered list of explores/models that contain textValue
*/
export const filterExplores = (textValue: string | null, modelsArray: ILookmlModel[]): ILookmlModel[] => {
  if (!textValue) {
    return modelsArray
  }
  var resultsArr: ILookmlModel[] = []

  modelsArray.forEach((model) => {
    if (
      model.label &&
      model.label.toLowerCase().indexOf(textValue.toLowerCase()) >= 0
    ) {
      // Title match.
      resultsArr.push(model)
      return
    }

    var filteredModel: ILookmlModel = {
      label: model.label,
      name: model.name,
      explores: [],
    }

    model.explores?.forEach((explore) => {
      if (
        explore.label &&
        explore.label.toLowerCase().indexOf(textValue.toLowerCase()) >= 0
      ) {
        filteredModel.explores?.push(explore)
      }
    })

    if (filteredModel.explores?.length || 0 > 0) {
      resultsArr.push(filteredModel)
    }
  })

  return resultsArr;
}
