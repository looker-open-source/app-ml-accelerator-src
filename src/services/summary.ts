import { keyBy, compact, isEqual } from 'lodash'
import { JOB_STATUSES } from '../constants'
import { BQModelState, Field, Step3State, SummaryTableHeaders } from '../types'
import { InputData } from '../types/inputData'
import { MODEL_TYPES } from './modelTypes'
import { titilize, splitFieldName, noDot } from './string'

export const removeLimit = (sql: string) => {
  const clauses = sql.split("\n")
  let limitIndex = -1
  clauses.forEach((s: string, i: number) =>
    (s.indexOf('LIMIT') >= 0) ? limitIndex = i : null
  )
  if (limitIndex === -1) {
    return sql
  }
  clauses.splice(limitIndex, 1)
  return clauses.join('\n')
}

// Removes the table name from the column keys
// e.g. summary_table.pct_null => pct_null
export const renameSummaryDataKeys = (summaryData: any[]) => {
  return summaryData.map((row) => {
    const newRow: { [key: string]: any } = {}
    for (const key in row) {
      newRow[splitFieldName(key)] = row[key]
    }
    return newRow
  })
}

type HasSummaryProps = {
  inputData: InputData,
  step3Data: Step3State,
  exploreName: string,
  modelName: string,
  bqModelName: string,
  sourceColumns: string[],
  sourceFilters: any
}

// This method determines whether the summary has been ran with the current Source tab ui state.
// The summary needs to be reran when the ui state has changed since the last time they ran the summary.
export const hasSummaryForSourceData = ({
  inputData,
  step3Data,
  exploreName,
  modelName,
  bqModelName,
  sourceColumns,
  sourceFilters
}: HasSummaryProps): boolean => {
  const { summary, allFeatures } = step3Data
  return Boolean(inputData.exploreName === exploreName
    && inputData.modelName === modelName
    && inputData.bqModelName === bqModelName
    && allFeatures?.sort().join(',') === sourceColumns.join(',')
    && isEqual(sourceFilters, inputData.selectedFields.filters)
    && summary.data
    && summary.data.length > 0)
}

type NeedsModelUpdateProps = {
  bqModel: BQModelState
  uiInputDataUID?: string
  uiAdvancedSettings: any
  uiObjective?: string
  uiFeatures?: string[]
  uiTarget?: string
  uiArimaTimeColumn?: string
}

export const needsModelUpdate = ({
  bqModel,
  uiInputDataUID,
  uiAdvancedSettings,
  uiObjective,
  uiFeatures,
  uiTarget,
  uiArimaTimeColumn
}: NeedsModelUpdateProps) => {
  return (bqModel.jobStatus === JOB_STATUSES.failed || bqModel.jobStatus === JOB_STATUSES.canceled) ||
    bqModel.objective !== uiObjective ||
    !isEqual(bqModel.advancedSettings, uiAdvancedSettings) ||
    bqModel.inputDataUID !== uiInputDataUID ||
    !isEqual(bqModel.selectedFeatures, uiFeatures) ||
    hasTargetOrTimeColumnChange(bqModel, uiTarget, uiArimaTimeColumn)
}

export const hasTargetOrTimeColumnChange = (inputData: InputData | BQModelState, uiTarget?: string, uiArimaTimeColumn?: string) => (
  inputData.target !== uiTarget ||
  inputData.arimaTimeColumn !== uiArimaTimeColumn
)

export const toggleSelectedFeature = (selectedFeatures: string[], fieldName: string): string[] => {
  const selectedIndex: number = selectedFeatures.indexOf(fieldName);
  if (selectedIndex < 0) {
    selectedFeatures.push(fieldName)
    return selectedFeatures
  }

  selectedFeatures.splice(selectedIndex, 1)
  return selectedFeatures
}

const fieldIsType = (field: any, dataType?: string) => {
  if (!dataType) { return true }
  if (dataType === 'date') {
    return field.type === 'date_date' // this is the only supported date type by BigQuery for Arima models
  }
  if (dataType === 'numeric') {
    return field.is_numeric
  }
  return field.type === dataType
}

