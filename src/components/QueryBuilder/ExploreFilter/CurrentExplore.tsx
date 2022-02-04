import React from "react"
import { useStore } from "../../../contexts/StoreProvider"
import { ButtonOutline } from "@looker/components"
import "./ExploreFilter.scss"

export const CurrentExplore: React.FC = () => {
  const { state, dispatch } = useStore()
  const { exploreData } = state.wizard.steps.step2

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
