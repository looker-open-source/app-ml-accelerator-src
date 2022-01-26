import React, { useState } from 'react'
import './Step2.scss'
import withWizardStep from '../WizardStepHOC'
import StepContainer from '../StepContainer'
import { getWizardStepCompleteCallback } from '../../services/wizard'
import QueryBuilder from '../QueryBuilder'

const Step2: React.FC<{ stepComplete: boolean }> = ({ stepComplete }) => {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <StepContainer
      isLoading={isLoading}
      stepComplete={stepComplete}
      stepNumber={2}
      customClass="step2-container">
      <QueryBuilder setIsLoading={setIsLoading}/>
    </StepContainer>
  )
}

export const WizardStep2 = withWizardStep({
  isStepComplete: getWizardStepCompleteCallback("step2"),
  stepNumber: 2
})(Step2)
