import React, { useContext, useState } from 'react'
import withWizardStep from '../WizardStepHOC'
import StepContainer from '../StepContainer'
import { getWizardStepCompleteCallback } from '../../services/wizard'
import QueryBuilder from '../QueryBuilder'
import { QueryBuilderContext } from '../../contexts/QueryBuilderProvider'
import RequiredFieldMessages from '../QueryBuilder/RequiredFieldMessages'
import './Step2.scss'

const Step2: React.FC<{ stepComplete: boolean }> = ({ stepComplete }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { stepName } = useContext(QueryBuilderContext)

  return (
    <StepContainer
      isLoading={isLoading}
      stepComplete={stepComplete}
      stepNumber={2}
      customClass="step2-container"
      stepInfo={stepName === 'step2' && <RequiredFieldMessages />}>
      <h2>Select your input data</h2>
      <QueryBuilder setIsLoading={setIsLoading}/>
    </StepContainer>
  )
}

export const WizardStep2 = withWizardStep({
  isStepComplete: getWizardStepCompleteCallback("step2"),
  stepNumber: 2
})(Step2)
