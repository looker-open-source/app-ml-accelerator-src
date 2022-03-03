import { Button, Checkbox, FieldText, Icon, IconButton, Label } from "@looker/components"
import { Add, ExpandLess, ExpandMore } from "@styled-icons/material"
import React, { useContext, useEffect, useState } from "react"
import { MODEL_STATE_TABLE_COLUMNS } from "../../constants"
import { BQMLContext } from "../../contexts/BQMLProvider"
import { toggleArrayEntry } from "../../services/array"

export const Admin : React.FC = () => {
  const { getAllSavedModels } = useContext(BQMLContext)
  const [ models, setModels ] = useState<any>([])

  useEffect(() => {
    populateModels()
  }, [])

  const populateModels = async () => {
    const { ok, value } = await getAllSavedModels?.()
    if (!ok) { return }
    setModels(value.data)
  }

  return (
    <div>
      <h2>Model Admin</h2>
      <p>Share your models with other users.</p>
      <AdminModelsList models={models} />
    </div>
  )
}

type AdminModelsListProps = {
  models: any[]
}

export const AdminModelsList : React.FC<AdminModelsListProps> = ({ models }) => {
  const listItems = models.map((model: any, i) => (
    <AdminModelsListItem model={model} key={i}/>
  ))

  return (
    <ul className="admin-model-list">
      { listItems }
    </ul>
  )
}

type AdminModelsListItemProps = {
  model: any
}

export const AdminModelsListItem : React.FC<AdminModelsListItemProps> = ({ model }) => {
  const [ isOpen, setIsOpen ] = useState(false)

  return (
    <li className="admin-model-list-item">
      <div className="modelstate-item" onClick={() => setIsOpen(!isOpen)}>
        <div className="modelstate-item--title">
          <span className="modelstate-item--title-label">
            Model Name:
          </span>
          { model[MODEL_STATE_TABLE_COLUMNS.modelName].value }
        </div>
        <div className="modelstate-item--actions">
          <Icon icon={ isOpen ? (<ExpandLess />) : (<ExpandMore />) } />
        </div>
      </div>
      <div className={`modelstate-item-content ${isOpen ? 'open' : ''}`}>
        <AdminModelShareForm model={model} />
      </div>
    </li>
  )
}

export const AdminModelShareForm : React.FC<AdminModelsListItemProps> = ({ model }) => {
  //const sharedWithEmails = JSON.parse(model[MODEL_STATE_TABLE_COLUMNS.sharedWithEmails].value || '[]')
  const sharedWithEmails: string[] = []
  const [ sharedList, setSharedList ] = useState<string[]>(sharedWithEmails)
  const [ checkedList, setCheckedList ] = useState<string[]>(sharedWithEmails)
  const [ emailToAdd, setEmailToAdd ] = useState<string>("")

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
