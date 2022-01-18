import React from "react"
import { useStore } from "../../contexts/StoreProvider"

type ExploreItemProps = {
  label?: string,
  modelName?: string,
  exploreName?: string
}

export const ExploreItem:React.FC<ExploreItemProps> = ({
    label,
    modelName,
    exploreName,
}) => {
  const { state, dispatch } = useStore()
  const clickHandle = () => {
    dispatch({
      type: 'addToStepData',
      step: 'step2',
      data: {
        modelName,
        exploreName,
        exploreLabel: label
      }
    })
  }
  const stepData = state.wizard.steps.step2
  const isItemMatch = stepData.modelName === modelName
    && stepData.exploreName === exploreName
  const selectedClass = isItemMatch ? 'selected' : ''

  return (
    <div onMouseDown={clickHandle} className={`view-file ${selectedClass}`}>
      {label}
    </div>
  )
}
