import React, { useState } from 'react'
import { isArima } from '../../services/modelTypes'
import ExpanderBar from '../QueryBuilder/Expander'
import { ArimaParametersForm } from './ArimaParametersForm'

type OptionalParametersProps = {
  objective: string
}

export const OptionalParameters: React.FC<OptionalParametersProps> = ({ objective }) => {
  const [ isOpen, setIsOpen ] = useState(false)

  const handleExpanderToggle = () => {
    setIsOpen(!isOpen)
  }

  const buildOptionalParametersForm = () => {
    if (isArima(objective)) {
      return (<ArimaParametersForm objective={objective} />)
    }
    return <></>
  }

  return (
    <ExpanderBar title="Optional Parameters" isOpen={isOpen} setIsOpen={handleExpanderToggle}>
      <div className="optional-parameters-container">
        { buildOptionalParametersForm() }
      </div>
    </ExpanderBar>
  )
}
