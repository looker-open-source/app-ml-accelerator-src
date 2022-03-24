import { ChartConfiguration } from "chart.js";
import { RanQuery } from "../../types";
import { buildPieDataSets, buildVizLabels } from "./visualizations";

export const pieChartObj = (ranQuery: RanQuery, data: any, target: string): ChartConfiguration => {
  const labels = buildVizLabels(ranQuery, data, target)
  const datasets = buildPieDataSets({ ranQuery, data, target, datasetMapper, labels })
  return {
    type: 'pie',
    data: { labels, datasets },
    options: {
      maintainAspectRatio: false
    }
  }
}

const datasetMapper = (fieldName: string, labels: string[]) => {
  return (datum: any, i: number) => {
    return datum[fieldName] ? Number(datum[fieldName].value) : 0
  }
}
