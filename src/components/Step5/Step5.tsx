import React, { useContext, useEffect, useState } from 'react'
import withWizardStep from '../WizardStepHOC'
import StepContainer from '../StepContainer'
import { getWizardStepCompleteCallback } from '../../services/wizard'
import { ApplyContext } from '../../contexts/ApplyProvider'
import { useStore } from '../../contexts/StoreProvider'
import { isArima, isBoostedTree } from '../../services/modelTypes'
import { ArimaPredict } from './ArimaPredict'
import { QueryBuilderProvider } from '../../contexts/QueryBuilderProvider'
import QueryBuilder from '../QueryBuilder'
import './Step5.scss'
import { BoostedTreePredict } from './BoostedTreePredict'
// import { BoostedTreePredict } from './BoostedTreePredict'

const Step5: React.FC<{ stepComplete: boolean }> = ({ stepComplete }) => {
  const { state } = useStore()
  const { isLoading: contextLoading } = useContext(ApplyContext)
  const [ isLoading, setIsLoading ] = useState<boolean>(false)
  const { step1 } = state.wizard.steps

  useEffect(() => {
    setIsLoading(!!contextLoading)
  }, [contextLoading])

  const showModelTypePredictComponent = () => {
    if (isArima(step1.objective || "")) {
      return (<ArimaPredict />)
    } else if (isBoostedTree(step1.objective || "")) {
      return (<BoostedTreePredict setIsLoading={setIsLoading} />)
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
