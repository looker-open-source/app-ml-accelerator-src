import React from 'react'
import { Switch, Route, Redirect, withRouter, useRouteMatch } from 'react-router-dom'
import { useStore } from "../../contexts/StoreProvider"
import './MLWizard.scss'
import NavBar from '../NavBar'
import Step1 from '../Step1'
import { WIZARD_STEPS } from "../../constants"

export const _MLWizard: React.FC = () => {
  let { path, url } = useRouteMatch();
  const { state, dispatch } = useStore()
  const { currentStep } = state.wizard
  const currentStepName = WIZARD_STEPS[`step${currentStep}`];
  const enforcementPath = `${path}/${currentStepName}`


  const increaseWizardStep = () => {
    dispatch({
      type: 'setCurrentStep',
      step: currentStep + 1
    })
  }

  return (
    <div>
      <button onClick={increaseWizardStep}>Increase</button> {currentStep}
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
              source
          </WizardRoute>
          <WizardRoute
            path={`${path}/${WIZARD_STEPS.step3}`}
            enforcementPath={enforcementPath}
            redirect={currentStep < 3}>
              model
          </WizardRoute>
          <WizardRoute
            path={`${path}/${WIZARD_STEPS.step4}`}
            enforcementPath={enforcementPath}
            redirect={currentStep < 4}>
              review
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
