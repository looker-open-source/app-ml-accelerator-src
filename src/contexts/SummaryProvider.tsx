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
  import { BQMLContext } from './BQMLProvider'
  import { useStore } from './StoreProvider'
  import { formatSummaryFilter, formBQViewSQL } from '../services/summary'
  import { SUMMARY_MODEL, SUMMARY_EXPLORE } from '../constants'

  type ISummaryContext = {
    getSummaryData?: (
      sql: string | undefined,
      bqModelName: string | undefined,
      targetField: string | undefined
    ) => Promise<any>
  }

  export const SummaryContext = createContext<ISummaryContext>({})

  /**
   * Summary provider
   */
  export const SummaryProvider = ({ children }: any) => {
    const { state, dispatch } = useStore()
    const { coreSDK: sdk } = useContext(ExtensionContext2)
    const { queryJob } = useContext(BQMLContext)
    const { lookerTempDatasetName } = state.userAttributes

    /*
    * private method
    * create or replace BQML view
    */
    const createBQMLView = async (
      querySql: string | undefined,
      bqModelName: string | undefined
    ) => {
      if (!lookerTempDatasetName) {
        throw new Error("User Attribute 'looker_temp_dataset_name' must be defined")
      }

      const sql = formBQViewSQL(querySql, lookerTempDatasetName, bqModelName)
      if (!sql) {
        throw new Error("Failed to create BigQuery View SQL statement")
      }

      const { ok, body } = await queryJob?.(sql)
      if (!ok) {
        throw new Error("Failed to create or replace bigQuery view")
      }

      if (!body.jobComplete) {
        // try again loop
        console.log('incomplete job');
        throw new Error("Failed to  finish creating bigQuery view")
      }
    }

    /**
     * Creates the Summary statistics table
     */
    const getSummaryData = async(
      querySql: string | undefined,
      bqModelName: string | undefined,
      targetField: string | undefined
    ): Promise<any> => {
      try {
        await createBQMLView(querySql, bqModelName)

        // fetch explore to retrieve all field names
        const { value: explore } = await sdk.lookml_model_explore(SUMMARY_MODEL, SUMMARY_EXPLORE)

        // query the summary table filtering on our newly created BQML data
        const { value: query } = await sdk.create_query({
          model:  SUMMARY_MODEL,
          view: SUMMARY_EXPLORE,
          fields: explore.fields.dimensions.map((d: any) => d.name),
          filters: {
            [`${SUMMARY_EXPLORE}.input_data_view_name`]: `${bqModelName}^_input^_data`,
            [`${SUMMARY_EXPLORE}.target_field_name`]: formatSummaryFilter(targetField || "")
          }
        })

        return await sdk.run_query({
          query_id: query.id,
          result_format: "json_detail",
        })
      } catch(error) {
        dispatch({type: 'addError', error})
        return { ok: false }
      }
    }

    return (
      <SummaryContext.Provider
        value={{
          getSummaryData
        }}
      >
        {children}
      </SummaryContext.Provider>
    )
  }
