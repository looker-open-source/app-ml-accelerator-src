import React, { useContext, useEffect, useState } from "react"
import { Dialog, Icon, Pagination, Tooltip, useConfirm } from "@looker/components"
import { useHistory } from "react-router-dom"
import { useStore } from "../../contexts/StoreProvider"
import { GridView } from "@styled-icons/material"
import Spinner from "../Spinner"
import { getPagedModels } from "../../services/modelList"
import { BrowseTable } from "@looker/icons"
import { BrowseModelsGrid } from "./BrowseModelsGrid"
import { BrowseModelsList } from "./BrowseModelsList"
import './BrowseModels.scss'
import { ShareModelDialog } from "./ShareModelDialog"
import { ModelMetadataDialog } from "./ModelMetadataDialog"
import { AdminContext } from "../../contexts/AdminProvider"
import { MODEL_STATE_TABLE_COLUMNS } from "../../constants"

const { modelName } = MODEL_STATE_TABLE_COLUMNS

type BrowseModelsProps = {
  loadingModels: boolean,
  models: any[],
  totalPages: number,
  isShared?: boolean
}

export const BrowseModels: React.FC<BrowseModelsProps> = ({ loadingModels, models, totalPages, isShared }) => {
  if (loadingModels) {
    return (<Spinner />)
  }

  const history = useHistory()
  const { dispatch } = useStore()
  const { removeModel } = useContext(AdminContext)
  const [ listView, setListView ] = useState<boolean>(false)
  const [ sortedModels, setSortedModels ] = useState<any[]>(models)
  const [ pagedModels, setPagedModels ] = useState<any[]>([])
  const [ currentPage, setCurrentPage ] = useState(1)
  const [ isShareOpen, setIsShareOpen ] = useState(false)
  const [ isMetadataOpen, setIsMetadataOpen ] = useState(false)
  const [ modelToEdit, setModelToEdit ] = useState<any | undefined>()
  const [deleteDialog, openDelete] = useConfirm({
    confirmLabel: 'Continue',
    buttonColor: 'key',
    title: `Delete model`,
    message: 'Are you sure you want to delete this model and all associated tables?',
    onConfirm: (close) => {
      if (!modelToEdit) { close() }
      const deleteModelName = modelToEdit[modelName]
      removeModel?.(deleteModelName)
      setSortedModels(sortedModels.filter((model) => model[modelName] !== deleteModelName))
      close()
    }
  })

  useEffect(() => {
    setPagedModels(
      getPagedModels(sortedModels, currentPage)
    )
  }, [currentPage, loadingModels, sortedModels])

  const navigate = (path: string) => {
    dispatch({ type: 'clearState' })
    history.push(path)
  }

  const closeDialog = () => {
    setIsShareOpen(false)
    setIsMetadataOpen(false)
  }

  const openDialog = (model: any, dialog: 'share' | 'metadata' | 'delete') => {
    setModelToEdit(model)
    if (dialog === 'share') { setIsShareOpen(true) }
    else if (dialog === 'metadata') { setIsMetadataOpen(true) }
    else if (dialog === 'delete') { openDelete() }
  }

  if (models.length <= 0) {
    return (
      <div className="browse-models-empty">
        You do not have any { isShared ? 'shared' : 'existing' } models.
      </div>
    )
  }

  return (
    <div className="browse-models-container">
      <div className="view-toggle" onClick={() => setListView(!listView)}>
        <Tooltip
          placement="left"
          delay="none"
          content={ listView ? 'Show items in a grid' : 'Show items in a list'}>
          { /* @ts-ignore */ }
          { listView ?  <Icon icon={<GridView />} size="xsmall"/> : <Icon icon={<BrowseTable />} size="xsmall" /> }
        </Tooltip>
      </div>
      {
        listView ?
          (<BrowseModelsList
            pagedModels={pagedModels}
            sortedModels={sortedModels}
            setSortedModels={setSortedModels}
            navigate={navigate}
            openDialog={openDialog}
            isShared={isShared} />) :
          (<BrowseModelsGrid
            models={pagedModels}
            navigate={navigate}
            openDialog={openDialog}
            isShared={isShared} />)
      }
      <div className="browse-models-pagination-container">
        <Pagination
          current={currentPage}
          pages={totalPages}
          onChange={setCurrentPage}
        />
      </div>
      <Dialog
        isOpen={isShareOpen}
        onClose={closeDialog}
        width={"600px"}
      >
        <ShareModelDialog model={modelToEdit} closeDialog={closeDialog} />
      </Dialog>
      <Dialog
        isOpen={isMetadataOpen}
        onClose={closeDialog}
        width={"800px"}
      >
        <ModelMetadataDialog model={modelToEdit} closeDialog={closeDialog} />
      </Dialog>
      {deleteDialog}
    </div>
  )
}
