import React, { useEffect, useState } from 'react'
import { useStore } from '../../../contexts/StoreProvider'
import { FieldText, IconButton, Label, Select } from '@looker/components'
import { arrayToSelectOptions, floatOnly } from '../../../services/common'
import { removeExactMatches } from '../../../services/array'
import { Add, Delete } from '@styled-icons/material'

type ClassWeightsProps = {
  form: any,
  setForm: (form: any) => void
}

export const ClassWeights: React.FC<ClassWeightsProps> = ({ form, setForm }) => {
  const { state } = useStore()
  const [features, setFeatures] = useState([])
  const [allFeatures, setAllFeatures] = useState([])

  useEffect(() => {
    const target = state.wizard.steps.step3.inputData.target;
    const data = state?.wizard?.steps?.step2?.ranQuery?.data ? state.wizard.steps.step2.ranQuery.data : [];
    const filteredData = data.map((int: any) => int[`${target}`].value);
    const uniqueFilteredData = [...new Set(filteredData)];
    setFeatures(uniqueFilteredData)
    setAllFeatures(uniqueFilteredData)
  }, [state]);

  if (!allFeatures || allFeatures.length <= 0) {
    return (
      <div className="advanced-settings-class-weights">
        <div>Class Weights</div>
        <div className="small-text" style={{ color: 'grey' }}>You must generate a summary of your input data before setting class weights. Exit the Advanced Options modal and click Generate Summary.</div>
      </div>
    )
  }

  const handleTextChange = (e: any, column: string) => {
    const value = e.target.value
    setForm({
      ...form,
      class_weights: {
        ...form.class_weights,
        [column]: value
      }
    })
  }

  const handleSelectChange = (newColumn: string, column: string) => {
    const classWeights = { ...form.class_weights }
    const weightValue = classWeights[column]
    const { [column]: removedColumn, ...classWeightsWithoutColumn } = classWeights

    setForm({
      ...form,
      class_weights: {
        ...classWeightsWithoutColumn,
        [newColumn]: weightValue
      }
    })

    const newFeatures = removeExactMatches([...features], newColumn)
    if (column) {
      setFeatures([...newFeatures, column])
    } else {
      setFeatures([...newFeatures])
    }
  }

  const handleAdd = (e: any) => {
    e.preventDefault()
    setForm({
      ...form,
      class_weights: {
        ...form.class_weights,
        ['']: ''
      }
    })
  }

  const handleRemove = (column: string) => {
    const { [column]: removedColumn, ...classWeightsWithoutColumn } = classWeights
    setForm({
      ...form,
      class_weights: {
        ...classWeightsWithoutColumn
      }
    })
    if (column && features.includes(column)) {
      setFeatures([...features, column])
    }
  }

  const classWeights = Object.keys(form.class_weights).length <= 0 ? { ['']: '' } : form.class_weights
  return (
    <div className="advanced-settings-class-weights">
      <h3>Class Weights</h3>
      <div className="form-row" style={{ fontSize: '12px', color: 'grey' }}>
        {'A weight must be set for every class label. The weights are not required to add up to one.'}
      </div>
      {
        (Object.keys(classWeights)).map((column, i) => (
          <div className="form-row" key={i}>
            <div className="form-row--item">
              <Label>
                Column
              </Label>
              <Select
                options={arrayToSelectOptions(features)}
                value={column}
                onChange={(value: string) => handleSelectChange(value, column)}
              />
            </div>
            <div className="form-row--item">
              <FieldText
                value={form.class_weights[column] || ''}
                onChange={(e: any) => handleTextChange(e, column)}
                onKeyPress={floatOnly}
                description={<span className="tiny-text">Decimal only</span>}
                label="Weight"
              />
            </div>
            <IconButton icon={<Delete />} onClick={() => handleRemove(column)} label="Remove Class Weight" size="large" />
          </div>
        ))
      }
      <div className="form-row">
        <IconButton icon={<Add />} onClick={handleAdd} label="Add Class Weight" size='large' />
      </div>
    </div>
  )
}
