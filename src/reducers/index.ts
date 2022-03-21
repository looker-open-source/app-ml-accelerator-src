import { errorsReducer, errorsInitialState } from "./errors"
import { wizardReducer, wizardInitialState } from "./wizard"
import { uiReducer, uiInitialState } from "./ui"
import { userReducer, userInitialState } from "./user"
import { bqModelReducer, bqModelInitialState } from "./bqModel"
import { userAttributesReducer, userAttributesInitialState } from "./userAttributes"

export const reducers = {
  wizardReducer,
  bqModelReducer,
  errorsReducer,
  uiReducer,
  userReducer,
  userAttributesReducer
}

export const initialStates = {
  wizardInitialState,
  bqModelInitialState,
  errorsInitialState,
  uiInitialState,
  userInitialState,
  userAttributesInitialState
}
