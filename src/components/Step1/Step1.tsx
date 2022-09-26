import React from 'react'
import { useStore } from "../../contexts/StoreProvider"
import { MODEL_TYPES } from '../../services/modelTypes'
import withWizardStep from '../WizardStepHOC'
import StepContainer from '../StepContainer'
import { getWizardStepCompleteCallback } from '../../services/wizard'
import './Step1.scss'
import { Button } from '@looker/components'

const Step1: React.FC<{ stepComplete: boolean }> = ({ stepComplete }) => {
  const { state, dispatch } = useStore()

  const handleSelect = (selection: any) => {
    dispatch({
      type: 'addToStepData',
      step: 'step1',
      data: {
        objective: selection ? selection.value : undefined
      }
    })
  }

  const objective = state.wizard.steps.step1.objective
  const preContinueToolTipText = "You must select an objective before continuing"
  return (
    <StepContainer stepComplete={stepComplete} stepNumber={1} tooltipDisabledText={preContinueToolTipText}>
      <h2>Choose your objective</h2>
      <div className="modeltypes">
        {
          Object.values(MODEL_TYPES).map((modelType) => {
            return (
              <ModelTypeCard
                selected={modelType.value === objective}
                title={modelType.label}
                type={modelType.value}
                techLabel={modelType.techLabel}
                description={modelType.description}
                handleSelect={handleSelect}
                key={modelType.value}
              />
            )
          })
        }
      </div>
    </StepContainer>
  )
}

type ModelTypeCardProps = {
  selected: boolean,
  title: string,
  type: string,
  techLabel: string,
  description: string,
  handleSelect: (selection: any) => void
}

export const ModelTypeCard: React.FC<ModelTypeCardProps> = ({ selected, title, type, techLabel, description, handleSelect }) => {
  const selectedClass = selected ? 'active' : ''
  return (
    <div
      className={`wizard-card modeltypecard ${selectedClass}`}
      onClick={() => handleSelect({ value: type })}
    >
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="modeltypecard-button-container">
        <Button className="action-Button modeltypecard-button">{techLabel}</Button>
      </div>
    </div>
  )
}

export const WizardStep1 = withWizardStep({
  isStepComplete: getWizardStepCompleteCallback("step1"),
  stepNumber: 1
})(Step1)
