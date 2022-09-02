import React, { useContext, useEffect, useState } from 'react'
import { ButtonToggle } from '@looker/components'
import { ExplainContext } from '../../contexts/ExplainProvider'
import { useStore } from '../../contexts/StoreProvider'
import LoadingOverlay from '../LoadingOverlay'
import { formatBQResults } from '../../services/common'
import { noDot, titilize } from '../../services/string'
import { isClassifier } from '../../services/modelTypes'
import { GlobalExplainDialogTabs } from './GlobalExplainDialogTabs'
import { ExplainBarChart } from './ExplainBarChart'
import './GlobalExplain.scss'

export const GlobalExplainDialog: React.FC = () => {
  const EXPLAIN_TABS = ['Model Level', 'Class Level']

  const { state } = useStore()
  const { getGlobalExplainData } = useContext(ExplainContext)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>(EXPLAIN_TABS[0])
  const [formattedModelData, setFormattedModelData] = useState<any>()
  const [formattedClassData, setFormattedClassData] = useState<any>()
  const [topFeatures, setTopFeatures] = useState<string>('all')
  const { explain } = state.wizard
  const { target, objective } = state.bqModel
  const topFeaturesOptions = [
    { value: '5', label: 'Top 5' },
    { value: '10', label: 'Top 10' },
    { value: '25', label: 'Top 25' },
    { value: 'all', label: 'All' },
  ]

  useEffect(() => {
    fetchModelData()
  }, [activeTab])

  useEffect(() => {
    const data = isClassLevel(activeTab) ? explain.class : explain.model
    const formattedData = getFormattedData()
    if (!data || formattedData) {
      return
    }
    isClassLevel(activeTab) ?
      setFormattedClassData(formatBQResults(data, true)) :
      setFormattedModelData(formatBQResults(data, true))
  }, [explain.class, explain.model, activeTab])

  const fetchModelData = async () => {
    setIsLoading(true)
    await getGlobalExplainData?.(isClassLevel(activeTab))
    setIsLoading(false)
  }

  const isClassLevel = (activeTab: string) => (
    activeTab === EXPLAIN_TABS[1]
  )

  const getFormattedData = () => (
    isClassLevel(activeTab) ? formattedClassData : formattedModelData
  )

  const drawCharts = () => {
    let chartData = getFormattedData()
    if (!chartData || chartData.length <= 0) { return <></> }

    if (isClassLevel(activeTab)) {
      const datumKey = Object.keys(chartData[0]).filter((int: any) => int !== 'feature' && int !== 'attribution');

      let datumSeperatedChartData = [];
      let datum = [];
      for (let a = 0; a < chartData.length; a++) {
        if (a === 0) {
          datum.push(chartData[a])
        }
        if (a > 0 && chartData[a][datumKey[0]] === chartData[a - 1][datumKey[0]]) {
          datum.push(chartData[a])
        }
        if (a > 0 && chartData[a][datumKey[0]] !== chartData[a - 1][datumKey[0]]) {
          datumSeperatedChartData.push(datum.sort((a: any, b: any) => parseFloat(a.attribution) < parseFloat(b.attribution) ? 1 : -1));
          datum = [];
          datum.push(chartData[a])
        }
        if (a + 1 === chartData.length) {
          datumSeperatedChartData.push(datum.sort((a: any, b: any) => parseFloat(a.attribution) < parseFloat(b.attribution) ? 1 : -1));
        }
      }

      // for every class value show a chart of the top 10 features
      return datumSeperatedChartData.map((datum: any, i: number) => (
        <ExplainBarChart data={datum} label={`${displayTarget()}: ${titilize(datum[0][datumKey[0]])}`} key={i} />
      ))
    }

    if (topFeatures !== 'all') {
      chartData = chartData.slice(0, Number(topFeatures))
    }
    return <ExplainBarChart data={chartData} label="Features" />
  }

  const displayTarget = () => (
    titilize(noDot(target || ''))
  )

  return (
    <>
      <div className="global-explain--container">
        <LoadingOverlay isLoading={isLoading} />
        {isClassifier(objective || '') &&
          <GlobalExplainDialogTabs activeTab={activeTab} setActiveTab={setActiveTab} availableTabs={EXPLAIN_TABS} />
        }
        <div className="global-explain--charts-container" >
          <div className="global-explain--charts-header">
            <h5>Target: {displayTarget()}</h5>
            <div className="global-explain--top-features">
              {!isClassLevel(activeTab) && <ButtonToggle value={topFeatures} onChange={setTopFeatures} options={topFeaturesOptions} />}
            </div>
          </div>
          <div className="global-explain--charts">
            {drawCharts()}
          </div>
        </div>
      </div>
    </>
  )
}
