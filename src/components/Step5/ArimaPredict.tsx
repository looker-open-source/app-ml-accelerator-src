import React, { useContext, useEffect } from 'react'
import { ApplyContext } from '../../contexts/ApplyProvider'
import { QueryBuilderProvider } from '../../contexts/QueryBuilderProvider'
import { useStore } from '../../contexts/StoreProvider'
import QueryBuilder from '../QueryBuilder'
import { Button } from '@looker/components'
import { WizardContext } from '../../contexts/WizardProvider'

type ArimaPredictProps = {
  isLoading: boolean,
  setIsLoading: (isLoading: boolean) => void
}

export const ArimaPredict: React.FC<ArimaPredictProps> = ({ isLoading, setIsLoading }) => {
  const { state } = useStore()
  const { step5 } = state.wizard.steps
  const { generateArimaPredictions } = useContext(ApplyContext)
  const { fetchExplore } = useContext(WizardContext)

  useEffect(() => {
    getPredictions()
  }, [])

  const getExplore = async () => {
    if (!step5.modelName || !step5.exploreName) { return }
    await fetchExplore?.(step5.modelName, step5.exploreName, 'step5')
  }

  const getPredictions = async () => {
    setIsLoading(true)
    await getExplore()
    await generateArimaPredictions?.()
    setIsLoading(false)
  }

  return (
    <>
      <QueryBuilderProvider stepName="step5" lockFields={true}>
        <QueryBuilder
          setIsLoading={setIsLoading}
          showPredictionsButton={true}
          predictionsButton={
            <Button
              className="action-button generate-predictions-button"
              onClick={() => getPredictions()}
              >
                Generate Predictions
            </Button>
          }
        />
      </QueryBuilderProvider>
    </>
  )
}
