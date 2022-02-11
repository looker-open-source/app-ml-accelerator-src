import React, { useEffect, useContext, useState, useRef } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useStore } from "../../contexts/StoreProvider"
import { FieldText, Select } from "@looker/components"
import withWizardStep from '../WizardStepHOC'
import StepContainer from '../StepContainer'
import { getWizardStepCompleteCallback } from '../../services/wizard'
import { hasSummaryData, buildFieldSelectOptions } from '../../services/summary'
import { SummaryContext } from '../../contexts/SummaryProvider'
import Summary from '../Summary'
import './Step3.scss'
import { wizardInitialState } from '../../reducers/wizard'
import { isArima, MODEL_TYPES } from '../../services/modelTypes'
import { JOB_STATUSES, WIZARD_STEPS } from '../../constants'


const Step3: React.FC<{ stepComplete: boolean }> = ({ stepComplete }) => {
  const history = useHistory()
  const { getSummaryData, createBQMLModel } = useContext(SummaryContext)
  const { modelNameParam } = useParams<any>()
  const { state, dispatch } = useStore()
  const [isLoading, setIsLoading] = useState(false)
  const { needsSaving } = state.wizard
  const { objective } = state.wizard.steps.step1
  const { exploreData, exploreName, modelName, ranQuery } = state.wizard.steps.step2

  if (!exploreName || !modelName) {
    dispatch({type: 'addError', error: 'Something went wrong, please return to the previous step'})
    return null
  }

  const {
    summary,
    selectedFields,
    targetField,
    bqModelName,
    arimaTimeColumn
  } = state.wizard.steps.step3
  const arima = isArima(objective || "")
  const sourceColumns = [...ranQuery?.dimensions || [], ...ranQuery?.measures || []]
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
  const firstUpdate = useRef(true)

  useEffect(() => {
    // don't run on component mount
    if(firstUpdate.current) {
      firstUpdate.current = false
      return
    }

    if (
      !targetField ||
      !bqModelName ||
      hasSummaryData(summary, exploreName, modelName, targetField)
    ) {
      return
    }

    setIsLoading(true)
    getSummaryData?.(ranQuery?.sql, bqModelName, targetField)
      .finally(() => setIsLoading(false))
  }, [exploreName, targetField])

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
      summary: {...wizardInitialState.steps.step3.summary}
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

  const createModel = async () => {
    const { ok, body } = await createBQMLModel?.(
      objective,
      bqModelName,
      targetField,
      arimaTimeColumn
    )

    if (!ok) {
      setIsLoading(false)
      return { ok }
    }

    dispatch({
      type: 'addToStepData',
      step: 'step4',
      data: {
        jobStatus: JOB_STATUSES.pending,
        job: body.jobReference
      }
    })
    return { ok }
  }

  const handleCompleteClick = async (): Promise<any> => {
    if (!needsSaving) { return true }
    setIsLoading(true)
    const { ok } = await createModel()
    return { ok, data: { bqModelName } }
  }

  const stepCompleteButtonText = () => (
    modelNameParam ?
      needsSaving ?
        "Update Model" :
        "Continue" :
      "Create Model"
  )

  return (
    <StepContainer
      isLoading={isLoading}
      stepComplete={stepComplete}
      stepNumber={3}
      buttonText={stepCompleteButtonText()}
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
            disabled={!!modelNameParam}
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
            Columns: <span className="factoid-bold">{sourceColumns.length}</span>
          </div>
          <div className="summary-factoid">
            Rows: <span className="factoid-bold">{ranQuery?.rowCount || '???'}</span>
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
