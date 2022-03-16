import React, { useContext } from "react"
import { useStore } from "../../../contexts/StoreProvider"
import { ButtonOutline } from "@looker/components"
import "./ExploreFilter.scss"
import { QueryBuilderContext } from "../../../contexts/QueryBuilderProvider"
import { WIZARD_KEYS } from "../../../constants"

export const CurrentExplore: React.FC = () => {
  const { dispatch } = useStore()
  const { stepData, stepName } = useContext(QueryBuilderContext)
  const { exploreData } = stepData

  return (
    <div className="current-explore">
      { stepName === WIZARD_KEYS['2'] ?
        (<div className="back-btn">
          <ButtonOutline
            size="xsmall"
            color="neutral"
            onClick={() => dispatch({type: 'clearExplore'})}
          >
            Back
          </ButtonOutline>
        </div>) :
        (<span className="explore-label-span">Explore: </span>)
      }
      <div className="explore-label">
        {exploreData?.exploreLabel}
      </div>
    </div>
  )
}
