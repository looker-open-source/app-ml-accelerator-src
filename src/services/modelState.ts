import { WizardState, Step1State, SelectedFields, RanQuery } from "../types"
import { initialStates } from '../reducers'
import { merge } from "lodash"

// ****************************
// WARNING:           READ THIS
// ****************************
// DO NOT CHANGE ANY OF THE KEY NAMES ON THE `modelStateToSave` OBJECT
//
// This object is saved in bigquery and used to load
// previously created models, changing these keys will
// make previously saved models unable to load
export const generateModelState = (wizardState: WizardState): SavedModelState => {
  const { step1, step2, step3, step4 } = wizardState.steps
  const modelStateToSave = {
    unlockedStep: wizardState.unlockedStep,
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
      selectedFields: step3.selectedFields,
    },
    step4: {
      job: step4.job
    }
  }
  return modelStateToSave
}

// build the wizard state from the saved model state
export const buildWizardState = (modelState: SavedModelState): WizardState => {
  const { step1, step2, step3, step4 } = modelState
  const { wizardInitialState } = initialStates

  const wizardState = {
    unlockedStep: modelState.unlockedStep,
    needsSaving: false,
    steps: {
      step1: step1,
      step2: {
        exploreName: step2.exploreName,
        modelName: step2.modelName,
        exploreLabel: step2.exploreLabel,
        limit: step2.limit,
        selectedFields: step2.selectedFields,
        sorts: step2.sorts,
      },
      step3: {
        bqModelName: step3.bqModelName,
        targetField: step3.targetField,
        arimaTimeColumn: step3.arimaTimeColumn,
        selectedFields: step3.selectedFields,
      },
      step4: {
        job: step4.job
      }
    }
  }

  // @ts-ignore
  const newWizardState: WizardState = {...wizardInitialState, ...wizardState}
  return newWizardState
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
    selectedFields?: string[]
  }
  step4: {
    job?: any
  }
}
