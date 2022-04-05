import React, { useContext, useEffect } from 'react'
import { ApplyContext } from '../../contexts/ApplyProvider'
import { QueryBuilderProvider } from '../../contexts/QueryBuilderProvider'
import { useStore } from '../../contexts/StoreProvider'
import QueryBuilder from '../QueryBuilder'
import { Button } from '@looker/components'

type ArimaPredictProps = {
  isLoading: boolean,
  setIsLoading: (isLoading: boolean) => void
}

export const ArimaPredict: React.FC<ArimaPredictProps> = ({ isLoading, setIsLoading }) => {
  const { state } = useStore()
  const { getArimaPredictions } = useContext(ApplyContext)

  useEffect(() => {
    getPredictions()
  }, [])

  const getPredictions = async () => {
    setIsLoading(true)
    await getArimaPredictions?.()
    setIsLoading(false)
  }

  return (
    <>
      <QueryBuilderProvider stepName="step5" lockFields={true} hideDirectoryPane={true}>
        <QueryBuilder
          setIsLoading={setIsLoading}
          // runCallback={removePredictions}
          // getPredictions={() => genPredictions(true)}
          showPredictionsButton={true}
          predictionsButton={
            <Button
              className="action-button generate-predictions-button"
              onClick={() => getPredictions()}
              // disabled={disablePredictButton()}
              >
                Generate Predictions
            </Button>
          }
        />
      </QueryBuilderProvider>
    </>
  )
}
