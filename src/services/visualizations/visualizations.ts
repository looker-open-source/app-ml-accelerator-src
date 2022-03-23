import { PREDICTION_COLOR, VIZ_COLORS } from "../../components/Visualizations/vizConstants"
import { RanQuery } from "../../types"
import { splitFieldName, titilize } from "../string"

type buildVizDataSetsProps = {
  ranQuery: RanQuery,
  data: any,
  target: string,
  labels: string[],
  datasetMapper: (fieldName: string, labels: string[]) => (datum: any, i: number) => any
}

export const buildVizDataSets = ({ ranQuery, data, target, labels, datasetMapper }: buildVizDataSetsProps): any[] => {
  if (!ranQuery?.selectedFields) { return [] }
  const { predictions, measures } = ranQuery.selectedFields
  let chartMeasures: any[] = []
  if (predictions && predictions.length > 0) {
    chartMeasures.push(...predictions)
  }
  if (measures.length > 0) {
    chartMeasures.push(...measures)
  }
  const targetIndex = chartMeasures.indexOf(target)
  if (targetIndex < 0) {
    chartMeasures.splice(1, 0, target)
  }

  const datasets = chartMeasures.map((fieldName, i) => {
    const color = isPrediction(fieldName, predictions) ? PREDICTION_COLOR : VIZ_COLORS[i] || 'red'
    return {
      label: titilize(splitFieldName(fieldName)),
      data: data.map(datasetMapper(fieldName, labels)),
      borderColor: color,
      backgroundColor: color,
    }
  })
  console.log({ datasets })
  return datasets
}

export const buildVizLabels = (ranQuery: RanQuery, data: any, target: string) => {
  if (!ranQuery?.selectedFields) { return [] }
  const dimensions = [...ranQuery.selectedFields.dimensions]
  const targetIndex = dimensions.indexOf(target)

  if (targetIndex >= 0) {
    dimensions.splice(targetIndex, 1)
  }

  return data.map((datum: any) => {
    let label = ""
    dimensions.forEach((dim) => {
      if (label) { label += " - "}
      label += datum[dim].value
    })
    return label
  })
}

const isPrediction = (fieldName: string, predictions?: string[]) => {
  if (!predictions) { return false }
  return predictions[0] === fieldName
}

export const truncateLabels = function (value: string | number) {
  // @ts-ignore
  const label = this.getLabelForValue(value)
  return label.length > 11 ? label.substr(0, 10) + '...' : label
}
