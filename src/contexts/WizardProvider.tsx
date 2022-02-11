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
import { ResultsTableHeaderItem, Step2State, WizardState } from '../types'
import { IQuery } from "@looker/sdk/lib/4.0/models"
import { BQMLContext } from './BQMLProvider'
import { matchPath, useHistory, useLocation } from 'react-router-dom'
import { buildWizardState } from '../services/modelState'
import { SUMMARY_EXPLORE, SUMMARY_MODEL, WIZARD_STEPS } from '../constants'
import { mapAPIExploreToClientExplore } from '../services/explores'
import { getHeaderColumns } from '../services/resultsTable'
import { formatSummaryFilter, renameSummaryDataKeys } from '../services/summary'

type IWizardContext = {
  loadingModel?: boolean,
  fetchExplore?: (modelName: string, exploreName: string) => Promise<any>,
  saveQueryToState?: (
    stepData: Step2State,
    results: any,
    exploreUrl?: string,
    tableHeaders?: ResultsTableHeaderItem[]) => void,
  createAndRunQuery?: (stepData: Step2State) => Promise<any>,
  fetchSummary?: (bqModelName: string, targetField: string) => Promise<any>,
  saveSummary?: (rawSummary: any, wizardState: WizardState) => void
}

export const WizardContext = createContext<IWizardContext>({})

export const WizardProvider = ({ children }: any) => {
  const history = useHistory()
  const { pathname } = useLocation()
  const match = matchPath<any>(pathname, '/ml/:page/:modelNameParam')
  const modelNameParam = match ? match?.params?.modelNameParam : undefined
  const { dispatch } = useStore()
  const { coreSDK: sdk } = useContext(ExtensionContext2)
  const { getSavedModelState } = useContext(BQMLContext)
  const [ loadingModel, setLoadingModel ] = useState<boolean>(true)


  useEffect(() => {
    if (modelNameParam) {
      setLoadingModel(true)
      loadModel().finally(() =>
        setLoadingModel(false)
      )
    } else {
      setLoadingModel(false)
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
      const { step2, step3 } = loadedWizardState.steps
      if (!step2.modelName || !step2.exploreName) {
        throw "Failed to load model"
      }

      // Fetch and Populate Step2 Data
      const { value: exploreData } = await fetchExplore(step2.modelName, step2.exploreName)
      const { ok, results, exploreUrl } = await createAndRunQuery(step2)
      if (!ok) {
        throw `Failed to load source query.  Please try re-running the query from the "${WIZARD_STEPS['step2']}" tab.`
      }
      const headers = getHeaderColumns(
        step2.selectedFields,
        formRanQuery(step2, results, exploreUrl),
        exploreData
      )
      saveQueryToState(step2, results, exploreUrl, headers)

      // Fetch and Populate Step3 Data
      if (step3.bqModelName && step3.targetField) {
        const { ok, value } = await fetchSummary(step3.bqModelName, step3.targetField)
        if (!ok || !value) { throw "Failed to load summmary" }
        saveSummary(value, loadedWizardState, step3.selectedFields)
      }

      dispatch({ type: 'setNeedsSaving', value: false })
      console.log('end load model')
    } catch (error) {
      dispatch({type: 'addError', error: `${error}`})
    }
  }

  const formRanQuery = (stepData: Step2State, results: any, exploreUrl?: string) => {
    return {
      dimensions: stepData.selectedFields.dimensions,
      measures: stepData.selectedFields.measures,
      data: results.data,
      rowCount: results.data.length,
      sql: results.sql,
      exploreUrl
    }
  }

  const saveQueryToState = (
    stepData: Step2State,
    results: any,
    exploreUrl?: string,
    tableHeaders?: ResultsTableHeaderItem[]
  ) => {
    dispatch({
      type: 'addToStepData',
      step: 'step2',
      data: {
        tableHeaders: tableHeaders || stepData.tableHeaders,
        ranQuery: formRanQuery(stepData, results, exploreUrl)
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
      return { ok, value: newExploreData }
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

  const fetchSummary = async (bqModelName: string, targetField: string) => {
    try {
      // fetch explore to retrieve all field names
      const { value: explore } = await sdk.lookml_model_explore(SUMMARY_MODEL, SUMMARY_EXPLORE)

      // query the summary table filtering on our newly created BQML data
      const { value: query } = await sdk.create_query({
        model:  SUMMARY_MODEL,
        view: SUMMARY_EXPLORE,
        fields: explore.fields.dimensions.map((d: any) => d.name),
        filters: {
          [`${SUMMARY_EXPLORE}.input_data_view_name`]: `${formatSummaryFilter(bqModelName || "")}^_input^_data`,
          [`${SUMMARY_EXPLORE}.target_field_name`]: formatSummaryFilter(targetField || "")
        }
      })

      const { ok, value } = await sdk.run_query({
        query_id: query.id,
        result_format: "json_detail",
      })
      if (!ok) { throw "Failed to run query" }
      return { ok, value }
    } catch (error) {
      dispatch({type: 'addError', error: "Error fetching summary"})
      return { ok: false }
    }
  }

  const saveSummary = (rawSummary: any, wizardState: WizardState, selectedFields?: string[]) => {
    const { step2, step3 } = wizardState.steps
    const fields = (rawSummary.fields || {})
    const summaryData = renameSummaryDataKeys(rawSummary.data)
    dispatch({
      type: 'addToStepData',
      step: 'step3',
      data: {
        selectedFields: selectedFields || summaryData.map((d: any) => d["column_name"].value),
        summary: {
          exploreName: step2.exploreName,
          modelName: step2.modelName,
          target: step3.targetField,
          data: summaryData,
          fields: [...fields.dimensions, ...fields.measures]
        }
      }
    })
  }

  return (
    <WizardContext.Provider
      value={{
        loadingModel,
        fetchExplore,
        saveQueryToState,
        createAndRunQuery,
        fetchSummary,
        saveSummary
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}
