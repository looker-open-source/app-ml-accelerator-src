import React, { useContext, useEffect, useState } from "react"
import { Button } from "@looker/components"
import { Add } from "@styled-icons/material"
import { useHistory } from "react-router-dom"
import { AdminContext } from "../../contexts/AdminProvider"
import { useStore } from "../../contexts/StoreProvider"
import { BrowseModels } from "../BrowseModels/BrowseModels"
import './HomeLanding.scss'

export const HomeLanding : React.FC = () => {
  const history = useHistory()
  const { state, dispatch } = useStore()
  const [ myModels, setMyModels ] = useState<any[]>([])
  const [ myModelPages, setMyModelPages ] = useState<number>(1)
  const [ sharedModels, setSharedModels ] = useState<any[]>([])
  const [ sharedModelPages, setSharedModelPages ] = useState<number>(1)
  const [ loadingSharedModels, setLoadingSharedModels ] = useState<boolean>(false)
  const [ loadingMyModels, setLoadingMyModels ] = useState<boolean>(false)
  const { getSharedModels, getMyModels } = useContext(AdminContext)
  const { firstName } = state.user

  useEffect(() => {
    fetchMyModels()
    fetchSharedModels()
  }, [])

  const fetchSharedModels = async () => {
    setLoadingSharedModels(true)
    const { ok, data, pages } = await getSharedModels?.()
    if (!ok) {
      setLoadingSharedModels(false)
      return
    }
    setSharedModels([...data])
    setSharedModelPages(pages)
    setLoadingSharedModels(false)
  }

  const fetchMyModels = async () => {
    setLoadingMyModels(true)
    const { ok, data, pages } = await getMyModels?.()
    if (!ok) {
      setLoadingMyModels(false)
      return
    }
    setMyModels([...data])
    setMyModelPages(pages)
    setLoadingMyModels(false)
  }

  const goToWizard = () => {
    dispatch({ type: 'clearState' })
    history.push('/ml')
  }

  return (
    <div className="home-landing-container">
      <div className="home-landing-grid">
        <div className="grid-item-large-left">
          <h1 className="no-margin-top">Gain deeper insights with machine learning in BigQuery</h1>
          <div className="home-page-bumper">
            <h3>Create New Models</h3>
            <p>
              The Create Model guide walks you through each step of the machine learning process.
            </p>
            <div className="home-landing-model-select">
              <Button size="large" onClick={goToWizard} className="action-color" iconBefore={<Add />}>Create New Model</Button>
            </div>
          </div>
        </div>
        <div className="grid-item-small-right">
        </div>
      </div>
      {/* <h1>Get Started</h1> */}
      <div className="home-page-bumper">
        <div>
          <h3>Use existing models</h3>
          <div className="home-landing-model-select">
            <h5>My Models</h5>
            <BrowseModels models={myModels} loadingModels={loadingMyModels} totalPages={myModelPages}/>
            <h5>Models Shared With Me</h5>
            <BrowseModels models={sharedModels} loadingModels={loadingSharedModels} totalPages={sharedModelPages} isShared={true}/>
          </div>
        </div>
      </div>
    </div>
  )
}
