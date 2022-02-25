import React, { useState } from 'react'
import ExpanderBar from '../QueryBuilder/Expander'
import { ArimaAdvancedForm } from './ArimaAdvancedForm'

type AdvancedSettingsProps = {
  objective: string
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ objective }) => {
  const [ isOpen, setIsOpen ] = useState(false)

  const handleExpanderToggle = () => {
    setIsOpen(!isOpen)
  }

  const buildAdvancedSettingsForm = () => {
    if (objective === 'ARIMA_PLUS') {
      return (<ArimaAdvancedForm objective={objective} />)
    }
    return <></>
  }

  return (
    <ExpanderBar title="Advanced Settings" isOpen={isOpen} setIsOpen={handleExpanderToggle}>
      <div className="advanced-settings-container">
        { buildAdvancedSettingsForm() }
      </div>
    </ExpanderBar>
  )
}
