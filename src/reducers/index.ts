import { errorsReducer, errorsInitialState } from "./errors"
import { wizardReducer, wizardInitialState } from "./wizard"

export const reducers = {
  wizardReducer,
  errorsReducer
}

export const initialStates = {
  wizardInitialState,
  errorsInitialState
}
