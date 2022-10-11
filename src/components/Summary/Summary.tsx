import React, { useState } from 'react'
import { toggleSelectedFeature, SUMMARY_TABLE_HEADERS, SUMMARY_TABLE_HEADERS_STEP3 } from '../../services/summary'
import { SummaryTableHeaders } from '../../types'
import { Checkbox } from "@looker/components"
import { SummaryTableRows } from './SummaryTableRows'
import { noDot } from '../../services/string'

type SummaryParams = {
  targetField: string,
  arimaTimeColumn?: string,
  summaryData: any[],
  selectedFeatures: string[],
  stepNumber: number,
  updateSelectedFeatures: (selectedFeatures: string[]) =>  void
}

export const Summary: React.FC<SummaryParams> = ({ targetField, arimaTimeColumn, summaryData, selectedFeatures, updateSelectedFeatures, stepNumber }) => {
  const [allChecked, setAllChecked] = useState(summaryData.length === selectedFeatures.length)
  const headers: SummaryTableHeaders = stepNumber === 3 ? SUMMARY_TABLE_HEADERS_STEP3 : SUMMARY_TABLE_HEADERS
  const targetFieldFormatted = noDot(targetField)

  const checkboxChange = (fieldName: string): void => {
    const newSelectedFeatures = toggleSelectedFeature(selectedFeatures, fieldName)
    updateSelectedFeatures(newSelectedFeatures)
    setAllChecked(summaryData.length === newSelectedFeatures.length)
  }

  const toggleAllFeatures = (evt: any): void => {
    const checked: boolean = evt.currentTarget.checked
    const selectedFeatures = checked ? summaryData.filter(d => d.summary_status.status == 'ok').map(d => d["column_name"].value) : [targetFieldFormatted]
    updateSelectedFeatures(selectedFeatures)
    setAllChecked(checked)
  }

  return (
    <section className="summary-table">
      <table>
        <thead>
          <tr>
            <th className="checkbox">
              {
                !arimaTimeColumn &&
                <Checkbox
                  checked={allChecked}
                  onChange={toggleAllFeatures}
                  className="feature-checkbox"
                />
              }
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
            arimaTimeColumn={arimaTimeColumn}
            selectedFeatures={selectedFeatures}
            checkboxChange={checkboxChange}
          />
        </tbody>
      </table>
    </section>
  )
}
