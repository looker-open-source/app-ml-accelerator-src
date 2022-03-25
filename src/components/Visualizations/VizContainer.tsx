import React, { useEffect, useState } from "react"
import { AllChartTypes, VIZ_HEIGHT } from "../../services/visualizations/vizConstants";
import { RanQuery } from "../../types";
import { VizChart } from "./VizChart";
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
    default:
      return <VizChart ranQuery={ranQuery} type={type} />
  }
}
