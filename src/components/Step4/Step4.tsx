import React, { useEffect, useState } from 'react'
import withWizardStep from '../WizardStepHOC'
import StepContainer from '../StepContainer'
import { getWizardStepCompleteCallback } from '../../services/wizard'
import { useStore } from '../../contexts/StoreProvider'
import './Step4.scss'

const Step4: React.FC<{ stepComplete: boolean }> = ({ stepComplete }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { state, dispatch } = useStore()
  const { jobStatus } = state.wizard.steps.step4

  useEffect(() => {
    if (!jobStatus) {
      setIsLoading(true)
      return
    }
    setIsLoading(false)
  }, [jobStatus])

  return (
    <StepContainer
      isLoading={isLoading}
      stepComplete={stepComplete}
      stepNumber={4}
      customClass="step4-container">
      <h2>Model evaluation overview</h2>
      <p className="step1-sub-details">Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.</p>

      { jobStatus }
    </StepContainer>
  )
}

export const WizardStep4 = withWizardStep({
  isStepComplete: getWizardStepCompleteCallback("step4"),
  stepNumber: 4
})(Step4)
