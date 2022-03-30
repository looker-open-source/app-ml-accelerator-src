import { Field, WizardState, WizardSteps } from '../types'
import { toggleArrayEntry } from '../services/array'
import { getStepStateClone } from '../services/wizard'

type Action = { type: 'clearState' } |
  { type: 'populateWizard', wizardState: WizardState } |
  { type: 'setUnlockedStep', step: number } |
  { type: 'setNeedsSaving', value: boolean } |
  { type: 'addToStepData', step: keyof WizardSteps, data: any } |
  { type: 'setSelectedDimension', field: Field, step: 'step2' | 'step5'  } |
  { type: 'setSelectedMeasure', field: Field, step: 'step2' | 'step5' } |
  { type: 'setSelectedParameter', field: Field, step: 'step2' | 'step5' } |
  { type: 'setSelectedFilter', field: Field, step: 'step2' | 'step5' } |
  { type: 'setFilterValue', key: string, expression: string, step: 'step2' | 'step5' } |
  { type: 'setExploreFilterText', filterText: string } |
  { type: 'clearExplore' }

const wizardInitialState: WizardState = {
  unlockedStep: 1,
  needsSaving: true, // If parameters of an existing model are updated, model needs to be saved
  steps: {
    step1: { objective: undefined },
    step2: {
      exploreName: undefined,
      modelName: undefined,
      exploreLabel: undefined,
      exploreData: undefined,
      exploreFilterText: "",
      limit: "500",
      selectedFields: {
        dimensions: [],
        measures: [],
        parameters: [],
        filters: {}
      },
      ranQuery: undefined,
      sorts: [],
      tableHeaders: []
    },
    step3: {
      bqModelName: '',
      targetField: undefined,
      arimaTimeColumn: undefined,
      allFeatures: [],
      selectedFeatures: [],
      advancedSettings: {},
      summary: {
        fields: undefined,
        data: undefined,
      }
    },
    step4: {
      complete: false
    },
    step5: {
      showPredictions: false,
      exploreData: undefined,
      limit: "500",
      selectedFields: {
        dimensions: [],
        measures: [],
        parameters: [],
        filters: {}
      },
      ranQuery: undefined,
      sorts: [],
      tableHeaders: []
    }
  }
}

const needsSavingSteps = ['step1', 'step2', 'step3']

// the ui state of the wizard
function wizardReducer(state: WizardState, action: Action): any {
  console.log({ reducer: action.type, action, state})
  switch (action.type) {
    case 'clearState': {
      return { ...wizardInitialState }
    }
    case 'populateWizard': {
      console.log({wizardState: action.wizardState})
      return { ...action.wizardState }
    }
    case 'setUnlockedStep': {
      return {...state, unlockedStep: action.step}
    }
    case 'setNeedsSaving': {
      return {...state, needsSaving: action.value}
    }
    case 'addToStepData': {
      // one way toggle of needsSaving,
      // set it to true or dont do anything to it
      const needsSaving = (needsSavingSteps.indexOf(action.step.toLowerCase()) >= 0)
      return {
        ...state,
        needsSaving: needsSaving || state.needsSaving,
        steps: {
          ...state.steps,
          [action.step]: {
            ...state.steps[action.step],
            ...action.data
          }
        }
      }
    }
    case 'setSelectedDimension': {
      const { selectedFields } = state.steps[action.step]
      const dimensions = toggleArrayEntry(selectedFields.dimensions, action.field.name)
      const newState = getStepStateClone(state, action.step, true)
      newState.steps[action.step].selectedFields = {
        ...newState.steps[action.step].selectedFields,
        dimensions
      }
      return newState
    }
    case 'setSelectedMeasure': {
      const { selectedFields } = state.steps[action.step]
      const measures = toggleArrayEntry(selectedFields.measures, action.field.name)
      const newState = getStepStateClone(state, action.step, true)
      newState.steps[action.step].selectedFields = {
        ...newState.steps[action.step].selectedFields,
        measures
      }
      return newState
    }
    case 'setSelectedParameter': {
      const { selectedFields } = state.steps[action.step]
      const parameters = toggleArrayEntry(selectedFields.parameters, action.field.name)
      const newState = getStepStateClone(state, action.step, true)
      newState.steps[action.step].selectedFields = {
        ...newState.steps[action.step].selectedFields,
        parameters
      }
      return newState
    }
    case 'setSelectedFilter': {
      const { filters } = state.steps[action.step].selectedFields
      const newState = getStepStateClone(state, action.step, true)

      // if passing in a filter that already exists
      // remove it from list of selected filters
      if (filters[action.field.name] || filters[action.field.name] == '') {
        delete filters[action.field.name]
        newState.steps[action.step].selectedFields = {
          ...newState.steps[action.step].selectedFields,
          filters
        }
        return newState
      }

      const newFilters = {
        ...filters,
        [action.field.name]: ""
      }
      newState.steps[action.step].selectedFields = {
        ...newState.steps[action.step].selectedFields,
        filters: newFilters
      }
      return newState
    }
    case 'setFilterValue': {
      const { filters } = state.steps[action.step].selectedFields
      if (!filters.hasOwnProperty(action.key)) {
        console.error('That filter does not exist')
      }

      const newFilters = {
        ...filters,
        [action.key]: action.expression
      }
      const newState = getStepStateClone(state, action.step, true)
      newState.steps[action.step].selectedFields = {
        ...state.steps[action.step].selectedFields,
        filters: newFilters
      }
      return newState;
    }
    case 'setExploreFilterText': {
      const newState = getStepStateClone(state, 'step2')
      newState.steps.step2.exploreFilterText = action.filterText
      return newState
    }
    case 'clearExplore': {
      const newState = getStepStateClone(state, 'step2', true)
      newState.steps.step2 = {...wizardInitialState.steps.step2}
      return newState
    }
    default: {
      return {...state}
    }
  }
}

export { wizardReducer, wizardInitialState }
