import React from 'react'
import { WIZARD_STEPS } from "../../constants"
import { useHistory, useParams} from 'react-router-dom'
import { Button, Tooltip } from '@looker/components'
import { useStore } from '../../contexts/StoreProvider'
import Spinner from '../Spinner'

type StepCompleteParams = {
  isStepComplete?: boolean
  isDisabled?: boolean,
  stepNumber: number,
  buttonText?: string,
  tooltipDisabledText?: string,
  handleCompleteClick?: () => Promise<any>
}

export const StepComplete: React.FC<StepCompleteParams> = ({
  isStepComplete,
  isDisabled,
  stepNumber,
  buttonText,
  handleCompleteClick,
  tooltipDisabledText
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
      history.push(`/ml/${modelName}/${WIZARD_STEPS[`step${nextStep}`]}`)
    } else{
      history.push(`/ml/create/${WIZARD_STEPS[`step${nextStep}`]}`)
    }
  }

  const btnClass = isStepComplete ? 'complete' : ''
  return (
    <>
    <Tooltip content={!isStepComplete ? (tooltipDisabledText || '') : ''}>
      <Button
        className={`wizard-next-step-btn ${btnClass}`}
        onClick={handleClick}
        disabled={isDisabled}
        >
        { buttonText || "Continue" }
      </Button>
        </Tooltip>
    </>
  )
}
