import { Card, CardContent, Heading, Icon, IconButton, Text, Tooltip } from '@looker/components'
import { ArrowDropDown, ArrowDropUp } from '@styled-icons/material'
import { ArrowCircleUp, ArrowCircleDown } from '@styled-icons/material-outlined'
import { AgGridReact } from 'ag-grid-react'
import { Chart, ChartTypeRegistry } from 'chart.js'
import { sortBy } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useStore } from '../../contexts/StoreProvider'
import { formatBQResults } from '../../services/common'
import { MODEL_EVAL_FUNCS, evaluationAdditionalInfo, TEvaluationInfo } from '../../services/modelTypes'
import { noDot, splitFieldName, titilize } from '../../services/string'
import GlobalExplain from '../GlobalExplain'

export const ModelDataBody: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  if (activeTab === 'explain') { return <GlobalExplain /> }

  const { state } = useStore()
  const evalData = state.wizard.steps.step4.evaluateData[activeTab]?.data

  if (!evalData) { return (<></>) }

  let formattedData = formatBQResults(evalData)

  switch (activeTab) {
    case MODEL_EVAL_FUNCS.confusionMatrix:
      return <ConfusionMatrixTable data={formattedData} target={state.bqModel.target}/>
    case MODEL_EVAL_FUNCS.rocCurve:
      return <ROCCurveTable data={formattedData} />
    case MODEL_EVAL_FUNCS.evaluate:
    case MODEL_EVAL_FUNCS.arimaEvaluate:
    default:
      return <EvaluateTable data={formattedData} />
  }
}

// TODO: investigate

// const ProgressBar: React.FC<{ value: number, plottable: boolean }> = ({ value, plottable }) => {
//   return (
//     <div className="progress">
//     <div className="progress--container">
//       <div className="progress--bar"
//         style={{
//           width: `${Number(value) * 100}%`,
//           // backgroundColor: `hsl(${value * 100}, 90%, 40%)`
//           }}>
//             <p>{Number(value).toFixed(4)}</p>
//       </div>
//       </div>
//   </div>
//   )
// }

const EvaluateTableItem: React.FC<{ heading: string, info: TEvaluationInfo, value: number }> = ({heading, info, value }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleCard = () => setIsExpanded(!isExpanded)
  return (
    <div className='model-evaluation--card'>
            <div className='model-evaluation--hover-area' onClick={toggleCard} >
              <div className='model-evaluation--topRow'>
                <div className='model-evaluation--mainInfo'>
                  <Heading>{heading}</Heading>
                <Tooltip content={info.subtitle}>
                <Icon icon={info.high_is_positive 
                  ? <ArrowCircleUp color='rgb(39, 117, 26)'/> 
                  : <ArrowCircleDown color='rgb(0, 99, 198)'/>}/>
                </Tooltip>
                </div>
              <div className='model-evaluation--details'>
              {/* <ProgressBar value={value} plottable={info.plottable}/>               */}
              {Number(value).toFixed(4)}
              </div>
              {isExpanded
              ? <IconButton icon={<ArrowDropUp/>} size='medium' label='Show more information'/>
              : <IconButton icon={<ArrowDropDown/>} size='medium' label='Hide more information'/>
            }
            </div>
            </div>
            {isExpanded && 
            <div className='model-evaluation--card-content'>
              {info.extraInfo.map(i => <p>{i}</p>)}
          </div>
          }
    </div>
  )
}

const EvaluateTable: React.FC<{ data: any[] }> = ({ data }) => {  
  const firstRow = data[0]
  const keys = Object.keys(firstRow)
  const half = Math.ceil(Object.keys(firstRow).length / 2);    
  const firstHalf = keys.slice(0, half)
  const secondHalf = keys.slice(half)

  return (
    <div className='model-evaluation'>
      <div className='model-evaluation--column'>
        {firstHalf.map((k) => <EvaluateTableItem
            key={k}
            heading={titilize(splitFieldName(k))}
            info={evaluationAdditionalInfo[k]}
            value={firstRow[k]}
            />
          )}
      </div>
      <div className='model-evaluation--column'>
        {secondHalf.map((k) => <EvaluateTableItem
            key={k}
            heading={titilize(splitFieldName(k))}
            info={evaluationAdditionalInfo[k]}
            value={firstRow[k]}
            />
          )}
      </div>
      </div>
    )
}

