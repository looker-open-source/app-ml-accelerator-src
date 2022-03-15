import React, { useState, useEffect, useContext } from "react"
import ModelExploreList from "../ModelExploreList"
import Spinner from "../../Spinner"
import { filterExplores } from "../../../services/explores"
import { QueryBuilderContext } from "../../../contexts/QueryBuilderProvider"
import { ILookmlModel } from "@looker/sdk/lib/4.0/models"
import "./ExploreSelect.scss"

export const ExploreSelect: React.FC = () => {
  const { fetchSortedModelsAndExplores, stepData } = useContext(QueryBuilderContext);
  const { exploreFilterText } = stepData
  const [isLoading, setIsLoading] = useState(true)
  const [exploreArr, setExploreArr] = useState<ILookmlModel[]>([])
  const [filteredExplores, setFilteredExplores] = useState<ILookmlModel[]>([])

  useEffect(() => {
    fetch()
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    setFilteredExplores(filterExplores(exploreFilterText, exploreArr))
  }, [exploreFilterText])

  const fetch = async () => {
    const modelExplores: ILookmlModel[] = await fetchSortedModelsAndExplores?.()
    setExploreArr(modelExplores)
    setFilteredExplores(modelExplores)
  }

  return (
    <div className="explore-select">
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
