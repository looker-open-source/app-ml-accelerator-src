import React, { useEffect, useContext, useState } from 'react'
import { useStore } from "../../contexts/StoreProvider"
import { ExtensionContext } from "@looker/extension-sdk-react"
import { FieldText, Select } from "@looker/components"
import './Step3.scss'
import withWizardStep from '../WizardStepHOC'
import StepContainer from '../StepContainer'
import { getWizardStepCompleteCallback } from '../../services/wizard'
import { getSummaryData, hasSummaryData, renameSummaryDataKeys } from '../../services/summary'
import Summary from '../Summary'


const Step3: React.FC<{ stepComplete: boolean }> = ({ stepComplete }) => {
  const { core40SDK: sdk } = useContext(ExtensionContext);
  const { state, dispatch } = useStore()
  const [isLoading, setIsLoading] = useState(true)
  const [textInput, setTextInput] = useState("")
  const { exploreName, modelName } = state.wizard.steps.step2
  const { summary, selectedFields } = state.wizard.steps.step3

  useEffect(() => {
    if (hasSummaryData(summary, exploreName, modelName)) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    getSummaryData(sdk)
      .then((results) => {
        if (results?.ok && results?.value) {
          const fields = (results.value.fields || {})
          const summaryData = renameSummaryDataKeys(results.value.data)
          dispatch({
            type: 'addToStepData',
            step: 'step3',
            data: {
              selectedFields: summaryData.map((d) => d["column_name"]),
              summary: {
                exploreName,
                modelName,
                data: summaryData,
                fields: [...fields.dimensions, ...fields.measures]
              }
            }
          })
        } else {
          setError()
        }
      }).catch((err: string) => {
        setError(err)
      }).finally(() => setIsLoading(false))
  }, [exploreName])

  const setError = (err?: string) => {
    const errString = "Failed to fetch summary data."
    dispatch({
      type: 'addError',
      error: err ? `"${err}" - ${errString}` : errString
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newTextValue = e.target.value
    setTextInput(newTextValue)
  }

  const updateSelectedFields = (selectedFields) => {
    dispatch({
      type: 'addToStepData',
      step: 'step3',
      data: {
        selectedFields
      }
    })
  }

  return (
    <StepContainer isLoading={isLoading} stepComplete={stepComplete} stepNumber={3}>
      <div className="model-blocks">
        <div className="wizard-card">
          <h2>Name your model</h2>
          <p>Ceserunt met minim mollit non des erunt ullamco est sit aliqua dolor.</p>
          <FieldText
            onChange={handleChange}
            value={textInput}
            placeholder="Model_Name"
          />
        </div>
        <div className="wizard-card">
          <h2>Select your target</h2>
          <p>Ceserunt met minim mollit non des erunt ullamco est sit aliqua dolor.</p>
          <Select
            options={[{value: "hi", label: "Hi"}]}
            placeholder="Target"
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
            fields={summary.fields}
            selectedFields={selectedFields}
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
