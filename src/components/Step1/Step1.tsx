import React from 'react'
import { useStore } from "../../contexts/StoreProvider"
import { MODEL_TYPES, MODEL_TYPES_AVAILABLE } from '../../services/modelTypes'
import withWizardStep from '../WizardStepHOC'
import StepContainer from '../StepContainer'
import { getWizardStepCompleteCallback } from '../../services/wizard'
import './Step1.scss'

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

  return (
    <StepContainer stepComplete={stepComplete} stepNumber={1}>
      <h2>Choose your objective</h2>
      <p className="step1-sub-details">Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.</p>
      <div className="modeltypes">
        {
          Object.values(MODEL_TYPES_AVAILABLE).map((typeName) => {
            const modelType = MODEL_TYPES[typeName]
            return (
              <ModelTypeCard
                selected={modelType.value === objective}
                title={modelType.label}
                type={modelType.value}
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
  description: string,
  handleSelect: (selection: any) => void
}

export const ModelTypeCard: React.FC<ModelTypeCardProps> = ({ selected, title, type, description, handleSelect }) => {
  const selectedClass = selected ? 'active' : ''
  return (
    <div
      className={`wizard-card modeltypecard ${selectedClass}`}
      onClick={() => handleSelect({ value: type })}
    >
      <h2>{description}</h2>
      <p>{title}</p>
    </div>
  )
}

export const WizardStep1 = withWizardStep({
  isStepComplete: getWizardStepCompleteCallback("step1"),
  stepNumber: 1
})(Step1)
