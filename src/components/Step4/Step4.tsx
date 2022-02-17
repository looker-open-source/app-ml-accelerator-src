import React, { useContext, useEffect, useState } from 'react'
import withWizardStep from '../WizardStepHOC'
import StepContainer from '../StepContainer'
import { getWizardStepCompleteCallback } from '../../services/wizard'
import { useStore } from '../../contexts/StoreProvider'
import { ModelContext } from '../../contexts/ModelProvider'
import { JOB_STATUSES, WIZARD_STEPS } from '../../constants'
import { MODEL_TYPES } from '../../services/modelTypes'
import { Prompt } from 'react-router-dom'
import { ModelSidebar } from './ModelSiderbar'
import { ModelDataBody } from './ModelDataBody'
import { IncompleteJob } from './IncompleteJob'
import './Step4.scss'


const Step4: React.FC<{ stepComplete: boolean }> = ({ stepComplete }) => {
  const { stopPolling, getModelEvalFuncData } = useContext(ModelContext)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>('')
  const [evalData, setEvalData] = useState<any>()
  const { state } = useStore()
  const { needsSaving } = state.wizard
  const { jobStatus, modelInfo } = state.wizard.steps.step4
  const jobComplete = jobStatus === JOB_STATUSES.done
  const jobCanceled = jobStatus === JOB_STATUSES.canceled

  useEffect(() => {
    const MODEL_TYPE = MODEL_TYPES[modelInfo.bqModelObjective || '']
    const { modelTabs } = MODEL_TYPE
    if (
      !MODEL_TYPE ||
      modelTabs.indexOf(activeTab) >= 0
    ) { return }
    setActiveTab(modelTabs[0])
  }, [])

  useEffect(() => {
    if (
      !jobComplete ||
      !modelInfo.bqModelName ||
      !modelInfo.bqModelObjective ||
      !activeTab
    ) { return }
    setIsLoading(true)
    getModelEvalFuncData?.(
      modelInfo.bqModelObjective,
      activeTab,
      modelInfo.bqModelName
    ). then(({ value }) => {
      console.log({value})
      setEvalData(value.data)
    }).finally(() => setIsLoading(false))
  }, [jobComplete, activeTab])

  const onRouteChange = () => {
    stopPolling?.()
    return true
  }

  return (
    <StepContainer
      isLoading={isLoading}
      stepComplete={stepComplete}
      stepNumber={4}
      customClass="step4-container">
      <Prompt message={onRouteChange}/>
      { jobComplete && needsSaving && (
        <div className="minor-error">
          You have made changes that are not reflected in this model.  Return to the {WIZARD_STEPS['step3']} tab and `Update Model`.
        </div>
      )}
      <h2>Model evaluation overview</h2>
      <p className="step1-sub-details">Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.</p>

      { jobComplete?
        (
          <div className="model-grid">
            <div className="model-grid--sidebar">
              <ModelSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                bqModelObjective={modelInfo.bqModelObjective || ''}
              />
            </div>
            <div className="model-grid--body">
              { !isLoading && evalData &&
                <ModelDataBody evalData={evalData[0]} />
              }
            </div>
          </div>
        ) : (<IncompleteJob jobCanceled={jobCanceled} setIsLoading={setIsLoading}/>)
      }
    </StepContainer>
  )
}

export const WizardStep4 = withWizardStep({
  isStepComplete: getWizardStepCompleteCallback("step4"),
  stepNumber: 4
})(Step4)
