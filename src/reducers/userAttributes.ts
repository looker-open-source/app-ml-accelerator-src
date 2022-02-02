import { UserAttributesState } from '../types'

type Action = {type: 'setAllAttributes', value: UserAttributesState}

const userAttributesInitialState = {
  bigQueryConn: undefined,
  googleClientId: undefined,
  lookerTempDatasetName: undefined,
  gcpProject: undefined
}

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
