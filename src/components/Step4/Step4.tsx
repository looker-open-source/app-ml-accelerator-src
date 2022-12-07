import React, { useContext, useEffect, useState } from 'react'
import withWizardStep from '../WizardStepHOC'
import StepContainer from '../StepContainer'
import { getWizardStepCompleteCallback } from '../../services/wizard'
import { useStore } from '../../contexts/StoreProvider'
import { ModelContext } from '../../contexts/ModelProvider'
import { JOB_STATUSES, WIZARD_STEPS } from '../../constants'
import { MODEL_TYPES } from '../../services/modelTypes'
import { Prompt } from 'react-router-dom'
import { ModelSidebar } from './ModelSidebar'
import { ModelDataBody } from './ModelDataBody'
import { IncompleteJob } from './IncompleteJob'
import BinaryClassifierThreshold from '../BinaryClassifierThreshold'
import { titilize } from '../../services/string'
import { needsModelUpdate } from '../../services/summary'
import './Step4.scss'
import { WizardContext } from '../../contexts/WizardProvider'

const Step4: React.FC<{ stepComplete: boolean }> = ({ stepComplete }) => {
  const { stopPolling, getModelEvalFuncData } = useContext(ModelContext)
  const { persistModelState } = useContext(WizardContext)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>('')
  const [jobComplete, setJobComplete] = useState<any>()
  const [jobCanceled, setJobCanceled] = useState<any>()
  const { state, dispatch } = useStore()
  const { step1, step3, step4, step5 } = state.wizard.steps
  const { jobStatus, job } = state.bqModel
  const { threshold: uiThreshold } = step5.predictSettings
  const {wizard, bqModel} = state

  useEffect(() => {
    if (!bqModel.objective) { return }
    const MODEL_TYPE = MODEL_TYPES[bqModel.objective]
    if (MODEL_TYPE) {
      const modelTabs = MODEL_TYPE.modelTabs(bqModel.binaryClassifier)
      if (!activeTab || modelTabs.indexOf(activeTab) < 0) {
        setActiveTab(modelTabs[0])
      }
    }
  }, [])

  useEffect(() => {
    setJobComplete(jobStatus === JOB_STATUSES.done)
    setJobCanceled(jobStatus === JOB_STATUSES.canceled || jobStatus === JOB_STATUSES.failed)
    const persistState = async () => {
      await persistModelState?.(
        {
          wizardState: wizard,
          bqModel: bqModel,
          isModelCreate: false,
          isModelUpdate: false
        }).then(() => {
          dispatch({type: 'setUnsavedState', value: false})
        })
      }
    // Second persist with the finished Job state once the sql finishes executing and the promise inside createBQMLModel resolves
    if (jobStatus && [JOB_STATUSES.done, JOB_STATUSES.canceled, JOB_STATUSES.failed].includes(jobStatus)) {
      persistState()
    }

  }, [jobStatus])

  useEffect(() => {
    if (activeTab === 'explain') { return }
    fetchModelData()
  }, [jobComplete, activeTab, uiThreshold])

  const fetchModelData = async () => {
    const tabEvalData = step4.evaluateData[activeTab]
    if (
      !jobComplete ||
      !activeTab ||
      hasEvalDataForTab(tabEvalData)
    ) { return }

    setIsLoading(true)
    await getModelEvalFuncData?.(activeTab)
    setIsLoading(false)
  }

  const hasEvalDataForTab = (tabEvalData: any) => (
    tabEvalData && tabEvalData.data.rows?.length > 0 && !thresholdChanged(tabEvalData)
  )

  const thresholdChanged = (tabEvalData: any) => (
    tabEvalData && tabEvalData.threshold !== uiThreshold
  )

  const onRouteChange = () => {
    stopPolling?.()
    return true
  }

  const needsUpdate = () => (
    needsModelUpdate({
      bqModel,
      uiInputDataUID: step3.inputData.uid,
      uiAdvancedSettings: step3.advancedSettings,
      uiObjective: step1.objective,
      uiFeatures: step3.selectedFeatures,
      uiTarget: step3.targetField,
      uiArimaTimeColumn: step3.arimaTimeColumn
    })
  )

  const modelChangesMsg = () => {
    if (jobComplete && needsUpdate()) {
      return (
        <div className="minor-error">
          You have made changes that are not reflected in this model.  Return to the {titilize(WIZARD_STEPS['step3'])} tab and 'Recreate Model'.
        </div>
      )
    }
    return <></>
  }


  return (
    <StepContainer
      isLoading={isLoading}
      stepComplete={stepComplete}
      stepNumber={4}
      customClass="step4-container">
      <Prompt message={onRouteChange}/>
      { modelChangesMsg() }
      <h2>Review evaluation metrics and feature importance</h2>
      { jobComplete?
        (
          <div className="model-grid">
            <div className="model-grid--sidebar">
              <ModelSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                bqModel={bqModel}
              />
            </div>
            <div className="model-grid--body">
              { !isLoading && activeTab &&
                <ModelDataBody activeTab={activeTab} />
              }
            </div>
          </div>
        ) : (
          <div className="flex-center">
            <IncompleteJob jobCanceled={jobCanceled} setIsLoading={setIsLoading} startTime={job.startTime}/>
          </div>
        )
      }
    </StepContainer>
  )
}

export const WizardStep4 = withWizardStep({
  isStepComplete: getWizardStepCompleteCallback("step4"),
  stepNumber: 4
})(Step4)
