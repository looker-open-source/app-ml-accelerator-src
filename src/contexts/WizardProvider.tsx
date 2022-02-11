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
import { Step2State } from '../types'
import { IQuery } from "@looker/sdk/lib/4.0/models"
import { BQMLContext } from './BQMLProvider'
import { matchPath, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { buildWizardState } from '../services/modelState'
import { WIZARD_STEPS } from '../constants'
import { mapAPIExploreToClientExplore } from '../services/explores'

type IWizardContext = {
  loadingModel?: boolean,
  fetchExplore?: (modelName: string, exploreName: string) => Promise<any>,
  saveQueryToState?: (results: any, exploreUrl: string) => void,
  createAndRunQuery?: (stepData: Step2State) => Promise<any>
}

export const WizardContext = createContext<IWizardContext>({})

export const WizardProvider = ({ children }: any) => {
  const history = useHistory()
  const { pathname } = useLocation()
  const match = matchPath<any>(pathname, '/ml/:page/:modelNameParam')
  const modelNameParam = match ? match?.params?.modelNameParam : undefined
  const { state, dispatch } = useStore()
  const { coreSDK: sdk } = useContext(ExtensionContext2)
  const { getSavedModelState } = useContext(BQMLContext)
  const [ loadingModel, setLoadingModel ] = useState<boolean>(false)


  useEffect(() => {
    if (modelNameParam) {
      setLoadingModel(true)
      loadModel().finally(() =>
        setLoadingModel(false)
      )
    }
  }, [])

  const loadModel = async () => {
    try {
      const modelState = await getSavedModelState?.(modelNameParam)
      if (!modelState) {
        history.push(`/ml/${WIZARD_STEPS['step1']}`)
        throw `Model does not exist: ${modelNameParam}`
      }
      const loadedWizardState = buildWizardState(modelState)
      console.log({ loadedWizardState })
      dispatch({
        type: 'populateWizard',
        wizardState: loadedWizardState
      })

      const { step2 } = loadedWizardState.steps
      if (!step2.modelName || !step2.exploreName) {
        throw "Failed to load model"
      }
      await fetchExplore(step2.modelName, step2.exploreName)

      const { ok, results, exploreUrl } = await createAndRunQuery(step2)
      if (!ok) {
        throw `Failed to load source query.  Please try re-running the query from the "${WIZARD_STEPS['step2']}" tab.`
      }
      saveQueryToState(results, exploreUrl)
      dispatch({ type: 'setNeedsSaving', value: false })
      console.log('end load model')
    } catch (error) {
      dispatch({type: 'addError', error: `${error}`})
    }
  }

  const saveQueryToState = (results: any, exploreUrl: string | undefined) => {
    const { step2 } = state.wizard.steps
    dispatch({
      type: 'addToStepData',
      step: 'step2',
      data: {
        ranQuery: {
          dimensions: step2.selectedFields.dimensions,
          measures: step2.selectedFields.measures,
          data: results.data,
          rowCount: results.data.length,
          sql: results.sql,
          exploreUrl
        }
      }
    })
  }

  const fetchExplore = async (modelName: string, exploreName: string) => {
    try {
      const { ok, value } = await sdk.lookml_model_explore(
        modelName,
        exploreName
      );
      if (!ok || !value) { throw 'Failed to fetch explore' }
      const newExploreData = mapAPIExploreToClientExplore(value)
      dispatch({
        type: 'addToStepData',
        step: 'step2',
        data: { exploreData: newExploreData }
      })
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
      return { ok, results, exploreUrl: baseQuery.share_url }
    } catch (error) {
      dispatch({type: 'addError', error: "Error running query: " + error})
      return { ok: false }
    }
  }

  return (
    <WizardContext.Provider
      value={{
        loadingModel,
        fetchExplore,
        saveQueryToState,
        createAndRunQuery
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}
