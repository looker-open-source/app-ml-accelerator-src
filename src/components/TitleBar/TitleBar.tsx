import React, { useState } from "react"
import { IconButton } from "@looker/components"
import { Link } from "react-router-dom"
import { useStore } from "../../contexts/StoreProvider"
import { ErrorOutline } from "@styled-icons/material-outlined"

const ModelStatusText = () => {
  const { state } = useStore()
  const [expandMsg, setExpandMsg] = useState(true)
  const statusText = "An ML model is currently training. Do not close this tab or it will be cancelled."
  const btnMessage = expandMsg ? 'Hide' : 'Show'
  return (
    <>
      {state.ui.unsavedState && 
      <div className='titlebar-status-text'>
        <IconButton 
          label={`${btnMessage} Message`}
          className="titlebar-status-text--icon"
          icon={<ErrorOutline color="white"/>}
          onClick={() => setExpandMsg(!expandMsg)}
        />
        {expandMsg && statusText}
        </div>}
    </>
  )
}

export const TitleBar : React.FC = () => {
  
  return (
    <div className="TitleBar_container">
      <div className="title-logo">
        <Link to={'/'} className="title-logo-text">
          Machine Learning <span>Accelerator</span>
        </Link>
        <ModelStatusText/>
      </div>
    </div>
  )
}
