import { SelectedFields } from '.'

export type ResultsTableHeaderItem = {
  type: string
  title?: string
  name?: string
  placeholder?: boolean
  colSpan?: number
}

export type RanQuery = {
  data: any[],
  rowCount: number,
  sql: string,
  exploreUrl: string
  exploreName: string | undefined,
  modelName: string | undefined,
  exploreLabel: string | undefined,
  limit: string | undefined,
  selectedFields: SelectedFields,
  sorts: string[],
}
