import React, { createContext, useContext } from 'react'
import { BQMLContext } from './BQMLProvider'
import { useStore } from './StoreProvider'
import { createClassifierGlobalExplainSql, createRegressorGlobalExplainSql, isClassifier, selectBoostedTreeGlobalExplainSql } from '../services/modelTypes'

type IExplainContext = {
  getGlobalExplainData?: (
    classLevelExplain: boolean
  ) => Promise<any>
}

export const ExplainContext = createContext<IExplainContext>({})

/**
 * Explain provider
 */
export const ExplainProvider = ({ children }: any) => {
  const { state, dispatch } = useStore()
  const { queryJobAndWait } = useContext(BQMLContext)
  const { gcpProject, bqmlModelDatasetName } = state.userAttributes


  // Create & Fetch Evaluate function data in BigQuery
  const getGlobalExplainData = async (
    classLevelExplain: boolean
  ) => {
    try {
      if (!gcpProject || !bqmlModelDatasetName) { throw 'Gcp project and dataset are incorrectly set up.'}

      const { name: bqModelName } = state.bqModel
      let queryResults

      const selectSql = selectBoostedTreeGlobalExplainSql({ gcpProject, bqmlModelDatasetName, bqModelName, classLevelExplain })
      if (!selectSql) { throw 'Failed to generate select sql' }

      // check if evaluate table already exists

      // if the evaluate table doesnt exist yet, create it and select from it again
      const createSql = isClassifier(state.bqModel.objective || '') ?
        createClassifierGlobalExplainSql({ gcpProject, bqmlModelDatasetName, bqModelName, classLevelExplain }) :
        createRegressorGlobalExplainSql({ gcpProject, bqmlModelDatasetName, bqModelName })
      if (!createSql) { throw 'Failed to generate create sql' }

      const { ok: createOk } = await queryJobAndWait?.(createSql)
      if (!createOk) { throw 'Failed to create explain table' }

      // fetch table results now that table is created
      const { ok: selectOk, body: selectBody } = await queryJobAndWait?.(selectSql)
      if (!selectOk) { throw 'Failed to fetch explain data' }
      queryResults = selectBody

      dispatch({ type: 'setExplain', explainLevel: classLevelExplain ? 'class' : 'model', data: queryResults })
      return { ok: true, body: queryResults }
    } catch (error) {
      dispatch({type: 'addError', error: "Error fetching Explain Data: " + error})
      return { ok: false }
    }
  }

  return (
    <ExplainContext.Provider
      value={{
        getGlobalExplainData
      }}
    >
      {children}
    </ExplainContext.Provider>
  )
}
