import React, { useState, useEffect, useContext } from "react"
import { useStore } from "../../../contexts/StoreProvider"
import { ExtensionContext2 } from "@looker/extension-sdk-react"
import { fetchExplore, mapAPIExploreToClientExplore } from "../../../services/explores"
import { CurrentExplore } from './CurrentExplore'
import FieldsDirectory from '../FieldsDirectory'
import Spinner from '../../Spinner'
import "./FieldsSelect.scss"

export const FieldsSelect: React.FC = () => {
  const { coreSDK } = useContext(ExtensionContext2)
  const { state, dispatch } = useStore()
  const [isLoading, setIsLoading] = useState(true)
  const { exploreName, modelName, exploreData } = state.wizard.steps.step2

  useEffect(() => {
    if (!modelName || !exploreName) { return }
    fetchExplore(coreSDK, modelName, exploreName).then((results) => {
      if (results?.ok && results?.value) {
        // convert raw JSON response to just the subset and shape of data we want
        const newExploreData = mapAPIExploreToClientExplore(results.value)
        dispatch({
          type: 'addToStepData',
          step: 'step2',
          data: { exploreData: newExploreData }
        })
      } else {
        setError()
      }
    }).catch((err: string) => {
      setError(err)
    }).finally(() => {
      setIsLoading(false)
    })
  }, [exploreName])

  const setError = (err?: string) => {
    const errString = "Failed to fetch explore."
    dispatch({
      type: 'addError',
      error: err ? `"${err}" - ${errString}` : errString
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
      {!isLoading && <CurrentExplore />}
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
