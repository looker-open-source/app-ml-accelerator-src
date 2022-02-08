import React, { useContext, useEffect, useState } from 'react'
import withWizardStep from '../WizardStepHOC'
import StepContainer from '../StepContainer'
import { getWizardStepCompleteCallback } from '../../services/wizard'
import { useStore } from '../../contexts/StoreProvider'
import { ModelContext } from '../../contexts/ModelProvider'
import './Step4.scss'



const Step4: React.FC<{ stepComplete: boolean }> = ({ stepComplete }) => {
  const { cancelPoll } = useContext(ModelContext)
  const [isLoading, setIsLoading] = useState(false)
  const { state, dispatch } = useStore()
  const { jobStatus, job } = state.wizard.steps.step4

  useEffect(() => {
    if (!jobStatus) {
      setIsLoading(true)
      return
    }
    setIsLoading(false)
  }, [jobStatus])

  useEffect(() => {
    return () => {
      // Clean up component,
      // cancel job polling when component unmounts
      if (!job || !job.jobId) { return }
      cancelPoll?.(job.jobId)
    }
  })

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
