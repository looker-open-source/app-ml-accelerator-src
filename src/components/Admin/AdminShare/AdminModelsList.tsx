import React from 'react'
import { AdminModelsListItem } from "./AdminModelsListItem"

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
