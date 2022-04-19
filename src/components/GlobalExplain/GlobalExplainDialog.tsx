import React, { useContext, useEffect, useState } from 'react'
import { ButtonToggle, DialogContent } from '@looker/components'
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
  const [ isLoading, setIsLoading ] = useState<boolean>(false)
  const [ activeTab, setActiveTab ] = useState<string>(EXPLAIN_TABS[0])
  const [ formattedModelData, setFormattedModelData ] = useState<any>()
  const [ formattedClassData, setFormattedClassData ] = useState<any>()
  const [ topFeatures, setTopFeatures ] = useState<string>('all')
  const { explain } = state.wizard
  const { target, objective } = state.bqModel
  const topFeaturesOptions = [
    { value: '5', label: 'Top 5' },
    { value: '10', label: 'Top 10' },
    { value: '25', label: 'Top 25' },
    { value: 'all', label: 'All' },
  ]

  useEffect(() => {
    const data = isClassLevel(activeTab) ? explain.class : explain.model
    if (data) { return }
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
  }, [explain.class, explain.model])

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
      return chartData.map((datum: any, i: number) => (
        <ExplainBarChart data={datum.top_feature_attributions} label={titilize(datum[Object.keys(datum)[0]])} key={i}/>
      ))
    }

    if (topFeatures !== 'all') {
      chartData = chartData.slice(0, Number(topFeatures))
    }
    return <ExplainBarChart data={chartData} label="Features" />
  }

  return (
    <>
      <DialogContent className="global-explain--content">
        <h3>Global Explain</h3>
        <p className="info-p">Aliquam pulvinar vestibulum blandit. Donec sed nisl libero. Fusce dignissim luctus sem eu dapibus. Pellentesque vulputate quam a quam volutpat, sed ullamcorper erat commodo. Vestibulum sit amet ipsum vitae mauris mattis vulputate lacinia nec neque. Aenean quis consectetur nisi, ac interdum elit. Aliquam sit amet luctus elit, id tempus purus.</p>
        <div className="global-explain--container modal-pane">
          <LoadingOverlay isLoading={isLoading}/>
          { isClassifier(objective || '') &&
            <GlobalExplainDialogTabs activeTab={activeTab} setActiveTab={setActiveTab} availableTabs={EXPLAIN_TABS} />
          }
          <div className="global-explain--charts-container" >
            <h5>Target: {titilize(noDot(target || ''))}</h5>
            <div className="global-explain--top-features">
            { !isClassLevel(activeTab) && <ButtonToggle value={topFeatures} onChange={setTopFeatures} options={topFeaturesOptions} /> }
            </div>
            <div className="global-explain--charts">
              { drawCharts() }
            </div>
          </div>
        </div>
      </DialogContent>
    </>
  )
}
