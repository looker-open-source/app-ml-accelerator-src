import React, { useContext, useEffect } from 'react'
import withWizardStep from '../WizardStepHOC'
import StepContainer from '../StepContainer'
import { getWizardStepCompleteCallback } from '../../services/wizard'
import './Step5.scss'
import { ApplyContext } from '../../contexts/ApplyProvider'
import { useStore } from '../../contexts/StoreProvider'
import { isArima, isBoostedTree } from '../../services/modelTypes'
import { ArimaPredict } from './ArimaPredict'
import { QueryBuilderProvider } from '../../contexts/QueryBuilderProvider'
import { BoostedTreePredict } from './BoostedTreePredict'

const Step5: React.FC<{ stepComplete: boolean }> = ({ stepComplete }) => {
  const { state } = useStore()
  const { isLoading } = useContext(ApplyContext)
  const { objective } = state.wizard.steps.step1

  const showModelTypePredictComponent = () => {
    if (isArima(objective || "")) {
      return (<ArimaPredict />)
    } else if (isBoostedTree(objective || "")) {
      return (
        <QueryBuilderProvider stepName="step5" lockFields={true}>
          <BoostedTreePredict />
        </QueryBuilderProvider>
      )
    }
  }

  return (
    <StepContainer
      isLoading={isLoading}
      stepComplete={stepComplete}
      lastStep={true}
      stepNumber={5}>
        <h2>Apply Your Model</h2>
        <p className="step1-sub-details">Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.</p>
        { showModelTypePredictComponent() }
    </StepContainer>
  )
}

export const WizardStep5 = withWizardStep({
  isStepComplete: getWizardStepCompleteCallback("step5"),
  stepNumber: 5
})(Step5)
