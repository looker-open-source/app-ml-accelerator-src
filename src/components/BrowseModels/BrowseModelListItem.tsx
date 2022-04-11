import React from "react"
import { DataTableAction, DataTableCell, DataTableItem } from "@looker/components"
import { MODEL_STATE_TABLE_COLUMNS } from "../../constants"
import { DateFormat, TimeFormat } from "@looker/components-date"

const { modelName, createdByEmail, modelUpdatedAt } = MODEL_STATE_TABLE_COLUMNS

type BrowseModelListItemProps = {
  model: any,
  handleModelSelect: (name: string) => void
}

export const BrowseModelListItem: React.FC<BrowseModelListItemProps> = ({ model, handleModelSelect }) => {
  const actions = (
    <>
      <DataTableAction>Share</DataTableAction>
      <DataTableAction>Info</DataTableAction>
      <DataTableAction>Edit</DataTableAction>
      <DataTableAction>Delete</DataTableAction>
    </>
  )

  return (
    <DataTableItem
      key={model[modelName]}
      id={model[modelName]}
      className="model-list-item"
      onClick={() => handleModelSelect(model[modelName])}
      actions={actions}
    >
      <DataTableCell description={model.objective} className="model-list-item--name">
        <div className="model-list-item--title">
          {model[modelName]}
        </div>
      </DataTableCell>
      <DataTableCell>{model[createdByEmail]}</DataTableCell>
      <DataTableCell>
        { model[modelUpdatedAt] ?
          (<><DateFormat>{new Date(model[modelUpdatedAt])}</DateFormat>{' '}
          <TimeFormat>{new Date(model[modelUpdatedAt])}</TimeFormat></>) : ''
        }
      </DataTableCell>
    </DataTableItem>
  )
}
