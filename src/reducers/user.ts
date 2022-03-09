import { UserState } from '../types'

type Action = {type: 'setUser', user: UserState}

const userInitialState = {
  id: undefined,
  email: undefined,
  firstName: undefined,
  personalFolderId: undefined,
  looksFolderId: undefined
}

function userReducer(state: UserState, action: Action): any {
  switch (action.type) {
    case 'setUser': {
      return {...state, ...action.user}
    }
    default: {
      return {...state}
    }
  }
}

export { userReducer, userInitialState }
