import { Looker40SDK } from '@looker/sdk'
import { Field, DataTableHeaderItem } from '../types'
import { fetchExplore } from './explores'

const parameterizeFilterValue = (filterValue: string): string => {
  return filterValue.replaceAll('_', '^_')
}

export const getSummaryData = async(sdk: Looker40SDK): Promise<any> => {
  const { value: explore } = await fetchExplore(sdk, 'selection_summary', 'selection_summary')
  const { value: query } = await sdk.create_query({
    model:  'selection_summary',
    view: 'selection_summary',
    fields: explore.fields.dimensions.map((d) => d.name),
    filters: {
      "selection_summary.schema_name": 'test',
      "selection_summary.table_name": parameterizeFilterValue('davidb_automl_model_test_1')
    }
  })
  const results = await sdk.run_query({
    query_id: query.id,
    result_format: "json_detail",
  })
  return results
}

const splitFieldName = (fieldName) => {
  const names = fieldName.split('.')
  return names.length >= 1 ? names[1] : fieldName
}

export const buildHeaders = (fields: Field[]): DataTableHeaderItem[] => {
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

export const renameSummaryDataKeys = (summaryData) => {
  return summaryData.map((row) => {
    const newRow = {}
    for (const key in row) {
      newRow[splitFieldName(key)] = row[key]
    }
    return newRow
  })
}

export const hasSummaryData = (summary, exploreName, modelName) => (
  summary.exploreName === exploreName && summary.modelName === modelName && summary.data?.length > 0
)

export const toggleSelectedField = (selectedFields, fieldName): string[] => {
  const selectedIndex: number = selectedFields.indexOf(fieldName);
  if (selectedIndex < 0) {
    selectedFields.push(fieldName)
    return selectedFields
  }

  selectedFields.splice(selectedIndex, 1)
  return selectedFields
}
