import { Field } from './field'

export type Summary = {
  fields: Field[]
  data: any[]
  exploreName: string
  modelName: string
}

export type SummaryTableHeaderItem = {
  type: string
  title: string
  name: string
  fullName: string
  align: string
}
