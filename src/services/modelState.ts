import { WizardState, Step1State, SelectedFields, Step2State, Step3State, Step4State, Step5State, BQModelState } from "../types"
import { initialStates } from '../reducers'

// ****************************
// WARNING:           READ THIS
// ****************************
// CHANGING ANY OF THE KEY NAMES ON THE `modelStateToSave` OBJECT COUDL RESULT IN BACKWARDS COMPATIBILITY ISSUES WITH OLD MODELS
//
// This object is saved in bigquery and used to load
// previously created models, changing these keys will
// make previously saved models unable to load
export const generateModelState = (wizardState: WizardState, bqModelState: BQModelState): SavedModelState => {
  const { unlockedStep } = wizardState
  const modelStateToSave = {
    unlockedStep: unlockedStep > 3 ? unlockedStep : 4,
    bqModel: {
      objective: bqModelState.objective,
      name: bqModelState.name,
      target: bqModelState.target,
      arimaTimeColumn: bqModelState.arimaTimeColumn,
      selectedFeatures: bqModelState.selectedFeatures,
      advancedSettings: bqModelState.advancedSettings,
      sourceQuery: {
        exploreName: bqModelState.sourceQuery.exploreName,
        modelName: bqModelState.sourceQuery.modelName,
        exploreLabel: bqModelState.sourceQuery.exploreLabel,
        limit: bqModelState.sourceQuery.limit,
        sorts: bqModelState.sourceQuery.sorts,
        selectedFields: bqModelState.sourceQuery.selectedFields
      },
      jobStatus: bqModelState.jobStatus,
      job: bqModelState.job,
      look: bqModelState.look
    }
  }
  return modelStateToSave
}

// build the wizard state from the saved model state
export const buildWizardState = (savedState: SavedModelState): WizardState => {
  const { wizardInitialState, bqModelInitialState } = initialStates
  const bqModelState = { ...bqModelInitialState, ...savedState.bqModel }

  const wizardState = {
    unlockedStep: savedState.unlockedStep,
    needsSaving: false,
    steps: {
      step1: { objective: bqModelState.objective },
      step2: buildWizardStep2(bqModelState, wizardInitialState.steps.step2),
      step3: buildWizardStep3(bqModelState, wizardInitialState.steps.step3),
      step4: buildWizardStep4(bqModelState, wizardInitialState.steps.step4),
      step5: buildWizardStep5(bqModelState, wizardInitialState.steps.step5)
    }
  }

  const newWizardState: WizardState = {...wizardInitialState, ...wizardState}
  return newWizardState
}

const buildWizardStep2 = (bqModelState: BQModelState, wizardStep2: Step2State): Step2State => {
  const mappedModelState = {
    exploreName: bqModelState.sourceQuery?.exploreName,
    modelName: bqModelState.sourceQuery?.modelName,
    exploreLabel: bqModelState.sourceQuery?.exploreLabel,
    limit: bqModelState.sourceQuery?.limit,
    selectedFields: bqModelState.sourceQuery?.selectedFields,
    sorts: bqModelState.sourceQuery?.sorts,
  }
  return {...wizardStep2, ...mappedModelState}
}

const buildWizardStep3 = (bqModelState: BQModelState, wizardStep3: Step3State): Step3State => {
  const mappedModelState = {
    bqModelName: bqModelState.name,
    targetField: bqModelState.target,
    arimaTimeColumn: bqModelState.arimaTimeColumn,
    selectedFeatures: bqModelState.selectedFeatures,
    advancedSettings: bqModelState.advancedSettings || {}
  }
  return {...wizardStep3, ...mappedModelState}
}

const buildWizardStep4 = (bqModelState: BQModelState, wizardStep4: Step4State): Step4State => {
  const mappedModelState = {
    complete: false
  }
  return {...wizardStep4, ...mappedModelState}
}

const buildWizardStep5 = (bqModelState: BQModelState, wizardStep5: Step5State): Step5State => {
  const mappedModelState = {
    look: bqModelState.look,
    lockedFields: bqModelState.sourceQuery.selectedFields,
    ...bqModelState.sourceQuery
  }
  return {...wizardStep5, ...mappedModelState}
}

type SavedModelState = {
  unlockedStep: number
  bqModel: BQModelState
}
