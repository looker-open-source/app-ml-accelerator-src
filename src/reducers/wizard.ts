import { WizardState } from '../types'

type Action = {type: 'setCurrentStep', step: number} |
{type: 'addToStepData', step: string, data: any}

const wizardInitialState: WizardState = {
  currentStep: 1,
  steps: {
    step1: { objective: null },
    step2: { exploreName: null, modelName: null, exploreLabel: null },
    step3: { data: null },
    step4: { data: null },
    step5: { data: null }
  }
}

function wizardReducer(state: WizardState, action: Action): any {
  switch (action.type) {
    case 'setCurrentStep': {
      return {...state, currentStep: action.step}
    }
    case 'addToStepData': {
      return {
        ...state,
        steps: {
          ...state.steps,
          [action.step]: {
            ...state.steps[action.step],
            ...action.data
          }
        }
      }
    }
    default: {
      return {...state}
    }
  }
}

export { wizardReducer, wizardInitialState }
