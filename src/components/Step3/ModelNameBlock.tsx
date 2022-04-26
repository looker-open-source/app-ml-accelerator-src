import React, { useContext } from 'react'
import { FieldText, Icon } from '@looker/components'
import { useStore } from '../../contexts/StoreProvider'
import { BQMLContext } from '../../contexts/BQMLProvider'
import { MODEL_STATE_TABLE_COLUMNS, NAME_CHECK_STATUSES } from '../../constants'
import { Warning, Check, Error } from "@styled-icons/material"
import { alphaNumericOnly } from '../../services/common'
import Spinner from '../Spinner'

type ModelNameBlockProps = {
  nameCheckStatus: string | undefined,
  setNameCheckStatus: (value?: string) => void,
  loadingNameStatus: boolean,
  setLoadingNameStatus: (value: boolean) => void,
  disabled?: boolean,
}

export const ModelNameBlock: React.FC<ModelNameBlockProps> = ({
  nameCheckStatus,
  setNameCheckStatus,
  loadingNameStatus,
  setLoadingNameStatus,
  disabled = false
}) => {
  const { getSavedModelByName } = useContext(BQMLContext)
  const { state, dispatch } = useStore()
  const { bqModelName } = state.wizard.steps.step3
  const { email: userEmail } = state.user

  const handleModelNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch({
      type: 'addToStepData',
      step: 'step3',
      data: {
        bqModelName: e.target.value
      }
    })
  }

  const handleModelNameBlur = async (e: any) => {
    setLoadingNameStatus(true)
    const { ok, value } = await getSavedModelByName?.(e.target.value)
    if (!ok) {
      setNameCheckStatus(undefined)
    }
    else if (value.data.length <= 0) {
      setNameCheckStatus(NAME_CHECK_STATUSES.valid)
    }
    else if (value.data[0][MODEL_STATE_TABLE_COLUMNS.createdByEmail].value === userEmail) {
      setNameCheckStatus(NAME_CHECK_STATUSES.warning)
    }
    else {
      setNameCheckStatus(NAME_CHECK_STATUSES.error)
    }
    setLoadingNameStatus(false)
  }

  const buildStatusMessage = () => {
    const statusMessage = {
      [NAME_CHECK_STATUSES.valid]: undefined,
      [NAME_CHECK_STATUSES.warning]: "You already have a model with that name.",
      [NAME_CHECK_STATUSES.error]: "A model with that name already exists.",
    }

    if (!nameCheckStatus) { return }
    return statusMessage[nameCheckStatus]
  }

  return (
    <div className="wizard-card">
      <h2>Name your model</h2>
      <div className="wizard-card-text">
        <FieldText
          onChange={handleModelNameChange}
          value={bqModelName}
          placeholder="Model_Name"
          onKeyPress={alphaNumericOnly}
          disabled={disabled}
          onBlur={handleModelNameBlur}
          iconAfter={
            <NameCheckIndicator
              loading={loadingNameStatus}
              status={nameCheckStatus}
            />
          }
        />
      </div>
      <div className={`status-message ${nameCheckStatus}`}>{buildStatusMessage()}</div>
    </div>
  )
}

type NameCheckIndicatorProps = {
  loading: boolean,
  status?: string
}

const NameCheckIndicator: React.FC<NameCheckIndicatorProps> = ({ loading, status }) => {
  const generateIndicator = {
    [NAME_CHECK_STATUSES.valid]: () => (
      // @ts-ignore
      <Icon icon={<Check />} color="positive" size="small" />
    ),
    [NAME_CHECK_STATUSES.warning]: () => (
      // @ts-ignore
      <Icon icon={<Warning />} color="warn" size="small"/>
    ),
    [NAME_CHECK_STATUSES.error]: () => (
      // @ts-ignore
      <Icon icon={<Error />} color="critical" size="small"/>
    ),
  }

  if (loading) {
    return (
      <Spinner size={20} />
    )
  }
  if (!status) { return (<></>) }
  return generateIndicator[status]?.()
}
