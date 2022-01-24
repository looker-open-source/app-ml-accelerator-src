import React from 'react'
import { DataTableHeaderItem } from '../../types'
import { Checkbox } from "@looker/components"

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
