import React from 'react'
import { SummaryTableHeaders } from '../../types'
import { Checkbox, Icon } from "@looker/components"
import { TrackChanges } from '@styled-icons/material'

type SummaryTableRows = {
  data: any[] | undefined
  headers: SummaryTableHeaders
  targetField: string
  selectedFeatures: string[]
  checkboxChange: (fieldName: string) => void
}

export const SummaryTableRows: React.FC<SummaryTableRows> = ({ data, headers, targetField, selectedFeatures, checkboxChange }) => {
  if (!data) { return null }

  const checkBoxCell = (rowData: any) => {
    const rowColumnName = rowData["column_name"].value
    if (targetField.replace(/\./g, '_') === rowColumnName) {
      return (
        <td className="checkbox">
          <Icon icon={<TrackChanges />} className="target-icon" />
        </td>
      )
    }
    return (
      <td className="checkbox">
        <Checkbox
          checked={selectedFeatures?.indexOf(rowColumnName) >= 0}
          onChange={() => { checkboxChange(rowColumnName) }}
          className="feature-checkbox"
        />
      </td>
    )
  }

  const tableRows = data.map((rowData, i) => {
    const tds = Object.keys(headers).map((col: keyof SummaryTableHeaders, j) => (
      <td className={headers[col].align} key={j}>{ headers[col].converter(rowData) || "∅" }</td>
    ))
    return (
      <tr key={i}>
        {checkBoxCell(rowData)}
        {tds}
      </tr>)
  })

  return (
    <>
      { tableRows }
    </>
  )
}
