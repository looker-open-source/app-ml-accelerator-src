import { ResultsTableHeaderItem, RanQuery, ExploreData, SelectedFields, Summary} from '.'

export type WizardState = {
  currentStep: number,
  steps: WizardSteps
}

export type WizardSteps = {
  step1: Step1State,
  step2: Step2State,
  step3: Step3State,
  step4: Step4State,
  step5: Step5State
}

export type Step1State = {
  objective: string | undefined
}

export type Step2State = {
  exploreName: string | undefined,
  modelName: string | undefined,
  exploreLabel: string | undefined,
  exploreData: ExploreData | undefined,
  exploreFilterText: string,
  limit: string | undefined,
  selectedFields: SelectedFields,
  sorts: string[],
  tableHeaders: ResultsTableHeaderItem[] | undefined,
  ranQuery: RanQuery | undefined
}

export type Step3State = {
  bqModelName: string,
  targetField: string | undefined,
  arimaTimeColumn: string | undefined,
  selectedFields: string[] | undefined,
  summary: Summary
}

export type Step4State = {
  jobStatus: string | undefined,
  job: any,
  data: any
}

export type Step5State = {
  data: any
}

export type GenericStepState = Step1State | Step2State | Step3State | Step4State | Step5State
