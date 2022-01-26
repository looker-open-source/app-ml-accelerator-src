import React, { useEffect, useState } from 'react'
import { useStore } from '../../contexts/StoreProvider'
import { GenericStepState, WizardSteps } from '../../types'

type WizardStepProps = {
  isStepComplete: (stepData: GenericStepState) => boolean,
  stepNumber: number
}

type WizardStepWrapper = (WrappedComponent: any) => React.FC

export const withWizardStep = ({isStepComplete, stepNumber}: WizardStepProps): WizardStepWrapper => {
  return (WrappedComponent: React.FC): React.FC => {
    return (props: any): any => {
      const { state, dispatch } = useStore()
      const [ stepComplete, setStepComplete ] = useState(false)
      const stepName: keyof WizardSteps = "step" + stepNumber
      const stepData: GenericStepState = state.wizard.steps[stepName]
      const nextStep: number = state.wizard.currentStep === stepNumber
        ? state.wizard.currentStep + 1
        : state.wizard.currentStep

      useEffect(() => {
        const stepComplete = isStepComplete(stepData)
        if (stepComplete) {
          dispatch({
            type: 'setCurrentStep',
            step: nextStep
          })
        }
        setStepComplete(stepComplete)
      }, [stepData])

      return <WrappedComponent stepComplete={stepComplete} {...props} />
    }
  }
}
