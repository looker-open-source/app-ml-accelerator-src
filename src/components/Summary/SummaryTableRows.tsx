import React from 'react'
import { SummaryTableHeaders } from '../../types'
import { Checkbox } from "@looker/components"

type SummaryTableRows = {
  data: any[] | undefined
  headers: SummaryTableHeaders
  selectedFields: string[]
  checkboxChange: (fieldName: string) => void
}

export const SummaryTableRows: React.FC<SummaryTableRows> = ({ data, headers, selectedFields, checkboxChange }) => {
  if (!data) { return null }

  const tableRows = data.map((rowData, i) => {
    const tds = Object.keys(headers).map((col: keyof SummaryTableHeaders, j) => (
      <td className={headers[col].align} key={j}>{ headers[col].converter(rowData) || "∅" }</td>
    ))
    return (
      <tr key={i}>
        <td className="checkbox">
          <Checkbox
            checked={selectedFields?.indexOf(rowData["column_name"]) >= 0}
            onChange={() => { checkboxChange(rowData["column_name"]) }}
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
