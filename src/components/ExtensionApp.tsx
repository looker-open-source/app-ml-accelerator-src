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
import { useUnload } from '../services/hooks'

export const ExtensionApp: React.FC = () => {
  const { extensionSDK, coreSDK } = useContext(ExtensionContext2)
  const { state, dispatch } = useStore()
  const [clientId, setClientId] = useState<string | null>()

  useUnload(e => {
    const msg = "A BQML model is building - exiting the page will lose your work"
    if (state.ui.unsavedState) {
      e.preventDefault();
      e.returnValue  = msg
    }
  })

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    let userId
    if (!state.user.email) {
      userId = await getUser()
    }
    if (!clientId && userId) {
      await getUserAttributes(userId)
    }
  }

  // get the user and their bqml-looks folder
  const getUser = async () => {
    try {
      const { value } = await coreSDK.me()
      dispatch({ type: "setUser", user: {
        id: value.id,
        email: value.email,
        firstName: value.first_name,
        lastName: value.last_name
      }})
      return value.id
    } catch (err) {
      dispatch({ type: 'addError', error: 'Failed to retrieve User - ' + err })
    } finally {
    }
  }

  const getUserAttributes = async (userId: number) => {
    try {
      const userAttributes = await getAllUserAttributes(coreSDK, userId)
      dispatch({ type: "setAllAttributes", value: userAttributes })
      setClientId(userAttributes.googleClientId)
      const hasAllUserAttributes = Object.values(userAttributes).reduce((hasAttr, value) => hasAttr = !!value, true)
      if (!hasAllUserAttributes) {
        dispatch({ type: 'addError', error: 'User Attributes have not been setup correctly.  Please see an administrator.' })
      }
    } catch (err) {
      dispatch({ type: 'addError', error: 'Failed to retrieve User Attributes - ' + err })
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
