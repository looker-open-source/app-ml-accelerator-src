import {  ButtonOutline, Heading, Icon } from '@looker/components'
import { ArrowCircleUp, ArrowCircleDown } from '@styled-icons/material-outlined'
import { AgGridReact } from 'ag-grid-react'
import { Chart, ChartTypeRegistry } from 'chart.js'
import { sortBy } from 'lodash'
import React, { useContext, useEffect, useState } from 'react'
import { useStore } from '../../contexts/StoreProvider'
import { formatBQResults } from '../../services/common'
import { MODEL_EVAL_FUNCS, evaluationAdditionalInfo, TEvaluationInfo } from '../../services/modelTypes'
import { noDot, splitFieldName, titilize } from '../../services/string'
import GlobalExplain from '../GlobalExplain'
import { ExtensionContext2 } from '@looker/extension-sdk-react'

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
  const {extensionSDK} = useContext(ExtensionContext2)
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleCard = () => setIsExpanded(!isExpanded)
  const openUrl = (url: string) => {
    extensionSDK.openBrowserWindow(url, '_blank')
  }
  return (
    <div className='model-evaluation--card'>
              <div className='model-evaluation--topRow'  onClick={toggleCard} >
                <div className='model-evaluation--mainInfo'>
                  <div className='model-evaluation--heading'>{heading}</div>
                </div>
              <div className='model-evaluation--details'>
              {Number(value).toFixed(4).toLocaleString()}
              </div>
            </div>
            {isExpanded && 
            <div className='model-evaluation--card-content'>
                <div className='model-evaluation--card-content-header'>
                {<Icon icon={info.high_is_positive 
                  ? <ArrowCircleUp color='rgb(39, 117, 26)'/> 
                  : <ArrowCircleDown color='#CC1F36'/>}/>}
                  {info.subtitle}
              </div>
              {info.extraInfo.map(i => <p>{i}</p>)}
              {info.url && <div>
                <ButtonOutline
                  className='glossary-button'
                  size='xsmall'
                  onClick={() => openUrl(info.url || '')}
                >
                  Read More
                </ButtonOutline>
              </div>}
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
    <div className='model-grid-bg'>
      <Heading as='h2'>Evaluation Metrics</Heading>
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
      </div>
    )
}

const ConfusionMatrixTable: React.FC<{ data: any[], target?: string }> = ({ data, target }) => {
  const [hoverCol, setHoverCol] = useState(-1)
  const [hoverRow, setHoverRow] = useState(-1)
  const dataItems = []
  const sortedData = sortBy(data, 'expected_label')
  const valueCount = sortedData.length
  
// TODO: don't do the highlighting for low cardinality confusion matrices 
  const matrixColor = (pct: number, row:number, col: number, isHeader:boolean = false) => {
    if ((row == hoverRow || col == hoverCol) && valueCount >= 4) {
      if (row == hoverRow && col == hoverCol) {
        return `rgb(39, 117, 26)`
      } else {
        return `rgb(222, 237, 219)`
      }
    } else {
      return isHeader ? 'white' : `rgba(66, 133, 244, ${pct / 100})`
    }
  };
  const textColor = (pct: number, row:number, col: number, isHeader:boolean = false) => {
    if ((row == hoverRow || col == hoverCol) && valueCount >= 4) {
      if (row == hoverRow && col == hoverCol) {
        return isHeader ? 'rgb(38, 45, 51)' : `white`;
      } else {
        return 'rgb(38, 45, 51)'
      }
    } else {
        return pct >= 80 ? 'white' : 'rgb(38, 45, 51)'
    }
  };

  const fontSizeCalc = (base=12) => {
    if (valueCount <= 2) return base + 4
    if (valueCount <= 4) return base + 2
    if (valueCount <= 5) return base
    return base
  }

  const headers = [(
    <td className="model-cm-item--placeholder" key="placeholder"></td>
  )]

  sortedData.map((row, idx) => {
    headers.push(
      <td
      style={{
         backgroundColor: matrixColor(0, -2, idx + 1, true),
         color: textColor(0, -2, idx + 1, true),
         width: `calc(100% / (${sortedData.length} + 2))`,
         fontSize: `${fontSizeCalc(12)}px`
        }}
      className={`model-cm-item--header`}
      key={row.expected_label}
      >
        {row.expected_label}
      </td>
    )
  })

  // Add col header (label for actual values)
  
  const handleCellMouseOver = (row: number, col: number) => {
    setHoverCol(col)
    setHoverRow(row)
  }

  const handleMouseLeave = () => {
    setHoverCol(-1)
    setHoverRow(-1)
  }

  const tableHeader = []

  tableHeader.push(
    <tr className="model-cm-item" key='headers'>
      {headers}
    </tr>
  )

  Object.keys(sortedData).map((rowKey, idx) => {
    const cells = []
    const row = sortedData[rowKey]
    const rowTotal = Object.keys(row).reduce(
      (total: number, key: any, index: number) =>
        (index > 0 ? total + Number(row[key]) : total + 0)
      , 0)

    Object.keys(row).map((key, idx2) => {
      const value = row[key]
      if (key === 'expected_label') {
        cells.push(
        <td
          style={{
            backgroundColor: matrixColor(0, idx, -2, true),
            color: textColor(0, idx, -2, true),
            height: `calc(40vw / (${sortedData.length} + 2))`,
            fontSize: `${fontSizeCalc(12)}px`
          }}
          className={`model-cm-item--col-header`}
          key={key}
        >
          {value}
        </td>
        )
      } else {
        const cellAsPercent = Math.round(Number(value) / rowTotal * 100)
        cells.push(
          <td
            style={{
              backgroundColor: matrixColor(cellAsPercent, idx, idx2),
              color: textColor(cellAsPercent, idx, idx2),
              fontWeight: idx + 1 == idx2 ? 'bold' : '',
              fontSize: `${fontSizeCalc(10)}px`
            }}
            className={`model-cm-item--value`}
            onMouseOver={() => handleCellMouseOver(idx, idx2)}
            key={key}>
              {cellAsPercent + '%'}
          </td>
        )
      }
    })

    dataItems.push(
      <tr className="model-cm-item" key={rowKey}>
        {cells}
      </tr>
    )
  })

  return (
    <div className="model-grid-bg fit-contents">
      <Heading as='h2'>Confusion Matrix</Heading>
        <div className="confusion-grid-target">
          Selected Target: <span>{ titilize(noDot(target || '')) }</span>
        </div>
          <div className='box-container-raised'>
            <div className='cm-header x'>
              Predicted Values
            </div>
          <div className='cm-inner-row'  onMouseLeave={handleMouseLeave}>
          <div className='cm-header y rotate'>
            Actual Values
          </div>
          <div className='cm-inner-col'>
            <table style={{minWidth: '80%'}}>
              <thead>
                { tableHeader }
              </thead>
              <tbody>
                { dataItems }
              </tbody>
            </table>
          </div>
        </div>
        </div>
    </div>
  )
}

