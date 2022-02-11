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
import React, { createContext, useContext, useState } from 'react'
import { ExtensionContext2 } from '@looker/extension-sdk-react'
import { BQMLContext } from './BQMLProvider'
import { useStore } from './StoreProvider'
import { formatSummaryFilter, formBQViewSQL } from '../services/summary'
import { SUMMARY_MODEL, SUMMARY_EXPLORE } from '../constants'
import { isArima, MODEL_TYPE_CREATE_METHOD } from '../services/modelTypes'

  type ISummaryContext = {
    getSummaryData?: (
      sql: string | undefined,
      bqModelName: string | undefined,
      targetField: string | undefined
    ) => Promise<any>,
    createJob?: (sql: string) => Promise<any>,
    createBQMLModel?: (
      objective: string | undefined,
      bqModelName: string | undefined,
      targetField: string | undefined,
      arimaTimeColumn:  string | undefined
    ) => Promise<any>
  }

  export const SummaryContext = createContext<ISummaryContext>({})

  /**
   * Summary provider
   */
  export const SummaryProvider = ({ children }: any) => {
    const { state, dispatch } = useStore()
    const { coreSDK: sdk } = useContext(ExtensionContext2)
    const { queryJob, pollJobStatus, getJob } = useContext(BQMLContext)
    const { gcpProject, bqmlModelDatasetName } = state.userAttributes
    const [ previousBQValues, setPreviousBQValues ] = useState<any>({
      sql: null,
      model: null
    })

    /*
    * private method
    * create or replace BQML view
    */
    const createBQMLView = async (
      querySql: string | undefined,
      bqModelName: string | undefined
    ) => {
      if (!bqmlModelDatasetName) {
        throw "User Attribute 'looker_temp_dataset_name' must be defined"
      }

      const sql = formBQViewSQL(querySql, bqmlModelDatasetName, bqModelName)
      if (!sql) {
        throw "Failed to create BigQuery View SQL statement"
      }
      const { body } = await createJob(sql)
      if (!body.jobComplete) {
        // Give it another 10s to get the job status in case BQ is taking a while to create the view
        if (!pollJobStatus) {
          throw "Failed to  finish creating bigQuery view"
        }
        const { promise } = pollJobStatus(
          body.jobReference.jobId,
          3300,
          3
        )
        await promise
      }
    }

    const createJob = async (sql: string) => {
      const { ok, body } = await queryJob?.(sql)
      if (!ok) {
        throw "Failed to create or replace bigQuery view"
      }
      return { ok, body }
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
        // in an effort to limit the number of calls to BigQuery
        // do not create the BQ view if its alrady been created for this sql and model name
        if (querySql !== previousBQValues.sql || bqModelName !== previousBQValues.model) {
          setPreviousBQValues({ sql: querySql, model: bqModelName })
          await createBQMLView(querySql, bqModelName)
        }

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

        return await sdk.run_query({
          query_id: query.id,
          result_format: "json_detail",
        })
      } catch(error) {
        dispatch({type: 'addError', error: "Failed to fetch summary.  Please try again."})
        return { ok: false }
      }
    }

    const createBQMLModel = async (
      objective: string | undefined,
      bqModelName: string | undefined,
      target: string | undefined,
      arimaTimeColumn: string | undefined
    ) => {
      try {
        if (
          !objective ||
          !gcpProject ||
          !bqmlModelDatasetName ||
          !target ||
          !bqModelName ||
          (isArima(objective) && !arimaTimeColumn)
        ) { return }

        // TODO:
        // CHECK THAT MODEL NAME IS NOT ALREADY TAKEN BY ANOTHER USER
        // IF ITS THEIR OWN EXISTING MODEL & NO modelNameParam,
        // PROMPT THE USER TO CONFIRM THEY WANT TO OVERWRITE THEIR OWN MODEL

        const sql = MODEL_TYPE_CREATE_METHOD[objective]({
          gcpProject,
          bqmlModelDatasetName,
          bqModelName,
          target,
          arimaTimeColumn
        })
        if (!sql) {
          throw "Failed to create BigQuery Model SQL statement"
        }
        const { ok, body } = await createJob?.(sql)
        if (!ok || !body.jobReference.jobId) {
          throw "Something went wrong, please try again."
        }
        await checkCreateModelSuccess(body.jobReference.jobId)

        return { ok, body }
      } catch (error) {
        console.log({error})
        dispatch({type: 'addError', error: "Failed to create model: " + error})
        return { ok: false }
      }
    }

    // fetch the Job by its id to ensure it was successful
    // some failures only reveal themselves from querying the job
    const checkCreateModelSuccess = async (jobId: string) => {
      const { ok, body } = await getJob?.({ jobId })
      if (body.status.errorResult) {
        throw body.status.errorResult.message
      }
      if (!ok) {
        throw "Something went wrong, please try again."
      }
    }

    return (
      <SummaryContext.Provider
        value={{
          getSummaryData,
          createJob,
          createBQMLModel
        }}
      >
        {children}
      </SummaryContext.Provider>
    )
  }
