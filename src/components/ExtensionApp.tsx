import React, { useEffect, useState, useContext } from 'react'
import { ExtensionContext2 } from '@looker/extension-sdk-react'
import { OauthProvider } from '../contexts/OauthProvider'
import { GOOGLE_SCOPES } from '../constants'
import { getGoogleClientID } from '../services/userAttributes'
import { LookerBQMLApp } from './LookerBQMLApp'
import './ExtensionApp.scss'
import { useStore } from '../contexts/StoreProvider'

export const ExtensionApp: React.FC = () => {
  const { extensionSDK } = useContext(ExtensionContext2)
  const { dispatch } = useStore()
  const [clientId, setClientId] = useState<string | null>()

  useEffect(() => {
    const getClientId = async () => {
      try {
        const googleClientId = await getGoogleClientID(extensionSDK)
        setClientId(googleClientId)
      } catch (err) {
        dispatch({type: 'addError', error: 'Failed to retrive Google Client ID'})
      }
    }
    getClientId()
  })

  return (
    <OauthProvider clientId={clientId} scopes={GOOGLE_SCOPES}>
      { clientId && (<LookerBQMLApp />) }
    </OauthProvider>
  )
}
