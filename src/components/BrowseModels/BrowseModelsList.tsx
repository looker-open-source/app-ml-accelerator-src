import React, { useState } from "react"
import { DataTable, DataTableColumns, doDataTableSort } from "@looker/components"
import { MODEL_STATE_TABLE_COLUMNS, WIZARD_STEPS } from "../../constants"
import { BrowseModelListItem } from "./BrowseModelListItem"

const { modelName, createdByEmail, modelUpdatedAt } = MODEL_STATE_TABLE_COLUMNS

type BrowseModelsViewProps = {
  pagedModels: any[],
  sortedModels: any[],
  navigate: (path: string) => void,
  setSortedModels: (models: any[]) => void
}

export const BrowseModelsList: React.FC<BrowseModelsViewProps> = ({ pagedModels, sortedModels, navigate, setSortedModels }) => {
  const [ columns, setColumns ] = useState<DataTableColumns>([
    {
      canSort: true,
      id: modelName,
      title: 'Name',
      type: 'string',
      size: 40,
    },
    {
      canSort: true,
      id: createdByEmail,
      title: 'Created By',
      type: 'string',
      size: 30
    },
    {
      canSort: true,
      id: modelUpdatedAt,
      title: 'Last Updated',
      type: 'date',
      size: 30
    }
  ])

  const onSort = (id: string, sortDirection: "desc" | "asc") => {
    const { columns: sortedColumns, data: sortedData } = doDataTableSort(
      sortedModels,
      columns,
      id,
      sortDirection
    )
    setSortedModels(sortedData)
    setColumns(sortedColumns)
  }

  const handleModelSelect = (name: string) => {
    navigate(`/ml/${name}/${WIZARD_STEPS['step5']}`)
  }

  const items = pagedModels.map((model, i) => (
    <BrowseModelListItem model={model} handleModelSelect={handleModelSelect} key={i} />
  ))

  return (
    <>
      { /*@ts-ignore */ }
      <DataTable caption="Models list view" columns={columns} onSort={onSort}>
        { items }
      </DataTable>
    </>
  )
}
