export type SummaryField = {
  category: string
  measure: boolean
  name: string
  hidden: boolean
  label: string
  label_short: string
  align: string
}

export type Field = {
  id?: number
  category: string
  dataType: string
  fieldLabel: string
  isHidden: boolean
  isPrimaryKey: boolean
  label: string
  name: string
  rawDataType: string
  type: string
  viewLabel: string
  fields: any
  formattedLabel?: string | null
}
