import React, { useState, useEffect, useContext } from "react"
import { useStore } from "../../../contexts/StoreProvider"
import { mapAPIExploreToClientExplore } from "../../../services/explores"
import FieldsDirectory from '../FieldsDirectory'
import Spinner from '../../Spinner'
import "./FieldsSelect.scss"
import { QueryBuilderContext } from "../../../contexts/QueryBuilderProvider"

export const FieldsSelect: React.FC = () => {
  const { fetchExplore } = useContext(QueryBuilderContext)
  const { state, dispatch } = useStore()
  const [isLoading, setIsLoading] = useState(true)
  const { exploreName, modelName, exploreData } = state.wizard.steps.step2

  useEffect(() => {
    fetch()
      .finally(() => { setIsLoading(false) })
  }, [exploreName])

  const fetch = async () => {
    if (!modelName || !exploreName) { return }
    const { value } = await fetchExplore?.(modelName, exploreName)
    const newExploreData = mapAPIExploreToClientExplore(value)
    dispatch({
      type: 'addToStepData',
      step: 'step2',
      data: { exploreData: newExploreData }
    })
  }

  // in a failure to retrieve the explore,
  // clear all selected explore data to return user to explore select screen
  if (!isLoading && !exploreData) {
    dispatch({ type: 'clearExplore' })
    return (<></>)
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
