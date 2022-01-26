import React, { useState, useEffect, useContext } from "react"
import { FieldText } from "@looker/components"
import { Search } from "@styled-icons/material"
import ModelExploreList from "../ModelExploreList"
import Spinner from "../../Spinner"
import { filterExplores, fetchSortedModelsAndExplores } from "../../../services/explores"
import { ExtensionContext } from "@looker/extension-sdk-react"
import { ILookmlModel } from "@looker/sdk/lib/4.0/models"
import "./ExploreSelect.scss"
import { useStore } from "../../../contexts/StoreProvider"


export const ExploreSelect: React.FC = () => {
  const { extensionSDK, core40SDK } = useContext(ExtensionContext);
  const { dispatch } = useStore()
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
          error: 'Failed to fetch Models and Explores.  Please reload the page.'
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

  return (
    <div className="explore-select">
      <div className="search-form">
        <FieldText
          className="text-field"
          onChange={handleChange}
          value={textInput}
          placeholder="Find An Explore"
          iconAfter={<Search />}
        />
      </div>
      {isLoading ? (
        <div className="spinner center">
            <Spinner />
        </div>
      ) : (
        <ModelExploreList models={filteredExplores}/>
      )}
    </div>
  )
}
