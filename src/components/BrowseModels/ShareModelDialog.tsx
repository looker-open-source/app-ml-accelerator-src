import { Button, ButtonTransparent, DialogContent, DialogFooter, DialogHeader, FieldChips, Icon } from '@looker/components'
import { Check, Save } from '@styled-icons/material'
import React, { useContext, useState } from "react"
// import { Add } from "@styled-icons/material"
import { MODEL_STATE_TABLE_COLUMNS } from "../../constants"
// import { toggleArrayEntry } from "../../services/array"
import { AdminContext } from "../../contexts/AdminProvider"
import { addSharedPermissions, removeSharedPermissions } from '../../services/admin'
import Spinner from "../Spinner"

type ShareModelDialogProps = {
  model: any,
  closeDialog: () => void
}

export const ShareModelDialog: React.FC<ShareModelDialogProps> = ({ model, closeDialog }) => {
  const sharedWithEmailsObj = model[MODEL_STATE_TABLE_COLUMNS.sharedWithEmails] || []
  const sharedWithEmails = removeSharedPermissions(sharedWithEmailsObj) // permissions are not used at this time. Currently they are just a placeholder for future development
  const [ sharedList, setSharedList ] = useState<string[]>(sharedWithEmails)
  const [ isLoading, setIsLoading ] = useState<boolean>(false)
  const [ isSaved, setIsSaved ] = useState<boolean>(false)
  const { updateSharedEmails } = useContext(AdminContext)
  const bqModelName = model[MODEL_STATE_TABLE_COLUMNS.modelName]

  const onChangeEmails = (values: string[]) => {
    setIsSaved(false)
    setSharedList(values)
  }

  const handleSave = async () => {
    setIsSaved(false)
    setIsLoading(true)
    const sharedEmailsWithPerms = addSharedPermissions(sharedList) // adding permissions as a placeholder onto the object for future development
    const { ok } = await updateSharedEmails?.(bqModelName, sharedEmailsWithPerms)
    setIsLoading(false)
    if (ok) {
      model[MODEL_STATE_TABLE_COLUMNS.sharedWithEmails] = [...sharedEmailsWithPerms]
      setIsSaved(true)
      closeDialog()
    }
  }

  return (
    <>
      <DialogHeader hideClose="true" borderBottom="transparent" className="share-dialog--header">
        Share
        <span className="share-dialog--modelname">{bqModelName}</span>
        <p>Enter one or multiple email addresses, pressing 'enter' after each.</p>
        <p>Then click 'save' button.</p>
      </DialogHeader>
      <DialogContent className="share-dialog--content">
        <div className="share-dialog--container modal-pane">
          <FieldChips
            onChange={onChangeEmails}
            values={sharedList}
          />
        </div>
      </DialogContent>
      <DialogFooter className="settings-dialog--footer">
        <div className="settings-dialog--footer-content">
          <div className="settings-dialog--buttons">
            <ButtonTransparent
              color="neutral"
              onClick={closeDialog}
              className="cancel-button"
              disabled={isLoading}
            >
                Cancel
            </ButtonTransparent>
            <Button
              className="action-button"
              color="key"
              iconBefore={<Save />}
              onClick={handleSave}
              disabled={isLoading}
            >
              Save
            </Button>
            { isLoading && <Spinner className="inline-spinner" size={28} />}
            { /* @ts-ignore */ }
            { isSaved && <Icon icon={<Check />} color="positive" size="small" className="inline-spinner" />}
          </div>
        </div>
      </DialogFooter>
    </>
  )
}
