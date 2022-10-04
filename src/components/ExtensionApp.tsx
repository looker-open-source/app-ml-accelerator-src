import React, { useRef, useEffect, useState, useContext } from 'react'
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
import { Button, ButtonTransparent, Card, CardContent, ConfirmLayout } from '@looker/components'

const TestMsgBar = () => {
  const { state } = useStore()
  const [isBuilding, setIsBuilding] = useState("Model Not Building")

  const updateText = () => {
    if (state.ui.modelIsBuilding) {
      setIsBuilding("Model Building")
    } else {
      setIsBuilding("Model Not Building")
    }
  }

  useEffect(() => {
    updateText()
  }, [state.ui.modelIsBuilding])

  return (
    <div style={{
      zIndex: 1000,
      color: 'white',
      width: '100%',
      height: '100px',
      position: 'absolute',
      top: '0',
      display: 'flex',
      justifyContent: 'flex-end',
      padding: '10px'
    }}>{isBuilding}</div>
  )
}

const ExitPrompt = ({setShowExitPrompt, continueToExit}) => {
  const handleCancel = () => setShowExitPrompt(false)
  return (
    <div className='exit-prompt-overlay'>
      <Card className='exit-prompt-overlay--card'>
        <ConfirmLayout
            title="Cancel Building BQML Model?"
            message="A BQML model is currently building. Leaving will cancel this. Continue?"
            primaryButton={
              <Button onClick={continueToExit} color="critical">
                Exit
              </Button>
            }
            secondaryButton={
              <ButtonTransparent onClick={handleCancel} color="neutral">
                Go Back
              </ButtonTransparent>
            }
            />
          </Card>
        </div>
    )
}

export const ExtensionApp: React.FC = () => {
  const { extensionSDK, coreSDK } = useContext(ExtensionContext2)
  const { state, dispatch } = useStore()
  const [clientId, setClientId] = useState<string | null>()
  const [showExitPrompt, setShowExitPrompt] = useState<boolean>(false)
  const [windowEvent, setWindowEvent] = useState(undefined)

  useUnload(e => {
    // if (state.ui.modelIsBuilding) {
      (e || window.event).preventDefault();
      setWindowEvent(e)
      setShowExitPrompt(true)
      // const exit = confirm(msg);
      (e || window.event).returnValue = 'foo';
      console.log((e || window.event).returnValue)
      // if (exit) window.close();
    // }
  })

  const continueToExit = () => {
    console.log(windowEvent)
    window.close()
  }

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
          <TestMsgBar />
          {showExitPrompt 
          && <ExitPrompt 
              continueToExit={continueToExit}
              setShowExitPrompt={setShowExitPrompt}
              />}
      </BQMLProvider>
    </OauthProvider>
  )
}
