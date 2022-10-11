import React, { useContext, useState } from "react"
import { Button, Checkbox, FieldText, IconButton, Label } from "@looker/components"
import { Add } from "@styled-icons/material"
import { MODEL_STATE_TABLE_COLUMNS } from "../../../constants"
import { toggleArrayEntry } from "../../../services/array"
import { AdminContext } from "../../../contexts/AdminProvider"
import Spinner from "../../Spinner"

type AdminModelsShareFormProps = {
  model: any
}

export const AdminModelShareForm : React.FC<AdminModelsShareFormProps> = ({ model }) => {
  const sharedWithEmails = JSON.parse(model[MODEL_STATE_TABLE_COLUMNS.sharedWithEmails].value || '[]')
  const [ sharedList, setSharedList ] = useState<string[]>(sharedWithEmails)
  const [ checkedList, setCheckedList ] = useState<string[]>(sharedWithEmails)
  const [ emailToAdd, setEmailToAdd ] = useState<string>("")
  const [ isLoading, setIsLoading ] = useState<boolean>(false)
  const { updateSharedEmails } = useContext(AdminContext)

  const checkboxChange = (email: string) => {
    const newCheckedList = toggleArrayEntry(checkedList, email)
    setCheckedList(newCheckedList)
  }

  const emailToAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailToAdd(e.target.value)
  }

  const addEmail = () => {
    if (!emailToAdd || sharedList.includes(emailToAdd)) { return }
    setSharedList([
      ...sharedList,
      emailToAdd
    ])
    setCheckedList([
      ...checkedList,
      emailToAdd
    ])
    setEmailToAdd("")
  }

  const handleSave = async () => {
    const bqModelName = model[MODEL_STATE_TABLE_COLUMNS.modelName].value
    setIsLoading(true)
    await updateSharedEmails?.(bqModelName, checkedList)
    setSharedList([...checkedList])
    setIsLoading(false)
  }

  return (
    <div className="modelstate-share-form">
      <div className="share-form-add-email">
        <div className="share-form-add-input">
          <FieldText
            onChange={emailToAddChange}
            value={emailToAdd}
            placeholder="Email to share with"
          />
        </div>
        <IconButton icon={<Add />} label="Add" onClick={addEmail} size="large"/>
      </div>
      <div className="share-form-checklist">
        {
          sharedList.map((email:string, i) => (
            <div className="share-form-checklist-item" key={i}>
              <Checkbox
                checked={checkedList.includes(email)}
                onChange={() => { checkboxChange(email) }}
              />
              <Label className="share-form-checkbox-label">
                {email}
              </Label>
            </div>
          ))
        }
      </div>
      <div className="share-form-actions">
        <Button className="action-button" onClick={handleSave} disabled={isLoading}>
          Save
        </Button>
        { isLoading && <Spinner className="inline-spinner" size={28} />}
      </div>
    </div>
  )
}
