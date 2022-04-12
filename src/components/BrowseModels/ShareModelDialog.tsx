import { Button, ButtonTransparent, DialogContent, DialogFooter, DialogHeader, FieldChips } from '@looker/components'
import { Save } from '@styled-icons/material'
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
  const { updateSharedEmails } = useContext(AdminContext)
  const bqModelName = model[MODEL_STATE_TABLE_COLUMNS.modelName]

  const onChangeEmails = (values: string[]) => (
    setSharedList(values)
  )

  const handleSave = async () => {
    setIsLoading(true)
    const sharedEmailsWithPerms = addSharedPermissions(sharedList) // adding permissions as a placeholder onto the object for future development
    const { ok } = await updateSharedEmails?.(bqModelName, sharedEmailsWithPerms)
    setIsLoading(false)
    if (ok) {
      model[MODEL_STATE_TABLE_COLUMNS.sharedWithEmails] = [...sharedEmailsWithPerms]
    }
    closeDialog()
  }

  return (
    <>
      <DialogHeader hideClose="true" borderBottom="transparent" className="share-dialog--header">
        Share
        <span className="share-dialog--modelname">{bqModelName}</span>
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
          </div>
        </div>
      </DialogFooter>
    </>
  )
}
