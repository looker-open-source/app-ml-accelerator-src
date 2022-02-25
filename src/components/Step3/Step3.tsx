import React, { useContext, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useStore } from "../../contexts/StoreProvider"
import { Select } from "@looker/components"
import withWizardStep from '../WizardStepHOC'
import StepContainer from '../StepContainer'
import { getWizardStepCompleteCallback } from '../../services/wizard'
import { buildFieldSelectOptions, hasSummaryData } from '../../services/summary'
import { SummaryContext } from '../../contexts/SummaryProvider'
import { isArima, MODEL_TYPES } from '../../services/modelTypes'
import Summary from '../Summary'
import { GenerateSummaryButton } from './GenerateSummaryButton'
import { ModelNameBlock } from './ModelNameBlock'
import './Step3.scss'
import { AdvancedSettings } from './AdvancedSettings'


const Step3: React.FC<{ stepComplete: boolean }> = ({ stepComplete }) => {
  const { createBQMLModel } = useContext(SummaryContext)
  const { modelNameParam } = useParams<any>()
  const { state, dispatch } = useStore()
  const [isLoading, setIsLoading] = useState(false)
  const [nameCheckStatus, setNameCheckStatus] = useState<string | undefined>()
  const [loadingNameStatus, setLoadingNameStatus] = useState<boolean>(false)
  const { needsSaving } = state.wizard
  const { step1, step2, step3 } = state.wizard.steps
  const { objective } = step1
  const { exploreData, exploreName, modelName, ranQuery } = step2

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
    advancedSettings
  } = step3
  const arima = isArima(objective || "")
  const sourceColumns = [...ranQuery?.dimensions || [], ...ranQuery?.measures || []]
  const sourceColumnsFormatted = sourceColumns.map((col) => col.replace(/\./g, '_')).sort()
  const targetFieldOptions = buildFieldSelectOptions(
    exploreData?.fieldDetails,
    sourceColumns,
    objective ? MODEL_TYPES[objective].targetDataType : null
  )
  const timeColumnFieldOptions = arima ? buildFieldSelectOptions(
    exploreData?.fieldDetails,
    sourceColumns,
    'date'
  ) : null

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
      objective,
      bqModelName,
      targetField,
      selectedFeatures,
      arimaTimeColumn,
      advancedSettings
    )
    setIsLoading(false)
    return { ok }
  }

  const summaryUpToDate = () => (
    hasSummaryData(
      step3,
      exploreName,
      modelName,
      targetField || '',
      bqModelName,
      advancedSettings,
      sourceColumnsFormatted
    )
  )

  const buildHandleCompleteClick = () => {
    if (modelNameParam) {
      if (
        !needsSaving ||
        (needsSaving && !summaryUpToDate())
      ) { return }
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
      needsSaving && summaryUpToDate()?
        "ReCreate Model" :
        "Continue" :
      "Create Model"
  )

  const buildAdvancedSettings = () => {
    if (!objective) { return <></> }
    return MODEL_TYPES[objective].advancedSettings ? <AdvancedSettings objective={objective}/> : <></>
  }

  return (
    <StepContainer
      isLoading={isLoading}
      stepComplete={stepComplete}
      stepNumber={3}
      buttonText={stepCompleteButtonText()}
      handleCompleteClick={buildHandleCompleteClick()}
    >
      <div className="model-blocks">
        <ModelNameBlock
          nameCheckStatus={nameCheckStatus}
          setNameCheckStatus={setNameCheckStatus}
          loadingNameStatus={loadingNameStatus}
          setLoadingNameStatus={setLoadingNameStatus}
          disabled={!!modelNameParam}
        />
        <div className="wizard-card">
          <h2>Select your target</h2>
          <p>Ceserunt met minim mollit non des erunt ullamco est sit aliqua dolor.</p>
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
                <p>Ceserunt met minim mollit non des erunt ullamco est sit aliqua dolor.</p>
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
          />
        </div>
      </div>
      { buildAdvancedSettings() }
      { summary.data && summary.target &&
        (
          <Summary
            targetField={summary.target}
            arimaTimeColumn={summary.arimaTimeColumn}
            summaryData={summary.data}
            selectedFeatures={selectedFeatures || []}
            updateSelectedFeatures={updateSelectedFeatures} />
        )
      }
    </StepContainer>
  )
}

export const WizardStep3 = withWizardStep({
  isStepComplete: getWizardStepCompleteCallback("step3"),
  stepNumber: 3
})(Step3)
