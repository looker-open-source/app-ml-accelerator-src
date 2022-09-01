import React, { useEffect, useState } from 'react'
import { Chart, ChartTypeRegistry } from 'chart.js'
import { getDatasetColors } from '../../services/visualizations/visualizations'
import { titilize } from '../../services/string'

export const ExplainBarChart: React.FC<{ data: any[],label: string }> = ({ data, label }) => {
  const chartRef: any = React.createRef();
  const [ chart, setChart ] = useState<any>()

  useEffect(() => {
    if (chart) { chart.destroy() }
    const ctx = chartRef.current.getContext("2d")
    console.log('data', data)
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
    const chartType: keyof ChartTypeRegistry = 'bar'
    const labels = data.map((feature) => titilize(feature.feature))
    const barValues = data.map((feature) => Number(feature.attribution))

    return {
      type: chartType,
      data: {
        labels,
        datasets: [{
          label,
          data: barValues,
          backgroundColor: getDatasetColors(labels.length)
        }]
      },
      options: {
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: label
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Attribution'
            },
          },
          y: {
            ticks: {
              autoSkip: false
            }
          }
        }
      }
    }
  }

  return (
    <div className="global-explain--chart">
      <canvas id="VizChart" ref={chartRef} height={300}/>
    </div>
  )
}
