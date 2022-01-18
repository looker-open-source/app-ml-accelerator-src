import React from 'react'
import { TrendingFlat } from "@styled-icons/material"
import { WIZARD_STEPS } from "../../constants"
import { useHistory} from 'react-router-dom'

type StepCompleteParams = {
  isStepComplete?: boolean
  stepNumber: number
}

export const StepComplete: React.FC<StepCompleteParams> = ({ isStepComplete, stepNumber }) => {
  const history = useHistory()

  const handleClick = () => {
    if (!isStepComplete) { return }
    history.push(`${WIZARD_STEPS[`step${stepNumber + 1}`]}`)
  }

  const btnClass = isStepComplete ? 'complete' : ''

  return (
    <div
      className={`wizard-next-step-btn ${btnClass}`}
      onClick={handleClick}
    >
      Continue
      <TrendingFlat fontSize="small"/>
    </div>
  )
}
