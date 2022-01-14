import React from 'react'
import { Switch, Route, Link, withRouter } from 'react-router-dom'
import './ExtensionApp.scss'
import ErrorBar from './ErrorBar'
import TitleBar from './TitleBar'
import MLWizard from './MLWizard'

export const _ExtensionApp: React.FC = () => {

  return (
    <div className="bqml-app">
      <ErrorBar></ErrorBar>
      <TitleBar></TitleBar>
      <div className="bqml-app-container">
        <Switch>
          <Route exact path="/">
            Home
            <Link to="/ml">ML</Link>
          </Route>
          <Route path="/ml">
            <MLWizard />
          </Route>
        </Switch>
      </div>
    </div>
  )
}

export const ExtensionApp = withRouter(_ExtensionApp)
