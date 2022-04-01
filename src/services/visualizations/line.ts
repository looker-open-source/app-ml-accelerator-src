import { ChartConfiguration } from "chart.js";
import { RanQuery } from "../../types";
import { buildVizDataSets, buildVizLabels, truncateLabels } from "./visualizations";

export const lineChartObj = (ranQuery: RanQuery, data: any, target: string): ChartConfiguration => {
  const labels = buildVizLabels(ranQuery, data, target)
  const datasets = buildVizDataSets({ ranQuery, data, target, datasetMapper, labels })
  return {
    type: 'line',
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
    return datum[fieldName] && (datum[fieldName].value || datum[fieldName].value === 0) ? Number(datum[fieldName].value) : null
  }
}
