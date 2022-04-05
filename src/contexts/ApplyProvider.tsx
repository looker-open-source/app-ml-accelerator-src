import React, { createContext, useContext, useState } from 'react'
import { ExtensionContext2 } from '@looker/extension-sdk-react'
import { useStore } from './StoreProvider'
import { getLooksFolderName } from '../services/user'
import { createArimaPredictSql, createBoostedTreePredictSql, getPredictSql, MODEL_TYPES } from '../services/modelTypes'
import { bqResultsToLookerFormat, buildApplyFilters, getPredictedColumnName } from '../services/apply'
import { BQML_LOOKER_MODEL } from '../constants'
import { WizardContext } from './WizardProvider'
import { BQMLContext } from './BQMLProvider'
import { BQModelState, WizardState } from '../types'
import { compact } from 'lodash'

type IApplyContext = {
  isLoading?: boolean,
  getArimaPredictions?: () => Promise<any>,
  getPredictions?: () => Promise<any>,
  generatePredictions?: (lookerSql: string, getOnly?: boolean) => Promise<any>
}

export const ApplyContext = createContext<IApplyContext>({})

/**
 * Apply provider
 */
export const ApplyProvider = ({ children }: any) => {
  const { state, dispatch } = useStore()
  const { coreSDK } = useContext(ExtensionContext2)
  const { persistModelState } = useContext(WizardContext)
  const { queryJob } = useContext(BQMLContext)
  const [ isLoading, setIsLoading ] = useState<boolean>(false)
  const { bqmlModelDatasetName } = state.userAttributes
  const { personalFolderId, looksFolderId, id: userId } = state.user
  const { bqModel } = state
  const { step5 } = state.wizard.steps

  const generatePredictions = async (lookerSql: string, getOnly?: boolean) => {
    try {
      if (!getOnly) {
        const { ok } = await createPredictions(lookerSql)
        if (!ok) {
          return { ok: false }
        }
      }
      const { ok: getOk, body: data } = await getPredictions?.()
      if (!getOk || !data.schema) {
        return { ok: false }
      }

      const tempBQModel: BQModelState = {
        ...bqModel,
        hasPredictions: true,
        applyQuery: {
          exploreName: step5.ranQuery?.exploreName,
          modelName: step5.ranQuery?.modelName,
          exploreLabel: step5.ranQuery?.exploreLabel,
          limit: step5.ranQuery?.limit,
          sorts: step5.sorts, // don't pull from step5.ranQuery.sorts here.
          selectedFields: step5.ranQuery?.selectedFields
        }
      }
      const tempWizardState: WizardState = {
        ...state.wizard,
        steps: {
          ...state.wizard.steps,
          step5: {
            ...state.wizard.steps.step5,
            showPredictions: true
          },
        },
        unlockedStep: 5
      }

      const { ok: savedOk } = await persistModelState?.(tempWizardState, tempBQModel)
      if (!savedOk) {
        throw "Error occurred while saving model state"
      }

      dispatch ({ type: 'setBQModel', data: tempBQModel })
      dispatch ({ type: 'setUnlockedStep', step: 5 })
      return { ok: true }
    } catch (err) {
      dispatch({
        type: 'addError',
        error: 'Failed to generate predictions - ' + err
      })
      return { ok: false }
    }
  }

  const createPredictions = async (lookerSql: string) => {
    try {
      if (!bqmlModelDatasetName) { throw "No dataset provided" }
      let sql
      debugger
      switch (bqModel.objective) {
        case MODEL_TYPES.ARIMA_PLUS.value:
          sql = createArimaPredictSql({
            bqmlModelDatasetName,
            bqModelName: bqModel.name
          })
          break;
        case MODEL_TYPES.BOOSTED_TREE_REGRESSOR.value:
        case MODEL_TYPES.BOOSTED_TREE_CLASSIFIER.value:
        default:
          sql = createBoostedTreePredictSql({
            bqmlModelDatasetName,
            lookerSql,
            bqModelName: bqModel.name
          })
      }

      const { ok, body } = await queryJob?.(sql)
      if (!ok) {
        throw "Unable to create table."
      }
      return { ok, body }
    } catch (err: any) {
      dispatch({
        type: 'addError',
        error: 'Failed to generate predictions - ' + err
      })
      return { ok: false }
    }
  }

  const getPredictions = async () => {
    try {
      if (!bqmlModelDatasetName || !bqModel.target || !bqModel.inputDataQuery.exploreName) {
        throw "This model does not have a dataset, target, or an explore, please try reloading."
      }
      const sql = getPredictSql({
        bqmlModelDatasetName,
        bqModelName: bqModel.name,
        sorts: step5.sorts || [],
        limit: step5.limit
      })

      const { ok, body } = await queryJob?.(sql)
      if (!ok) {
        throw "Unable to find table."
      }

      if (!step5.exploreData) { throw 'Failed to format data as no explore data was provided.'}
      const formattedResults = bqResultsToLookerFormat(body, bqModel.inputDataQuery.exploreName, step5.exploreData)

      // Handles two different code paths.
      // 1. When there isn't a ran query, its loading an existing model for the first time.
      // 2. When there is a ranQuery, you are generating the predictions for an existing query.
      const ranQuery = step5.ranQuery ? {
          ...step5.ranQuery,
          data: formattedResults,
          rowCount: formattedResults.length,
          selectedFields: {
            ...step5.selectedFields,
            // add the predictedColumn so table headers will be regenerated
            predictions: [getPredictedColumnName(bqModel.target)]
          }
        } : {
          data: formattedResults,
          rowCount: formattedResults.length,
          sql: '',
          exploreUrl: '',
          exploreName: step5.exploreName,
          modelName: step5.modelName,
          exploreLabel: step5.exploreLabel,
          limit: step5.limit,
          selectedFields: {
            ...step5.selectedFields,
            // add the predictedColumn so table headers will be regenerated
            predictions: [getPredictedColumnName(bqModel.target)]
          },
          sorts: step5.sorts,
        }

      dispatch({
        type: 'addToStepData',
        step: 'step5',
        data: {
          ...step5,
          showPredictions: true,
          selectedFields: {
            ...step5.selectedFields,
            // add the predictedColumn so table headers will be regenerated
            predictions: [getPredictedColumnName(bqModel.target)]
          },
          ranQuery
        }
      })
      return { ok, body }
    } catch (err: any) {
      dispatch({
        type: 'addError',
        error: 'Failed to retrieve predictions - ' + err
      })
      return { ok: false }
    }
  }

  const getArimaPredictions = async () => {
    const {
      objective: bqModelObjective,
      name: bqModelName,
      inputDataUID: uid,
      target: bqModelTarget,
      arimaTimeColumn: bqModelArimaTimeColumn,
      advancedSettings: bqModelAdvancedSettings
    } = bqModel

    if (
      !bqModelObjective ||
      !bqModelName ||
      !bqModelTarget ||
      !bqModelArimaTimeColumn ||
      !uid
    ) { return }

    try {
      const modelType = MODEL_TYPES[bqModelObjective]
      const filters = buildApplyFilters({
        modelType,
        uid,
        bqModelObjective,
        bqModelName,
        bqModelTarget,
        bqModelArimaTimeColumn,
        bqModelAdvancedSettings
      })
      const { ok, value: queryResult } = await coreSDK.create_query({
        model: BQML_LOOKER_MODEL,
        view: modelType.exploreName,
        fields: ['arima_forecast.date_date', 'arima_forecast.total_forecast', 'arima_forecast.time_series_data_col'],
        filters
      })
      if (!ok) { throw "Query creation failed" }

      const { ok: runOk, value } = await coreSDK.run_query({
        query_id: queryResult.id,
        result_format: "json_detail",
      })
      if (!runOk) { throw "Query creation failed" }

      const formattedResults = value.data.map((datum: any) => ({
        [getPredictedColumnName(bqModelTarget)]: datum['arima_forecast.total_forecast'],
        [bqModelTarget]: datum['arima_forecast.time_series_data_col'],
        [bqModelArimaTimeColumn]: datum['arima_forecast.date_date']
      }))

      const isTargetOrTimeColumn = (field: any) => field === bqModelTarget || field === bqModelArimaTimeColumn
      const filteredDimensions = step5.selectedFields.dimensions.filter(isTargetOrTimeColumn)
      const filteredMeasures = step5.selectedFields.measures.filter(isTargetOrTimeColumn)
      const selectedFields = {
        ...step5.selectedFields,
        dimensions: filteredDimensions,
        measures: filteredMeasures,
        // add the predictedColumn so table headers will be regenerated
        predictions: [getPredictedColumnName(bqModelTarget)]
      }

      const ranQuery = {
        data: formattedResults,
        rowCount: formattedResults.length,
        sql: '',
        exploreUrl: '',
        exploreName: step5.exploreName,
        modelName: step5.modelName,
        exploreLabel: step5.exploreLabel,
        limit: step5.limit,
        selectedFields,
        sorts: step5.sorts,
      }

      dispatch({
        type: 'addToStepData',
        step: 'step5',
        data: {
          ...step5,
          showPredictions: true,
          selectedFields,
          ranQuery
        }
      })

      return queryResult
    } catch (error) {
      dispatch({
        type: 'addError',
        error: 'Failed - ' + error
      })
    }
  }

  return (
    <ApplyContext.Provider
      value={{
        isLoading,
        getArimaPredictions,
        getPredictions,
        generatePredictions
      }}
    >
      {children}
    </ApplyContext.Provider>
  )
}
