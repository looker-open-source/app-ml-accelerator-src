import React, { useContext, useEffect, useState } from 'react'
import withWizardStep from '../WizardStepHOC'
import StepContainer from '../StepContainer'
import { getWizardStepCompleteCallback } from '../../services/wizard'
import QueryBuilder from '../QueryBuilder'
import { QueryBuilderContext } from '../../contexts/QueryBuilderProvider'
import RequiredFieldMessages from '../QueryBuilder/RequiredFieldMessages'
import './Step2.scss'

const Step2: React.FC<{ stepComplete: boolean }> = ({ stepComplete }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [exploreIsSelected, setExploreIsSelected] = useState(false)
  const { stepData, stepName } = useContext(QueryBuilderContext)
  const preContinueToolTipText = "You must select fields from an explore and run the query before continuing"
  
  useEffect(() => {
    if (!stepData.exploreName) {
      setExploreIsSelected(false)
    } else {
      setExploreIsSelected(true)
    }
  }, [stepData.exploreName])

  return (
    <StepContainer
      isLoading={isLoading}
      stepComplete={stepComplete}
      stepNumber={2}
      tooltipDisabledText={preContinueToolTipText}
      customClass="step2-container"
      stepInfo={stepName === 'step2' && <RequiredFieldMessages />}>
      <h2>Select your input data</h2>
      <p>NOTE:
        {exploreIsSelected
        ? <> A row limit of 5,000 will be applied to the Explore below, but this limit will not be applied during model training.</>
        : <> You will only see the Explores allowed to access the application’s BigQuery connection.</>}
        </p>
      <QueryBuilder setIsLoading={setIsLoading}/>
    </StepContainer>
  )
}

export const WizardStep2 = withWizardStep({
  isStepComplete: getWizardStepCompleteCallback("step2"),
  stepNumber: 2
})(Step2)
