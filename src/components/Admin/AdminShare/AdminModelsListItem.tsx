import React, { useState } from "react"
import { MODEL_STATE_TABLE_COLUMNS } from "../../../constants"
import { AdminModelShareForm } from "./AdminModelShareForm"
import { Icon} from "@looker/components"
import { ExpandLess, ExpandMore } from "@styled-icons/material"

type AdminModelsListItemProps = {
  model: any
}

export const AdminModelsListItem : React.FC<AdminModelsListItemProps> = ({ model }) => {
  const [ isOpen, setIsOpen ] = useState(false)

  return (
    <li className="admin-model-list-item">
      <div className="modelstate-item" onClick={() => setIsOpen(!isOpen)}>
        <div className="modelstate-item--title">
          <span className="modelstate-item--title-label">
            Model Name:
          </span>
          { model[MODEL_STATE_TABLE_COLUMNS.modelName].value }
        </div>
        <div className="modelstate-item--actions">
          <Icon icon={ isOpen ? (<ExpandLess />) : (<ExpandMore />) } />
        </div>
      </div>
      <div className={`modelstate-item-content ${isOpen ? 'open' : ''}`}>
        <AdminModelShareForm model={model} />
      </div>
    </li>
  )
}