const ConfusionMatrixTable: React.FC<{ data: any[], target?: string }> = ({ data, target }) => {
  const dataItems = []
  const sortedData = sortBy(data, 'expected_label')
  const valueCount = sortedData.length
  const firstRow = sortedData[0]
  const matrixColor = (pct: number) => `rgba(66, 133, 244, ${pct / 100})`

  const cellSizeClass = (() => {
    if (valueCount <= 2) return 'xlarge'
    if (valueCount <= 4) return 'large'
    if (valueCount <= 5) return 'medium'
    return 'small'
  })()

  const headers = [(
    <td colSpan={2} className="model-cm-item--placeholder" width="60" key="placeholder"></td>
  )]

  for (const row of sortedData) {
    headers.push(
      <td className={`model-cm-item--header ${cellSizeClass}`} key={row.expected_label}>{row.expected_label}</td>
    )
  }

  // Add col header (label for actual values)
  const tableHeader = [(
    <tr>
      <th colSpan={sortedData.length + 2}>Actual Values</th>
    </tr>
  )]

  tableHeader.push(
    <tr className="model-cm-item" key={'headers'}>
      {headers}
    </tr>
  )

  // Add row header (label for predicted values)
  dataItems.push(
    <tr>
      <th className='rotate' rowSpan={sortedData.length + 2}>Predicted Values</th>
    </tr>
  )

  for (const rowKey in sortedData) {
    const cells = []
    const row = sortedData[rowKey]
    const rowTotal = Object.keys(row).reduce(
      (total: number, key: any, index: number) =>
        (index > 0 ? total + Number(row[key]) : total + 0)
      , 0)

    for (const key in row) {
      const value = row[key]
      if (key === 'expected_label') {
        cells.push(<td className={`model-cm-item--header ${cellSizeClass}`} key={key}>{value}</td>) //titilize(splitFieldName(value))
      } else {
        const cellAsPercent = Math.round(Number(value) / rowTotal * 100)
        cells.push(
          <td
            style={{ backgroundColor: matrixColor(cellAsPercent)}}
            className={`model-cm-item--value ${cellSizeClass}`}
            key={key}>
              {cellAsPercent + '%'}
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
    <div className="model-grid-bg fit-contents">
      <div className="model-cm-container">
        <div className="confusion-grid-target">
          Selected Target: <span>{ titilize(noDot(target || '')) }</span>
        </div>
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
  const convertedData = data?.map((datum: any) => ({ ...datum, recall: Number(datum.recall)}))
  const sortedData = sortBy(convertedData, 'recall')
  const sortedDataFormatted = sortedData.map((int: any) => {
    return {
      ...int,
      threshold: Number(int.threshold).toFixed(4),
      recall: `${(int.recall * 100).toFixed(2)}%`,
      false_positive_rate: `${(int.false_positive_rate * 100).toFixed(2)}%`
    }
  });

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
      <ROCCurveLineChart data={sortedData} />
      <div className="ag-theme-balham" style={{height: 220}}>
        <AgGridReact
          defaultColDef={defaultColDef}
          getRowStyle={getRowStyle}
          onGridReady={onGridReady}
          rowData={sortedDataFormatted}
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
        maintainAspectRatio: true,
        responsive: false,
        scales: {
          x: {
            type: 'linear',
            title: {
              display: true,
              text: 'False Positive Rate'
            },
            ticks: {
              callback: function(value: any) {
                  return (value * 100)  + '%';
              }
            }
          },
          y: {
            type: 'linear',
            title: {
              display: true,
              text: 'True Positive Rate (Recall)'
            },
            ticks: {
              callback: function(value: any) {
                  return (value * 100)  + '%';
              }
            }
          }
        }
      }
    }
  }

  return (
    <div className="roc-line-chart" style={{height: '400px'}}>
      <canvas id="VizChart" ref={chartRef} height={400} width={500}/>
    </div>
  )
}
