import React, { createContext, useContext } from 'react'
import { useStore } from './StoreProvider'
import { BQMLContext } from './BQMLProvider'
import { formatSavedModelData, MODELS_PER_PAGE } from '../services/modelList'
import { BigQueryModelMetadata } from '../types/BigQueryModel'
import { TABLE_SUFFIXES, getAllInputDataTablesSql } from '../services/modelTypes'
import { formatBQResults } from '../services/common'

type IAdminContext = {
  getModelMetadata?: (modelName: string) => Promise<any>
  saveModelMetadata?: (model: BigQueryModelMetadata, modelName: string) => Promise<any>
  updateSharedEmails?: (bqModelName: string, sharedWithEmails: any[]) => Promise<any>,
  getSharedModels?: () => Promise<any>,
  getMyModels?: () => Promise<any>,
  removeModel?: (modelName: string) => Promise<any>,
}

export const AdminContext = createContext<IAdminContext>({})

export const AdminProvider = ({ children }: any) => {
  const { state, dispatch } = useStore()
  const {
    updateModelStateSharedWithEmails,
    getSavedModelsSharedWithMe,
    getAllMySavedModels,
    getModel,
    updateModel,
    deleteModel,
    deleteTable,
    queryJobAndWait,
    deleteModelFromModelState
  } = useContext(BQMLContext)
  const { bqmlModelDatasetName } = state.userAttributes

  const getModelMetadata = async (modelName: string) => {
    try {
      const { ok, body } = await getModel?.({ modelName })
      if (!ok) {
        throw "Request was unsuccessful"
      }
      return { ok, body }
    } catch (error) {
      dispatch({
        type: 'addError',
        error: `Failed to get Model metadata: ${modelName} - ${error}`
      })
      return { ok: false }
    }
  }

  const saveModelMetadata = async (model: BigQueryModelMetadata, modelName: string) => {
    try {
      const { ok, body } = await updateModel?.({ model, modelName })
      if (!ok) {
        throw "Request was unsuccessful"
      }
      return { ok, body }
    } catch (error) {
      dispatch({
        type: 'addError',
        error: `Failed to save Model metadata: ${error}`
      })
      return { ok: false }
    }
  }

  const updateSharedEmails = async (bqModelName: string, sharedWithEmails: any[]) => {
    try {
      const { ok, body } = await updateModelStateSharedWithEmails?.(bqModelName, sharedWithEmails)
      if (!ok) {
        throw "Request was unsuccessful"
      }
      return { ok, body }
    } catch (error) {
      dispatch({
        type: 'addError',
        error: `Failed to update shared list for Model: ${bqModelName} - ${error}`
      })
      return { ok: false }
    }
  }

  const getSharedModels = async () => {
    try {
      const { ok, value } = await getSavedModelsSharedWithMe?.(true)
      if (!ok) {
        return { ok }
      }
      const formattedData = formatSavedModelData(value.data)
      const pages = Math.ceil(formattedData.length / MODELS_PER_PAGE)
      return { ok, data: formattedData, pages }
    } catch (error) {
      dispatch({ type: 'addError', error: error })
      return { ok: false }
    }
  }

  const getMyModels = async () => {
    try {
      const { ok, value } = await getAllMySavedModels?.(true)
      if (!ok) {
        return { ok }
      }
      const formattedData = formatSavedModelData(value.data)
      const pages = Math.ceil(formattedData.length / MODELS_PER_PAGE)
      return { ok, data: formattedData, pages }
    } catch (error) {
      dispatch({ type: 'addError', error: error })
      return { ok: false }
    }
  }

  const removeModel = async (modelName: string) => {
    try {
      if (!modelName) { throw 'A model was not provided.' }
      const { ok: modelStateOk } = await deleteModelFromModelState?.(modelName)
      if (!modelStateOk) {
        throw `Failed to delete model: ${modelName}`
      }
      deleteModel?.({ modelName })
      removeAllInputDataTables(modelName)
      removeAllModelTables(modelName)
      return { ok: true }
    } catch (error) {
      dispatch({ type: 'addError', error: `Model Deletion Failed: ${error}` })
      return { ok: false }
    }
  }

  const removeAllModelTables = async (modelName: string) => {
    try {
      // Loop through all the different table names associated with the model and delete them
      Object.keys(TABLE_SUFFIXES).forEach((key: string) => {
        if (key !== 'inputData') {
          const suffix: string = TABLE_SUFFIXES[key]
          const tableName = `${modelName}${suffix}`
          deleteTable?.({ tableName })
        }
      })
    } catch (error) {
      dispatch({ type: 'addError', error: `Model Tables Deletion Failed: ${error}` })
      return { ok: false }
    }
  }

  // InputData tables are suffixed with a UID.
  // First we have to fetch all input data table names for our model from INFORMATION_SCHEMA.TABLES
  // take that list, loop through and delete each one
  const removeAllInputDataTables = async (modelName: string) => {
    try{
      const { ok, body } = await getAllInputDataTableNames(modelName)
      if (body.rows && body.rows.length > 0) {
        const tableNames = formatBQResults(body)
        tableNames.forEach((row: any) => {
          const tableName: string = row.table_name
          deleteTable?.({ tableName })
        })
      }
    } catch (error) {
      dispatch({ type: 'addError', error: `Model InputData Table Deletion Failed: ${error}` })
      return { ok: false }
    }
  }

  // fetch all input data table names for our model from INFORMATION_SCHEMA.TABLES
  const getAllInputDataTableNames = async (modelName: string) => {
    try{
      if (!bqmlModelDatasetName || !modelName) { throw 'No dataset or model name provided.' }
      const sql = getAllInputDataTablesSql({ bqmlModelDatasetName, bqModelName: modelName })
      const { ok, body } = await queryJobAndWait?.(sql)
      return { ok, body }
    } catch (error) {
      dispatch({ type: 'addError', error: `Model Deletion Failed: ${error}` })
      return { ok: false }
    }
  }

  return (
    <AdminContext.Provider
      value={{
        getModelMetadata,
        saveModelMetadata,
        updateSharedEmails,
        getSharedModels,
        getMyModels,
        removeModel
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}
