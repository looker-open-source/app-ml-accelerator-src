import React from 'react'
import { SummaryTableHeaders } from '../../types'
import { Checkbox } from "@looker/components"

type SummaryTableRows = {
  data: any[] | undefined
  headers: SummaryTableHeaders
  selectedFeatures: string[]
  checkboxChange: (fieldName: string) => void
}

export const SummaryTableRows: React.FC<SummaryTableRows> = ({ data, headers, selectedFeatures, checkboxChange }) => {
  if (!data) { return null }

  const tableRows = data.map((rowData, i) => {
    const tds = Object.keys(headers).map((col: keyof SummaryTableHeaders, j) => (
      <td className={headers[col].align} key={j}>{ headers[col].converter(rowData) || "∅" }</td>
    ))
    return (
      <tr key={i}>
        <td className="checkbox">
          <Checkbox
            checked={selectedFeatures?.indexOf(rowData["column_name"].value) >= 0}
            onChange={() => { checkboxChange(rowData["column_name"].value) }}
          />
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
