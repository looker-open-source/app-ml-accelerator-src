import React, { useState, useEffect, useContext } from "react"
import { useStore } from "../../../contexts/StoreProvider"
import { WizardContext } from "../../../contexts/WizardProvider"
import FieldsDirectory from '../FieldsDirectory'
import Spinner from '../../Spinner'
import "./FieldsSelect.scss"
import { QueryBuilderContext } from "../../../contexts/QueryBuilderProvider"


export const FieldsSelect: React.FC = () => {
  const { stepData, stepName } = useContext(QueryBuilderContext)
  const { fetchExplore } = useContext(WizardContext)
  const { state, dispatch } = useStore()
  const [isLoading, setIsLoading] = useState(true)
  const { exploreName, modelName, exploreData } = stepData

  useEffect(() => {
    if (exploreName === exploreData?.exploreName) {
      setIsLoading(false)
      return
    }

    fetch()
      .finally(() => { setIsLoading(false) })
  }, [exploreName])

  const fetch = async () => {
    if (!modelName || !exploreName) { return }
    await fetchExplore?.(modelName, exploreName, stepName)
  }

  if (!isLoading && !exploreData) {
    dispatch({ type: 'addError', error: 'Failed to load explore, please try again' })
    dispatch({ type: 'clearExplore' })
    return <></>
  }

  return (
    <div>
      <div className="fields-tabs">
        {isLoading ? (
          <div className="spinner center">
            <Spinner />
          </div>
        ) : (
          <FieldsDirectory />
        )}
      </div>
    </div>
  )
}
