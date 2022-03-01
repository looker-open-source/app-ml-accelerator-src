import React, { useContext } from 'react'
import { Switch, Route, Redirect, withRouter, useRouteMatch } from 'react-router-dom'
import { useStore } from "../../contexts/StoreProvider"
import { SummaryProvider } from '../../contexts/SummaryProvider'
import { QueryBuilderProvider } from '../../contexts/QueryBuilderProvider'
import { ModelProvider } from '../../contexts/ModelProvider'
import { WIZARD_STEPS } from "../../constants"
import { WizardContext } from '../../contexts/WizardProvider'
import Spinner from '../Spinner'
import NavBar from '../NavBar'
import Step1 from '../Step1'
import Step2 from '../Step2'
import Step3 from '../Step3'
import Step4 from '../Step4'
import './MLWizard.scss'

export const _MLWizard: React.FC = () => {
  const { loadingModel } = useContext(WizardContext)
  const { path, url } = useRouteMatch()
  const { state } = useStore()
  const { unlockedStep } = state.wizard

  if (loadingModel) {
    return (
      <div className="loading-model-splash">
        <div className="loading-model-text">
          Loading Model...
        </div>
        <Spinner />
      </div>
    )
  }
  return (
    <div>
      <NavBar url={url} unlockedStep={unlockedStep}></NavBar>
      <div className="mlwizard-page-contents">
        <Switch>
          <Route exact path="/ml">
            <Redirect to={`${url}/create/${WIZARD_STEPS.step1}`} />
          </Route>
          <Route path={`${path}/${WIZARD_STEPS.step1}`}>
            <Step1 />
          </Route>
          <Route
            path={`${path}/${WIZARD_STEPS.step2}`}>
              <QueryBuilderProvider>
                <Step2 />
              </QueryBuilderProvider>
          </Route>
          <Route
            path={`${path}/${WIZARD_STEPS.step3}`}>
              <SummaryProvider>
                <Step3 />
              </SummaryProvider>
          </Route>
          <Route
            path={`${path}/${WIZARD_STEPS.step4}`}>
              <ModelProvider>
                <Step4 />
              </ModelProvider>
          </Route>
          <Route
            path={`${path}/${WIZARD_STEPS.step5}`}>
              apply
          </Route>
        </Switch>
      </div>
    </div>
  )
}

export const MLWizard = withRouter(_MLWizard)
