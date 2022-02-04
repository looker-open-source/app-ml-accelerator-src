import React from "react"
import { useStore } from "../../../contexts/StoreProvider"
import { FieldText } from "@looker/components"
import { Search } from "@styled-icons/material"
import { CurrentExplore } from './CurrentExplore'
import "./ExploreFilter.scss"

export const ExploreFilter: React.FC = () => {
  const { state, dispatch } = useStore()
  const { exploreFilterText, exploreData } = state.wizard.steps.step2

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const filterText = e.target.value
    dispatch({ type: 'setExploreFilterText', filterText })
  }

  return (
    <div>
      <h2>Select your input data</h2>
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
