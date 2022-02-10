import React from 'react'
import Spinner from '../Spinner'
import StepComplete from '../StepComplete'

type StepContainerParams = {
  isLoading?: boolean
  stepComplete?: boolean
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
      { isLoading &&
        (
          <>
            <div className="step-container-loading-overlay">
            </div>
            <div className="step-container-spinner-container">
              <Spinner className="step-container-spinner"/>
            </div>
          </>
        )
      }
      { children }
      <div className="wizard-footer-bar">
        <StepComplete
          stepText={stepText}
          isStepComplete={stepComplete}
          stepNumber={stepNumber}
          buttonText={buttonText}
          handleCompleteClick={handleCompleteClick}
        />
      </div>
    </section>
  )
}
