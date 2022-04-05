import { AgGridReact } from 'ag-grid-react'
import { Chart, ChartTypeRegistry } from 'chart.js'
import { sortBy } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useStore } from '../../contexts/StoreProvider'
import { formatBQResults } from '../../services/common'
import { MODEL_EVAL_FUNCS } from '../../services/modelTypes'
import { noDot, splitFieldName, titilize } from '../../services/string'

export const ModelDataBody: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { state } = useStore()
  const evalData = state.wizard.steps.step4.evaluateData[activeTab]

  if (!evalData) { return (<></>) }

  let formattedData = formatBQResults(evalData)

  switch (activeTab) {
    case MODEL_EVAL_FUNCS.confusionMatrix:
      return <ConfusionMatrixTable data={formattedData} />
    case MODEL_EVAL_FUNCS.rocCurve:
      return <ROCCurveTable data={formattedData} />
    case MODEL_EVAL_FUNCS.evaluate:
    case MODEL_EVAL_FUNCS.arimaEvaluate:
    default:
      return <EvaluateTable data={formattedData} />
  }
}

const EvaluateTable: React.FC<{ data: any[] }> = ({ data }) => {
  const dataItems = []
  const firstRow = data[0]
  for (const key in firstRow) {
    const value = firstRow[key]
    dataItems.push(
      <div className="model-data-item" key={key}>
        <div className="model-data-item--name">{titilize(splitFieldName(key))}:</div>
        <div className="model-data-item--value">{value}</div>
      </div>
    )
  }

  return (
    <div>
      { dataItems }
    </div>
  )
}

const ConfusionMatrixTable: React.FC<{ data: any[] }> = ({ data }) => {
  const dataItems = []
  const sortedData = sortBy(data, 'expected_label')
  const firstRow = sortedData[0]
  const matrixColor = (pct: number) => `rgba(230,0,0, ${pct / 100})`

  const headers = [(
    <td className="model-cm-item--placeholder"></td>
  )]

  for (const key in firstRow) {
    if (key === 'expected_label') { continue }
    headers.push(
      <td className="model-cm-item--header">{titilize(splitFieldName(key))}</td>
    )
  }

  const tableHeader = (
    <tr className="model-cm-item" key={'headers'}>
      {headers}
    </tr>
  )

  for (const rowKey in sortedData) {
    const cells = []
    for (const key in sortedData[rowKey]) {
      const value = sortedData[rowKey][key]
      if (key === 'expected_label') {
        cells.push(<td className="model-cm-item--header">{titilize(splitFieldName(value))}</td>)
      } else {
        cells.push(
          <td
            style={{ backgroundColor: matrixColor(Number(value))}}
            className="model-cm-item--value">
              {value}
          </td>
        )
      }
    }

    dataItems.push(
      <tr className="model-cm-item" key={rowKey}>
        {cells}
      </tr>
    )
  }

  return (
    <div className="model-grid-bg">
      <div className="model-cm-container">
        <table>
          <thead>
            { tableHeader }
          </thead>
          <tbody>
            { dataItems }
          </tbody>
        </table>
      </div>
    </div>
  )
}

const ROCCurveTable: React.FC<{ data: any[] }> = ({ data }) => {
  const columns = Object.keys(data[0]).map((key) => {
    const formattedKey = noDot(key)
    return {
      field: formattedKey,
      headerName: titilize(formattedKey)
    }
  })

  const getRowStyle = (params: any) => {
    if (params.node.rowIndex % 2 === 0) {
      return { background: '#f0f1f1' };
    }
  }

  const defaultColDef = {
    resizable: true,
  }

  const onGridReady = (params: any) => {
    const gridApi = params.api;
    gridApi.sizeColumnsToFit();
  }

  return (
    <div className="model-grid-bg">
      <ROCCurveLineChart data={data} />
      <div className="ag-theme-balham" style={{height: 220}}>
        <AgGridReact
          defaultColDef={defaultColDef}
          getRowStyle={getRowStyle}
          onGridReady={onGridReady}
          rowData={data}
          columnDefs={columns}>
        </AgGridReact>
      </div>
    </div>
  )
}

const ROCCurveLineChart: React.FC<{ data: any[] }> = ({ data }) => {
  const chartRef: any = React.createRef();
  const [ chart, setChart ] = useState<any>()

  useEffect(() => {
    if (chart) { chart.destroy() }
    const ctx = chartRef.current.getContext("2d")
    createChart(ctx)
  }, [data])

  const createChart = (ctx: any) => {
    const chartObj = buildChartObj()
    if (!chartObj) { return }
    // @ts-ignore
    const newChart = new Chart(ctx, chartObj);

    setChart(newChart)
  }

  const buildChartObj = () => {
    const chartType: keyof ChartTypeRegistry = 'line'

    const xyData = data.map((datum: any) => ({
      x: Number(datum['false_positive_rate']),
      y: Number(datum['recall'])
    }))

    return {
      type: chartType,
      data: {
        datasets: [{
          label: 'ROC Curve',
          data: xyData,
          fill: false,
          borderColor: 'rgb(75, 192, 192)'
        }]
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'linear',
            title: {
              display: true,
              text: 'False Positive Rate'
            }
          },
          y: {
            type: 'linear',
            title: {
              display: true,
              text: 'Recall'
            }
          }
        }
      }
    }
  }

  return (
    <div className="roc-line-chart">
      <canvas id="VizChart" ref={chartRef} height={300}/>
    </div>
  )
}
