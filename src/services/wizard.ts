import { WIZARD_STEPS } from "../constants"
import { Step1State, Step2State, Step3State, Step4State, Step5State, WizardSteps } from '../types'
import { isArima } from "./modelTypes"

export const hasNoEmptyValues = (obj: any) => {
  if (!obj) { return false }
  for (const key in obj) {
    if (!obj[key]) { return false }
  }
  return true
}

const step2Validation = (stepData: Step2State) => (
  hasNoEmptyValues(stepData.ranQuery)
)

const step3Validation = (stepData: Step3State, objective: string) => {
  if (
    !stepData.selectedFeatures ||
    stepData.selectedFeatures.length <= 0 ||
    (isArima(objective) && !stepData.arimaTimeColumn)
  ) {
    return false
  }

  return hasNoEmptyValues(stepData.summary)
}

export const getWizardStepCompleteCallback = (stepName: keyof WizardSteps): any => {
  const callbacks: any = {
    step1: hasNoEmptyValues,
    step2: step2Validation,
    step3: step3Validation,
    step4: hasNoEmptyValues,
    step5: hasNoEmptyValues
  }

  return callbacks[stepName]
}

export const getStepStateClone = (state: any, stepName: string, needsSaving?: boolean): any => {
  return {
    ...state,
    needsSaving: needsSaving || state.needsSaving,
    steps: {
      ...state.steps,
      [stepName]: {
        ...state.steps[stepName]
      }
    }
  }
}
