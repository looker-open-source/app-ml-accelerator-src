import { ChartConfiguration } from "chart.js";
import { RanQuery } from "../../types";
import { buildVizDataSets, buildVizLabels, truncateLabels } from "./visualizations";

export const columnChartObj = (ranQuery: RanQuery, data: any, target: string): ChartConfiguration => {
  const labels = buildVizLabels(ranQuery, data, target)
  const datasets = buildVizDataSets({ ranQuery, data, target, datasetMapper, labels, colorSolid: true })
  return {
    type: 'bar',
    data: { labels, datasets },
    options: {
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            callback: truncateLabels
          }
        }
      },
    }
  }
}

const datasetMapper = (fieldName: string, labels: string[]) => {
  return (datum: any, i: number) => {
    return datum[fieldName] ? Number(datum[fieldName].value) : 0
  }
}
