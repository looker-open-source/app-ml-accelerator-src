import React, { useState } from "react"
import { IconButton } from "@looker/components"
import { Link } from "react-router-dom"
import { useStore } from "../../contexts/StoreProvider"
import { ErrorOutline } from "@styled-icons/material-outlined"

const ModelStatusText = () => {
  const { state } = useStore()
  const [expandMsg, setExpandMsg] = useState(true)
  const statusText = "A BQML model is currently building. Please don't navigate away"
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
          BigQuery ML <span>Accelerator</span>
        </Link>
        <ModelStatusText/>
      </div>
    </div>
  )
}
