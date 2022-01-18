import React from 'react'
import Spinner from '../Spinner'
import StepComplete from '../StepComplete'

type StepContainerParams = {
  isLoading?: boolean
  stepComplete?: boolean
  stepNumber: number
  children: any
}

export const StepContainer: React.FC<StepContainerParams> = ({ isLoading, stepComplete, stepNumber, children }) => {
  const loadingClass = isLoading ? 'loading' : ''

  return (
    <section className={`step-container ${loadingClass}`}>
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
      <StepComplete
        isStepComplete={stepComplete}
        stepNumber={stepNumber}
      />
    </section>
  )
}
