import React from 'react'
import { TrendingFlat } from "@styled-icons/material"
import { WIZARD_STEPS } from "../../constants"
import { getWizardStepCompleteCallback } from "../../services/wizard"
import { Step1State, Step2State, Step3State, Step4State, Step5State } from '../../types'

type StepCompleteParams = {
  path: string,
  stepName: string,
  stepData: Step1State | Step2State | Step3State | Step4State | Step5State,
  history: any
  currentStep: number
}

export const StepComplete: React.FC<StepCompleteParams> = ({ path, stepName, stepData, history, currentStep }) => {
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
