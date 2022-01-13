import React, { useEffect, useState } from 'react'
import { useStore } from '../../contexts/StoreProvider'

type WizardStepProps = {
  isStepComplete: () => void,
  stepName: number
}

export const withWizardStep = ({isStepComplete, stepNumber}) =>
  WrappedComponent => {
    return (props) => {
      const { state, dispatch } = useStore()
      const [ stepComplete, setStepComplete ] = useState(false)
      const stepData = state.wizard.steps[`step${stepNumber}`]
      const nextStep = state.wizard.currentStep === stepNumber
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
