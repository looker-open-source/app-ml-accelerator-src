import { Looker40SDK } from '@looker/sdk'
import { reduce } from 'lodash'
import { Field, Summary, SummaryField, SummaryTableHeaderItem } from '../types'
import { fetchExplore } from './explores'
import { titilize } from './string'

export const getSummaryData = async(sdk: Looker40SDK): Promise<any> => {
  const { value: explore } = await fetchExplore(sdk, 'selection_summary', 'selection_summary')
  const { value: query } = await sdk.create_query({
    model:  'selection_summary',
    view: 'selection_summary',
    fields: explore.fields.dimensions.map((d: any) => d.name),
    filters: {
      "selection_summary.schema_name": 'test',
      "selection_summary.table_name": 'davidb^_automl^_model^_test^_1'
    }
  })
  const results = await sdk.run_query({
    query_id: query.id,
    result_format: "json_detail",
  })
  return results
}

const splitFieldName = (fieldName: string) => {
  const names = fieldName.split('.')
  return names.length >= 1 ? names[1] : fieldName
}

// Transforms fields into table header objects
export const buildHeaders = (fields: SummaryField[]): SummaryTableHeaderItem[] => {
  return fields.map((field) => {
    const colName = splitFieldName(field.name)
    return {
      title: field.label_short,
      fullName: field.name,
      name: colName,
      type: field.category,
      align: field.align
    }
  })
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

export const hasSummaryData = (summary: Summary, exploreName: string, modelName: string, target: string): boolean => (
  Boolean(summary.exploreName === exploreName
    && summary.modelName === modelName
    && summary.target === target
    && summary.data
    && summary.data.length > 0)
)

export const toggleSelectedField = (selectedFields: string[], fieldName: string): string[] => {
  const selectedIndex: number = selectedFields.indexOf(fieldName);
  if (selectedIndex < 0) {
    selectedFields.push(fieldName)
    return selectedFields
  }

  selectedFields.splice(selectedIndex, 1)
  return selectedFields
}

export const buildFieldSelectOptions = (fieldDetails: any, fieldNames: string[]) => {
  const fields = [...fieldDetails.dimensions, ...fieldDetails.measures]
  const indexedFields: { [key: string]: Field } = reduce(fields, (agg: any, field: Field) => {
    agg[field.name] = field
    return agg
  }, {})

  return fieldNames.map((name: string) => {
    const field = indexedFields[name]
    if (!field) { return null }
    console.log({field})
    let formattedLabel
    if (field.label) {
      formattedLabel = field.label
        titilize(field.name).replace(".", " ")
        .trim(); // remove the view name and then title format string
    }
    return {
      // each field in the view gets mapped to an option
      label: formattedLabel || field.name,
      value: field.name,
      color: field.category === "measure" ? "#C2772E" : "#262D33"
    };
  })
}
