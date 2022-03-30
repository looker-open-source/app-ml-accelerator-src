import { ExploreData } from "../types"
import { isArima } from "./modelTypes"
import { formatParameterFilter, noDot } from "./string"

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

export const getLookerColumnName = (views: string[], fieldName: string) => {
  let name: string = ''
  for (const view of views) {
    if (fieldName.indexOf(`${view}_`) === 0) {
      name = fieldName.replace(`${view}_`, `${view}.`)
      break
    }
  }
  return name || fieldName
}

export const getPredictedColumnName = (target: string) => (
  `predicted_${noDot(target)}`
)

export const bqResultsToLookerFormat = (data: any, exploreName: string, exploreData: ExploreData) => {
  const iteratorKeys = Array.from(exploreData.views.keys())
  const exploreViews = iteratorKeys.length > 0 ? iteratorKeys : [exploreName]

  return data.rows.map((row: any) => {
    const rowObj: any = {}
    const arr = row.f
    arr.forEach((col: any, i: number) => {
      const columnName = getLookerColumnName(
        exploreViews,
        data.schema.fields[i].name
      )
      rowObj[columnName] = { value: col.v }
    })
    return rowObj
  })
}
