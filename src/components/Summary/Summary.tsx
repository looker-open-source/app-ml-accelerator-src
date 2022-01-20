import React, { useState } from 'react'
import { useStore } from '../../contexts/StoreProvider'
import { buildHeaders } from '../../services/summary'
import { Field, DataTableHeaderItem } from '../../types'
import { Checkbox } from "@looker/components"

type SummaryParams = {
  fields?: Field[] | undefined
  data: any[] | undefined
}

export const Summary: React.FC<SummaryParams> = ({ fields, data }) => {
  console.log({fields})
  console.log({data})
  const { state, dispatch } = useStore()
  const [allChecked, setAllChecked] = useState(true)
  const headers: DataTableHeaderItem[] = buildHeaders(fields)

  const toggleSelectedField = (fieldName): string[] => {
    const { selectedFields } = state.wizard.steps.step3
    const selectedIndex: number = selectedFields.indexOf(fieldName);
    if (selectedIndex < 0) {
      selectedFields.push(fieldName)
      return selectedFields
    }

    selectedFields.splice(selectedIndex, 1)
    return selectedFields
  }

  const checkboxChange = (fieldName): void => {
    const newSelectedFields = toggleSelectedField(fieldName)
    dispatch({
      type: 'addToStepData',
      step: 'step3',
      data: {
        selectedFields: newSelectedFields
      }
    })
    setAllChecked(data.length === newSelectedFields.length)
  }

  const toggleAllFields = (evt): void => {
    const checked: boolean = evt.currentTarget.checked
    const selectedFields = checked ? data.map((d) => d["selection_summary.column_name"]) : []
    dispatch({
      type: 'addToStepData',
      step: 'step3',
      data: {
        selectedFields
      }
    })
    setAllChecked(checked)
  }

  return (
    <section className="summary-table">
      <table>
        <thead>
          <tr>
            <th>
              <Checkbox
                checked={allChecked}
                onChange={toggleAllFields}
              />
            </th>
            {
              headers.map((h) => (
                <th>{h.title}</th>
              ))
            }
          </tr>
        </thead>
        <tbody>
          <SummaryTableRows
            data={data}
            headers={headers}
            selectedFields={state.wizard.steps.step3.selectedFields}
            checkboxChange={checkboxChange}
          />
        </tbody>
      </table>
    </section>
  )
}


type SummaryTableRows = {
  data: any[] | undefined
  headers: DataTableHeaderItem[]
  selectedFields: string[]
  checkboxChange: (string) => void
}

export const SummaryTableRows: React.FC<SummaryTableRows> = ({ data, headers, selectedFields, checkboxChange }) => {
  if (!data || headers?.length <= 0) { return null }

  const tableRows = data.map((rowData, i) => {
    const tds = headers.map((col, j) => {
      return (
        <td className={col.align} key={j}>{ rowData[col.name].value || "∅" }</td>
      )
    })
    return (
      <tr key={i}>
        <td>
          <Checkbox
            checked={selectedFields?.indexOf(rowData["selection_summary.column_name"]) >= 0}
            onChange={(evt) => {
              const fieldName = rowData["selection_summary.column_name"]
              checkboxChange(fieldName)
            }} />
        </td>
        {tds}
      </tr>)
  })

  return (
    <>
      { tableRows }
    </>
  )
}
