import React, { useContext, useEffect } from 'react'
import { OauthContext } from '../contexts/OauthProvider'
import { Switch, Route, Link, withRouter } from 'react-router-dom'
import './ExtensionApp.scss'
import ErrorBar from './ErrorBar'
import TitleBar from './TitleBar'
import MLWizard from './MLWizard'
import { BQMLContext } from '../contexts/BQMLProvider'

export const _LookerBQMLApp: React.FC = () => {
  const { loggingIn, token, signIn, signOut } = useContext(OauthContext)
  const { expired } = useContext(BQMLContext)

  useEffect(() => {
    if (signOut && expired) {
      signOut()
    }
    if (signIn && !loggingIn && !token) {
      signIn()
      return
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
              Home
              <Link to="/ml">ML</Link>
            </Route>
            <Route path="/ml">
              <MLWizard />
            </Route>
          </Switch>
        )}
      </div>
    </div>
  )
}

export const LookerBQMLApp = withRouter(_LookerBQMLApp)