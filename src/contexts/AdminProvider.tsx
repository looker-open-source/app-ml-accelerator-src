import React, { createContext, useContext } from 'react'
import { useStore } from './StoreProvider'
import { BQMLContext } from './BQMLProvider'
import { formatSavedModelData, MODELS_PER_PAGE } from '../services/modelList'

type IAdminContext = {
  updateSharedEmails?: (bqModelName: string, sharedWithEmails: string[]) => Promise<any>,
  getSharedModels?: () => Promise<any>,
  getMyModels?: () => Promise<any>
}

export const AdminContext = createContext<IAdminContext>({})

export const AdminProvider = ({ children }: any) => {
  const { dispatch } = useStore()
  const { updateModelStateSharedWithEmails, getSavedModelsSharedWithMe, getAllMySavedModels } = useContext(BQMLContext)

  const updateSharedEmails = async (bqModelName: string, sharedWithEmails: string[]) => {
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
    }
  }

  const getSharedModels = async () => {
    try {
      const { ok, value } = await getSavedModelsSharedWithMe?.()
      if (!ok) {
        throw "Failed to fetch models shared with you."
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
      const { ok, value } = await getAllMySavedModels?.()
      if (!ok) {
        throw "Failed to fetch your models."
      }
      const formattedData = formatSavedModelData(value.data)
      const pages = Math.ceil(formattedData.length / MODELS_PER_PAGE)
      return { ok, data: formattedData, pages }
    } catch (error) {
      dispatch({ type: 'addError', error: error })
      return { ok: false }
    }
  }

  return (
    <AdminContext.Provider
      value={{
        updateSharedEmails,
        getSharedModels,
        getMyModels
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}
