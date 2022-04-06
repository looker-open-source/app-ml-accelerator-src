import React, { useEffect, useContext, useRef } from "react"
import { useStore } from "../../contexts/StoreProvider"
import NoExplorePlaceHolder from './NoExplorePlaceHolder'
import ExploreSelect from './ExploreSelect'
import ExploreFilter from "./ExploreFilter"
import FieldsSelect from './FieldsSelect'
import QueryPane from './QueryPane'
import StaticDataTimeStamp from './StaticDataTimeStamp'
import { hasOrphanedSorts } from '../../services/resultsTable'
import { Button } from "@looker/components"
import { WizardContext } from "../../contexts/WizardProvider"
import { QueryBuilderContext } from "../../contexts/QueryBuilderProvider"
import { isArima } from "../../services/modelTypes"
import ArimaParamsPicker from "./ArimaParamsPicker"


type QueryBuilderProps = {
  setIsLoading: (isLoading: boolean) => void,
  runCallback?: () => void
  getPredictions?: () => void
  showPredictionsButton?: boolean
  predictionsButton?: any
}

export const QueryBuilder : React.FC<QueryBuilderProps> = ({
  setIsLoading,
  runCallback,
  getPredictions,
  showPredictionsButton,
  predictionsButton
}) => {
  const { saveQueryToState, createAndRunQuery } = useContext(WizardContext)
  const { stepData, stepName } = useContext(QueryBuilderContext)
  const { state, dispatch } = useStore()
  const { step5 } = state.wizard.steps
  const firstUpdate = useRef(true)

  // re-run the query when a sort is applied
  useEffect(() => {
    // don't run on component mount
    if(firstUpdate.current) {
      firstUpdate.current = false
      return
    }
    if (!stepData.ranQuery?.data) { return }
    setIsLoading(true)
    runQuery()
      .finally(() => setIsLoading(false))
  }, [stepData.sorts])

  const runQuery = async(forceLookerQuery?: boolean) => {
    try {
      if (!forceLookerQuery && stepName === 'step5' && step5.showPredictions) {
        await getPredictions?.()
        return
      } else {
        if (
          stepData.tableHeaders &&
          hasOrphanedSorts(stepData.tableHeaders, stepData.sorts || [])
        ) {
          // case when a sort is applied to a column that no longer exists in the query
          // clearing the sorts will trigger another runQuery execution in the useEffect above
          dispatch({type: 'addToStepData', step: stepName, data: { sorts: [] }})
          return
        }
        setIsLoading(true)
        const {results, exploreUrl} = await createAndRunQuery?.(stepData)
        saveQueryToState?.(stepName, stepData, results, exploreUrl)
        runCallback?.()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const directoryPaneContents = () => {
    if (!stepData.exploreName) { return (<ExploreSelect />) }

    if (stepName === 'step5' && isArima(state.bqModel.objective || '')) {
      return <ArimaParamsPicker setIsLoading={setIsLoading}/>
    }
    return (<FieldsSelect/>)
  }

  const queryPaneContents = stepData.exploreName && stepData.exploreData ?
    (<QueryPane/>) : (<NoExplorePlaceHolder />)

  return (
    <div>
      <div className="query-header">
        <div className="explore-filter">
          <ExploreFilter />
        </div>
        <div className="query-header-actions">
          { stepData.exploreData && (<>
              { stepName === 'step2' && <StaticDataTimeStamp /> }
              { showPredictionsButton ? predictionsButton :
                <Button
                  onClick={() => runQuery(true)}
                  className="action-button">
                    Run
                </Button>
              }
            </>)
          }
        </div>
      </div>
      <div className="default-layout">
        <div className="pane directory-pane">
          {directoryPaneContents()}
        </div>
        <div className="pane query-pane">
          {queryPaneContents}
        </div>
      </div>
    </div>
  )
}
