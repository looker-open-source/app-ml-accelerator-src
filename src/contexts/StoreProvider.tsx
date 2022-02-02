import * as React from 'react'
import useCombinedReducers from 'use-combined-reducers';
import { reducers, initialStates } from '../reducers'
import { UIState, UserAttributesState, WizardState } from '../types'

type StoreProviderProps = {children: React.ReactNode}
type StoreState = {
  errors: [object],
  ui: UIState,
  userAttributes: UserAttributesState,
  wizard: WizardState
}

const StoreContext = React.createContext<
  {state: StoreState, dispatch: React.Dispatch<any>} | undefined
>(undefined)

function StoreProvider({children}: StoreProviderProps) {
  const [state, dispatch] = useCombinedReducers<any, any>({
    errors: React.useReducer(reducers.errorsReducer, initialStates.errorsInitialState),
    ui: React.useReducer(reducers.uiReducer, initialStates.uiInitialState),
    userAttributes: React.useReducer(reducers.userAttributesReducer, initialStates.userAttributesInitialState),
    wizard: React.useReducer(reducers.wizardReducer, initialStates.wizardInitialState)
  })

  const value = {state, dispatch}
  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
}

function useStore() {
  const context = React.useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}

export {StoreProvider, useStore, StoreState}