export const buildFieldSelectOptions = (fieldDetails: any, fieldNames: string[], filteredDataType?: string) => {
  const fields = [...fieldDetails.dimensions, ...fieldDetails.measures]
  const indexedFields: { [key: string]: Field } = keyBy(fields, 'name')

  const options = fieldNames.map((name: string) => {
    const field = indexedFields[name]
    if (!field) { return null }
    // remove all fields that arent of the desired type
    if (!fieldIsType(field, filteredDataType)) { return null }
    let formattedLabel
    if (field.label) {
      formattedLabel = field.label
      titilize(field.name).replace(".", " ")
        .trim();
    }
    return {
      // each field in the view gets mapped to an option
      label: formattedLabel || field.name,
      value: field.name,
      color: field.category === "measure" ? "#C2772E" : "#262D33"
    };
  })

  return compact(options)
}

export const isBinaryClassifier = (objective: string, step3: Step3State) => {
  if (objective !== MODEL_TYPES.BOOSTED_TREE_CLASSIFIER.value) { return false }
  const inputData = step3.summary.data
  const targetSummaryRow = inputData?.filter((row) => row.column_name.value === noDot(step3.targetField || ''))
  if (!targetSummaryRow || targetSummaryRow.length <= 0) { return false }
  return targetSummaryRow[0].count_distinct_values.value === 2
}

export const SUMMARY_TABLE_HEADERS: SummaryTableHeaders = {
  fieldName: {
    label: "Field Name",
    converter: (row) => titilize(row.column_name?.value),
    align: "left",
    order: 1
  },
  type: {
    label: "Type",
    converter: (row) => row.data_type?.value,
    align: "left",
    order: 2
  },
  missingPCT: {
    label: "Missing % (Count)",
    converter: (row) => `${(Number(row.pct_null?.value) * 100)}% (${row.count_nulls?.value})`,
    align: "right",
    order: 3
  },
  distinctValues: {
    label: "Distinct Values",
    converter: (row) => row.count_distinct_values?.value,
    align: "right",
    order: 4
  },
  max: {
    label: "Max",
    converter: (row) => row.data_type?.value !== "STRING" ? row._max_value?.value : "NA",
    align: "right",
    order: 5
  },
  min: {
    label: "Min",
    converter: (row) => row.data_type?.value !== "STRING" ? row._min_value?.value : "NA",
    align: "right",
    order: 6
  },
  avg: {
    label: "Avg",
    converter: (row) => row.data_type?.value !== "STRING" ? Number(row._avg_value?.value).toFixed(2) : "NA",
    align: "right",
    order: 7
  }
}

export const SUMMARY_TABLE_HEADERS_STEP3: SummaryTableHeaders = {
  fieldName: {
    label: "Field Name",
    converter: (row) => titilize(row.column_name?.value),
    align: "left",
    order: 1
  },
  type: {
    label: "Type",
    converter: (row) => row.data_type?.value,
    align: "left",
    order: 2
  },
  missingPCT: {
    label: "Missing % (Count)",
    converter: (row) => `${(Number(row.pct_null?.value) * 100).toLocaleString('en-US', {maximumFractionDigits: 2})}% (${row.count_nulls?.value})`,
    align: "right",
    order: 3
  },
  distinctValues: {
    label: "Distinct Values",
    converter: (row) => Number(row.count_distinct_values?.value).toLocaleString('en-US', {maximumFractionDigits: 2}),
    align: "right",
    order: 4
  },
  max: {
    label: "Max",
    converter: (row) => row.data_type?.value !== "STRING" ? Number(row._max_value?.value).toLocaleString('en-US', {maximumFractionDigits: 2}) : "NA",
    align: "right",
    order: 5
  },
  min: {
    label: "Min",
    converter: (row) => row.data_type?.value !== "STRING" ? Number(row._min_value?.value).toLocaleString('en-US', {maximumFractionDigits: 2}) : "NA",
    align: "right",
    order: 6
  },
  avg: {
    label: "Avg",
    converter: (row) => row.data_type?.value !== "STRING" ? Number(row._avg_value?.value).toLocaleString('en-US', {maximumFractionDigits: 2}) : "NA",
    align: "right",
    order: 7
  }
}