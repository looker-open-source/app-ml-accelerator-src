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
import { OauthContext } from './OauthProvider'
import { useStore } from './StoreProvider'
import { poll } from '../services/common'
import { JOB_STATUSES } from '../constants'

type IBQMLContext = {
  expired?: boolean
  queryJob?: (sql: string) => Promise<any>,
  getJob?: (props: any) => Promise<any>,
  pollJobStatus?: (
    jobId: string,
    interval: number,
    maxAttempts?: number
  ) => {
    promise: Promise<any>,
    cancel: () => void
  }
}

export const BQMLContext = createContext<IBQMLContext>({})

/**
 * BQML provider that exposes a simple wrapper around the Google
 * BQML restful API.
 */
export const BQMLProvider = ({ children }: any) => {
  const { token } = useContext(OauthContext)
  const { state, dispatch } = useStore()
  const [expired, setExpired] = useState(false)
  const { extensionSDK } = useContext(ExtensionContext2)
  const { gcpProject } = state.userAttributes

  /**
   * Low level invocation of the BigQuery API.
   * Performs primitive error handling.
   *
   * This is a private method.
   */
  const invokeBQApi = async (pathname: string, requestBody?: any) => {
    try {
      const init: any = requestBody
        ? {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
          }
        : {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }

      setExpired(false)
      const { ok, status, body } = await extensionSDK.fetchProxy(
        `https://bigquery.googleapis.com/bigquery/v2/${pathname}`,
        init
      )
      if (status === 401 || status === 404) {
        setExpired(true)
        dispatch({ type: 'addError', error: 'Unauthorized request to google api' })
      }
      return { ok, body, status }
    } catch (error) {
      setExpired(true)
      dispatch({ type: 'addError', error: "Failed to connect to BigQuery. Please refresh and try again." })
      return { ok: false }
    }
  }

  /**
   * Create job to build summary data
   */
  const queryJob = async (sql: string) => {
    const result = await invokeBQApi(
      `projects/${gcpProject}/queries`,
      {
        query: sql,
        useLegacySql: false
      }
    )
    return result
  }

  /**
   * Fetch a job
   */
  const getJob = async ({ jobId }: { jobId: string }) => {
    if (!jobId) {
      throw "Failed fetch job because jobId was not provided"
    }
    const result = await invokeBQApi(
      `projects/${gcpProject}/jobs/${jobId}`
    )
    return result
  }

  const pollJobStatus = (jobId: string, interval: number, maxAttempts?: number) => {
    if (!getJob || !jobId) {
      throw "Failed to fetch job"
    }
    const { promise, cancel } = poll({
      fn: getJob,
      props: { jobId },
      validate: ({ok, body}) => (ok && body.status.state === JOB_STATUSES.done),
      interval,
      maxAttempts
    })
    return { promise, cancel }
  }

  return (
    <BQMLContext.Provider
      value={{
        expired,
        queryJob,
        getJob,
        pollJobStatus
      }}
    >
      {children}
    </BQMLContext.Provider>
  )
}


// CREATE MODEL looker_scratch.david_boosted_tree_classifier
// OPTIONS(MODEL_TYPE='BOOSTED_TREE_CLASSIFIER',
//         BOOSTER_TYPE = 'GBTREE',
//         INPUT_LABEL_COLS = ['input_label_col'])
// AS SELECT * FROM `project.dataset.input_data_view`;


// CREATE OR REPLACE MODEL looker_scratch.david_boosted_tree_classifier
// OPTIONS(MODEL_TYPE='BOOSTED_TREE_REGRESSOR',
//         BOOSTER_TYPE = 'GBTREE',
//         INPUT_LABEL_COLS = ['input_label_col'])
// AS SELECT * FROM `project.dataset.input_data_view`;


// CREATE OR REPLACE MODEL dataset.model_name
//                   OPTIONS(MODEL_TYPE = 'ARIMA_PLUS'
//                     , time_series_timestamp_col = 'user_selected_time_column'
//                     , time_series_data_col = 'user_selected_data_column'

//                     {% if arima_hyper_params.set_horizon._parameter_value == 1000 %}
//                     {% else %}
//                       , HORIZON = {% parameter arima_hyper_params.set_horizon %}
//                     {% endif %}

//                     {% if arima_hyper_params.set_holiday_region._parameter_value == 'none' %}
//                     {% else %}
//                     , HOLIDAY_REGION = '{% parameter arima_hyper_params.set_holiday_region %}'
//                     {% endif %}

//                     , AUTO_ARIMA = TRUE)
//                   AS (SELECT * FROM `project.dataset.input_data_view`) ;
