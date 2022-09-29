import React from 'react'
import { SummaryTableHeaders } from '../../types'
import { Checkbox, Icon, Tooltip } from "@looker/components"
import { TrackChanges, AccessTime } from '@styled-icons/material'
import { Error } from '@styled-icons/material-outlined'
import { noDot } from '../../services/string'

type SummaryTableRows = {
  data: any[] | undefined
  headers: SummaryTableHeaders
  targetField: string
  arimaTimeColumn?: string
  selectedFeatures: string[]
  checkboxChange: (fieldName: string) => void
}

export const SummaryTableRows: React.FC<SummaryTableRows> = ({ data, headers, targetField, arimaTimeColumn, selectedFeatures, checkboxChange }) => {
  if (!data) { return null }

  const checkBoxCell = (rowData: any) => {
    const rowColumnName = rowData["column_name"].value
    if (noDot(targetField) === rowColumnName) {
      return (
        <td className="checkbox">
          <Icon icon={<TrackChanges />} className="target-icon" />
        </td>
      )
    }
    if (arimaTimeColumn && noDot(arimaTimeColumn) === rowColumnName) {
      return (
        <td className="checkbox">
          <Icon icon={<AccessTime />} className="target-icon" />
        </td>
      )
    }
    if (arimaTimeColumn) {
      return (
        <td className="checkbox">
        </td>
      )
    }
    return (
      <td className="checkbox">
        { rowData.isInvalid
        ? <Icon color='grey' icon={<Error/>}/> :
         <Checkbox
          checked={selectedFeatures?.indexOf(rowColumnName) >= 0}
          onChange={() => { checkboxChange(rowColumnName) }}
          className="feature-checkbox"
        />
        }
      </td>
    )
  }


  const tableRows = data.map((rowData, i) => {
    const invalidMessage = "Cannot select the primary key of a table as this results in overfitting of the model."
    const tds = Object.keys(headers).map((col: keyof SummaryTableHeaders, j) => {
      let rowClassNames = [headers[col].align]
      if (rowData.isInvalid) {
        rowClassNames.push('invalid')
      }
      return (
      
          <Tooltip content={rowData.isInvalid ? invalidMessage : ''}>
            <td className={rowClassNames.join(' ')} key={j}>
                { headers[col].converter(rowData) || "∅" }
            </td>
            </Tooltip>
      )
    })
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
