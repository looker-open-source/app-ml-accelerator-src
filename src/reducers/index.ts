import { errorsReducer, errorsInitialState } from "./errors"
import { wizardReducer, wizardInitialState } from "./wizard"
import { uiReducer, uiInitialState } from "./ui"

export const reducers = {
  wizardReducer,
  errorsReducer,
  uiReducer
}

export const initialStates = {
  wizardInitialState,
  errorsInitialState,
  uiInitialState
}
