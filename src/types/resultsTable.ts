import { Field } from './field'

export type ResultsTableHeaderItem = {
  type: string
  title?: string
  name?: string
  placeholder?: boolean
  colSpan?: number
}

export type RanQuery = {
  dimensions: Field[],
  measures: Field[],
  data: any[],
  exploreUrl: string
}
