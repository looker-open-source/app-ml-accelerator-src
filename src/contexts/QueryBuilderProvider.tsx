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
    fetchSortedModelsAndExplores?: () => Promise<any>,
    fetchExplore?: (modelName: string, exploreName: string) => Promise<any>,
    createAndRunQuery?: (stepData: Step2State) => Promise<any>
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

    const fetchExplore = async (modelName: string, exploreName: string) => {
      try {
        const { ok, value } = await sdk.lookml_model_explore(
          modelName,
          exploreName
        );

        if (!ok || !value) { throw 'Failed to fetch explore' }
        return { ok, value }
      } catch (error) {
        dispatch({type: 'addError', error: "Error loading explore " + error})
        return { ok: false }
      }
    }

    /*
    * Private method
    */
    const createBaseQuery = async (
      stepData: Step2State
    ): Promise<IQuery> => {
      const { dimensions, measures } = stepData.selectedFields
      const fields = [...dimensions, ...measures]
      const { value: baseQuery } = await sdk.create_query({
        model: stepData.modelName || undefined,
        view: stepData.exploreName || undefined,
        fields,
        filters: stepData.selectedFields.filters,
        limit: stepData.limit || "500",
        sorts: stepData.sorts || []
      })
      return baseQuery
    }

    const createAndRunQuery = async (
      stepData: Step2State,
    ) => {
      try {
        const baseQuery = await createBaseQuery(stepData)
        if (!baseQuery.client_id || !baseQuery.id || !stepData.modelName) {
          throw "Missing Parameters"
        }

        const { ok, value: results } = await sdk.run_query({
          query_id: baseQuery.id,
          limit: Number(stepData.limit) || 500,
          result_format: "json_detail",
        })

        if (!ok) { throw "Failed to run query" }
        return { results, exploreUrl: baseQuery.share_url }
      } catch (error) {
        dispatch({type: 'addError', error: "Error running query: " + error})
        return { ok: false }
      }
    }

    return (
      <QueryBuilderContext.Provider
        value={{
          fetchSortedModelsAndExplores,
          fetchExplore,
          createAndRunQuery
        }}
      >
        {children}
      </QueryBuilderContext.Provider>
    )
  }
