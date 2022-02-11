import React, { useEffect, useContext, useRef } from "react"
import { useStore } from "../../contexts/StoreProvider"
import NoExplorePlaceHolder from './NoExplorePlaceHolder'
import ExploreSelect from './ExploreSelect'
import ExploreFilter from "./ExploreFilter"
import FieldsSelect from './FieldsSelect'
import QueryPane from './QueryPane'
import { hasOrphanedSorts } from '../../services/resultsTable'
import { Button } from "@looker/components"
import { WizardContext } from "../../contexts/WizardProvider"

type QueryBuilderProps = {
  setIsLoading: (isLoading: boolean) => void
}

export const QueryBuilder : React.FC<QueryBuilderProps> = ({ setIsLoading }) => {
  const { saveQueryToState, createAndRunQuery } = useContext(WizardContext)
  const { state, dispatch } = useStore()
  const { step2 } = state.wizard.steps
  const firstUpdate = useRef(true)

  // re-run the query when a sort is applied
  useEffect(() => {
    // don't run on component mount
    if(firstUpdate.current) {
      firstUpdate.current = false
      return
    }
    if (!step2.ranQuery?.data) { return }
    setIsLoading(true)
    runQuery()
      .finally(() => setIsLoading(false))
  }, [step2.sorts])

  const runQuery = async() => {
    if (
      step2.tableHeaders &&
      hasOrphanedSorts(step2.tableHeaders, step2.sorts || [])
    ) {
      // case when a sort is applied to a column that no longer exists in the query
      // clearing the sorts will trigger another runQuery execution in the useEffect above
      dispatch({type: 'addToStepData', step: 'step2', data: { sorts: [] }})
      return
    }
    setIsLoading(true)
    const {results, exploreUrl} = await createAndRunQuery?.(step2)
    saveQueryToState?.(step2, results, exploreUrl)
    setIsLoading(false)
  }

  const directoryPaneContents = step2.exploreName ?
    (<FieldsSelect/>) : (<ExploreSelect />)

  const queryPaneContents = step2.exploreName && step2.exploreData ?
    (<QueryPane/>) : (<NoExplorePlaceHolder />)

  return (
    <div>
      <div className="query-header">
        <div className="explore-filter">
          <ExploreFilter />
        </div>
        {
          step2.exploreData &&
          (<Button
            onClick={runQuery}
            className="run-query-button">
              Run
          </Button>)
        }
      </div>
      <div className="default-layout">
        <div className="pane directory-pane">
          {directoryPaneContents}
        </div>
        <div className="pane query-pane">
          {queryPaneContents}
        </div>
      </div>
    </div>
  )
}
