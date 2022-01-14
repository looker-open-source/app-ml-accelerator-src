type ErrorPayload = {
  errorString: string,
  errorLevel: string,
  id: number
}
type Action = {type: 'addError', error: string} | {type: 'removeError', id: number}

type ErrorState = ErrorPayload[]

const errorsInitialState: ErrorPayload[] = []

function errorsReducer(state: ErrorState, action: Action): ErrorState {
  switch (action.type) {
    case 'addError': {
      const newState = [...state]
      newState.push({
        errorString: action.error,
        errorLevel: 'critical',
        id: state.length > 0 ? state[state.length - 1].id + 1 : 1
      })
      return [...newState]
    }
    case 'removeError': {
      return state.filter((error: ErrorPayload) => error.id !== action.id)
    }
    default: {
      return [...state]
    }
  }
}

export { errorsReducer, ErrorState, errorsInitialState }
