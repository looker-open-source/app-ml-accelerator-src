import React, { useContext, useState } from 'react'
import withWizardStep from '../WizardStepHOC'
import StepContainer from '../StepContainer'
import { getWizardStepCompleteCallback } from '../../services/wizard'
import { useStore } from '../../contexts/StoreProvider'
import { ModelContext } from '../../contexts/ModelProvider'
import './Step4.scss'
import { JOB_STATUSES, WIZARD_STEPS } from '../../constants'
import { Prompt } from 'react-router-dom'

const Step4: React.FC<{ stepComplete: boolean }> = ({ stepComplete }) => {
  const { stopPolling } = useContext(ModelContext)
  const [isLoading, setIsLoading] = useState(false)
  const { state } = useStore()
  const { needsSaving } = state.wizard
  const { jobStatus } = state.wizard.steps.step4
  const jobComplete = jobStatus === JOB_STATUSES.done

  const onRouteChange = () => {
    stopPolling?.()
    return true
  }

  return (
    <StepContainer
      isLoading={isLoading}
      stepComplete={stepComplete}
      stepNumber={4}
      customClass="step4-container">
      <Prompt message={onRouteChange}/>
      { jobComplete && needsSaving && (
        <div className="minor-error">
          You have made changes that are not reflected in this model.  Return to the {WIZARD_STEPS['step3']} tab and `Update Model`.
        </div>
      )}
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
