import { UserAttributesState } from '../types'

type Action = {type: 'setAllAttributes', value: UserAttributesState}

const userAttributesInitialState = {
  bigQueryConn: undefined,
  googleClientId: undefined,
  lookerTempDatasetName: undefined,
  gcpProject: undefined
}

// Reducer for Looker userAttributes
// values are populated from the marketplace
function userAttributesReducer(state: UserAttributesState, action: Action): any {
  switch (action.type) {
    case 'setAllAttributes': {
      return {...state, ...action.value}
    }
    default: {
      return {...state}
    }
  }
}

export { userAttributesReducer, userAttributesInitialState }
