import React, { useContext, useEffect, useState } from "react"
import { useStore } from '../../../contexts/StoreProvider'
import {
  FieldText,
  ExtendComponentsThemeProvider,
  ButtonTransparent
} from '@looker/components'
import { QueryBuilderContext } from "../../../contexts/QueryBuilderProvider"
import { floatOnly } from "../../../services/common"
import { DEFAULT_PREDICT_THRESHOLD } from "../../../constants"
import "./BinaryClassifierThreshold.scss"
import { Add } from "@styled-icons/material"



export const BinaryClassifierThreshold: React.FC = () => {
  const { state, dispatch } = useStore()
  if (!state.bqModel.binaryClassifier) { <></> }

  const [ thresholdError, setThresholdError ] = useState<string>('')
  const [ showThreshold, setShowThreshold ] = useState<boolean>(false)
  const { stepData } = useContext(QueryBuilderContext)
  const { predictSettings } = stepData

  useEffect(() => {
    updateSetting({ threshold: predictSettings.threshold || `${DEFAULT_PREDICT_THRESHOLD}` })
  }, [])

  // pass in { threshold: 0.5 }
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

  const handleThreholdChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = Number(e.currentTarget.value)
    if (value > 1) {
      setThresholdError(`Must be between 0 and 1`)
      return
    }
    setThresholdError('')
    updateSetting({ threshold: e.target.value || undefined })
  }

  return (
    <div className="threshold-container">
      <div className={ `threshold-visible ${showThreshold ? 'hide' : 'show'}`} >
        <ButtonTransparent color="neutral" size="small" iconBefore={<Add />} onClick={() => setShowThreshold(true)}>
          Add Threshold
        </ButtonTransparent>
      </div>
      <div className={ `threshold-visible ${showThreshold ? 'show' : 'hide'}`} >
        <ExtendComponentsThemeProvider
          themeCustomizations={{
            defaults: {
              externalLabel: false
            }
          }}
        >
          <FieldText
            externalLabel={false}
            label="Threshold"
            className="threshold-field"
            value={predictSettings.threshold || ''}
            onChange={handleThreholdChange}
            onKeyPress={floatOnly}
          />
        </ExtendComponentsThemeProvider>
        <div className="threshold-error field-error">
          { thresholdError }
        </div>
      </div>
    </div>
  )
}
