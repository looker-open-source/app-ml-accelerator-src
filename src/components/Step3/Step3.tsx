import React, { useEffect, useContext, useState } from 'react'
import { useStore } from "../../contexts/StoreProvider"
import { FieldText, Select } from "@looker/components"
import './Step3.scss'
import withWizardStep from '../WizardStepHOC'
import StepContainer from '../StepContainer'
import { getWizardStepCompleteCallback } from '../../services/wizard'
import { hasSummaryData, renameSummaryDataKeys, buildFieldSelectOptions } from '../../services/summary'
import { SummaryContext } from '../../contexts/SummaryProvider'
import Summary from '../Summary'

const Step3: React.FC<{ stepComplete: boolean }> = ({ stepComplete }) => {
  const { getSummaryData } = useContext(SummaryContext)
  const { state, dispatch } = useStore()
  const [isLoading, setIsLoading] = useState(true)
  const { exploreData, exploreName, modelName, ranQuery } = state.wizard.steps.step2
  const { summary, selectedFields, targetField, bqModelName } = state.wizard.steps.step3
  const targetFieldOptions = buildFieldSelectOptions(
    exploreData?.fieldDetails,
    [...(ranQuery?.dimensions || []), ...(ranQuery?.measures || [])]
  )

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
      dispatch({ type: 'addError', error: "Failed to fetch summary data." })
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
    updateStepData({ bqModelName: e.target.value })
  }

  const handleTargetChange = (targetField: string) => {
    updateStepData({ targetField })
  }

  const updateSelectedFields = (selectedFields: string[]) => {
    updateStepData({ selectedFields })
  }

  const alphaNumericOnly = (e: any) => {
    const re = /[0-9a-zA-Z ]+/g;
    if (!re.test(e.key)) {
      e.preventDefault();
    }
  }

  return (
    <StepContainer isLoading={isLoading} stepComplete={stepComplete} stepNumber={3}>
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
            placeholder="Target"
            onChange={handleTargetChange}
          />
        </div>
        <div className="wizard-card">
          <h2>Data Summary Statistics</h2>
          <p>Ceserunt met minim mollit non des erunt ullamco est sit aliqua dolor.</p>
        </div>
      </div>
      <div>
        { summary.data &&
          (<Summary
            summaryData={summary.data}
            fields={summary.fields || []}
            selectedFields={selectedFields || []}
            updateSelectedFields={updateSelectedFields} />)
        }
      </div>
    </StepContainer>
  )
}

export const WizardStep3 = withWizardStep({
  isStepComplete: getWizardStepCompleteCallback("step3"),
  stepNumber: 3
})(Step3)
