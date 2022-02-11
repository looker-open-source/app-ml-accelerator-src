import React from 'react'
import { WIZARD_STEPS } from "../../constants"
import { useHistory, useParams} from 'react-router-dom'
import { Button } from '@looker/components'
import { useStore } from '../../contexts/StoreProvider'

type StepCompleteParams = {
  isStepComplete?: boolean
  stepNumber: number,
  stepText?: string,
  buttonText?: string,
  handleCompleteClick?: () => Promise<any>
}

export const StepComplete: React.FC<StepCompleteParams> = ({
  isStepComplete,
  stepNumber,
  stepText,
  buttonText,
  handleCompleteClick
}) => {
  const history = useHistory()
  const { state, dispatch } = useStore()
  const { modelNameParam } = useParams<{modelNameParam: string}>()
  let modelName = modelNameParam

  const handleClick = async () => {
    if (!isStepComplete) { return }
    if (handleCompleteClick) {
      const { ok, data } = await handleCompleteClick()
      if (!ok) { return }
      modelName = data.bqModelName || modelName
    }

    const nextStep = stepNumber + 1
    if (stepNumber == state.wizard.unlockedStep) {
      dispatch({
        type: 'setUnlockedStep',
        step: nextStep
      })
    }

    if (modelName) {
      history.push(`/ml/${WIZARD_STEPS[`step${nextStep}`]}/${modelName}`)
    } else{
      history.push(`/ml/${WIZARD_STEPS[`step${nextStep}`]}`)
    }
  }

  const btnClass = isStepComplete ? 'complete' : ''

  return (
    <>
      <p>{stepText}</p>
      <Button
        className={`wizard-next-step-btn ${btnClass}`}
        onClick={handleClick}
      >
        { buttonText || "Continue" }
      </Button>
    </>
  )
}
