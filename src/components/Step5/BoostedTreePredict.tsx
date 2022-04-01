import React, { useCallback, useContext, useEffect } from 'react'
import { ApplyContext } from '../../contexts/ApplyProvider'
import { QueryBuilderProvider } from '../../contexts/QueryBuilderProvider'
import { useStore } from '../../contexts/StoreProvider'
import QueryBuilder from '../QueryBuilder'
import { Button } from '@looker/components'
import { isEqual } from 'lodash'

type BoostedTreePredictProps = {
  isLoading: boolean,
  setIsLoading: (isLoading: boolean) => void
}

export const BoostedTreePredict: React.FC<BoostedTreePredictProps> = ({ isLoading, setIsLoading }) => {
  const { state, dispatch } = useStore()
  const { generateBoostedTreePredictions, getBoostedTreePredictions } = useContext(ApplyContext)
  const { step5 } = state.wizard.steps

  useEffect(() => {
    if (step5.showPredictions) {
      setIsLoading(true)
      getBoostedTreePredictions?.().finally(() =>
        setIsLoading(false)
      )
    }
  }, [])

  const generatePredictions = async () => {
    if (!step5.ranQuery) { return }
    setIsLoading(true)
    await generateBoostedTreePredictions?.(step5.ranQuery.sql)
    setIsLoading(false)
  }

  const disablePredictButton = () => (
    !step5.ranQuery || !step5.ranQuery.sql || isLoading
  )

  const removePredictions = () => {
    dispatch({
      type: 'addToStepData',
      step: 'step5',
      data: {
        showPredictions: false,
        selectedFields: {
          ...step5.selectedFields,
          predictions: []
        }
      }
    })
  }

  const queryParamsChanged = () => (
    !isEqual(step5.selectedFields, step5.ranQuery?.selectedFields) ||
    step5.limit !== step5.ranQuery?.limit ||
    !isEqual(step5.sorts, step5.ranQuery?.sorts)
  )

  const showPredictionsButton = () => (
    Boolean(step5.ranQuery?.sql && !step5.showPredictions && !queryParamsChanged())
  )

  return (
    <>
      <QueryBuilderProvider stepName="step5" lockFields={true}>
        <QueryBuilder
          setIsLoading={setIsLoading}
          runCallback={removePredictions}
          showPredictionsButton={showPredictionsButton()}
          predictionsButton={
            <Button
              className="action-button generate-predictions-button"
              onClick={generatePredictions}
              disabled={disablePredictButton()}>
                Generate Predictions
            </Button>
          }
        />
      </QueryBuilderProvider>
    </>
  )
}
