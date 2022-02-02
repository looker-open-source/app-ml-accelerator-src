import React, { useState, useEffect, useContext } from "react"
import { FieldText } from "@looker/components"
import { Search } from "@styled-icons/material"
import ModelExploreList from "../ModelExploreList"
import Spinner from "../../Spinner"
import { filterExplores } from "../../../services/explores"
import { QueryBuilderContext } from "../../../contexts/QueryBuilderProvider"
import { ILookmlModel } from "@looker/sdk/lib/4.0/models"
import "./ExploreSelect.scss"



export const ExploreSelect: React.FC = () => {
  const { fetchSortedModelsAndExplores } = useContext(QueryBuilderContext);
  const [isLoading, setIsLoading] = useState(true)
  const [textInput, setTextInput] = useState("")
  const [exploreArr, setExploreArr] = useState<ILookmlModel[]>([])
  const [filteredExplores, setFilteredExplores] = useState<ILookmlModel[]>([])

  useEffect(() => {
    fetch()
      .finally(() => setIsLoading(false))
  }, [])

  const fetch = async () => {
    const modelExplores: ILookmlModel[] = await fetchSortedModelsAndExplores?.()
    setExploreArr(modelExplores)
    setFilteredExplores(modelExplores)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
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
