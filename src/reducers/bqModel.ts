import { BQModelState } from '../types'

type Action = { type: 'clearState' } |
  {type: 'setBQModel', data: BQModelState}

const bqModelInitialState = {
  objective: undefined,
  name: '',
  target: undefined,
  arimaTimeColumn: undefined,
  selectedFeatures: undefined,
  advancedSettings: {},
  sourceQuery: {
    exploreName: undefined,
    modelName: undefined,
    exploreLabel: undefined,
    limit: "500",
    sorts: [],
    selectedFields: {
      dimensions: [],
      measures: [],
      parameters: [],
      filters: {}
    }
  },
  jobStatus: undefined,
  job: undefined,
  look: undefined,
  hasPredictions: undefined,
  applyQuery: {
    exploreName: undefined,
    modelName: undefined,
    exploreLabel: undefined,
    limit: "500",
    sorts: [],
    selectedFields: {
      dimensions: [],
      measures: [],
      parameters: [],
      filters: {}
    }
  },
}

// The state that was used to generate the model in big query
function bqModelReducer(state: BQModelState, action: Action): any {
  switch (action.type) {
    case 'setBQModel': {
      return {...state, ...action.data}
    }
    case 'clearState': {
      return { ...bqModelInitialState }
    }
    default: {
      return {...state}
    }
  }
}

export { bqModelReducer, bqModelInitialState }
