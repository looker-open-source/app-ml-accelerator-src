  /*
 * The MIT License (MIT)
 *
 * Copyright (c) 2021 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import React, { createContext, useContext, useEffect, useState } from 'react'
import { ExtensionContext2 } from '@looker/extension-sdk-react'
import { useStore } from './StoreProvider'
import { getLooksFolderName } from '../services/user'
import { isArima, MODEL_TYPES } from '../services/modelTypes'
import { formatParameterFilter } from '../services/string'
import { buildApplyFilters } from '../services/apply'
import { BQML_LOOKER_MODEL } from '../constants'

type IApplyContext = {
  isLoading?: boolean
}

export const ApplyContext = createContext<IApplyContext>({})

/**
 * Apply provider
 */
export const ApplyProvider = ({ children }: any) => {
  const { state, dispatch } = useStore()
  const { coreSDK } = useContext(ExtensionContext2)
  const [ isLoading, setIsLoading ] = useState<boolean>(false)
  const { personalFolderId, looksFolderId, id: userId } = state.user
  const { step4, step5 } = state.wizard.steps

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    setIsLoading(true)
    let folderId = looksFolderId
    if (!folderId) {
      folderId = await createLooksFolder()
    }
    if (!step5.lookId && folderId) {
      await createLook(folderId)
    } //else if (true) {
      //await updateLook()
    //}
    setIsLoading(false)
  }

  // Create a folder for our BQML Looks
  const createLooksFolder = async () => {
    if (!userId || !personalFolderId) {
      dispatch({
        type: 'addError',
        error: 'Failed to retrieve user or personal folder, please try refreshing.'
      })
      return
    }
    // Create a folder for bqml looks to be saved in
    const newFolderName = getLooksFolderName(userId)
    try {
      const { value: looksFolder } = await coreSDK.create_folder({
        name: newFolderName,
        parent_id: `${personalFolderId}`,
      })
      dispatch({
        type: 'setUser',
        user: {
          looksFolderId: looksFolder.id
        }
      })
      return looksFolder.id
    } catch (err) {
      dispatch({
        type: 'addError',
        error: 'Failed to create the looks bqml folder - ' + err
      })
      console.log(err)
    }
  }

  const getLook = async () => {
    try {
      const { ok, value } = await coreSDK.look(`${step5.lookId}`)
    } catch (err) {
      dispatch({
        type: 'addError',
        error: 'Failed to load your segment - ' + err
      })
    }
  }

  const createQuery = async () => {
    const {
      bqModelObjective,
      bqModelName,
      bqModelTarget,
      bqModelArimaTimeColumn,
      bqModelAdvancedSettings
    } = step4.modelInfo
    if (
      !bqModelObjective ||
      !bqModelName ||
      !bqModelTarget
    ) { return }

    try {
      const modelType = MODEL_TYPES[bqModelObjective]
      const filters = buildApplyFilters({
        modelType,
        bqModelObjective,
        bqModelName,
        bqModelTarget,
        bqModelArimaTimeColumn,
        bqModelAdvancedSettings
      })
      const { ok, value: queryResult } = await coreSDK.create_query({
        model: BQML_LOOKER_MODEL,
        view: modelType.exploreName,
        filters
      })

      if (!ok) {
        throw "Query creation failed"
      }

      return queryResult
    } catch (error) {
      dispatch({
        type: 'addError',
        error: 'Failed - ' + error
      })
    }
  }

  const createLook = async (folderId: number) => {
    try {
      const { bqModelName } = step4.modelInfo
      const queryResult = await createQuery()
      const queryId = queryResult.id

      const look = await coreSDK.create_look({
        folder_id: folderId,
        query_id: queryId,
        title: bqModelName
      })
      if (!look.ok) {
        const error = look.error.errors[0]
        const msg = `${error.field} - ${error.message}`
        throw Error(msg)
      }
      debugger
      dispatch({
        type: 'addToStepData',
        step: 'step5',
        data: {
          lookId: look.value
        }
      })

    } catch (error) {
      dispatch({
        type: 'addError',
        error: 'Failed to create look - ' + error
      })
    }
  }

  const updateLook = async () => {
    try {
      const { bqModelName } = step4.modelInfo
      const queryResult = await createQuery()
      const queryId = queryResult.id

      const { ok, value: look } = await coreSDK.update_look(step5.lookId, {
        query_id: queryId,
        title: bqModelName
      })
      if (!ok) {
        throw "error"
      }

      debugger
      dispatch({
        type: 'addToStepData',
        step: 'step5',
        data: {
          lookId: look.value
        }
      })

    } catch (error) {
      dispatch({
        type: 'addError',
        error: 'Failed to update look - ' + error
      })
    }
  }

  return (
    <ApplyContext.Provider
      value={{
        isLoading
      }}
    >
      {children}
    </ApplyContext.Provider>
  )
}
