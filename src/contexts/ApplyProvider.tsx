import React, { createContext, useContext, useState } from 'react'
import { ExtensionContext2 } from '@looker/extension-sdk-react'
import { useStore } from './StoreProvider'
import { lookerToBqResults} from '../services/LookerToBQResults'
import { createArimaPredictSql, createBoostedTreePredictSql, getPredictSql, MODEL_TYPES } from '../services/modelTypes'
import { bqResultsToLookerFormat, buildApplyFilters, buildPredictSorts, FORECAST_PREDICT_COLUMNS, getPredictedColumnName } from '../services/apply'
import { BQML_LOOKER_MODEL } from '../constants'
import { WizardContext } from './WizardProvider'
import { BQMLContext } from './BQMLProvider'
import { BQModelState, WizardState } from '../types'

type IApplyContext = {
  generateArimaPredictions?: () => Promise<any>,
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
  const { queryJob, queryJobAndWait } = useContext(BQMLContext)
  const { gcpProject, bqmlModelDatasetName } = state.userAttributes
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

      const { ok: savedOk } = await persistModelState?.({ wizardState: tempWizardState, bqModel: tempBQModel })
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
      switch (bqModel.objective) {
        // case MODEL_TYPES.ARIMA_PLUS.value:
        //   sql = createArimaPredictSql({
        //     bqmlModelDatasetName,
        //     bqModelName: bqModel.name
        //   })
        //   break;
        case MODEL_TYPES.BOOSTED_TREE_REGRESSOR.value:
        case MODEL_TYPES.BOOSTED_TREE_CLASSIFIER.value:
        default:
          sql = createBoostedTreePredictSql({
            gcpProject,
            bqmlModelDatasetName,
            lookerSql,
            bqModelName: bqModel.name,
            threshold: bqModel.binaryClassifier ? step5.predictSettings.threshold : undefined
          })
      }

      const { ok, body } = await queryJobAndWait?.(sql)
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
        gcpProject,
        bqmlModelDatasetName,
        bqModelName: bqModel.name,
        sorts: step5.sorts || [],
        limit: step5.limit
      })

      const { ok, body: lookerResults } = await queryJobAndWait?.(sql)
      // const { ok, body } = await queryJobAndWait?.(sql)
      if (!ok) {
        throw "Unable to find table."
      }

      if (!step5.exploreData) { throw 'Failed to format data as no explore data was provided.'}
      const body = lookerToBqResults(lookerResults)
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

  const generateArimaPredictions = async () => {
    const {
      objective: bqModelObjective,
      name: bqModelName,
      inputDataUID: uid,
      target: bqModelTarget,
      arimaTimeColumn: bqModelArimaTimeColumn
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
        predictSettings: step5.predictSettings
      })

      const sorts = buildPredictSorts(step5.sorts, bqModel)

      const { ok, value: queryResult } = await coreSDK.create_query({
        model: BQML_LOOKER_MODEL,
        view: modelType.exploreName,
        fields: [FORECAST_PREDICT_COLUMNS.timeColumn, FORECAST_PREDICT_COLUMNS.predictColumn, FORECAST_PREDICT_COLUMNS.targetColumn],
        filters,
        sorts
      })
      if (!ok) { throw "Query creation failed" }

      const { ok: runOk, value } = await coreSDK.run_query({
        query_id: queryResult.id,
        result_format: "json_detail",
        cache: false
      })
      if (!runOk) { throw "Query creation failed" }

      // Format results so that column names are reverted to their original names
      const formattedResults = value.data.map((datum: any) => ({
        [getPredictedColumnName(bqModelTarget)]: datum[FORECAST_PREDICT_COLUMNS.predictColumn],
        [bqModelTarget]: datum[FORECAST_PREDICT_COLUMNS.targetColumn],
        [bqModelArimaTimeColumn]: datum[FORECAST_PREDICT_COLUMNS.timeColumn]
      }))

      // filter out unused fields
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

      // Update Wizard UI with fetched Data
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
          showPredictions: true,
          selectedFields,
          ranQuery
        }
      })

      // Save changes
      const tempWizardState = {
        ...state.wizard,
        unlockedStep: 5
      }
      const tempBQModel = {
        ...bqModel,
        predictSettings: step5.predictSettings
      }
      const { ok: savedOk } = await persistModelState?.({ wizardState: tempWizardState, bqModel: tempBQModel })
      if (!savedOk) {
        throw "Error occurred while saving model state"
      }
      dispatch ({ type: 'setBQModel', data: tempBQModel })
      dispatch ({ type: 'setUnlockedStep', step: 5 })

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
        generateArimaPredictions,
        getPredictions,
        generatePredictions
      }}
    >
      {children}
    </ApplyContext.Provider>
  )
}
