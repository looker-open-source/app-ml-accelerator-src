import React, { useState, useEffect, useContext } from "react"
import { useStore } from "../../../contexts/StoreProvider"
import { WizardContext } from "../../../contexts/WizardProvider"
import FieldsDirectory from '../FieldsDirectory'
import Spinner from '../../Spinner'
import "./FieldsSelect.scss"


export const FieldsSelect: React.FC = () => {
  const { fetchExplore } = useContext(WizardContext)
  const { state, dispatch } = useStore()
  const [isLoading, setIsLoading] = useState(true)
  const { exploreName, modelName, exploreData } = state.wizard.steps.step2

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
    await fetchExplore?.(modelName, exploreName)
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
