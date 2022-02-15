import React, { useState } from 'react'
import { toggleSelectedFeature, SUMMARY_TABLE_HEADERS } from '../../services/summary'
import { SummaryTableHeaders } from '../../types'
import { Checkbox } from "@looker/components"
import { SummaryTableRows } from './SummaryTableRows'

type SummaryParams = {
  targetField: string,
  summaryData: any[],
  selectedFeatures: string[],
  updateSelectedFeatures: (selectedFeatures: string[]) =>  void
}

export const Summary: React.FC<SummaryParams> = ({ targetField, summaryData, selectedFeatures, updateSelectedFeatures }) => {
  const [allChecked, setAllChecked] = useState(summaryData.length === selectedFeatures.length)
  const headers: SummaryTableHeaders = SUMMARY_TABLE_HEADERS
  const targetFieldFormatted = targetField.replace(/\./g, '_')

  const checkboxChange = (fieldName: string): void => {
    const newSelectedFeatures = toggleSelectedFeature(selectedFeatures, fieldName)
    updateSelectedFeatures(newSelectedFeatures)
    setAllChecked(summaryData.length === newSelectedFeatures.length)
  }

  const toggleAllFeatures = (evt: any): void => {
    const checked: boolean = evt.currentTarget.checked
    const selectedFeatures = checked ? summaryData.map((d) => d["column_name"].value) : [targetFieldFormatted]
    updateSelectedFeatures(selectedFeatures)
    setAllChecked(checked)
  }

  return (
    <section className="summary-table">
      <table>
        <thead>
          <tr>
            <th className="checkbox">
              <Checkbox
                checked={allChecked}
                onChange={toggleAllFeatures}
                className="feature-checkbox"
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
            targetField={targetFieldFormatted}
            selectedFeatures={selectedFeatures}
            checkboxChange={checkboxChange}
          />
        </tbody>
      </table>
    </section>
  )
}
