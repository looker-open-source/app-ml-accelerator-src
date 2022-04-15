import { compact } from "lodash"
import { MODEL_STATE_TABLE_COLUMNS } from "../constants"

export const MODELS_PER_PAGE = 15

export const formatSavedModelData = (models: any[]) => (
  compact(models.map((model) => {
    const state = parseModelInfoJson(model[MODEL_STATE_TABLE_COLUMNS.stateJson].value)
    if (!state) { return }
    return {
      [MODEL_STATE_TABLE_COLUMNS.modelName]: model[MODEL_STATE_TABLE_COLUMNS.modelName]?.value,
      [MODEL_STATE_TABLE_COLUMNS.createdByEmail]: model[MODEL_STATE_TABLE_COLUMNS.createdByEmail]?.value,
      [MODEL_STATE_TABLE_COLUMNS.stateJson]: state,
      objective: state.bqModel.objective,
      [MODEL_STATE_TABLE_COLUMNS.sharedWithEmails]: safelyParseJson(model[MODEL_STATE_TABLE_COLUMNS.sharedWithEmails]?.value),
      [MODEL_STATE_TABLE_COLUMNS.modelCreatedAt]: toDate(model[MODEL_STATE_TABLE_COLUMNS.modelCreatedAt]?.value),
      [MODEL_STATE_TABLE_COLUMNS.modelUpdatedAt]: toDate(model[MODEL_STATE_TABLE_COLUMNS.modelUpdatedAt]?.value),
    }
  }))
)

const toDate = (dateStr: string) => (
  dateStr ? new Date(dateStr) : undefined
)

const parseModelInfoJson = (json: string) => {
  const parsed = safelyParseJson(json)
  if (!parsed || !parsed.hasOwnProperty('bqModel')) { return undefined }
  return parsed
}

const safelyParseJson = (json: string) => {
  let parsed
  try {
    parsed = JSON.parse(json)
  } catch (e) {}
  return parsed
}

export const getPagedModels = (models: any[], page: number) => {
  const endIndex = page * MODELS_PER_PAGE
  const startIndex = endIndex - MODELS_PER_PAGE

  return models.slice(startIndex, endIndex)
}

// export const buildModelListOptions = (models: any[], email: string) => {
//   const options: {[key: string]: any} = {}
//   models.forEach((record: any) => {
//     const modelName = record[MODEL_STATE_TABLE_COLUMNS.modelName]?.value
//     const createEmail = record[MODEL_STATE_TABLE_COLUMNS.createdByEmail]?.value

//     if (!options[createEmail]) {
//       options[createEmail] = {
//         label: createEmail,
//         options: []
//       }
//     }
//     options[createEmail].options.push({ value: modelName, label: modelName })
//   })
//   return Object.values(options).sort(sortMyModelsFirst(email))
// }

// const sortMyModelsFirst = (email: string) => {
//   return (a: any, b: any) => {
//     if (a.label === email) { return -1 }
//     if (b.label === email) { return 1 }
//     if (a.label < b.label) { return -1 }
//     if (a.label > b.label) { return 1 }
//     return 0
//   }
// }

// export const filterModelListOptions = (models: any[], filterTerm: string) => {
//   const filteredOptions = models.map((category) => {
//     const filteredOptions = category.options.filter((option: any) => option.label.includes(filterTerm))
//     if (filteredOptions.length <= 0) {
//       return null
//     }
//     return {
//       ...category,
//       options: filteredOptions
//     }
//   })
//   return compact(filteredOptions)
// }
