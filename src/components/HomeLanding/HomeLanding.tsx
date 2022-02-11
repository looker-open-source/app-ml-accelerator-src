import { Select } from "@looker/components"
import React, { useContext, useEffect, useState } from "react"
import { Link, useHistory } from "react-router-dom"
import { MODEL_STATE_TABLE_COLUMNS, WIZARD_STEPS } from "../../constants"
import { BQMLContext } from "../../contexts/BQMLProvider"
import './HomeLanding.scss'

export const HomeLanding : React.FC = () => {
  const history = useHistory()
  const [ savedModels, setSavedModels ] = useState<any[]>()
  const [ loadingModels, setLoadingModels ] = useState<boolean>()
  const { getAllSavedModels } = useContext(BQMLContext)

  useEffect(() => {
    populateSavedModels()
  }, [])

  const populateSavedModels = async () => {
    setLoadingModels(true)
    const { ok, value } = await getAllSavedModels?.()
    if (!ok) { return }
    const bqModelNameList = value.data.map((record: any) =>
      record[MODEL_STATE_TABLE_COLUMNS.modelName]?.value
    )
    setSavedModels(bqModelNameList)
    setLoadingModels(false)
  }

  const handleModelSelect = async (modelName: string) => {
    history.push(`/ml/${WIZARD_STEPS['step4']}/${modelName}`)
  }

  return (
    <div className="home-landing-container">
      Home
      <Link to="/ml">ML</Link>
      <Select
        options={savedModels?.map((model) => ({ value: model, label: model }))}
        placeholder="View/Edit a Model"
        onChange={handleModelSelect}
        isLoading={loadingModels}
      />
    </div>
  )
}
