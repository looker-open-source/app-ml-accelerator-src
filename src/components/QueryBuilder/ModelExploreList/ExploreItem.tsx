import React, { useContext } from "react"
import { QueryBuilderContext } from "../../../contexts/QueryBuilderProvider"
import { useStore } from "../../../contexts/StoreProvider"

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
  const { stepData, stepName } = useContext(QueryBuilderContext)
  const { dispatch } = useStore()
  const clickHandle = () => {
    dispatch({
      type: 'addToStepData',
      step: stepName,
      data: {
        modelName,
        exploreName,
        exploreLabel: label
      }
    })
  }
  const isItemMatch = stepData.modelName === modelName
    && stepData.exploreName === exploreName
  const selectedClass = isItemMatch ? 'selected' : ''

  return (
    <div onMouseDown={clickHandle} className={`view-file ${selectedClass}`}>
      {label}
    </div>
  )
}
