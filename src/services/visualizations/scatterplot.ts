import { ChartConfiguration } from "chart.js";
import { RanQuery } from "../../types";
import { buildVizDataSets, buildVizLabels, truncateLabels } from "./visualizations";

export const scatterPlotChartObj = (ranQuery: RanQuery, data: any, target: string): ChartConfiguration => {
  const labels = buildVizLabels(ranQuery, data, target)
  const datasets = buildVizDataSets({ ranQuery, data, target, datasetMapper, labels })
  return {
    type: 'scatter',
    data: { datasets },
    options: {
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            callback: truncateLabels
          },
          type: 'category',
          labels
        }
      },
    }
  }
}

const datasetMapper = (fieldName: string, labels: string[]) => {
  return (datum: any, i: number) => {
    const y = datum[fieldName] ? Number(datum[fieldName].value) : 0
    return { y, x: labels[i] }
  }
}