const ROCCurveTable: React.FC<{ data: any[] }> = ({ data }) => {
  const convertedData = data?.map((datum: any) => ({ ...datum, recall: Number(datum.recall)}))
  const sortedData = sortBy(convertedData, 'threshold')
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
      headerName: titilize(formattedKey),
      cellStyle: (_params: any) => {
        if (formattedKey == 'threshold') {
            return {fontWeight: 'bold'};
        }
        return null;
    }
    }
  })

  const defaultColDef = {
    resizable: true,
  }

  const onGridReady = (params: any) => {
    const gridApi = params.api;
    gridApi.sizeColumnsToFit();
  }

  return (
    <div className="model-grid-bg roc">
      <Heading as='h2'>ROC curve</Heading>
      {/* <div className='box-container-raised'> */}

      <ROCCurveLineChart data={sortedData} />
      <div
        className="ag-theme-material"
        style={{height: '50vh'}}
        >
        <AgGridReact
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          rowData={sortedDataFormatted}
          columnDefs={columns}>
        </AgGridReact>
      </div>
        {/* </div> */}
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
          fill: {
            target: 'start',
            above: 'rgba(66, 133, 244, 0.1)',
          },
          pointRadius: 0,
          borderColor: '#4285F4'
        }]
      },
      options: {
        plugins: {
          legend: {
          display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'white',
            bodyColor: 'black',
            titleColor: 'black',
            borderColor: 'gray',
            borderRadius: 2,
            borderWidth: 1,
            displayColors: false,
            callbacks: {
              title: (ctx: any) => {
                let txt = `Threshold: ${Number(ctx[0].label).toFixed(3)}`
                return txt
              },
              label: (ctx: any) => {
                let x = `False positive rate: ${(ctx.parsed.x * 100).toFixed(2)}%`
                let y = `True positive rate:  ${(ctx.parsed.y * 100).toFixed(2)}%`
                return [y, x]
              },

          }
          },
        },
       hover: {
          mode: 'nearest',
          intersect: true
        },
        maintainAspectRatio: true,
        responsive: true,
        scales: {
          x: {
            type: 'linear',
            title: {
              color: '#555555',
              font: {
                lineHeight: '1.5rem'
              },
              display: true,
              text: 'False Positive Rate'
            },
            ticks: {
              callback: function(value: any) {
                if ((value * 100) % 20 == 0) {
                  return (value * 100)  + '%';
                }
              }
            }
          },
          y: {
            type: 'linear',
            title: {
              color: '#555555',
              font: {
                lineHeight: '1.5rem'
              },
              display: true,
              text: 'True Positive Rate (Recall)'
            },
            ticks: {
              callback: function(value: any) {
                if ((value * 100) % 20 == 0) {
                  return (value * 100)  + '%'
                };
              }
            }
          }
        },
        elements: {
          line: {
            tension: 0
          }
        }
      }
    }
  }

  return (
    <div className="roc-line-chart">
      <canvas id="VizChart" ref={chartRef}/>
      {/* <p>Area under curve: {auc}</p> TODO - add AUC */}
    </div>
  )
}
