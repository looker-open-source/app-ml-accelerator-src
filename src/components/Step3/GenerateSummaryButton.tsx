import React, { useContext } from 'react'
import { useStore } from "../../contexts/StoreProvider"
import { Button, useConfirm } from "@looker/components"
import { SummaryContext } from '../../contexts/SummaryProvider'
import { NAME_CHECK_STATUSES } from '../../constants'

type GenerateSummaryButtonProps = {
  setIsLoading: (value: boolean) => void
  loadingNameStatus: boolean,
  nameCheckStatus?: string,
  summaryUpToDate: () => boolean
}

export const GenerateSummaryButton: React.FC<GenerateSummaryButtonProps> = ({
  setIsLoading,
  loadingNameStatus,
  nameCheckStatus,
  summaryUpToDate
}) => {
  const { getSummaryData } = useContext(SummaryContext)
  const { state } = useStore()
  const { step2, step3 } = state.wizard.steps
  const { ranQuery } = step2
  const { targetField, bqModelName } = step3

  const canGenerateSummary = (): boolean => (
    Boolean(
      !loadingNameStatus &&
      nameCheckStatus !== NAME_CHECK_STATUSES.error &&
      targetField &&
      bqModelName &&
      !summaryUpToDate()
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

  const generateSummary = async () => {
    setIsLoading(true)
    await getSummaryData?.(ranQuery?.sql, bqModelName, targetField)
    setIsLoading(false)
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
