import React from 'react'
import LoadingOverlay from '../LoadingOverlay'
import Spinner from '../Spinner'
import StepComplete from '../StepComplete'

type StepContainerParams = {
  isLoading?: boolean
  stepComplete?: boolean
  lastStep?: boolean
  customClass?: string
  stepNumber: number
  children: any,
  stepText?: string,
  buttonText?: string,
  handleCompleteClick?: () => Promise<boolean>
}

export const StepContainer: React.FC<StepContainerParams> = ({
  isLoading,
  stepComplete,
  lastStep,
  customClass,
  stepNumber,
  children,
  stepText,
  buttonText,
  handleCompleteClick
}) => {
  const loadingClass = isLoading ? 'loading' : ''

  return (
    <section className={`step-container ${loadingClass} ${customClass}`}>
      <LoadingOverlay isLoading={!!isLoading} />
      { children }
      { !lastStep &&
        <div className="wizard-footer-bar">
          <StepComplete
            stepText={stepText}
            isStepComplete={stepComplete}
            isLoading={isLoading}
            stepNumber={stepNumber}
            buttonText={buttonText}
            handleCompleteClick={handleCompleteClick}
          />
        </div>
      }
    </section>
  )
}
