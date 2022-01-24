import React from "react"
import { useStore } from "../../contexts/StoreProvider"
import NoExplorePlaceHolder from './NoExplorePlaceHolder'
import ExploreSelect from './ExploreSelect'
import FieldsSelect from './FieldsSelect'
import QueryPane from './QueryPane'

type QueryBuilderProps = {
}

export const QueryBuilder : React.FC<QueryBuilderProps> = () => {
  const { state } = useStore()
  const { step2 } = state.wizard.steps

  const directoryPaneContents = step2.exploreName ?
    (<FieldsSelect/>) : (<ExploreSelect />)

  const queryPaneContents = step2.exploreName && step2.exploreData ?
    (<QueryPane />) : (<NoExplorePlaceHolder />)

  return (
    <div className="default-layout">
      <div className="pane directory-pane">
        {directoryPaneContents}
      </div>
      <div className="pane query-pane">
        {queryPaneContents}
      </div>
    </div>
  )
}
