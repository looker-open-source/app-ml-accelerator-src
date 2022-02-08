import React, { useEffect, useContext, useState } from 'react'
import { useStore } from "../../contexts/StoreProvider"
import { FieldText, Select } from "@looker/components"
import withWizardStep from '../WizardStepHOC'
import StepContainer from '../StepContainer'
import { getWizardStepCompleteCallback } from '../../services/wizard'
import { hasSummaryData, renameSummaryDataKeys, buildFieldSelectOptions } from '../../services/summary'
import { SummaryContext } from '../../contexts/SummaryProvider'
import Summary from '../Summary'
import './Step3.scss'
import { wizardInitialState } from '../../reducers/wizard'
import { isArima, MODEL_TYPES } from '../../services/modelTypes'
import { JOB_STATUSES } from '../../constants'

const Step3: React.FC<{ stepComplete: boolean }> = ({ stepComplete }) => {
  const { getSummaryData, createBQMLModel } = useContext(SummaryContext)
  const { state, dispatch } = useStore()
  const [isLoading, setIsLoading] = useState(true)
  const { objective } = state.wizard.steps.step1
  const { exploreData, exploreName, modelName, ranQuery } = state.wizard.steps.step2
  const {
    summary,
    selectedFields,
    targetField,
    bqModelName,
    arimaTimeColumn
  } = state.wizard.steps.step3
  const arima = isArima(objective || "")
  const columnCount = [...ranQuery?.dimensions || [], ...ranQuery?.measures || []].length
  const targetFieldOptions = buildFieldSelectOptions(
    exploreData?.fieldDetails,
    [...(ranQuery?.dimensions || []), ...(ranQuery?.measures || [])],
    objective ? MODEL_TYPES[objective].targetDataType : null
  )
  const timeColumnFieldOptions = arima ? buildFieldSelectOptions(
    exploreData?.fieldDetails,
    [...(ranQuery?.dimensions || []), ...(ranQuery?.measures || [])],
    'date'
  ) : null

  if (!exploreName || !modelName) {
    dispatch({type: 'addError', error: 'Something went wrong, please return to the previous step'})
    return null
  }

  useEffect(() => {
    if (
      !targetField ||
      !bqModelName ||
      hasSummaryData(summary, exploreName, modelName, targetField)
    ) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    fetchSummary().finally(() => setIsLoading(false))
  }, [exploreName, targetField])

  const fetchSummary = async () => {
    const { ok, value } = await getSummaryData?.(ranQuery?.sql, bqModelName, targetField)
    if (!ok || !value) {
      return
    }

    const fields = (value.fields || {})
    const summaryData = renameSummaryDataKeys(value.data)
    updateStepData({
      selectedFields: summaryData.map((d: any) => d["column_name"]),
      summary: {
        exploreName,
        modelName,
        target: targetField,
        data: summaryData,
        fields: [...fields.dimensions, ...fields.measures]
      }
    })
  }

  const updateStepData = (data: any) => {
    dispatch({
      type: 'addToStepData',
      step: 'step3',
      data
    })
  }

  const handleModelNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    updateStepData({
      bqModelName: e.target.value,
      targetField: '',
      summary: wizardInitialState.steps.step3.summary
    })
  }

  const handleTargetChange = (targetField: string) => {
    updateStepData({ targetField })
  }

  const handleTimeColumnChange = (arimaTimeColumn: string) => {
    updateStepData({ arimaTimeColumn })
  }

  const updateSelectedFields = (selectedFields: string[]) => {
    updateStepData({ selectedFields })
  }

  const alphaNumericOnly = (e: any) => {
    const re = /[0-9a-zA-Z_]+/g;
    if (!re.test(e.key)) {
      e.preventDefault();
    }
  }

  async function createModel() {
    const { ok, body } = await createBQMLModel?.(
      objective,
      bqModelName,
      targetField,
      arimaTimeColumn
    )

    dispatch({
      type: 'addToStepData',
      step: 'step4',
      data: {
        jobStatus: ok ? JOB_STATUSES.pending : "FAILED",
        job: ok ? body.jobReference : null
      }
    })
  }

  const handleCompleteClick = () => {
    createModel()
  }

  return (
    <StepContainer
      isLoading={isLoading}
      stepComplete={stepComplete}
      stepNumber={3}
      buttonText="Create Model"
      handleCompleteClick={handleCompleteClick}
    >
      <div className="model-blocks">
        <div className="wizard-card">
          <h2>Name your model</h2>
          <p>Ceserunt met minim mollit non des erunt ullamco est sit aliqua dolor.</p>
          <FieldText
            onChange={handleModelNameChange}
            value={bqModelName}
            placeholder="Model_Name"
            onKeyPress={alphaNumericOnly}
          />
        </div>
        <div className="wizard-card">
          <h2>Select your target</h2>
          <p>Ceserunt met minim mollit non des erunt ullamco est sit aliqua dolor.</p>
          <Select
            options={targetFieldOptions}
            value={targetField}
            placeholder="Target"
            onChange={handleTargetChange}
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
                />
              </div>
            )
        }
        <div className="wizard-card">
          <h2>Data Summary Statistics</h2>
          <div className="summary-factoid">
            Columns: <span className="factoid-bold">{columnCount}</span>
          </div>
          <div className="summary-factoid">
            Rows: <span className="factoid-bold">{ranQuery?.data?.length}</span>
          </div>
        </div>
      </div>
      { summary.data &&
        (
          <Summary
            summaryData={summary.data}
            fields={summary.fields || []}
            selectedFields={selectedFields || []}
            updateSelectedFields={updateSelectedFields} />
        )
      }
    </StepContainer>
  )
}

export const WizardStep3 = withWizardStep({
  isStepComplete: getWizardStepCompleteCallback("step3"),
  stepNumber: 3
})(Step3)
