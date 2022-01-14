import React from 'react'
import { Switch, Route, Redirect, withRouter, useRouteMatch, useHistory, useLocation } from 'react-router-dom'
import { useStore } from "../../contexts/StoreProvider"
import './MLWizard.scss'
import { TrendingFlat } from "@styled-icons/material"
import NavBar from '../NavBar'
import Step1 from '../Step1'
import { WIZARD_STEPS } from "../../constants"
import { getActualStep, getWizardStepCompleteCallback } from "../../services/wizard"
import { Step1State, Step2State, Step3State, Step4State, Step5State } from '../../types'

export const _MLWizard: React.FC = () => {
  let { path, url } = useRouteMatch();
  const location = useLocation()
  const { state, dispatch } = useStore()
  const history = useHistory()
  const { currentStep } = state.wizard  // the step the user is allowed to view
  const currentStepName = WIZARD_STEPS[`step${currentStep}`];
  const enforcementPath = `${path}/${currentStepName}`
  const actualStep = getActualStep(location.pathname, dispatch) // the step the user is viewing


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
      <StepComplete
        path={path}
        stepName={actualStep}
        stepData={state.wizard.steps[actualStep]}
        history={history}
        currentStep={currentStep}
      />
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

type StepCompleteParams = {
  path: string,
  stepName: string,
  stepData: Step1State | Step2State | Step3State | Step4State | Step5State,
  history: any
  currentStep: number
}

const StepComplete: React.FC<StepCompleteParams> = ({ path, stepName, stepData, history, currentStep }) => {
  const handleClick = () => {
    if (!isStepComplete) { return }
    history.push(`${path}/${WIZARD_STEPS[`step${currentStep}`]}`)
  }

  // determine if StepComplete button should be shown
  const isStepComplete = getWizardStepCompleteCallback(stepName)(stepData)
  const btnClass = isStepComplete ? 'complete' : ''

  return (
    <div
      className={`wizard-next-step-btn ${btnClass}`}
      onClick={handleClick}
    >
      Continue
      <TrendingFlat fontSize="small"/>
    </div>
  )
}

export const MLWizard = withRouter(_MLWizard)
