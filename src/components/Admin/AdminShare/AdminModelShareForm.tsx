import React, { useContext, useState } from "react"
import { Button, Checkbox, FieldText, IconButton, Label } from "@looker/components"
import { Add } from "@styled-icons/material"
import { MODEL_STATE_TABLE_COLUMNS } from "../../../constants"
import { BQMLContext } from "../../../contexts/BQMLProvider"
import { toggleArrayEntry } from "../../../services/array"

type AdminModelsShareFormProps = {
  model: any
}

export const AdminModelShareForm : React.FC<AdminModelsShareFormProps> = ({ model }) => {
  const sharedWithEmails = JSON.parse(model[MODEL_STATE_TABLE_COLUMNS.sharedWithEmails].value || '[]')
  const [ sharedList, setSharedList ] = useState<string[]>(sharedWithEmails)
  const [ checkedList, setCheckedList ] = useState<string[]>(sharedWithEmails)
  const [ emailToAdd, setEmailToAdd ] = useState<string>("")
  const { updateModelStateSharedWithEmails } = useContext(BQMLContext)

  const checkboxChange = (email: string) => {
    if (
      email === 'everyone' &&
      sharedList.includes('everyone')
    ) {
      setSharedList([...sharedList, email])
    }
    const newCheckedList = toggleArrayEntry(checkedList, email)
    console.log({newCheckedList})
    setCheckedList(newCheckedList)
  }

  const emailToAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailToAdd(e.target.value)
  }

  const addEmail = () => {
    if (sharedList.includes(emailToAdd)) { return }
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
        <div className="share-form-checklist-item">
          <Checkbox
            checked={checkedList.includes('everyone')}
            onChange={() => { checkboxChange('everyone') }}
          />
          <Label className="share-form-checkbox-label">
            Everyone
          </Label>
        </div>
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
      <Button className="action-button">
        Save
      </Button>
    </div>
  )
}
