import React, { useEffect, useState } from 'react'
import { useStore } from '../../contexts/StoreProvider'
import { GenericStepState, WizardSteps } from '../../types'
import { WIZARD_KEYS, WIZARD_STEPS } from '../../constants'
import { Redirect, useParams, useRouteMatch } from 'react-router-dom'

type WizardStepProps = {
  isStepComplete: (stepData: GenericStepState, objective?: string) => boolean,
  stepNumber: number
}

type WizardStepWrapper = (WrappedComponent: any) => React.FC

export const withWizardStep = ({isStepComplete, stepNumber}: WizardStepProps): WizardStepWrapper => {
  return (WrappedComponent: React.FC): React.FC => {
    return (props: any): any => {
      const { state, dispatch } = useStore()
      const { modelNameParam } = useParams<{modelNameParam: string}>()
      const { currentStep } = state.wizard
      const [ stepComplete, setStepComplete ] = useState(false)
      const stepKey: keyof WizardSteps = WIZARD_KEYS[stepNumber]
      const { objective } = state.wizard.steps.step1
      const stepData: GenericStepState = state.wizard.steps[stepKey]
      const nextStep: number = currentStep === stepNumber
        ? currentStep + 1
        : currentStep
      const enforceStep = currentStep < stepNumber

      useEffect(() => {
        const stepComplete = isStepComplete(stepData, objective)
        if (stepComplete) {
          dispatch({
            type: 'setCurrentStep',
            step: nextStep
          })
        }
        setStepComplete(stepComplete)
      }, [stepData])

      if (enforceStep) {
        const enforcementPath = modelNameParam ?
          `/ml/${WIZARD_STEPS[`step${currentStep}`]}/${modelNameParam}` :
          `/ml/${WIZARD_STEPS[`step${currentStep}`]}`

        return (<Redirect to={enforcementPath} />)
      }

      return <WrappedComponent stepComplete={stepComplete} {...props} />
    }
  }
}
