import React, { useState } from 'react'
import { toggleSelectedField, SUMMARY_TABLE_HEADERS } from '../../services/summary'
import { SummaryField, SummaryTableHeaders } from '../../types'
import { Checkbox } from "@looker/components"
import { SummaryTableRows } from './SummaryTableRows'

type SummaryParams = {
  fields: SummaryField[],
  summaryData: any[],
  selectedFields: string[],
  updateSelectedFields: (selectedFields: string[]) =>  void
}

export const Summary: React.FC<SummaryParams> = ({ fields, summaryData, selectedFields, updateSelectedFields }) => {
  const [allChecked, setAllChecked] = useState(summaryData.length === selectedFields.length)
  const headers: SummaryTableHeaders = SUMMARY_TABLE_HEADERS

  const checkboxChange = (fieldName: string): void => {
    const newSelectedFields = toggleSelectedField(selectedFields, fieldName)
    updateSelectedFields(newSelectedFields)
    setAllChecked(summaryData.length === newSelectedFields.length)
  }

  const toggleAllFields = (evt: any): void => {
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
              Object.keys(headers).map((header: keyof SummaryTableHeaders, i) => (
                <th key={i} className={headers[header].align}>{headers[header].label}</th>
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
