import { FieldText, Label, Select } from '@looker/components'
import React, { useState } from 'react'
import { HOLIDAY_REGION_OPTIONS } from '../../constants'
import { useStore } from '../../contexts/StoreProvider'
import { InfoTip } from '../InfoTip/InfoTip'

type ArimaParametersFormProps = {
  objective: string
}

export const ArimaParametersForm: React.FC<ArimaParametersFormProps> = ({ objective }) => {
  const { state, dispatch } = useStore()
  const { horizon, holidayRegion } = state.wizard.steps.step3.advancedSettings

  const handleHorizonChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch({
      type: 'addToStepData',
      step: 'step3',
      data: {
        advancedSettings: {
          ...state.wizard.steps.step3.advancedSettings,
          horizon: e.target.value || undefined
        }
      }
    })
  }

  const handleHolidayRegionSelect = (value: string): void => {
    dispatch({
      type: 'addToStepData',
      step: 'step3',
      data: {
        advancedSettings: {
          ...state.wizard.steps.step3.advancedSettings,
          holidayRegion: value || undefined
        }
      }
    })
  }

  const numericOnly = (e: any) => {
    const re = /[0-9]+/g;
    if (!re.test(e.key)) {
      e.preventDefault();
    }
  }

  return (
    <>
      <div className="optional-parameters-form-item">
        <Label>
          Horizon
          <InfoTip content="The number of interval units to predict into the future" />
        </Label>
        <FieldText
          onChange={handleHorizonChange}
          value={horizon || ""}
          placeholder="Horizon"
          onKeyPress={numericOnly}
        />
      </div>
      <div className="optional-parameters-form-item">
        <Label>
          Holiday Region
        </Label>
        <Select
          options={HOLIDAY_REGION_OPTIONS}
          placeholder="Holiday Region"
          onChange={handleHolidayRegionSelect}
          value={holidayRegion}
          className="select-with-label"
        />
      </div>
    </>
  )
}
