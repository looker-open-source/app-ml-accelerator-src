import { SummaryField } from './field'

export type Summary = {
  fields?: SummaryField[]
  data?: any[]
  exploreName?: string
  modelName?: string
  target?: string
  bqModelName?: string
  advancedSettings?: any
  arimaTimeColumn?: any
}

export type SummaryTableHeader = {
  label: string,
  converter: (row: any) => any,
  align: string,
  order: number
}

export type SummaryTableHeaders = { [key: string]: SummaryTableHeader }
