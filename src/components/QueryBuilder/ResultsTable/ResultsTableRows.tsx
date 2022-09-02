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
      let value, formattedValue
      let className = col.type
      if (col.name) {
        value = rowData[col.name]?.value
        formattedValue = rowData[col.name]?.rendered ? rowData[col.name]?.rendered : null
        if (!colDataType[col.name]) {
          const isNumber = !!Number(value)
          colDataType[col.name] = isNumber ? "number" : "string"
        }
        className += ` ${colDataType[col.name]}`
      }

      if (col.type === 'prediction' && !!Number(value)) {
        value = Number(value).toLocaleString('en-US', {maximumFractionDigits: 4})
      }

      let displayValue = formattedValue ? formattedValue : value

      return (
        <td className={className} key={j}>{ displayValue || (displayValue == 0 ? displayValue : "∅") }</td>
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
