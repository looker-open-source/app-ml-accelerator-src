import { Field } from './field'

export type Summary = {
  fields: Field[]
  data: any[]
}

export type DataTableHeaderItem = {
  type: string
  title: string
  name: string
  align: string
}
