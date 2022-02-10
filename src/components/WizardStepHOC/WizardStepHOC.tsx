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
      const { unlockedStep } = state.wizard
      const [ stepComplete, setStepComplete ] = useState(false)
      const stepKey: keyof WizardSteps = WIZARD_KEYS[stepNumber]
      const { objective } = state.wizard.steps.step1
      const stepData: GenericStepState = state.wizard.steps[stepKey]
      const nextStep: number = unlockedStep === stepNumber
        ? unlockedStep + 1
        : unlockedStep
      const enforceStep = unlockedStep < stepNumber

      useEffect(() => {
        const stepComplete = isStepComplete(stepData, objective)
        if (stepComplete) {
          dispatch({
            type: 'setUnlockedStep',
            step: nextStep
          })
        }
        setStepComplete(stepComplete)
      }, [stepData])

      if (enforceStep) {
        const enforcementPath = modelNameParam ?
          `/ml/${WIZARD_STEPS[`step${unlockedStep}`]}/${modelNameParam}` :
          `/ml/${WIZARD_STEPS[`step${unlockedStep}`]}`

        return (<Redirect to={enforcementPath} />)
      }

      return <WrappedComponent stepComplete={stepComplete} {...props} />
    }
  }
}
