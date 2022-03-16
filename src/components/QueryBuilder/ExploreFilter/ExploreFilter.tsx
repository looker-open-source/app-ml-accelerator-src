import React, { useContext } from "react"
import { useStore } from "../../../contexts/StoreProvider"
import { FieldText } from "@looker/components"
import { Search } from "@styled-icons/material"
import { CurrentExplore } from './CurrentExplore'
import "./ExploreFilter.scss"
import { QueryBuilderContext } from "../../../contexts/QueryBuilderProvider"

export const ExploreFilter: React.FC = () => {
  const { stepData } = useContext(QueryBuilderContext)
  const { dispatch } = useStore()
  const { exploreFilterText, exploreData } = stepData

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const filterText = e.target.value
    dispatch({ type: 'setExploreFilterText', filterText })
  }

  return (
    <div>
      { exploreData ?
        (<CurrentExplore />) :
        (<div className="explore-search-form">
          <FieldText
            className="text-field"
            onChange={handleChange}
            value={exploreFilterText}
            placeholder="Find An Explore"
            iconAfter={<Search />}
          />
        </div>)
      }
    </div>
  )
}
