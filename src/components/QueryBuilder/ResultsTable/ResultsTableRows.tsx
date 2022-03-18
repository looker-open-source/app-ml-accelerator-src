import React from 'react'
import { ResultsTableHeaderItem } from '../../../types'

type ResultsTableRowsProps = {
  data: any[] | undefined
  headers: ResultsTableHeaderItem[]
}

export const ResultsTableRows: React.FC<ResultsTableRowsProps> = ({ data, headers }) => {
  if (!data || !headers || headers.length <= 0) { return null }

  const colDataType: any = {}
  const tableRows = data.map((rowData, i) => {
    const tds = headers.map((col, j) => {
      if (col.placeholder) {
        return (<td key={j}><i>?</i></td>)
      }
      if (col.type === 'rowNumber') {
        return (<td className={col.type} key={j}>{ i + 1 }</td>)
      }
      let value
      let className = col.type
      if (col.name) {
        value = rowData[col.name]?.value
        if (!colDataType[col.name]) {
          const isNumber = !!Number(value)
          colDataType[col.name] = isNumber ? "number" : "string"
        }
        className += ` ${colDataType[col.name]}`
      }
      return (
        <td className={className} key={j}>{ value || value == 0 ? value : "∅" }</td>
      )
    })
    return (<tr key={i}>{tds}</tr>)
  })

  return (
    <>
      { tableRows }
    </>
  )
}
