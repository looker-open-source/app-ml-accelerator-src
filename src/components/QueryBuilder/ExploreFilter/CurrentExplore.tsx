import React, { useContext } from "react"
import { useStore } from "../../../contexts/StoreProvider"
import { ButtonOutline } from "@looker/components"
import "./ExploreFilter.scss"
import { QueryBuilderContext } from "../../../contexts/QueryBuilderProvider"

export const CurrentExplore: React.FC = () => {
  const { dispatch } = useStore()
  const { stepData } = useContext(QueryBuilderContext)
  const { exploreData } = stepData

  return (
    <div className="current-explore">
      <div className="back-btn">
        <ButtonOutline
          size="xsmall"
          color="neutral"
          onClick={() => dispatch({type: 'clearExplore'})}
        >
          Back
        </ButtonOutline>
      </div>
      <div className="explore-label">
        {exploreData?.exploreLabel}
      </div>
    </div>
  )
}
