import { WizardState, Step1State, SelectedFields, Step2State, Step3State, Step4State, Step5State } from "../types"
import { initialStates } from '../reducers'

// ****************************
// WARNING:           READ THIS
// ****************************
// DO NOT CHANGE ANY OF THE KEY NAMES ON THE `modelStateToSave` OBJECT
//
// This object is saved in bigquery and used to load
// previously created models, changing these keys will
// make previously saved models unable to load
export const generateModelState = (wizardState: WizardState): SavedModelState => {
  const { unlockedStep } = wizardState
  const { step1, step2, step3, step4, step5 } = wizardState.steps
  const modelStateToSave = {
    unlockedStep: unlockedStep > 3 ? unlockedStep : 4,
    step1: step1,
    step2: {
      exploreName: step2.exploreName,
      modelName: step2.modelName,
      exploreLabel: step2.exploreLabel,
      limit: step2.limit,
      selectedFields: step2.selectedFields,
      sorts: step2.sorts
    },
    step3: {
      bqModelName: step3.bqModelName,
      targetField: step3.targetField,
      arimaTimeColumn: step3.arimaTimeColumn,
      selectedFeatures: step3.selectedFeatures,
      advancedSettings: step3.advancedSettings || {}
    },
    step4: {
      jobStatus: step4.jobStatus,
      job: step4.job,
      modelInfo: step4.modelInfo
    },
    step5: {
      look: step5.look
    }
  }
  return modelStateToSave
}

// build the wizard state from the saved model state
export const buildWizardState = (modelState: SavedModelState): WizardState => {
  const { step1, step2, step3, step4, step5 } = modelState
  const { wizardInitialState } = initialStates

  const wizardState = {
    unlockedStep: modelState.unlockedStep,
    needsSaving: false,
    steps: {
      step1: step1,
      step2: buildWizardStep2(step2, wizardInitialState.steps.step2),
      step3: buildWizardStep3(step3, wizardInitialState.steps.step3),
      step4: buildWizardStep4(step4, wizardInitialState.steps.step4),
      step5: buildWizardStep5(step5, wizardInitialState.steps.step5)
    }
  }

  const newWizardState: WizardState = {...wizardInitialState, ...wizardState}
  return newWizardState
}

const buildWizardStep2 = (modelStep2: any, wizardStep2: Step2State): Step2State => {
  const mappedModelState = {
    exploreName: modelStep2.exploreName,
    modelName: modelStep2.modelName,
    exploreLabel: modelStep2.exploreLabel,
    limit: modelStep2.limit,
    selectedFields: modelStep2.selectedFields,
    sorts: modelStep2.sorts,
  }
  return {...wizardStep2, ...mappedModelState}
}

const buildWizardStep3 = (modelStep3: any, wizardStep3: Step3State): Step3State => {
  const mappedModelState = {
    bqModelName: modelStep3.bqModelName,
    targetField: modelStep3.targetField,
    arimaTimeColumn: modelStep3.arimaTimeColumn,
    selectedFeatures: modelStep3.selectedFeatures,
    advancedSettings: modelStep3.advancedSettings || {}
  }
  return {...wizardStep3, ...mappedModelState}
}

const buildWizardStep4 = (modelStep4: any, wizardStep4: Step4State): Step4State => {
  const mappedModelState = {
    jobStatus: modelStep4.jobStatus,
    job: modelStep4.job,
    modelInfo: modelStep4.modelInfo
  }
  return {...wizardStep4, ...mappedModelState}
}

const buildWizardStep5 = (modelStep5: any, wizardStep5: Step5State): Step5State => {
  const mappedModelState = {
    look: modelStep5.look
  }
  return {...wizardStep5, ...mappedModelState}
}

type SavedModelState = {
  unlockedStep: number
  step1: Step1State
  step2: {
    exploreName?: string
    modelName?: string
    exploreLabel?: string
    limit?: string
    selectedFields?: SelectedFields
    sorts?: string[]
  }
  step3: {
    bqModelName?: string
    targetField?: string
    arimaTimeColumn?: string
    selectedFeatures?: string[]
    advancedSettings: any
  }
  step4: {
    job?: any
    modelInfo: {
      bqModelName?: string,
      bqModelObjective?: string
      bqModelTarget?: string,
      bqModelArimaTimeColumn?: string,
      bqModelAdvancedSettings?: any
    }
  },
  step5: {
    look: any
  }
}
