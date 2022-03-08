import { isArima } from "./modelTypes"
import { formatParameterFilter } from "./string"

type buildApplyFiltersProps = {
  modelType: any,
  bqModelObjective: string,
  bqModelName: string,
  bqModelTarget: string,
  bqModelArimaTimeColumn?: string,
  bqModelAdvancedSettings?: any
}

export const buildApplyFilters = ({
  modelType,
  bqModelObjective,
  bqModelName,
  bqModelTarget,
  bqModelArimaTimeColumn,
  bqModelAdvancedSettings
}: buildApplyFiltersProps) => {
  let filters = {
    [`${modelType.exploreName}.model_name`]: formatParameterFilter(bqModelName)
  }
  if (isArima(bqModelObjective) && bqModelArimaTimeColumn) {
    filters = {
      ...filters,
      [`${modelType.exploreName}.time_series_data_col`]: formatParameterFilter(bqModelTarget),
      [`${modelType.exploreName}.time_series_timestamp_col`]: formatParameterFilter(bqModelArimaTimeColumn)
    }

    if (bqModelAdvancedSettings.horizon) {
      filters[`${modelType.exploreName}.set_horizon`] = bqModelAdvancedSettings.horizon
    }
  }

  return filters
}
