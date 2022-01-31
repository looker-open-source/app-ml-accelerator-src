import { Field } from './field'

export type ResultsTableHeaderItem = {
  type: string
  title?: string
  name?: string
  placeholder?: boolean
  colSpan?: number
}

export type RanQuery = {
  dimensions: string[],
  measures: string[],
  data: any[],
  sql: string,
  exploreUrl: string
}
