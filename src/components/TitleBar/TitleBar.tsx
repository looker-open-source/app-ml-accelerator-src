import React from "react"
import { ButtonOutline } from "@looker/components"
import { Link } from "react-router-dom"

export const TitleBar : React.FC = () => {
  return (
    <div className="TitleBar_container">
      <div className="title-logo">
        <Link to={'/'} className="title-logo-text">
          BigQuery ML<span>app</span>
        </Link>
      </div>
      <div className="button_container">
        <Link to={'/admin'} className="toolbar-button-link">
          <ButtonOutline className="ToolBar-button">Model Admin</ButtonOutline>
        </Link>
      </div>
    </div>
  )
}
