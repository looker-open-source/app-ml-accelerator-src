import React from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import { WizardProvider } from '../contexts/WizardProvider'
import ErrorBar from './ErrorBar'
import TitleBar from './TitleBar'
import MLWizard from './MLWizard'
import HomeLanding from './HomeLanding'
import './ExtensionApp.scss'
import { AdminProvider } from '../contexts/AdminProvider'
import { useStore } from '../contexts/StoreProvider'


export const _LookerBQMLApp: React.FC = () => {
  const { state } = useStore()
  const errorsCount = state.errors.length

  return (
    <div className="bqml-app">
      <div className="bqml-app--header">
        <ErrorBar></ErrorBar>
        <TitleBar></TitleBar>
      </div>
      <div className="bqml-app--header-placeholder" style={{ marginBottom: 52 * errorsCount }}></div>
      <div className="bqml-app-container">
          <Switch>
            <Route exact path="/">
              <AdminProvider>
                <HomeLanding />
              </AdminProvider>
            </Route>
            <Route path={["/ml/create", "/ml/:modelNameParam?"]}>
              <WizardProvider>
                <MLWizard />
              </WizardProvider>
            </Route>
          </Switch>
      </div>
      <div id="dialog-portal" />
    </div>
  )
}

export const LookerBQMLApp = withRouter(_LookerBQMLApp)
