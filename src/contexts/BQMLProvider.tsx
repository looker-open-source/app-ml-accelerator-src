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

type IBQMLContext = {
  expired?: boolean
  queryJob?: (sql: string) => Promise<any>
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
      if (status === 401) {
        setExpired(true)
        dispatch({ type: 'addError', error: 'Unauthorized request to google api' })
      }
      return { ok, body, status }
    } catch (error) {
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

  return (
    <BQMLContext.Provider
      value={{
        expired,
        queryJob
      }}
    >
      {children}
    </BQMLContext.Provider>
  )
}
