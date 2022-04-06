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
  // The ${model_name}_input_data_${uid} BQML table is created when a summary is generated
  // The UID tells the model which input_data table was used at the time of model creation/update
  inputDataUID: undefined,
  inputDataQuery: {
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
  binaryClassifier: false,
  jobStatus: undefined,
  job: undefined,
  hasPredictions: undefined,
  predictSettings: {},
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
