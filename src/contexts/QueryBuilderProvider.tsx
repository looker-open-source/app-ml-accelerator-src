import React, { createContext, useContext } from 'react'
import { ExtensionContext2 } from '@looker/extension-sdk-react'
import { useStore } from './StoreProvider'
import {
  alphabeticSortByLabel,
  filterExploresByConn,
  mapExploresByModel
} from '../services/explores'
import { wizardInitialState } from '../reducers/wizard'
import { getBQInputDataMetaDataSql } from '../services/modelTypes'
import { BQMLContext } from './BQMLProvider'
import { getCreationTimeIndex } from '../services/resultsTable'

type IQueryBuilderContext = {
  stepData: any,
  stepName: 'step2' | 'step5',
  lockFields: boolean,
  fetchSortedModelsAndExplores?: () => Promise<any>,
  getStaticDataCreatedTime?: () => Promise<any>
}

export const QueryBuilderContext = createContext<IQueryBuilderContext>({
  stepData: wizardInitialState.steps.step2,
  stepName: 'step2',
  lockFields: false,
})

type QueryBuilderProps = {
  children: any
  stepName: 'step2' | 'step5',
  lockFields?: boolean,
}

export const QueryBuilderProvider = ({ children, stepName, lockFields }: QueryBuilderProps) => {
  const { state, dispatch } = useStore()
  const { coreSDK: sdk } = useContext(ExtensionContext2)
  const { queryJob } = useContext(BQMLContext)
  const { gcpProject, bigQueryConn, bqmlModelDatasetName } = state.userAttributes
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

  // get the input data time stamp to show the user they are viewing not live data
  const getStaticDataCreatedTime = async (): Promise<any> => {
    try {
      // if sql has been generated then were not using static data
      if (stepData.ranQuery?.sql) { return }

      const bqModelName = state.bqModel.name
      const uid = state.bqModel.inputDataUID
      if (!bqmlModelDatasetName || !bqModelName || ! uid) { return }

      const metadataSql = getBQInputDataMetaDataSql({
        gcpProject,
        bqmlModelDatasetName,
        bqModelName,
        uid
      })
      const { ok, body } = await queryJob?.(metadataSql)
      if (!ok) { return }

      return new Date(body[0].creation_time)
      // const timeIndex = getCreationTimeIndex(body)
      // const creationEpoch = body.rows[0].f[timeIndex].v
      // return  new Date(Number(creationEpoch) * 1000) // multiply by milliseconds
    } catch (err) {
      console.log('Error fetching static time stamp - ' + err)
    }
  }

  return (
    <QueryBuilderContext.Provider
      value={{
        stepData,
        stepName,
        lockFields: !!lockFields,
        fetchSortedModelsAndExplores,
        getStaticDataCreatedTime
      }}
    >
      {children}
    </QueryBuilderContext.Provider>
  )
}
