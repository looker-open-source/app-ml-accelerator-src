import React from "react"
import { ButtonOutline } from "@looker/components"

export const TitleBar : React.FC = () => {
  return (
    <div className="TitleBar_container">
      <div className="title-logo">
        <div className="title-logo-text">
          BigQuery ML<span>app</span>
        </div>
      </div>
      <div className="button_container">
        <ButtonOutline className="ToolBar-button">Model Admin</ButtonOutline>
      </div>
    </div>
  )
}

export default TitleBar
