import React from 'react'
import { MODEL_TABS, MODEL_TYPES } from '../../services/modelTypes'

type ModelSidebarProps = {
  activeTab: string,
  setActiveTab: (value: string) => void,
  bqModelObjective: string
}

export const ModelSidebar: React.FC<ModelSidebarProps> = ({ activeTab, setActiveTab, bqModelObjective }) => {
  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName)
  }

  const buildTabs = () => {
    const availableTabs = MODEL_TYPES[bqModelObjective].modelTabs
    return availableTabs.map((tabName: string) => {
      const isActive = tabName === activeTab
      return (
        <li
          className={`model-sidebar--item ${isActive ? 'active' : ''}`}
          onClick={() => handleTabClick(tabName)}
          key={tabName}
        >
          { MODEL_TABS[tabName] }
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
