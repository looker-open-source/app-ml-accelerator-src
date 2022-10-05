import { UIState } from '../types'

type Action = {type: 'isLoading', value: boolean} |
  {type: 'setFiltersOpen', value: boolean} |
  {type: 'setVizOpen', value: boolean} |
  {type: 'setDataOpen', value: boolean} | 
  {type: 'setUnsavedState', value: boolean}

const uiInitialState = {
  isLoading: false,
  filtersOpen: false,
  vizOpen: false,
  dataOpen: true, 
  unsavedState: false
}

function uiReducer(state: UIState, action: Action): any {
  switch (action.type) {
    case 'isLoading': {
      return {...state, isLoading: action.value}
    }
    case 'setUnsavedState': {
      return {...state, unsavedState: action.value}
    }
    case 'setFiltersOpen': {
      return {...state, filtersOpen: action.value}
    }
    case 'setVizOpen': {
      return {...state, vizOpen: action.value}
    }
    case 'setDataOpen': {
      return {...state, dataOpen: action.value}
    }
    default: {
      return {...state}
    }
  }
}

export { uiReducer, uiInitialState }
