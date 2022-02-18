import React, { useContext } from 'react'
import { ModelContext } from '../../contexts/ModelProvider'
import { Button, useConfirm } from '@looker/components'
import './Step4.scss'

export const CancelModelButton: React.FC<{ setIsLoading: (value: boolean) => void }> = ({ setIsLoading }) => {
  const { cancelModelCreate } = useContext(ModelContext)
  const [confirmationDialog, openDialog] = useConfirm({
    confirmLabel: 'Continue',
    buttonColor: 'key',
    title: `Cancel Model Creation?`,
    message: 'This model will no longer be created or updated if you cancel this job.  Do you wish to continue?',
    onConfirm: (close) => {
      close()
      setIsLoading(true)
      cancelModelCreate?.().finally(() => setIsLoading(false))
    }
  })

  return (
    <>
      {confirmationDialog}
      <Button onClick={openDialog} className="model-job-pending--button">Cancel Model Creation</Button>
    </>
  )
}
