import React, { useEffect, useContext, useState } from 'react'
import { useStore } from "../../contexts/StoreProvider"
import { ExtensionContext } from "@looker/extension-sdk-react"
import { FieldText } from "@looker/components"
import { Search } from "@styled-icons/material"
import './Step2.scss'
import { ILookmlModel } from "@looker/sdk/lib/4.0/models"
import withWizardStep from '../WizardStepHOC'
import ModelExploreList from '../QueryBuilder/ModelExploreList'
import StepContainer from '../StepContainer'
import { getWizardStepCompleteCallback } from '../../services/wizard'
import { filterExplores, fetchSortedModelsAndExplores } from '../../services/explores'
import QueryBuilder from '../QueryBuilder'

const Step2: React.FC<{ stepComplete: boolean }> = ({ stepComplete }) => {
  const { extensionSDK, core40SDK } = useContext(ExtensionContext);
  const { state, dispatch } = useStore()
  const [isLoading, setIsLoading] = useState(true)
  const [textInput, setTextInput] = useState("")
  const [exploreArr, setExploreArr] = useState<ILookmlModel[]>([])
  const [filteredExplores, setFilteredExplores] = useState<ILookmlModel[]>([])

  useEffect(() => {
    fetchSortedModelsAndExplores(extensionSDK, core40SDK)
      .then((modelExplores: ILookmlModel[]) => {
        setExploreArr(modelExplores)
        setFilteredExplores(modelExplores)
      })
      .catch((err: any) => {
        dispatch({
          type: 'addError',
          error: 'Failed to fetch Models and Explores.  Please reload the page. - ' + err
        })
        console.error(err)
      })
      .finally(() => setIsLoading(false))
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const newTextValue = e.target.value
    const filteredExplores = filterExplores(newTextValue, exploreArr)

    setTextInput(newTextValue)
    setFilteredExplores(filteredExplores)
  }

  const selectedExplore = state.wizard.steps.step2.exploreLabel
  return (
    <StepContainer isLoading={isLoading} stepComplete={stepComplete} stepNumber={2}>
      {/* <h2>Select your input data</h2>
      <div className="step2-header">
        <div className="text-field">
          <FieldText
            onChange={handleChange}
            value={textInput}
            placeholder="Find An Explore"
            iconAfter={<Search />}
          />
        </div>
        { selectedExplore &&
          (<div className="selected-explore">
            Selected Input: <span>{ selectedExplore }</span>
          </div>)
        }
      </div>
      <div className="explore-list">
        <div className="explore-list-contents">
          <ModelExploreList models={filteredExplores}/>
        </div>
      </div> */}
      <QueryBuilder />
    </StepContainer>
  )
}

export const WizardStep2 = withWizardStep({
  isStepComplete: getWizardStepCompleteCallback("step2"),
  stepNumber: 2
})(Step2)
