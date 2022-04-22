import React from 'react'

type GlobalExplainDialogTabsProps = {
  activeTab: string,
  setActiveTab: (value: string) => void,
  availableTabs: string[]
}

export const GlobalExplainDialogTabs: React.FC<GlobalExplainDialogTabsProps> = ({ activeTab, setActiveTab, availableTabs }) => {
  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName)
  }

  const buildTabs = () => {
    return availableTabs.map((tabName: string) => {
      const isActive = tabName === activeTab
      return (
        <div
          className={`explain-tab ${isActive ? 'active' : ''}`}
          onClick={() => handleTabClick(tabName)}
          key={tabName}
        >
          { tabName }
        </div>
      )
    })
  }

  return (
    <div className="explain-tabs">
      { buildTabs() }
    </div>
  )
}
