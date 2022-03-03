import React, { useContext, useEffect, useState } from "react"
import { BQMLContext } from "../../contexts/BQMLProvider"
import { AdminModelsList } from "./AdminShare/AdminModelsList"

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
