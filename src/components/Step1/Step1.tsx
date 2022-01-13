import React from 'react'
import { useStore } from "../../contexts/StoreProvider"
import { InputSearch } from "@looker/components"
import './Step1.scss'
import { MODEL_TYPES } from '../../services/modelTypes'
import withWizardStep from '../WizardStepHOC'
import { hasNoEmptyValues } from '../../services/wizard'

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
  const searchValue = MODEL_TYPES[objective]?.label || ''

  return (
    <section className="step-container">
      { stepComplete.toString() }
      <h2>Choose your objective</h2>
      <p className="step1-sub-details">Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.</p>
      <InputSearch
        value={searchValue}
        className="step1-search"
        options={Object.values(MODEL_TYPES)}
        placeholder="[What's your objective]"
        onSelectOption={handleSelect}
        openOnFocus
        noOptionsLabel="Nothing matched your search"
      />
      <div className="modeltypes">
        {
          Object.values(MODEL_TYPES).map((modelType) => {
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
    </section>
  )
}

type ModelTypeCardProps = {
  selected: boolean,
  title: string,
  type: string,
  description: string,
  handleSelect: (selection) => void
}

export const ModelTypeCard: React.FC<ModelTypeCardProps> = ({ selected, title, type, description, handleSelect }) => {
  const selectedClass = selected ? 'active' : ''
  return (
    <div
      className={`modeltypecard ${selectedClass}`}
      onClick={() => handleSelect({ value: type })}
    >
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="modeltypecard-footer">
        {type}
      </div>
    </div>
  )
}

export const WizardStep1 = withWizardStep({
  isStepComplete: (stepData) => hasNoEmptyValues(stepData),
  stepNumber: 1
})(Step1)
