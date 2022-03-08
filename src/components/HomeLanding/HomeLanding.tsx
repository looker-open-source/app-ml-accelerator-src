import { Select } from "@looker/components"
import React, { useContext, useEffect, useState } from "react"
import { Link, useHistory } from "react-router-dom"
import { WIZARD_STEPS } from "../../constants"
import { BQMLContext } from "../../contexts/BQMLProvider"
import { useStore } from "../../contexts/StoreProvider"
import { buildModelListOptions, filterModelListOptions } from "../../services/modelList"
import './HomeLanding.scss'

export const HomeLanding : React.FC = () => {
  const history = useHistory()
  const { state, dispatch } = useStore()
  const [ savedModels, setSavedModels ] = useState<any[]>([])
  const [ filteredModels, setFilteredModels ] = useState<any[]>([])
  const [ loadingModels, setLoadingModels ] = useState<boolean>(false)
  const [ filterSearchTerm, setFilterSearchTerm ] = useState("")
  const { getAllAccessibleSavedModels } = useContext(BQMLContext)
  const { firstName, email } = state.user

  useEffect(() => {
    populateSavedModels()
  }, [])

  const populateSavedModels = async () => {
    setLoadingModels(true)
    const { ok, value } = await getAllAccessibleSavedModels?.(true)
    if (!ok) {
      setLoadingModels(false)
      return
    }

    const modelListOptions = buildModelListOptions(value.data, email || "")

    setSavedModels([...modelListOptions])
    setFilteredModels([...modelListOptions])
    setLoadingModels(false)
  }

  useEffect(() => {
    if (!filterSearchTerm) {
      setFilteredModels([...savedModels])
    }
    const newFilteredModels = filterModelListOptions([...savedModels], filterSearchTerm)
    setFilteredModels(newFilteredModels)
  }, [filterSearchTerm])

  const handleModelSelect = async (modelName: string) => {
    history.push(`/ml/${modelName}/${WIZARD_STEPS['step4']}`)
  }

  const clearState = () => {
    dispatch({ type: 'clearState' })
  }

  return (
    <div className="home-landing-container">
      <h1 className="no-margin-top">Welcome back {firstName ? `, ${firstName}` : '' }</h1>
      <div className="home-landing-grid">
        <div className="grid-item-large-left">
          <p>
            Role-based intro message aliquam pulvinar vestibulum blandit. Donec sed nisl libero. Fusce dignissim luctus sem eu dapibus. Pellentesque vulputate quam a quam volutpat, sed ullamcorper erat commodo. Vestibulum sit amet ipsum vitae mauris mattis vulputate lacinia nec neque. Aenean quis consectetur nisi, ac interdum elit. Aliquam sit amet luctus elit, id tempus purus. Fusce dignissim luctus sem eu dapibus. Pellentesque vulputate quam a quam volutpat.
          </p>
        </div>
        <div className="grid-item-small-right">
          <label>Select a Model</label>
          <Select
            options={filteredModels}
            placeholder="View/Edit a Model"
            onChange={handleModelSelect}
            isLoading={loadingModels}
            value={filterSearchTerm}
            onFilter={setFilterSearchTerm}
            isFilterable
          />
        </div>
      </div>
      <h1>Get Started</h1>
      <div className="home-landing-grid">
        <div className="grid-item-small-left">
          <h3>Create New Models</h3>
          <p>
            Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit.
          </p>
          <Link to="/ml" onClick={clearState}>Create New Model</Link>
        </div>
        <div className="grid-item-large-right">
          <h3>Use existing models</h3>
          <p>
            Aliquam pulvinar vestibulum blandit. Donec sed nisl libero. Fusce dignissim luctus sem eu dapibus. Pellentesque vulputate quam a quam volutpat, sed ullamcorper erat commodo. Vestibulum sit amet ipsum vitae mauris mattis vulputate lacinia nec neque. Aenean quis consectetur nisi, ac interdum elit. Aliquam sit amet luctus elit, id tempus purus.
          </p>
        </div>
      </div>
    </div>
  )
}
