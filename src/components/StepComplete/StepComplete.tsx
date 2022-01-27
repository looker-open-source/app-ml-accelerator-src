import React from 'react'
import { WIZARD_STEPS } from "../../constants"
import { useHistory} from 'react-router-dom'
import { Button } from '@looker/components'

type StepCompleteParams = {
  isStepComplete?: boolean
  stepNumber: number,
  stepText?: string
}

export const StepComplete: React.FC<StepCompleteParams> = ({ isStepComplete, stepNumber, stepText }) => {
  const history = useHistory()

  const handleClick = () => {
    if (!isStepComplete) { return }
    history.push(`${WIZARD_STEPS[`step${stepNumber + 1}`]}`)
  }

  const btnClass = isStepComplete ? 'complete' : ''

  return (
    <>
      <p>{stepText}</p>
      <Button
        className={`wizard-next-step-btn ${btnClass}`}
        onClick={handleClick}
      >
        Continue
      </Button>
    </>
  )
}
