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
    // TODO Deduplicate caching call here
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
      <h1 className="no-margin-top">Gain deeper insights with machine learning in BigQuery</h1>
      <div className="home-landing-grid">
        <div className="grid-item-large-left">
          <h3>Create New Models</h3>
          <p>
            The Create Model guide walks you through each step of the machine learning process.
          </p>
          <div className="home-page-bumper">
            <Button size="large" onClick={goToWizard} className="action-color" iconBefore={<Add />}>Create New Model</Button>
          </div>
        </div>
        <div className="grid-item-small-third-quarter">
          <h3>BigQuery ML in a minute</h3>
          <iframe
            className="home-landing--video"
            src="https://www.youtube.com/embed/0RMT8uEplbM"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
            allowFullScreen>
          </iframe>
        </div>
        <div className="grid-item-small-fourth-quarter">
          <h3 className="small-margin-bottom">Learn about BigQuery ML</h3>
          <ul className="home-landing--linklist">
            <li>
              <a href="https://cloud.google.com/bigquery-ml/docs/introduction" target="_blank">What is BigQuery ML</a>
            </li>
            <li>
              <a href="https://cloud.google.com/bigquery-ml/docs" target="_blank">BigQuery ML Docs</a>
            </li>
            <li>
              <a href="https://cloud.google.com/bigquery-ml/pricing" target="_blank">BigQuery ML Pricing</a>
            </li>
          </ul>
          <h3 className="small-margin-bottom">Machine Learning Training</h3>
          <ul className="home-landing--linklist">
            <li>
              <a href="https://developers.google.com/machine-learning/intro-to-ml" target="_blank">Introduction to Machine Learning</a>
            </li>
            <li>
              <a href="https://developers.google.com/machine-learning/problem-framing" target="_blank">Problem Framing</a>
            </li>
            <li>
              <a href="https://developers.google.com/machine-learning/data-prep" target="_blank">Data Prep</a>
            </li>
          </ul>
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
