import React, { useContext } from 'react'
import { useStore } from "../../contexts/StoreProvider"
import { Button, useConfirm } from "@looker/components"
import { hasSummaryData } from '../../services/summary'
import { SummaryContext } from '../../contexts/SummaryProvider'
import { NAME_CHECK_STATUSES } from '../../constants'

type GenerateSummaryButton = {
  setIsLoading: (value: boolean) => void
  loadingNameStatus: boolean,
  nameCheckStatus?: string,
}

export const GenerateSummaryButton: React.FC<GenerateSummaryButton> = ({
  setIsLoading,
  loadingNameStatus,
  nameCheckStatus
}) => {
  const { getSummaryData } = useContext(SummaryContext)
  const { state } = useStore()
  const { step2, step3 } = state.wizard.steps
  const { exploreName, modelName, ranQuery } = step2
  const { targetField, bqModelName } = step3
  const sourceColumns = [...ranQuery?.dimensions || [], ...ranQuery?.measures || []]
  const sourceColumnFormatted = sourceColumns.map((col) => col.replace(/\./g, '_')).sort()

  const canGenerateSummary = (): boolean => (
    Boolean(
      !loadingNameStatus &&
      nameCheckStatus !== NAME_CHECK_STATUSES.error &&
      targetField &&
      bqModelName &&
      !hasSummaryData(step3, exploreName || '', modelName || '', targetField, bqModelName, sourceColumnFormatted)
    )
  )

  const confirmGenerateSummary = () => {
    if (!canGenerateSummary()) {
      return
    }

    if (nameCheckStatus === NAME_CHECK_STATUSES.warning) {
      openDialog()
    } else {
      generateSummary()
    }
  }

  const generateSummary = () => {
    setIsLoading(true)
    getSummaryData?.(ranQuery?.sql, bqModelName, targetField)
      .finally(() => setIsLoading(false))
  }

  const [confirmationDialog, openDialog] = useConfirm({
    confirmLabel: 'Continue',
    buttonColor: 'key',
    title: `Overwrite existing model?`,
    message: 'You already have a model with this name.  Continuing will overwrite your existing model.',
    onConfirm: (close) => {
      close()
      generateSummary()
    }
  })

  return (
    <>
      {confirmationDialog}
      <Button
        className="action-button summary-generate"
        onClick={confirmGenerateSummary}
        disabled={!canGenerateSummary()}
      >
        Generate Summary
      </Button>
    </>
  )
}
