import React from 'react'
import { isArima, MODEL_TABS, MODEL_TYPES } from '../../services/modelTypes'
import { BQModelState } from '../../types'

type ModelSidebarProps = {
  activeTab: string,
  setActiveTab: (value: string) => void,
  bqModel: BQModelState
}

export const ModelSidebar: React.FC<ModelSidebarProps> = ({ activeTab, setActiveTab, bqModel }) => {
  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName)
  }

  const buildTabs = () => {
    const availableTabs = MODEL_TYPES[bqModel.objective || ''].modelTabs(bqModel.binaryClassifier)
    const tabList = availableTabs.map((tabName: string) => ({ tabName, label: MODEL_TABS[tabName] }))

    if (!isArima(bqModel.objective || '')) {
      tabList.push({ tabName: 'explain', label: 'FEATURE IMPORTANCE' })
    }

    return tabList.map((tab: any) => {
      const isActive = tab.tabName === activeTab
      return (
        <li
          className={`model-sidebar--item ${isActive ? 'active' : ''}`}
          onClick={() => handleTabClick(tab.tabName)}
          key={tab.tabName}
        >
          { tab.label }
        </li>
      )
    })
  }

  return (
    <ul className="model-sidebar">
      { buildTabs() }
    </ul>
  )
}
