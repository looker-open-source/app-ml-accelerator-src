import { WizardState, Step1State, SelectedFields, Step2State, Step3State, Step4State, Step5State, BQModelState } from "../types"
import { initialStates } from '../reducers'
import { cloneDeep } from "lodash"

// ****************************
// WARNING:           READ THIS
// ****************************
// CHANGING ANY OF THE KEY NAMES ON THE `modelStateToSave` OBJECT COULD RESULT IN BACKWARDS COMPATIBILITY ISSUES WITH OLD MODELS
//
// This object is saved in bigquery and used to load
// previously created models, changing these keys will
// make previously saved models unable to load


export const generateModelState = (wizardState: WizardState, bqModelState: BQModelState): SavedModelState => {
  const { unlockedStep } = wizardState
  const modelStateToSave = {
    unlockedStep,
    bqModel: {
      objective: bqModelState.objective,
      name: bqModelState.name,
      registerVertex: bqModelState.registerVertex,
      target: bqModelState.target,
      arimaTimeColumn: bqModelState.arimaTimeColumn,
      selectedFeatures: bqModelState.selectedFeatures,
      advancedSettings: bqModelState.advancedSettings,
      inputDataUID: bqModelState.inputDataUID,
      inputDataQuery: {
        exploreName: bqModelState.inputDataQuery.exploreName,
        modelName: bqModelState.inputDataQuery.modelName,
        exploreLabel: bqModelState.inputDataQuery.exploreLabel,
        limit: bqModelState.inputDataQuery.limit,
        sorts: bqModelState.inputDataQuery.sorts,
        selectedFields: bqModelState.inputDataQuery.selectedFields
      },
      binaryClassifier: bqModelState.binaryClassifier,
      jobStatus: bqModelState.jobStatus,
      job: bqModelState.job,
      hasPredictions: bqModelState.hasPredictions,
      predictSettings: bqModelState.predictSettings,
      applyQuery: {
        exploreName: bqModelState.applyQuery.exploreName,
        modelName: bqModelState.applyQuery.modelName,
        exploreLabel: bqModelState.applyQuery.exploreLabel,
        limit: bqModelState.applyQuery.limit,
        sorts: bqModelState.applyQuery.sorts,
        selectedFields: bqModelState.applyQuery.selectedFields
      },
    }
  }
  return modelStateToSave
}

// build the wizard state from the saved model state
export const buildWizardState = (savedState: SavedModelState): WizardState => {
  const wizardInitialState = cloneDeep(initialStates.wizardInitialState)
  const bqModelState = { ...cloneDeep(initialStates.bqModelInitialState), ...cloneDeep(savedState.bqModel) }

  const wizardState = {
    unlockedStep: savedState.unlockedStep,
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
    exploreName: bqModelState.inputDataQuery?.exploreName,
    modelName: bqModelState.inputDataQuery?.modelName,
    exploreLabel: bqModelState.inputDataQuery?.exploreLabel,
    limit: bqModelState.inputDataQuery?.limit,
    selectedFields: bqModelState.inputDataQuery?.selectedFields,
    sorts: bqModelState.inputDataQuery?.sorts,
  }
  return {...wizardStep2, ...mappedModelState}
}

const buildWizardStep3 = (bqModelState: BQModelState, wizardStep3: Step3State): Step3State => {
  const mappedModelState = {
    bqModelName: bqModelState.name,
    registerVertex: bqModelState.registerVertex,
    targetField: bqModelState.target,
    arimaTimeColumn: bqModelState.arimaTimeColumn,
    selectedFeatures: bqModelState.selectedFeatures,
    advancedSettings: bqModelState.advancedSettings || {},
    inputData: {
      exploreName: bqModelState.inputDataQuery?.exploreName,
      modelName: bqModelState.inputDataQuery?.modelName,
      exploreLabel: bqModelState.inputDataQuery?.exploreLabel,
      limit: bqModelState.inputDataQuery?.limit,
      selectedFields: bqModelState.inputDataQuery?.selectedFields,
      sorts: bqModelState.inputDataQuery?.sorts,
      uid: bqModelState.inputDataUID,
      bqModelName: bqModelState.name,
      target: bqModelState.target,
      arimaTimeColumn: bqModelState.arimaTimeColumn,
    }
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
  const { applyQuery, inputDataQuery } = bqModelState
  const query = applyQuery.exploreName ? applyQuery : inputDataQuery
  const mappedModelState = {
    ...query,
    predictSettings: bqModelState.predictSettings,
    showPredictions: bqModelState.hasPredictions
  }
  return { ...wizardStep5, ...mappedModelState }
}

type SavedModelState = {
  unlockedStep: number
  bqModel: BQModelState
}
