import { SummaryField } from './field'

export type Summary = {
  fields: SummaryField[] | undefined
  data: any[] | undefined
  exploreName: string | undefined
  modelName: string | undefined
  target: string | undefined
}

export type SummaryTableHeaderItem = {
  type: string
  title: string
  name: string
  fullName: string
  align: string
}
