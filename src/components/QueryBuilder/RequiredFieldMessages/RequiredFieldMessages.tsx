import React, { useEffect, useState } from "react"
import { useStore } from "../../../contexts/StoreProvider"
import { getRequiredFieldMessages } from '../../../services/resultsTable'
import { MODEL_TYPES } from "../../../services/modelTypes"

export const RequiredFieldMessages : React.FC = () => {
  const { state } = useStore()
  const [ requiredFieldMessages, setRequiredFieldMessages ] = useState<string[]>([])
  const { step1, step2 } = state.wizard.steps

  useEffect(() => {
    if (!step2.exploreData) { return }
    const messages = getRequiredFieldMessages(
      step2.exploreData?.fieldDetails,
      [...step2.selectedFields.dimensions, ...step2.selectedFields.measures],
      getRequiredFieldTypes()
    )
    setRequiredFieldMessages(messages)
  }, [step2.selectedFields, step2.exploreData])

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
