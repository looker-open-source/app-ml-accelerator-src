import React from "react"
import { ButtonOutline } from "@looker/components"
import { Link } from "react-router-dom"

export const TitleBar : React.FC = () => {
  return (
    <div className="TitleBar_container">
      <div className="title-logo">
        <Link to={'/'} className="title-logo-text">
          BigQuery ML <span>Accelerator</span>
        </Link>
      </div>
    </div>
  )
}
