import { IconButton } from '@looker/components'
import { VisBar, VisColumn, VisLine, VisScatter } from '@looker/icons'
import React from 'react'
import { AllChartTypes } from '../../Visualizations/vizConstants'
import './QueryPane.scss'

type VizButtonsProps = {
  chartType: AllChartTypes,
  setChartType: (chartType: AllChartTypes) => void
}
export const VizButtons: React.FC<VizButtonsProps> = ({ chartType, setChartType }) => {
  const activeClass = (type: AllChartTypes) => (
    chartType === type ? " active" : ""
  )

  const handleClick = (chartType: AllChartTypes) => {
    return (e: any) => {
      e.stopPropagation()
      e.preventDefault()
      setChartType(chartType)
    }
  }

  return (
    <div className="viz-button-container">
      <IconButton icon={<VisColumn />} onClick={handleClick('column')} label="Column" className={`viz-button ${activeClass('column')}`}/>
      <IconButton icon={<VisBar />} onClick={handleClick('bar')} label="Bar" className={`viz-button ${activeClass('bar')}`}/>
      <IconButton icon={<VisScatter />} onClick={handleClick('scatter')} label="Scatterplot" className={`viz-button ${activeClass('scatter')}`}/>
      <IconButton icon={<VisLine />} onClick={handleClick('line')} label="Line" className={`viz-button ${activeClass('line')}`}/>
    </div>
  )
}
