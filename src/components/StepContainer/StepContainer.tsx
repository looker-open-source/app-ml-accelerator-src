import React from 'react'
import GlobalExplain from '../GlobalExplain'
import LoadingOverlay from '../LoadingOverlay'
import StepComplete from '../StepComplete'

type StepContainerParams = {
  isLoading?: boolean
  isDisabled?: boolean
  stepComplete?: boolean
  lastStep?: boolean
  customClass?: string
  stepNumber: number
  children: any,
  stepInfo?: any,
  buttonText?: string,
  handleCompleteClick?: () => Promise<boolean>
}

export const StepContainer: React.FC<StepContainerParams> = ({
  isLoading,
  isDisabled,
  stepComplete,
  lastStep,
  customClass,
  stepNumber,
  children,
  stepInfo,
  buttonText,
  handleCompleteClick
}) => {
  const loadingClass = isLoading ? 'loading' : ''

  return (
    <section className={`step-container ${loadingClass} ${customClass || ''}`}>
      <LoadingOverlay isLoading={!!isLoading} />
      { children }

        <div className="wizard-footer-bar">
          <GlobalExplain />
          {stepInfo}
          { !lastStep &&
            <StepComplete
              isStepComplete={stepComplete}
              isDisabled={isLoading || isDisabled}
              stepNumber={stepNumber}
              buttonText={buttonText}
              handleCompleteClick={handleCompleteClick}
            />
          }
        </div>
    </section>
  )
}
