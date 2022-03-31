import { SummaryField } from './field'
import { SelectedFields } from './selectedFields'
import { WizardState } from './wizard'

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

export type SaveSummaryProps = {
  rawSummary: any,
  wizardState: WizardState,
  selectedFeatures?: string[]
}
