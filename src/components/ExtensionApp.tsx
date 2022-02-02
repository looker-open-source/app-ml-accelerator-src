import React, { useEffect, useState, useContext } from 'react'
import { ExtensionContext2 } from '@looker/extension-sdk-react'
import { OauthProvider } from '../contexts/OauthProvider'
import { GOOGLE_SCOPES } from '../constants'
import { getGoogleClientID, getAllUserAttributes } from '../services/userAttributes'
import { LookerBQMLApp } from './LookerBQMLApp'
import './ExtensionApp.scss'
import { useStore } from '../contexts/StoreProvider'
import { BQMLProvider } from '../contexts/BQMLProvider'

export const ExtensionApp: React.FC = () => {
  const { extensionSDK } = useContext(ExtensionContext2)
  const { dispatch } = useStore()
  const [clientId, setClientId] = useState<string | null>()

  useEffect(() => {
    const getUserAttributes = async () => {
      try {
        const userAttributes = await getAllUserAttributes(extensionSDK)
        dispatch({ type: "setAllAttributes", value: userAttributes })
        setClientId(userAttributes.googleClientId)
      } catch (err) {
        dispatch({type: 'addError', error: 'Failed to retrieve User Attributes'})
      }
    }
    if (clientId) { return }
    getUserAttributes()
  })

  return (
    <OauthProvider clientId={clientId} scopes={GOOGLE_SCOPES}>
      <BQMLProvider>
        { clientId ? (<LookerBQMLApp />) : <></> }
      </BQMLProvider>
    </OauthProvider>
  )
}
