import React from "react"
import { AllChartTypes } from "../../services/visualizations/vizConstants";
import { RanQuery } from "../../types";
import { VizChart } from "./VizChart";
import { VizSingleRecord } from "./VizSingleRecord";
import { VizSingleValue } from "./VizSingleValue";
import { VizTable } from "./VizTable";

type VizContainerProps = {
  ranQuery: RanQuery,
  type: AllChartTypes
}

export const VizContainer : React.FC<VizContainerProps> = ({ ranQuery, type }) => {
  if (!ranQuery) { return <></> }

  switch (type) {
    case 'table':
      return <VizTable ranQuery={ranQuery} />
    case 'singleValue':
      return <VizSingleValue ranQuery={ranQuery} />
    case 'singleRecord':
      return <VizSingleRecord ranQuery={ranQuery} />
    default:
      return <VizChart ranQuery={ranQuery} type={type} />
  }
}
