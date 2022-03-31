import React, { createContext, useContext } from 'react'
import { useStore } from './StoreProvider'
import { BQMLContext } from './BQMLProvider'

type IAdminContext = {
  updateSharedEmails?: (bqModelName: string, sharedWithEmails: string[]) => Promise<any>
}

export const AdminContext = createContext<IAdminContext>({})

export const AdminProvider = ({ children }: any) => {
  const { state, dispatch } = useStore()
  const { updateModelStateSharedWithEmails } = useContext(BQMLContext)

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

  return (
    <AdminContext.Provider
      value={{
        updateSharedEmails
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}
