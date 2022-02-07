import { SummaryField } from './field'

export type Summary = {
  fields: SummaryField[] | undefined
  data: any[] | undefined
  exploreName: string | undefined
  modelName: string | undefined
  target: string | undefined
  arimaTimeColumn: string | undefined
}

export type SummaryTableHeader = {
  label: string,
  converter: (row: any) => any,
  align: string,
  order: number
}

export type SummaryTableHeaders = { [key: string]: SummaryTableHeader }
