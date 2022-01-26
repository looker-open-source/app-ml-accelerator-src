import { Field } from './field'

export type Summary = {
  fields: Field[] | undefined
  data: any[] | undefined
  exploreName: string | undefined
  modelName: string | undefined
}

export type SummaryTableHeaderItem = {
  type: string
  title: string
  name: string
  fullName: string
  align: string
}
