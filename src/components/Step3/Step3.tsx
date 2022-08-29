import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useStore } from "../../contexts/StoreProvider"
import { Select } from "@looker/components"
import withWizardStep from '../WizardStepHOC'
import StepContainer from '../StepContainer'
import { getWizardStepCompleteCallback } from '../../services/wizard'
import { buildFieldSelectOptions, hasSummaryForSourceData, hasTargetOrTimeColumnChange, needsModelUpdate } from '../../services/summary'
import { SummaryContext } from '../../contexts/SummaryProvider'
import { isArima, MODEL_TYPES } from '../../services/modelTypes'
import Summary from '../Summary'
import { GenerateSummaryButton } from './GenerateSummaryButton'
import { ModelNameBlock } from './ModelNameBlock'
import './Step3.scss'
import { OptionalParameters } from './OptionalParameters'
import AdvancedSettings from './AdvancedSettings'
import { ModelValidation } from './ModelValidation'
import { noDot } from '../../services/string'
import { JOB_STATUSES } from '../../constants'


const Step3: React.FC<{ stepComplete: boolean }> = ({ stepComplete }) => {
  const { createBQMLModel } = useContext(SummaryContext)
  const { modelNameParam } = useParams<any>()
  const { state, dispatch } = useStore()
  const [isLoading, setIsLoading] = useState(false)
  const [nameCheckStatus, setNameCheckStatus] = useState<string | undefined>()
  const [loadingNameStatus, setLoadingNameStatus] = useState<boolean>(false)
  const [isInvalid, setIsInvalid] = useState<boolean>(false)
  const { bqModel, wizard } = state
  const { step1, step2, step3 } = wizard.steps
  const { objective } = step1
  const { exploreData, exploreName, modelName, ranQuery } = step2
  const { jobStatus } = bqModel

  if (!exploreName || !modelName) {
    dispatch({type: 'addError', error: 'Something went wrong, please return to the previous step'})
    return null
  }

  const {
    summary,
    selectedFeatures,
    targetField,
    bqModelName,
    arimaTimeColumn,
    advancedSettings,
    inputData
  } = step3
  const arima = isArima(objective || "")
  const ranQueryFields = ranQuery?.selectedFields
  const sourceColumns = [...ranQueryFields?.dimensions || [], ...ranQueryFields?.measures || []]
  const sourceColumnsFormatted = sourceColumns.map((col) => noDot(col)).sort()
  const [targetFieldOptions, setTargetFieldOptions] = useState<any>()
  const [timeColumnFieldOptions, setTimeColumnFieldOptions] = useState<any>()

  useEffect(() => {
    const targetOptions = buildFieldSelectOptions(
      exploreData?.fieldDetails,
      sourceColumns,
      objective ? MODEL_TYPES[objective].targetDataType : null
    )
    setTargetFieldOptions(targetOptions)
    const arimaOptions = arima ? buildFieldSelectOptions(
      exploreData?.fieldDetails,
      sourceColumns,
      'date'
    ) : undefined
    setTimeColumnFieldOptions(arimaOptions)
    if (!fieldOptionExists(step3.targetField || '', targetOptions)) {
      updateStepData({ targetField: undefined })
    }
    if (!fieldOptionExists(step3.arimaTimeColumn || '', arimaOptions)) {
      updateStepData({ arimaTimeColumn: undefined })
    }
  }, [step2.ranQuery, step2.ranQuery?.sql])

  const fieldOptionExists = (target: string, options?: any[]) => (
    options ? options.filter((option) => option.value === target).length > 0 : false
  )

  const updateStepData = (data: any) => {
    dispatch({
      type: 'addToStepData',
      step: 'step3',
      data
    })
  }

  const handleTargetChange = (targetField: string) => {
    updateStepData({ targetField })
  }

  const handleTimeColumnChange = (arimaTimeColumn: string) => {
    updateStepData({ arimaTimeColumn })
  }

  const updateSelectedFeatures = (selectedFeatures: string[]) => {
    updateStepData({ selectedFeatures })
  }

  const createModel = async () => {
    const { ok } = await createBQMLModel?.(
      inputData.uid,
      objective,
      inputData.bqModelName,
      inputData.target,
      selectedFeatures,
      inputData.arimaTimeColumn,
      advancedSettings
    )
    setIsLoading(false)
    return { ok }
  }

  const targetTimeColumnChanged = () => (
    hasTargetOrTimeColumnChange(
      step3.inputData,
      step3.targetField,
      step3.arimaTimeColumn
    )
  )

  const summaryUpToDate = () => (
    hasSummaryForSourceData({
      inputData: step3.inputData,
      step3Data: step3,
      exploreName,
      modelName,
      bqModelName,
      sourceColumns: sourceColumnsFormatted,
      sourceFilters: ranQuery?.selectedFields.filters
    })
  )

  const modelNeedsUpdate = () => (
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

  const buildHandleCompleteClick = () => {
    if (modelNameParam && !modelNeedsUpdate()) {
      return
    }

    // passed into the stepComplete button to be executed
    // before redirect to the next step
    return async (): Promise<any> => {
      setIsLoading(true)
      const { ok } = await createModel()
      return { ok, data: { bqModelName } }
    }
  }

  const stepCompleteButtonText = () => (
    modelNameParam ?
      modelNeedsUpdate() ?
        "ReCreate Model" :
        "Continue" :
      "Create Model"
  )

  const buildOptionalParameters = () => {
    if (!objective) { return <></> }
    return MODEL_TYPES[objective].optionalParameters ? <OptionalParameters objective={objective}/> : <></>
  }

  const disableModelCreate = () => {
    if (stepCompleteButtonText() === "Continue") { return false }
    if (!jobStatus) { return false }
    return jobStatus === JOB_STATUSES.pending || jobStatus === JOB_STATUSES.running
  }

  return (
    <StepContainer
      isLoading={isLoading}
      isDisabled={disableModelCreate()}
      stepComplete={!isInvalid && stepComplete}
      stepNumber={3}
      buttonText={stepCompleteButtonText()}
      handleCompleteClick={buildHandleCompleteClick()}
      stepInfo={!isArima(objective || '') ? (<AdvancedSettings objective={objective}/>) : ''}
    >
      <h2>Select model target and features</h2>
      <div className="model-blocks">
        <ModelNameBlock
          nameCheckStatus={nameCheckStatus}
          setNameCheckStatus={setNameCheckStatus}
          loadingNameStatus={loadingNameStatus}
          setLoadingNameStatus={setLoadingNameStatus}
          disabled={!!modelNameParam || (!!summary.data && !!inputData.target) === true}
        />
        <div className="wizard-card">
          <h2>Select your target</h2>
          <Select
            options={targetFieldOptions}
            value={targetField}
            placeholder="Target"
            onChange={handleTargetChange}
            className="wizard-card-select"
          />
        </div>
        {
          arima &&
            (
              <div className="wizard-card">
                <h2>Select your Time Column</h2>
                <Select
                  options={timeColumnFieldOptions}
                  value={arimaTimeColumn}
                  placeholder="Time Column"
                  onChange={handleTimeColumnChange}
                  className="wizard-card-select"
                />
              </div>
            )
        }
        <div className="wizard-card">
          <h2>Data Summary Statistics</h2>
          <div className="summary-factoid">
            Columns: <span className="factoid-bold">{sourceColumns.length}</span>
          </div>
          <div className="summary-factoid">
            Rows: <span className="factoid-bold">{ranQuery?.rowCount || '???'}</span>
          </div>
          <GenerateSummaryButton
            setIsLoading={setIsLoading}
            loadingNameStatus={loadingNameStatus}
            nameCheckStatus={nameCheckStatus}
            summaryUpToDate={summaryUpToDate}
            targetTimeColumnChanged={targetTimeColumnChanged}
          />
        </div>
      </div>
      { buildOptionalParameters() }
      <ModelValidation
        setIsInvalid={setIsInvalid}
        data={summary.data}
        target={inputData.target}
        objective={objective}
      />
      { summary.data && inputData.target && 
        (
          <Summary
            targetField={inputData.target}
            arimaTimeColumn={inputData.arimaTimeColumn}
            summaryData={summary.data}
            selectedFeatures={selectedFeatures || []}
            updateSelectedFeatures={updateSelectedFeatures} 
            stepNumber={3} />
        )
      }
    </StepContainer>
  )
}

export const WizardStep3 = withWizardStep({
  isStepComplete: getWizardStepCompleteCallback("step3"),
  stepNumber: 3
})(Step3)
