import { WIZARD_STEPS } from "../constants"

export const determineWizardStep = (wizard) => {
  let currentStep = 1
  for (const step in Object.keys(wizard.steps).sort()) {
    if (hasNoEmptyValues(wizard[step])) {
      currentStep + 1
    } else {
      return currentStep
    }
  }

  return currentStep
}

export const hasNoEmptyValues = (obj) => {
  for (const key in obj) {
    if (!obj[key]) { return false }
  }
  return true
}

export const getWizardStepCompleteCallback = (stepName) => {
  const callbacks = {
    step1: (stepData) => hasNoEmptyValues(stepData),
    step2: (stepData) => hasNoEmptyValues(stepData),
    step3: (stepData) => hasNoEmptyValues(stepData),
    step4: (stepData) => hasNoEmptyValues(stepData),
    step5: (stepData) => hasNoEmptyValues(stepData)
  }

  return callbacks[stepName]
}

export const getActualStep = (locationPath, dispatch) => {
  try {
    for (const key in WIZARD_STEPS) {
      if ( locationPath.indexOf(WIZARD_STEPS[key]) >= 0) {
        return key;
      }
    }
    throw "Failed to retrieve the Actual Step"
  } catch (error: any) {
    dispatch({
      type: 'AddError',
      error: "Something went wrong finding your page.  Please try again."
    })
  }
}

export const getStepStateClone = (state: any, stepName: string): any => {
  return {
    ...state,
    steps: {
      ...state.steps,
      [stepName]: {
        ...state.steps[stepName]
      }
    }
  }
}
