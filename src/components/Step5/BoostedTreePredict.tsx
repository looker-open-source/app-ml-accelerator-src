import React, { useCallback, useContext, useEffect } from 'react'
import { ApplyContext } from '../../contexts/ApplyProvider'
import { QueryBuilderProvider } from '../../contexts/QueryBuilderProvider'
import { useStore } from '../../contexts/StoreProvider'
import QueryBuilder from '../QueryBuilder'
import { Button } from '@looker/components'

type BoostedTreePredictProps = {
  setIsLoading: (isLoading: boolean) => void
}

export const BoostedTreePredict: React.FC<BoostedTreePredictProps> = ({ setIsLoading }) => {
  const { state, dispatch } = useStore()
  const { createBoostedTreePredictions, getBoostedTreePredictions } = useContext(ApplyContext)
  const { step5 } = state.wizard.steps
  const { target, sourceQuery } = state.bqModel

  const generatePredictions = async () => {
    if (!step5.ranQuery  || !target) { return }
    setIsLoading(true)
    const { ok, body } = await createBoostedTreePredictions?.(step5.ranQuery.sql)
    if (!ok) {
      setIsLoading(false)
      return
    }
    const { ok: getOk, body: data } = await getBoostedTreePredictions?.()
    if (!getOk || !data.schema) {
      setIsLoading(false)
      return
    }

    const formattedResults = data.rows.map((row: any) => {
      const rowObj: any = {}
      const arr = row.f
      arr.forEach((col: any, i: number) => {
        const columnName = getLookerColumnName(
          sourceQuery.exploreName || '',
          data.schema.fields[i].name
        )
        rowObj[columnName] = { value: col.v }
      })
      return rowObj
    })

    // add the predictedColumn so headers will be regenerated
    dispatch({
      type: 'addToStepData',
      step: 'step5',
      data: {
        ...step5,
        selectedFields: {
          ...step5.selectedFields,
          predictions: [getPredictedColumnName(target)]
        },
        ranQuery: {
          ...step5.ranQuery,
          data: formattedResults
        }
      }
    })
    setIsLoading(false)
  }

  const disablePredictButton = () => (
    !step5.ranQuery || !step5.ranQuery.sql
  )

  return (
    <>
      <Button
        className="action-button"
        onClick={generatePredictions}
        disabled={disablePredictButton()}>
          Generate Predictions
      </Button>
      <QueryBuilderProvider stepName="step5" lockFields={true}>
        <QueryBuilder setIsLoading={setIsLoading} />
      </QueryBuilderProvider>
    </>
  )
}

const getLookerColumnName = (exploreName: string, fieldName: string) => {
  if (fieldName.indexOf(`${exploreName}_`) === 0) {
    return fieldName.replace(`${exploreName}_`, `${exploreName}.`)
  }
  return fieldName
}

const getPredictedColumnName = (target: string) => (
  `predicted_${target.replace(/\./g, '_')}`
)
