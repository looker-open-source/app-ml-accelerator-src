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

  if (target) {
    const targetIndex = chartMeasures.indexOf(target)
    if (targetIndex < 0) {
      // insert the target if its a dimension
      chartMeasures.splice(1, 0, target)
    }
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
      spanGaps: false
    }
  })
  return datasets
}

export const buildVizLabels = (ranQuery: RanQuery, data: any, target: string) => {
  if (!ranQuery?.selectedFields) { return [] }
  const dimensions = [...ranQuery.selectedFields.dimensions]

  if (target) {
    const targetIndex = dimensions.indexOf(target)
    if (targetIndex >= 0) {
      dimensions.splice(targetIndex, 1)
    }
  }

  return data.map((datum: any) => {
    let label = ""
    dimensions.forEach((dim) => {
      if (label) { label += " - " }
      label += datum[dim] ? datum[dim].value : ''
    })
    return label
  })
}

export const isPrediction = (fieldName: string, predictions?: string[]) => {
  if (!predictions) { return false }
  return predictions[0] === fieldName
}

export const truncateLabels = function (value: string | number) {
  // @ts-ignore
  const label = this.getLabelForValue(value)
  return label.length > 11 ? label.substr(0, 10) + '...' : label
}

export const getDatasetColors = (count: number) => {
  // let colors = ["#1A73E8", "#12B5CB", "#E52592", "#E8710A", "#F9AB00", "#7CB342", "#9334E6", "#80868B", "#079c98", "#A8A116", "#EA4335", "#FF8168"];
  // if (count < colors.length) {
  //   return colors.slice(0, count)
  // } else {
    // return chroma.bezier(["#1A73E8", "#12B5CB", "#E52592", "#E8710A", "#F9AB00", "#7CB342", "#9334E6", "#80868B", "#079c98", "#A8A116", "#EA4335", "#FF8168"]).scale().correctLightness().colors(count)
    // }
    return chroma.scale(["#1A73E8", "#F4B400"]).correctLightness().colors(count)
    //.scale().correctLightness().colors(count)
}

//['#5e4fa2', '#9e0142','#f47b4d','#feefa4','#7dc9a6'] spectral

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
  if (target) {
    const targetIndex = chartMeasures.indexOf(target)
    if (targetIndex < 0) {
      chartMeasures.splice(1, 0, target)
    }
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
  return datasets
}
