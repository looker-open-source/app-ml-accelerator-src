import { errorsReducer, errorsInitialState } from "./errors"
import { wizardReducer, wizardInitialState } from "./wizard"
import { uiReducer, uiInitialState } from "./ui"
import { userReducer, userInitialState } from "./user"
import { userAttributesReducer, userAttributesInitialState } from "./userAttributes"

export const reducers = {
  wizardReducer,
  errorsReducer,
  uiReducer,
  userReducer,
  userAttributesReducer
}

export const initialStates = {
  wizardInitialState,
  errorsInitialState,
  uiInitialState,
  userInitialState,
  userAttributesInitialState
}
