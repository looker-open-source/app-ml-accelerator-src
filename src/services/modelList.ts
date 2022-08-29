import { compact } from "lodash"
import { MODEL_STATE_TABLE_COLUMNS } from "../constants"
import { BQModelState } from "../types"
import { MODEL_TYPES } from "./modelTypes"
import { zonedTimeToUtc } from "date-fns-tz"

export const MODELS_PER_PAGE = 16

export const formatSavedModelData = (models: any[]) => (
  compact(models.map((model) => {
    const state = parseModelInfoJson(model[MODEL_STATE_TABLE_COLUMNS.stateJson].value)
    if (!state) { return }
    if (!state.bqModel.objective || !Object.keys(MODEL_TYPES).includes(state.bqModel.objective)) {
      return
    }
    return {
      [MODEL_STATE_TABLE_COLUMNS.modelName]: model[MODEL_STATE_TABLE_COLUMNS.modelName]?.value,
      [MODEL_STATE_TABLE_COLUMNS.createdByEmail]: model[MODEL_STATE_TABLE_COLUMNS.createdByEmail]?.value,
      [MODEL_STATE_TABLE_COLUMNS.createdByFirstName]: model[MODEL_STATE_TABLE_COLUMNS.createdByFirstName]?.value,
      [MODEL_STATE_TABLE_COLUMNS.createdByLastName]: model[MODEL_STATE_TABLE_COLUMNS.createdByLastName]?.value,
      [MODEL_STATE_TABLE_COLUMNS.stateJson]: state,
      objective: state.bqModel.objective,
      [MODEL_STATE_TABLE_COLUMNS.sharedWithEmails]: safelyParseJson(model[MODEL_STATE_TABLE_COLUMNS.sharedWithEmails]?.value),
      [MODEL_STATE_TABLE_COLUMNS.modelCreatedAt]: toDate(model[MODEL_STATE_TABLE_COLUMNS.modelCreatedAt]?.value, model.timezone),
      [MODEL_STATE_TABLE_COLUMNS.modelUpdatedAt]: toDate(model[MODEL_STATE_TABLE_COLUMNS.modelUpdatedAt]?.value, model.timezone),
    }
  }))
)

const toDate = (dateStr: string, timezone: string) => {
  if (dateStr && timezone) {
    const utcDate = zonedTimeToUtc(dateStr, timezone)
    return utcDate;
  }
  else return undefined;
};

const parseModelInfoJson = (json: string): { bqModel: BQModelState } | undefined => {
  const parsed = safelyParseJson(json)
  if (!parsed || !parsed.hasOwnProperty('bqModel')) { return undefined }
  return parsed
}

const safelyParseJson = (json: string) => {
  let parsed
  try {
    parsed = JSON.parse(json)
  } catch (e) { }
  return parsed
}

export const getPagedModels = (models: any[], page: number) => {
  const endIndex = page * MODELS_PER_PAGE
  const startIndex = endIndex - MODELS_PER_PAGE

  return models.slice(startIndex, endIndex)
}
