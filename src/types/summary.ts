import { SummaryField } from './field'

export type Summary = {
  fields?: SummaryField[]
  data?: any[]
}

export type SummaryTableHeader = {
  label: string,
  converter: (row: any) => any,
  align: string,
  order: number
}

export type SummaryTableHeaders = { [key: string]: SummaryTableHeader }
