import React, { useContext, useEffect, useState } from "react"
import { useStore } from '../../../contexts/StoreProvider'
import {
  Label,
  FieldText
} from '@looker/components'
import { QueryBuilderContext } from "../../../contexts/QueryBuilderProvider"
import { floatOnly, numericOnly } from "../../../services/common"
import { DEFAULT_ARIMA_CONFIDENCE_LEVEL, DEFAULT_ARIMA_HORIZON } from "../../../constants"
import "./ArimaParamsPicker.scss"


export const ArimaParamsPicker: React.FC<{ setIsLoading: (isLoading: boolean) => void }> = ({ setIsLoading }) => {
  const [ horizonError, setHorizonError ] = useState<string>('')
  const [ confidenceError, setConfidenceError ] = useState<string>('')
  const { stepData } = useContext(QueryBuilderContext)
  const { state, dispatch } = useStore()
  const { predictSettings } = stepData
  const { advancedSettings } = state.wizard.steps.step3
  const maxHorizon = advancedSettings.horizon ? advancedSettings.horizon : DEFAULT_ARIMA_HORIZON

  useEffect(() => {
    updateSetting({
      horizon: predictSettings.horizon || '30',
      confidenceLevel: predictSettings.confidenceLevel || `${DEFAULT_ARIMA_CONFIDENCE_LEVEL}`
    })
  }, [])

  // pass in { horizon: 30 }
  const updateSetting = (setting: any) => {
    dispatch({
      type: 'addToStepData',
      step: 'step5',
      data: {
        predictSettings: {
          ...predictSettings,
          ...setting
        }
      }
    })
  }

  const handleHorizonChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = Number(e.currentTarget.value)
    if (value > maxHorizon) {
      setHorizonError(`Horizon must be less than value used to create model (<${maxHorizon})`)
      return
    }
    setHorizonError('')
    updateSetting({ horizon: e.target.value || undefined })
  }

  const handleConfidenceChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = Number(e.currentTarget.value)
    if (value > 1) {
      setConfidenceError(`Confidence must be a decimal between 0 and 1`)
      return
    }
    setConfidenceError('')
    updateSetting({ confidenceLevel: e.target.value || undefined })
  }

  return (
    <div className="fields-directory-container">
      <div className="arima-params-container">
        <h3>Parameters</h3>
        <div className="parameter-item">
          <Label>
            Horizon
          </Label>
          <FieldText
            value={predictSettings.horizon || ''}
            onChange={handleHorizonChange}
            onKeyPress={numericOnly}
            description={
              <>
                { horizonError &&
                  <div className="field-error">
                    { horizonError }
                  </div>
                }
                <span className="tiny-text">Numeric only</span>
              </>
            }
          />
        </div>
        <div className="parameter-item">
          <Label>
            Confidence Level
          </Label>
          <FieldText
            value={predictSettings.confidenceLevel || ''}
            onChange={handleConfidenceChange}
            onKeyPress={floatOnly}
            description={
              <>
                { confidenceError &&
                  <div className="field-error">
                    { confidenceError }
                  </div>
                }
                <span className="tiny-text">Decimal only</span>
              </>
            }
          />
        </div>
      </div>
    </div>
  )
}
