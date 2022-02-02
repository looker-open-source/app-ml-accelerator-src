import React, { useEffect, useContext } from "react"
import { useStore } from "../../contexts/StoreProvider"
import NoExplorePlaceHolder from './NoExplorePlaceHolder'
import ExploreSelect from './ExploreSelect'
import FieldsSelect from './FieldsSelect'
import QueryPane from './QueryPane'
import { hasOrphanedSorts } from '../../services/resultsTable'
import { QueryBuilderContext } from "../../contexts/QueryBuilderProvider"

type QueryBuilderProps = {
  setIsLoading: (isLoading: boolean) => void
}

export const QueryBuilder : React.FC<QueryBuilderProps> = ({ setIsLoading }) => {
  const { createAndRunQuery } = useContext(QueryBuilderContext)
  const { state, dispatch } = useStore()
  const { step2 } = state.wizard.steps

  // re-run the query when a sort is applied
  useEffect(() => {
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
    const {results, exploreUrl} = await createAndRunQuery?.(step2)
    saveQueryToState(results, exploreUrl)
  }

  const saveQueryToState = (results: any, exploreUrl: string | undefined) => {
    dispatch({
      type: 'addToStepData',
      step: 'step2',
      data: {
        ranQuery: {
          dimensions: step2.selectedFields.dimensions,
          measures: step2.selectedFields.measures,
          data: results.data,
          sql: results.sql,
          exploreUrl
        }
      }
    })
  }

  const directoryPaneContents = step2.exploreName ?
    (<FieldsSelect/>) : (<ExploreSelect />)

  const queryPaneContents = step2.exploreName && step2.exploreData ?
    (<QueryPane runQuery={runQuery}/>) : (<NoExplorePlaceHolder />)

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
