import React from 'react'
import { Switch, Route, Redirect, withRouter, useRouteMatch } from 'react-router-dom'
import { useStore } from "../../contexts/StoreProvider"
import { SummaryProvider } from '../../contexts/SummaryProvider'
import { QueryBuilderProvider } from '../../contexts/QueryBuilderProvider'
import './MLWizard.scss'
import NavBar from '../NavBar'
import Step1 from '../Step1'
import Step2 from '../Step2'
import Step3 from '../Step3'
import Step4 from '../Step4'
import { WIZARD_STEPS } from "../../constants"
import { ModelProvider } from '../../contexts/ModelProvider'

export const _MLWizard: React.FC = () => {
  let { path, url } = useRouteMatch();
  const { state } = useStore()
  const { currentStep } = state.wizard  // the step the user is allowed to view
  const currentStepName = WIZARD_STEPS[`step${currentStep}`];
  const enforcementPath = `${path}/${currentStepName}`

  return (
    <div>
      <NavBar url={url} currentStep={currentStep}></NavBar>
      <div className="mlwizard-page-contents">
        <Switch>
          <Route exact path="/ml">
            <Redirect to={`${path}/${WIZARD_STEPS.step1}`} />
          </Route>
          <Route path={`${path}/${WIZARD_STEPS.step1}`}>
            <Step1 />
          </Route>
          <WizardRoute
            path={`${path}/${WIZARD_STEPS.step2}`}
            enforcementPath={enforcementPath}
            redirect={currentStep < 2}>
              <QueryBuilderProvider>
                <Step2 />
              </QueryBuilderProvider>
          </WizardRoute>
          <WizardRoute
            path={`${path}/${WIZARD_STEPS.step3}`}
            enforcementPath={enforcementPath}
            redirect={currentStep < 3}>
              <SummaryProvider>
                <Step3 />
              </SummaryProvider>
          </WizardRoute>
          <WizardRoute
            path={`${path}/${WIZARD_STEPS.step4}`}
            enforcementPath={enforcementPath}
            redirect={currentStep < 4}>
              <ModelProvider>
                <Step4 />
              </ModelProvider>
          </WizardRoute>
          <WizardRoute
            path={`${path}/${WIZARD_STEPS.step5}`}
            enforcementPath={enforcementPath}
            redirect={currentStep < 5}>
              apply
          </WizardRoute>
        </Switch>
      </div>
    </div>
  )
}

type WizardRouteProps = {
  path: string,
  enforcementPath: string,
  redirect: boolean,
  children: any
}

const WizardRoute: React.FC<WizardRouteProps> = ({ path, enforcementPath, redirect, children }) => {
  if (redirect) {
    return (<Redirect to={enforcementPath} />)
  }
  return (
    <Route path={path}>
      {children}
    </Route>
  )
}

export const MLWizard = withRouter(_MLWizard)
