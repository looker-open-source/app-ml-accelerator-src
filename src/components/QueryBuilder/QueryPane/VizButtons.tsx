import { IconButton } from '@looker/components'
import { VisArea, VisBar, VisColumn, VisLine, VisPie, VisScatter, VisSingleValue, VisTable } from '@looker/icons'
import React from 'react'
import { AllChartTypes } from '../../../services/visualizations/vizConstants'
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
      <IconButton icon={<VisTable />} onClick={handleClick('table')} label="Table" className={`viz-button ${activeClass('table')}`}/>
      <IconButton icon={<VisColumn />} onClick={handleClick('column')} label="Column" className={`viz-button ${activeClass('column')}`}/>
      <IconButton icon={<VisBar />} onClick={handleClick('bar')} label="Bar" className={`viz-button ${activeClass('bar')}`}/>
      <IconButton icon={<VisScatter />} onClick={handleClick('scatter')} label="Scatterplot" className={`viz-button ${activeClass('scatter')}`}/>
      <IconButton icon={<VisLine />} onClick={handleClick('line')} label="Line" className={`viz-button ${activeClass('line')}`}/>
      <IconButton icon={<VisArea />} onClick={handleClick('area')} label="Area" className={`viz-button ${activeClass('area')}`}/>
      <IconButton icon={<VisPie />} onClick={handleClick('pie')} label="Pie" className={`viz-button ${activeClass('pie')}`}/>
      <IconButton icon={<VisSingleValue />} onClick={handleClick('singleValue')} label="Single Value" className={`viz-button ${activeClass('singleValue')}`}/>
      <IconButton icon={<span>Single Record</span>} onClick={handleClick('singleRecord')} label="Single Record" className={`viz-button viz-button-text ${activeClass('singleRecord')}`}/>
    </div>
  )
}
