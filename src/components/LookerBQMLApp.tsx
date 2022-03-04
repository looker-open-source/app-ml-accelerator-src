import React, { useContext, useEffect } from 'react'
import { OauthContext } from '../contexts/OauthProvider'
import { Switch, Route, withRouter } from 'react-router-dom'
import { BQMLContext } from '../contexts/BQMLProvider'
import { WizardProvider } from '../contexts/WizardProvider'
import ErrorBar from './ErrorBar'
import TitleBar from './TitleBar'
import MLWizard from './MLWizard'
import HomeLanding from './HomeLanding'
import Admin from './Admin'
import './ExtensionApp.scss'
import { AdminProvider } from '../contexts/AdminProvider'


export const _LookerBQMLApp: React.FC = () => {
  const { loggingIn, token, signIn, signOut } = useContext(OauthContext)
  const { expired, setExpired } = useContext(BQMLContext)

  useEffect(() => {
    if (signOut && expired && token) {
      signOut(true)
      setExpired?.(false)
    }
    if (signIn && !loggingIn && !token) {
      signIn()
      setExpired?.(false)
    }
  })

  return (
    <div className="bqml-app">
      <ErrorBar></ErrorBar>
      <TitleBar></TitleBar>
      <div className="bqml-app-container">
        { !loggingIn && token && (
          <Switch>
            <Route exact path="/">
              <HomeLanding />
            </Route>
            <Route exact path="/admin">
              <AdminProvider>
                <Admin />
              </AdminProvider>
            </Route>
            <Route path={["/ml/create", "/ml/:modelNameParam?"]}>
              <WizardProvider>
                <MLWizard />
              </WizardProvider>
            </Route>
          </Switch>
        )}
      </div>
    </div>
  )
}

export const LookerBQMLApp = withRouter(_LookerBQMLApp)
