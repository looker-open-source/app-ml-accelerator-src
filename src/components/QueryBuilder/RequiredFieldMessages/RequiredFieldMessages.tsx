import React, { useContext, useEffect, useState } from "react"
import { useStore } from "../../../contexts/StoreProvider"
import { getRequiredFieldMessages } from '../../../services/resultsTable'
import { MODEL_TYPES } from "../../../services/modelTypes"
import { QueryBuilderContext } from "../../../contexts/QueryBuilderProvider"

export const RequiredFieldMessages : React.FC = () => {
  const { stepData } = useContext(QueryBuilderContext)
  const { state } = useStore()
  const [ requiredFieldMessages, setRequiredFieldMessages ] = useState<string[]>([])
  const { step1 } = state.wizard.steps

  useEffect(() => {
    if (!stepData.exploreData) { return }
    const messages = getRequiredFieldMessages(
      stepData.exploreData?.fieldDetails,
      [...stepData.selectedFields.dimensions, ...stepData.selectedFields.measures],
      getRequiredFieldTypes()
    )
    setRequiredFieldMessages(messages)
  }, [stepData.selectedFields, stepData.exploreData])

  const getRequiredFieldTypes = (): string[] => {
    if (!step1.objective) { return [] }
    return MODEL_TYPES[step1.objective].requiredFieldTypes || []
  }

  if (getRequiredFieldTypes().length <= 0) {
    return <></>
  }

  return (
    <div className="objective-requirements">
      { requiredFieldMessages.length > 0 ? requiredFieldMessages.join(' ') : 'All field requirements met.'  }
      <div className={`objective-requirements-indicator ${requiredFieldMessages.length > 0 ? 'warning' : 'success'}`} />
    </div>
  )
}
