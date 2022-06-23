import React from "react"
import { DataTableAction, DataTableCell, DataTableItem } from "@looker/components"
import { MODEL_STATE_TABLE_COLUMNS } from "../../constants"
import { DateFormat, TimeFormat } from "@looker/components-date"
import { MODEL_TYPES } from "../../services/modelTypes"
import { startCase } from 'lodash'


const { modelName, createdByEmail, modelUpdatedAt } = MODEL_STATE_TABLE_COLUMNS

type BrowseModelListItemProps = {
  model: any,
  handleModelSelect: (name: string) => void,
  openDialog: (model: any, dialog: 'share' | 'metadata' | 'delete') => void,
  isShared?: boolean
}

export const BrowseModelListItem: React.FC<BrowseModelListItemProps> = ({ model, handleModelSelect, openDialog, isShared }) => {
  const actions = (
    <>
      { isShared ? <></> : <DataTableAction onClick={() => openDialog(model, 'share')}>Share</DataTableAction> }
      <DataTableAction onClick={() => openDialog(model, 'metadata')}>Info</DataTableAction>
      <DataTableAction onClick={() => handleModelSelect(model)}>Edit</DataTableAction>
      { isShared ? <></> : <DataTableAction onClick={() => openDialog(model, 'delete')}>Delete</DataTableAction> }
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
          {startCase(model[modelName])}
        </div>
      </DataTableCell>
      <DataTableCell>{model[createdByEmail]}</DataTableCell>
      <DataTableCell>{model.objective ? MODEL_TYPES[model.objective].techLabel : ''}</DataTableCell>
      <DataTableCell>
        { model[modelUpdatedAt] ?
          (<><DateFormat>{new Date(model[modelUpdatedAt])}</DateFormat>{' '}
          {new Date(model[modelUpdatedAt]).toTimeString()}</>) : ''
        }
      </DataTableCell>
    </DataTableItem>
  )
}
