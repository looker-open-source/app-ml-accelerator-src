import React, { useEffect, useState } from "react"
import Chart from 'chart.js/auto';
import { useStore } from "../../contexts/StoreProvider";
import { AllChartTypes, VIZ_HEIGHT } from "./vizConstants";
import { barChartObj, columnChartObj, lineChartObj, scatterPlotChartObj } from "../../services/visualizations";

type VizChartProps = {
  data: any,
  type: AllChartTypes
}

export const VizChart : React.FC<VizChartProps> = ({ data, type }) => {
  const { state } = useStore()
  const { ranQuery } = state.wizard.steps.step5
  const { target } = state.bqModel
  const chartRef: any = React.createRef();
  const [ chart, setChart ] = useState<any>()

  useEffect(() => {
    if (chart) { chart.destroy() }
    const ctx = chartRef.current.getContext("2d")
    createChart(ctx)
  }, [type, data])

  // useEffect(() => {
  //   if (!chart) { return }
  //   chart.data = buildChartData()
  //   chart.height = VIZ_HEIGHT
  //   chart.update()
  // }, [data, chart])

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
