import React, { useEffect, useState } from "react"
import { Button, Icon, Pagination, Tooltip } from "@looker/components"
import { useHistory } from "react-router-dom"
import { useStore } from "../../contexts/StoreProvider"
import { Add, GridView } from "@styled-icons/material"
import Spinner from "../Spinner"
import { getPagedModels } from "../../services/modelList"
import { BrowseTable } from "@looker/icons"
import { BrowseModelsGrid } from "./BrowseModelsGrid"
import { BrowseModelsList } from "./BrowseModelsList"
import './BrowseModels.scss'


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
  const [ listView, setListView ] = useState<boolean>(false)
  const [sortedModels, setSortedModels] = useState<any[]>(models)
  const [pagedModels, setPagedModels] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setPagedModels(
      getPagedModels(sortedModels, currentPage)
    )
  }, [currentPage, loadingModels, sortedModels])

  const navigate = (path: string) => {
    dispatch({ type: 'clearState' })
    history.push(path)
  }

  if (models.length <= 0) {
    return (
      <div className="browse-models-empty">
        You do not have any existing models.
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
          (<BrowseModelsList pagedModels={pagedModels} sortedModels={sortedModels} setSortedModels={setSortedModels} navigate={navigate} />) :
          (<BrowseModelsGrid models={pagedModels} navigate={navigate} />)
      }
      <div className="browse-models-pagination-container">
        <Pagination
          current={currentPage}
          pages={totalPages}
          onChange={setCurrentPage}
        />
      </div>
    </div>
  )
}
