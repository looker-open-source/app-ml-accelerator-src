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
  import React, { createContext, useContext } from 'react'
  import { ExtensionContext2 } from '@looker/extension-sdk-react'
  import { useStore } from './StoreProvider'
  import {
    alphabeticSortByLabel,
    filterExploresByConn,
    mapExploresByModel
  } from '../services/explores'
  import { Step2State } from '../types'
  import { IQuery } from "@looker/sdk/lib/4.0/models"

  type IQueryBuilderContext = {
    fetchSortedModelsAndExplores?: () => Promise<any>
  }

  export const QueryBuilderContext = createContext<IQueryBuilderContext>({})

  export const QueryBuilderProvider = ({ children }: any) => {
    const { state, dispatch } = useStore()
    const { coreSDK: sdk } = useContext(ExtensionContext2)
    const { bigQueryConn } = state.userAttributes

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
          fetchSortedModelsAndExplores
        }}
      >
        {children}
      </QueryBuilderContext.Provider>
    )
  }
