import React from "react"
import { useStore } from "../../contexts/StoreProvider";
import { isPrediction } from "../../services/visualizations";
import { VIZ_HEIGHT } from "../../services/visualizations/vizConstants";
import { RanQuery } from "../../types";

type VizSingleValueProps = {
  ranQuery: RanQuery
}

export const VizSingleValue : React.FC<VizSingleValueProps> = ({ ranQuery }) => {
  if (!ranQuery) { return <></> }

  const { state } = useStore()
  const { data } = ranQuery
  const { predictions } = ranQuery.selectedFields
  const { target } = state.bqModel

  const getSingleValue = () => {
    if (data.length <= 0) { return "No Data" }
    const firstRecord = data[0]

    if (predictions && predictions.length > 0) {
      return firstRecord[predictions[0]].value
    } else if (target) {
      return firstRecord[target].value
    }
    return "No Data"
  }

  return (
    <div className="viz-single-value" style={{height: VIZ_HEIGHT}}>
      { getSingleValue() }
    </div>
  )
}
