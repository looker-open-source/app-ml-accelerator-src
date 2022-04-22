import { compact } from "lodash"
import { BQModelState, ExploreData } from "../types"
import { isArima, TABLE_SUFFIXES } from "./modelTypes"
import { formatParameterFilter, noDot } from "./string"

export const FORECAST_PREDICT_COLUMNS = {
  targetColumn: 'arima_forecast.time_series_data_col',
  timeColumn: 'arima_forecast.date_date',
  predictColumn: 'arima_forecast.total_forecast'
}

type buildApplyFiltersProps = {
  modelType: any,
  uid: string,
  bqModelObjective: string,
  bqModelName: string,
  bqModelTarget: string,
  bqModelArimaTimeColumn?: string,
  predictSettings?: any,
}

export const buildApplyFilters = ({
  modelType,
  bqModelObjective,
  bqModelName,
  bqModelTarget,
  bqModelArimaTimeColumn,
  predictSettings,
  uid
}: buildApplyFiltersProps) => {
  let filters = {
    [`${modelType.exploreName}.model_name`]: formatParameterFilter(bqModelName),
    [`${modelType.exploreName}.input_table_name`]: formatParameterFilter(`${bqModelName}${TABLE_SUFFIXES.inputData}_${uid}`)
  }
  if (isArima(bqModelObjective) && bqModelArimaTimeColumn) {
    filters = {
      ...filters,
      [`${modelType.exploreName}.time_series_data_col`]: formatParameterFilter(bqModelTarget),
      [`${modelType.exploreName}.time_series_timestamp_col`]: formatParameterFilter(bqModelArimaTimeColumn)
    }

    filters[`${modelType.exploreName}.set_horizon`] = predictSettings.horizon || 30

    if (predictSettings.confidenceLevel) {
      filters[`${modelType.exploreName}.set_confidence_level`] = predictSettings.confidenceLevel
    }
  }

  return filters
}

export const buildPredictSorts = (sorts: string[], bqModel: BQModelState) => (
  compact(sorts.map((sort) => {
    if (!sort) { return }
    const splitSort = sort.split(' ')
    const sortName = splitSort[0]
    let sortColumn = ''
    if (sortName === bqModel.target) {
      sortColumn = FORECAST_PREDICT_COLUMNS.targetColumn
    } else if (sortName === bqModel.arimaTimeColumn) {
      sortColumn = FORECAST_PREDICT_COLUMNS.timeColumn
    } else {
      sortColumn = FORECAST_PREDICT_COLUMNS.predictColumn
    }
    return splitSort.length <= 1 ? sortColumn : `${sortColumn} ${splitSort[1]}`
  }))
)

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
