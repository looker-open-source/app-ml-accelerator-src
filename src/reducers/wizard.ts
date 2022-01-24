import { Field, WizardState } from '../types'
import { toggleArrayEntry } from '../services/array'
import { getStepStateClone } from '../services/wizard'

type Action = { type: 'setCurrentStep', step: number } |
  { type: 'addToStepData', step: string, data: any } |
  { type: 'setSelectedDimension', field: Field } |
  { type: 'setSelectedMeasure', field: Field } |
  { type: 'setSelectedParameter', field: Field } |
  { type: 'setSelectedFilter', field: Field } |
  { type: 'setFilterValue', key: string, expression: string } |
  { type: 'clearExplore' }

const wizardInitialState: WizardState = {
  currentStep: 1,
  steps: {
    step1: { objective: null },
    step2: {
      exploreName: null,
      modelName: null,
      exploreLabel: null,
      exploreData: null,
      limit: "500",
      selectedFields: {
        dimensions: [],
        measures: [],
        parameters: [],
        filters: {}
      }
    },
    step3: {
      bqModelName: null,
      targetField: null,
      selectedFields: [],
      summary: {
        exploreName: null,
        modelName: null,
        fields: null,
        data: null
      }
    },
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
    // TODO: refactor this nesting with a getStepStateClone or something
    case 'setSelectedDimension': {
      const { selectedFields } = state.steps.step2
      const dimensions = toggleArrayEntry(selectedFields.dimensions, action.field.name)
      const newState = getStepStateClone(state, 'step2')
      newState.steps.step2.selectedFields = {
        ...newState.steps.step2.selectedFields,
        dimensions
      }
      return newState
    }
    case 'setSelectedMeasure': {
      const { selectedFields } = state.steps.step2
      const measures = toggleArrayEntry(selectedFields.measures, action.field.name)
      const newState = getStepStateClone(state, 'step2')
      newState.steps.step2.selectedFields = {
        ...newState.steps.step2.selectedFields,
        measures
      }
      return newState
    }
    case 'setSelectedParameter': {
      const { selectedFields } = state.steps.step2
      const parameters = toggleArrayEntry(selectedFields.parameters, action.field.name)
      const newState = getStepStateClone(state, 'step2')
      newState.steps.step2.selectedFields = {
        ...newState.steps.step2.selectedFields,
        parameters
      }
      return newState
    }
    case 'setSelectedFilter': {
      const { filters } = state.steps.step2.selectedFields
      const newState = getStepStateClone(state, 'step2')

      // if passing in a filter that already exists
      // remove it from list of selected filters
      if (filters[action.field.name] || filters[action.field.name] == '') {
        delete filters[action.field.name]
        newState.steps.step2.selectedFields = {
          ...newState.steps.step2.selectedFields,
          filters
        }
        return newState
      }

      const newFilters = {
        ...filters,
        [action.field.name]: ""
      }
      newState.steps.step2.selectedFields = {
        ...newState.steps.step2.selectedFields,
        filters: newFilters
      }
      return newState
    }
    case 'clearExplore': {
      const newState = getStepStateClone(state, 'step2')
      newState.steps.step2 = wizardInitialState.steps.step2
      return newState
    }
    default: {
      return {...state}
    }
  }
}

export { wizardReducer, wizardInitialState }
