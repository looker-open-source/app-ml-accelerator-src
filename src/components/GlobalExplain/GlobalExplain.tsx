import React, { useState } from 'react'
import { ButtonTransparent, Dialog } from '@looker/components'
import { IdeFileDocument } from '@looker/icons'
import { useParams } from 'react-router-dom'
import { GlobalExplainDialog } from './GlobalExplainDialog'
import { ExplainProvider } from '../../contexts/ExplainProvider'
import { useStore } from '../../contexts/StoreProvider'
import { JOB_STATUSES } from '../../constants'
import './GlobalExplain.scss'

export const GlobalExplain: React.FC = () => {
  const { modelNameParam } = useParams<any>()
  const { state } = useStore()
  const { jobStatus } = state.bqModel
  const [ isDialogOpen, setIsDialogOpen ] = useState(false)

  if (!modelNameParam || jobStatus !== JOB_STATUSES.done ) { return <></> }

  const handleIconClick = () => {
    setIsDialogOpen(!isDialogOpen)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
  }

  return (
    <div className="global-explain-icon">
      <ButtonTransparent color="neutral" size="small" iconBefore={<IdeFileDocument />} onClick={handleIconClick}>Explain</ButtonTransparent>
      <ExplainProvider>
        <Dialog
          isOpen={isDialogOpen}
          onClose={closeDialog}
          width={"80%"}
        >
          <GlobalExplainDialog />
        </Dialog>
      </ExplainProvider>
    </div>
  )
}
