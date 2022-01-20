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

export const buildHeaders = (fields: Field[]): DataTableHeaderItem[] => {
  return fields.map((field) => ({
    title: field.label_short,
    name: field.name,
    type: field.category,
    align: field.align
  }))
}
