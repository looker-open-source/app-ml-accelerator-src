import React from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import './ExtensionApp.scss'
import TitleBar from './TitleBar'
import NavBar from './NavBar'

export const _ExtensionApp: React.FC = () => {

  return (
    <div className="bqml-app">
      <TitleBar></TitleBar>
      <div className="bqml-app-container">
        <NavBar></NavBar>
        <div className="page-contents">
          <Switch>
            <Route exact path="/">
              Home
            </Route>
            <Route path="/objective">
              objective
            </Route>
            <Route path="/source">
              source
            </Route>
            <Route path="/model">
              model
            </Route>
          </Switch>
        </div>
      </div>
    </div>
  )
}

export const ExtensionApp = withRouter(_ExtensionApp)
