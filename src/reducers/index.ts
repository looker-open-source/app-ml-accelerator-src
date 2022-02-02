import { errorsReducer, errorsInitialState } from "./errors"
import { wizardReducer, wizardInitialState } from "./wizard"
import { uiReducer, uiInitialState } from "./ui"
import { userAttributesReducer, userAttributesInitialState } from "./userAttributes"

export const reducers = {
  wizardReducer,
  errorsReducer,
  uiReducer,
  userAttributesReducer
}

export const initialStates = {
  wizardInitialState,
  errorsInitialState,
  uiInitialState,
  userAttributesInitialState
}
