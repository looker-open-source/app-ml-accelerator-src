import React, { useState } from 'react'
import { buildHeaders, toggleSelectedField } from '../../services/summary'
import { Field, DataTableHeaderItem } from '../../types'
import { Checkbox } from "@looker/components"
import { SummaryTableRows } from './SummaryTableRows'

type SummaryParams = {
  fields?: Field[] | undefined,
  summaryData: any[] | undefined,
  selectedFields: string[],
  updateSelectedFields: (selectedFields) =>  void
}

export const Summary: React.FC<SummaryParams> = ({ fields, summaryData, selectedFields, updateSelectedFields }) => {
  console.log({fields})
  console.log({summaryData})
  const [allChecked, setAllChecked] = useState(summaryData.length === selectedFields.length)
  const headers: DataTableHeaderItem[] = buildHeaders(fields)


  const checkboxChange = (fieldName): void => {
    const newSelectedFields = toggleSelectedField(selectedFields, fieldName)
    updateSelectedFields(newSelectedFields)
    setAllChecked(summaryData.length === newSelectedFields.length)
  }

  const toggleAllFields = (evt): void => {
    const checked: boolean = evt.currentTarget.checked
    const selectedFields = checked ? summaryData.map((d) => d["column_name"]) : []
    updateSelectedFields(selectedFields)
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
              headers.map((header, i) => (
                <th key={i}>{header.title}</th>
              ))
            }
          </tr>
        </thead>
        <tbody>
          <SummaryTableRows
            data={summaryData}
            headers={headers}
            selectedFields={selectedFields}
            checkboxChange={checkboxChange}
          />
        </tbody>
      </table>
    </section>
  )
}
