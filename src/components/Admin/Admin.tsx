import React, { useContext, useEffect, useState } from "react"
import { BQMLContext } from "../../contexts/BQMLProvider"
import LoadingOverlay from "../LoadingOverlay"
import { AdminModelsList } from "./AdminShare/AdminModelsList"

export const Admin : React.FC = () => {
  const { getAllMySavedModels } = useContext(BQMLContext)
  const [ models, setModels ] = useState<any>([])
  const [ isLoading, setIsLoading ] = useState<boolean>(false)

  useEffect(() => {
    populateModels()
  }, [])

  const populateModels = async () => {
    setIsLoading(true)
    const { ok, value } = await getAllMySavedModels?.(true)
    if (!ok) {
      setIsLoading(false)
      return
    }
    setModels(value.data)
    setIsLoading(false)
  }

  return (
    <div>
      <LoadingOverlay isLoading={isLoading} />
      <h2>Model Admin</h2>
      <p>Share your models with other users.</p>
      { !isLoading && models.length <= 0 ? (
        <div className="admin-no-models">
          You do not have any saved models
        </div>
      ) : (
        <AdminModelsList models={models} />
      ) }
    </div>
  )
}
