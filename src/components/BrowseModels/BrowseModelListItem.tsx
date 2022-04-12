import React from "react"
import { DataTableAction, DataTableCell, DataTableItem } from "@looker/components"
import { MODEL_STATE_TABLE_COLUMNS } from "../../constants"
import { DateFormat, TimeFormat } from "@looker/components-date"
import { MODEL_TYPES } from "../../services/modelTypes"

const { modelName, createdByEmail, modelUpdatedAt } = MODEL_STATE_TABLE_COLUMNS

type BrowseModelListItemProps = {
  model: any,
  handleModelSelect: (name: string) => void,
  onShareModel: (model: any) => void,
  isShared?: boolean
}

export const BrowseModelListItem: React.FC<BrowseModelListItemProps> = ({ model, handleModelSelect, onShareModel, isShared }) => {
  const actions = (
    <>
      { isShared ? <></> : <DataTableAction onClick={() => onShareModel(model)}>Share</DataTableAction> }
      <DataTableAction>Info</DataTableAction>
      <DataTableAction onClick={() => handleModelSelect(model)}>Edit</DataTableAction>
      { isShared ? <></> : <DataTableAction>Delete</DataTableAction> }
    </>
  )

  return (
    <DataTableItem
      key={model[modelName]}
      id={model[modelName]}
      className="model-list-item"
      onClick={() => handleModelSelect(model)}
      actions={actions}
    >
      <DataTableCell className="model-list-item--name">
        <div className="model-list-item--title">
          {model[modelName]}
        </div>
      </DataTableCell>
      <DataTableCell>{model[createdByEmail]}</DataTableCell>
      <DataTableCell>{model.objective ? MODEL_TYPES[model.objective].label : ''}</DataTableCell>
      <DataTableCell>
        { model[modelUpdatedAt] ?
          (<><DateFormat>{new Date(model[modelUpdatedAt])}</DateFormat>{' '}
          <TimeFormat>{new Date(model[modelUpdatedAt])}</TimeFormat></>) : ''
        }
      </DataTableCell>
    </DataTableItem>
  )
}
