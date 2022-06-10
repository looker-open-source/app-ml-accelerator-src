import React, { createContext, useContext, useState } from 'react'
import { ExtensionContext2 } from '@looker/extension-sdk-react'
import { useStore } from './StoreProvider'
import { LOOKER_CLIENT_ID, LOOKER_CLIENT_SECRET, BQML_EXT_ACCESS_TOKEN_SERVER_ENDPOINT } from '../constants'

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
      let response

      // Check if extension app is configured to use a service account to authenticate with BQ
      const accessTokenServerEndpoint = await extensionSDK.userAttributeGetItem(BQML_EXT_ACCESS_TOKEN_SERVER_ENDPOINT)
      if (accessTokenServerEndpoint !== null || '') {
        console.log('Using SERVICE ACCOUNT to request access token')

        // Get Oauth access token using service account (call external access token server)
        const resp = await extensionSDK.serverProxy(
          `${accessTokenServerEndpoint}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              client_id: extensionSDK.createSecretKeyTag(LOOKER_CLIENT_ID),
              client_secret: extensionSDK.createSecretKeyTag(LOOKER_CLIENT_SECRET),
              scope: scopes
            }),
          }
        )

        if (resp.ok) {
          response = resp.body
        } else {
          console.error(
            `Failed to get access token for service account.
            \nCheck that the necessary Looker user attributes are properly set.
            \nStatus code: ${resp.status}
            \nEndpoint: ${accessTokenServerEndpoint}`
          )
        }
      } else {
        console.log('Using OAuth implicit flow (end-user creds)')
        // otherwise, assume authentication w/ end-user creds
        response = await extensionSDK.oauth2Authenticate(authUrl, {
          client_id: clientId,
          scope: scopes,
          response_type: 'token',
        })
      }
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
