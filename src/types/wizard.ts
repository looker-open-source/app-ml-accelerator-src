import { ResultsTableHeaderItem, RanQuery, ExploreData, SelectedFields, Summary} from '.'

export type WizardState = {
  unlockedStep: number,
  needsSaving: boolean,
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
  allFeatures: string[] | undefined,
  selectedFeatures: string[] | undefined,
  advancedSettings: any,
  summary: Summary
}

export type Step4State = {
  jobStatus?: string,
  job?: any,
  modelInfo: {
    bqModelName?: string,
    bqModelObjective?: string
    bqModelTarget?: string
    bqModelArimaTimeColumn?: string
    bqModelAdvancedSettings?: any
  }
}

export type Step5State = {
  lookId?: string
}

export type GenericStepState = Step1State | Step2State | Step3State | Step4State | Step5State
