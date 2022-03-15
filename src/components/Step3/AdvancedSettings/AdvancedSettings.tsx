import { Dialog, IconButton } from '@looker/components'
import { Settings } from '@styled-icons/material'
import React, { useState } from 'react'
import { isBoostedTree } from '../../../services/modelTypes'
import { BoostedSettingsDialog } from './BoostedSettingsDialog'
import './AdvancedSettings.scss'

type AdvancedSettingsProps = {
  objective?: string
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ objective }) => {
  if (!objective) { return (<></>)}

  const [ isDialogOpen, setIsDialogOpen ] = useState(false)

  const handleGearClick = () => {
    setIsDialogOpen(!isDialogOpen)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
  }

  const buildAdvancedSettingsForm = () => {
    if (isBoostedTree(objective)) {
      return (<BoostedSettingsDialog closeDialog={closeDialog} />)
    }
    return <></>
  }

  return (
    <div className="advanced-settings-icon">
      <IconButton icon={<Settings />} onClick={handleGearClick} label="Advanced Settings"></IconButton>
      <Dialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        width={"800px"}
      >
        { buildAdvancedSettingsForm() }
      </Dialog>
    </div>
  )
}
