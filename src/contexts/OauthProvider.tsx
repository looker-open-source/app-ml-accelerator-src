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
import { useStore } from './StoreProvider'

type IOauthContext = {
  loggingIn?: boolean
  token?: string
  signIn?: () =>  Promise<boolean | undefined>
  signOut?: (expiredAttempt?: boolean) => void
}

export const OauthContext = createContext<IOauthContext>({})

const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth'

type OauthProviderProps = {
  children: any,
  clientId?: string | null,
  scopes: string
}

/**
 * Oauth provider that stores an OAUTH2 access token in history push state.
 * This example uses Googles implicit OAUTH2 flow.
 */
export const OauthProvider = ({
  children,
  clientId,
  scopes
}: OauthProviderProps) => {
  const { extensionSDK } = useContext(ExtensionContext2)
  const { dispatch } = useStore()
  const [ loggingIn, setLoggingIn ] = useState<boolean>(false)
  const [ token, setToken ] = useState<string>()
  const [ attempts, setAttempts ] = useState<number>(0)

  /**
   * OAUTH2 authentication.
   */
  const signIn = async () => {
    if (!clientId) { return }
    if (attempts > 2) {
      throw "Attempted to login to Oauth too many times.  Please refresh your page."
    }
    try {
      setLoggingIn(true)
      const response = await extensionSDK.oauth2Authenticate(authUrl, {
        client_id: clientId,
        scope: scopes,
        response_type: 'token',
      })
      const { access_token } = response
      setToken(access_token)
      setAttempts(0)
      return true
    } catch (error) {
      setAttempts(attempts + 1)
      dispatch({
        type: 'addError',
        error: 'Failed to sign in to Oauth.  Please reload.'
      })
      return false
    } finally {
      setLoggingIn(false)
    }
  }

  /**
   * Simplistic sign out of the user.
   * Removes the token. Note that the token is
   * still active if it has not already expired.
   */
  const signOut = (expiredAttempt: boolean = false) => {
    if (expiredAttempt) {
      setAttempts(attempts + 1)
    }
    setToken(undefined)
  }

  return (
    <OauthContext.Provider value={{ loggingIn, token, signIn, signOut }}>
      {children}
    </OauthContext.Provider>
  )
}
