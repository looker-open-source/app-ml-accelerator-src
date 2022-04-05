import React, { useEffect, useState, useContext } from 'react'
import { ExtensionContext2 } from '@looker/extension-sdk-react'
import { OauthProvider } from '../contexts/OauthProvider'
import { GOOGLE_SCOPES } from '../constants'
import { getAllUserAttributes } from '../services/userAttributes'
import { LookerBQMLApp } from './LookerBQMLApp'
import './ExtensionApp.scss'
import { useStore } from '../contexts/StoreProvider'
import { BQMLProvider } from '../contexts/BQMLProvider'
import ErrorBar from './ErrorBar'

export const ExtensionApp: React.FC = () => {
  const { extensionSDK, coreSDK } = useContext(ExtensionContext2)
  const { state, dispatch } = useStore()
  const [clientId, setClientId] = useState<string | null>()

  useEffect(() => {
    if (!state.user.email) {
      getUser()
    }
    if (!clientId) {
      getUserAttributes()
    }
  }, [])

  // get the user and their bqml-looks folder
  const getUser = async () => {
    try {
      const { value } = await coreSDK.me()
      dispatch({ type: "setUser", user: {
        id: value.id,
        email: value.email,
        firstName: value.first_name
      }})
    } catch (err) {
      dispatch({ type: 'addError', error: 'Failed to retrieve User - ' + err })
    } finally {
    }
  }

  const getUserAttributes = async () => {
    try {
      const userAttributes = await getAllUserAttributes(extensionSDK)
      dispatch({ type: "setAllAttributes", value: userAttributes })
      setClientId(userAttributes.googleClientId)
    } catch (err) {
      dispatch({ type: 'addError', error: 'Failed to retrieve User Attributes' })
    }
  }

  return (
    <OauthProvider clientId={clientId} scopes={GOOGLE_SCOPES}>
      <BQMLProvider>
        {
          clientId && state.user.email ?
            (<LookerBQMLApp />) :
            <ErrorBar />
        }
      </BQMLProvider>
    </OauthProvider>
  )
}
