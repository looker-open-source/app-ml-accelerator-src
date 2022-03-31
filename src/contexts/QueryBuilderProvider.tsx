import React, { createContext, useContext } from 'react'
import { ExtensionContext2 } from '@looker/extension-sdk-react'
import { useStore } from './StoreProvider'
import {
  alphabeticSortByLabel,
  filterExploresByConn,
  mapExploresByModel
} from '../services/explores'
import { WizardSteps } from '../types'
import { wizardInitialState } from '../reducers/wizard'

type IQueryBuilderContext = {
  stepData: any,
  stepName: keyof WizardSteps,
  lockFields: boolean,
  fetchSortedModelsAndExplores?: () => Promise<any>
}

export const QueryBuilderContext = createContext<IQueryBuilderContext>({
  stepData: wizardInitialState.steps.step2,
  stepName: 'step2',
  lockFields: false
})

type QueryBuilderProps = {
  children: any
  stepName: keyof WizardSteps,
  lockFields?: boolean
}

export const QueryBuilderProvider = ({ children, stepName, lockFields }: QueryBuilderProps) => {
  const { state, dispatch } = useStore()
  const { coreSDK: sdk } = useContext(ExtensionContext2)
  const { bigQueryConn } = state.userAttributes
  const stepData = state.wizard.steps[stepName]

  /*
  * Fetch all explores and associated models and sort them
  */
  const fetchSortedModelsAndExplores = async(): Promise<any> => {
    try {
      if (!bigQueryConn) {
        throw "User Attribute 'bigquery_connection_name' must be defined"
      }

      const { ok, value } = await sdk.all_lookml_models({})
      if (!ok) {
        throw "Failed to fetch models"
      }

      const modelExplores = (value || [])
        .filter(filterExploresByConn(bigQueryConn))
        .sort(alphabeticSortByLabel)
        .map(mapExploresByModel)
      return modelExplores
    } catch(error) {
      dispatch({type: 'addError', error})
      return false
    }
  }

  return (
    <QueryBuilderContext.Provider
      value={{
        stepData,
        stepName,
        lockFields: !!lockFields,
        fetchSortedModelsAndExplores
      }}
    >
      {children}
    </QueryBuilderContext.Provider>
  )
}
