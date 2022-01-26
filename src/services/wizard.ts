import { WIZARD_STEPS } from "../constants"
import { Step1State, Step2State, Step3State, Step4State, Step5State, WizardSteps } from '../types'

// export const determineWizardStep = (wizard) => {
//   let currentStep = 1
//   for (const step in Object.keys(wizard.steps).sort()) {
//     if (hasNoEmptyValues(wizard[step])) {
//       currentStep + 1
//     } else {
//       return currentStep
//     }
//   }

//   return currentStep
// }

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

export const getWizardStepCompleteCallback = (stepName: keyof WizardSteps): any => {
  const callbacks: any = {
    step1: hasNoEmptyValues,
    step2: step2Validation,
    step3: hasNoEmptyValues,
    step4: hasNoEmptyValues,
    step5: hasNoEmptyValues
  }

  return callbacks[stepName]
}

// export const getActualStep = (locationPath, dispatch) => {
//   try {
//     for (const key in WIZARD_STEPS) {
//       if ( locationPath.indexOf(WIZARD_STEPS[key]) >= 0) {
//         return key;
//       }
//     }
//     throw "Failed to retrieve the Actual Step"
//   } catch (error: any) {
//     dispatch({
//       type: 'AddError',
//       error: "Something went wrong finding your page.  Please try again."
//     })
//   }
// }

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
