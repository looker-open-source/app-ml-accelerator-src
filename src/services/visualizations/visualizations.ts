import { PREDICTION_COLOR, VIZ_COLORS } from "./vizConstants"
import { RanQuery } from "../../types"
import { splitFieldName, titilize } from "../string"
import chroma from "chroma-js"

type buildVizDataSetsProps = {
  ranQuery: RanQuery,
  data: any,
  target: string,
  labels: string[],
  colorSolid?: boolean,
  datasetMapper: (fieldName: string, labels: string[]) => (datum: any, i: number) => any
}

export const buildVizDataSets = ({ ranQuery, data, target, labels, datasetMapper, colorSolid }: buildVizDataSetsProps): any[] => {
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

  const datasetColors = getDatasetColors(chartMeasures.length)

  const datasets = chartMeasures.map((fieldName, i) => {
    const color = isPrediction(fieldName, predictions) ? PREDICTION_COLOR : datasetColors[i] || '#aaaaaa'
    const bgColor = chroma(color).alpha(.2)
    return {
      label: titilize(splitFieldName(fieldName)),
      data: data.map(datasetMapper(fieldName, labels)),
      borderColor: color,
      backgroundColor: colorSolid ? color : bgColor,
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

const getDatasetColors = (count: number) => {
  return [...VIZ_COLORS, ...chroma.scale(['navy','red','yellow','white']).correctLightness().colors(count)]
}

export const buildPieDataSets = ({ ranQuery, data, target, labels, datasetMapper }: buildVizDataSetsProps): any[] => {
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

  const datasetColors = getDatasetColors(chartMeasures.length)

  const datasets = chartMeasures.map((fieldName, i) => {
    const color = isPrediction(fieldName, predictions) ? PREDICTION_COLOR : datasetColors[i] || '#aaaaaa'
    return {
      label: titilize(splitFieldName(fieldName)),
      data: data.map(datasetMapper(fieldName, labels)),
      borderColor: 'transparent',
      backgroundColor: chroma.scale([chroma(color).darken(2.5), color]).mode('lch').colors(data.length),
    }
  })
  console.log({ datasets })
  return datasets
}
