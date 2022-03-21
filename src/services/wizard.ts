import { Step2State, Step3State, Step4State, WizardSteps } from '../types'
import { isArima } from "./modelTypes"

export const hasNoEmptyValues = (obj: any, ignoreKeys?: string[]) => {
  if (!obj) { return false }
  for (const key in obj) {
    if (!ignoreKeys || !ignoreKeys.includes(key)) {
      if (!obj[key]) { return false }
    }
  }
  return true
}

const step2Validation = (stepData: Step2State) => (
  hasNoEmptyValues({
    sql: stepData.ranQuery?.sql,
    data: stepData.ranQuery?.data
  })
)

const step3Validation = (stepData: Step3State, objective: string) => {
  if (
    !stepData.selectedFeatures ||
    stepData.selectedFeatures.length <= 0 ||
    (isArima(objective) && !stepData.arimaTimeColumn)
  ) {
    return false
  }
  const ignoreKeys = isArima(objective) ? undefined : ['arimaTimeColumn']
  return hasNoEmptyValues(stepData.summary, ignoreKeys)
}

const step4Validation = (stepData: Step4State) => (
  stepData.complete
)

export const getWizardStepCompleteCallback = (stepName: keyof WizardSteps): any => {
  const callbacks: any = {
    step1: hasNoEmptyValues,
    step2: step2Validation,
    step3: step3Validation,
    step4: step4Validation,
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
