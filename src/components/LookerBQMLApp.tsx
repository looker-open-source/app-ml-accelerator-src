import React, { useContext, useEffect } from 'react'
import { OauthContext } from '../contexts/OauthProvider'
import { Switch, Route, Link, withRouter } from 'react-router-dom'
import './ExtensionApp.scss'
import ErrorBar from './ErrorBar'
import TitleBar from './TitleBar'
import MLWizard from './MLWizard'

export const _LookerBQMLApp: React.FC = () => {
  const { loggingIn, token, signIn } = useContext(OauthContext)

  useEffect(() => {
    if (!loggingIn && !token && signIn) {
      signIn()
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
