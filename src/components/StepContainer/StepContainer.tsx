import React from 'react'
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
  tooltipDisabledText?: string,
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
  handleCompleteClick,
  tooltipDisabledText
}) => {
  const loadingClass = isLoading ? 'loading' : ''

  return (
    <section className={`step-container ${loadingClass} ${customClass || ''}`}>
      <LoadingOverlay isLoading={!!isLoading} />
      { children }
      { !lastStep &&
        <div className="wizard-footer-bar">
          {stepInfo}
          <StepComplete
            isStepComplete={stepComplete}
            isDisabled={isLoading || isDisabled}
            stepNumber={stepNumber}
            buttonText={buttonText}
            handleCompleteClick={handleCompleteClick}
            tooltipDisabledText={tooltipDisabledText}
          />
        </div>
      }
    </section>
  )
}
