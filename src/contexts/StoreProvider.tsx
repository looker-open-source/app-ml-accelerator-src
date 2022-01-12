import * as React from 'react'
import useCombinedReducers from 'use-combined-reducers';
import { reducers, initialStates } from '../reducers'
import { WizardState } from '../types'

type StoreProviderProps = {children: React.ReactNode}
type StoreState = {
  wizard: WizardState
}

const StoreContext = React.createContext<
  {state: StoreState, dispatch: React.Dispatch<any>} | undefined
>(undefined)

function StoreProvider({children}: StoreProviderProps) {
  const [state, dispatch] = useCombinedReducers<any, any>({
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
