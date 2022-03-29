import React, { useEffect, useState } from "react"
import Chart from 'chart.js/auto';
import { useStore } from "../../contexts/StoreProvider";
import { AllChartTypes, VIZ_HEIGHT } from "../../services/visualizations/vizConstants";
import { areaChartObj, barChartObj, columnChartObj, lineChartObj, pieChartObj, scatterPlotChartObj } from "../../services/visualizations";
import { RanQuery } from "../../types";

type VizChartProps = {
  ranQuery: RanQuery,
  type: AllChartTypes
}

export const VizChart : React.FC<VizChartProps> = ({ ranQuery, type }) => {
  if (!ranQuery) { return <></> }

  const { state } = useStore()
  const { data } = ranQuery
  const { target } = state.bqModel
  const chartRef: any = React.createRef();
  const [ chart, setChart ] = useState<any>()

  useEffect(() => {
    if (chart) { chart.destroy() }
    const ctx = chartRef.current.getContext("2d")
    createChart(ctx)
  }, [type, data])

  const buildChartObj = () => {
    if (!ranQuery || !target) { return }

    switch (type) {
      case 'line':
        return lineChartObj(ranQuery, data, target)
      case 'bar':
        return barChartObj(ranQuery, data, target)
      case 'column':
        return columnChartObj(ranQuery, data, target)
      case 'scatter':
        return scatterPlotChartObj(ranQuery, data, target)
      case 'area':
        return areaChartObj(ranQuery, data, target)
      case 'pie':
        return pieChartObj(ranQuery, data, target)
    }
  }

  const createChart = (ctx: any) => {
    const chartObj = buildChartObj()
    if (!chartObj) { return }
    const newChart = new Chart(ctx, chartObj);

    setChart(newChart)
  }

  return (
    <div className="chart-viz-container">
      <canvas id="VizChart" ref={chartRef} height={VIZ_HEIGHT}/>
    </div>
  )
}
