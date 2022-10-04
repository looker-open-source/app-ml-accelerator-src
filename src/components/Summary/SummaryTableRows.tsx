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
  console.log(data)

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
         <Checkbox
          checked={selectedFeatures?.indexOf(rowColumnName) >= 0}
          disabled={rowData.summary_status.isInvalid}
          onChange={() => { checkboxChange(rowColumnName) }}
          className="feature-checkbox"
        />
      </td>
    )
  }


  const tableRows = data.map((rowData, i) => {
    
    const tds = Object.keys(headers).map((col: keyof SummaryTableHeaders, j) => {
      let rowClassNames = [headers[col].align]
      let tooltipContent = ''
      let iconColor = ''
      if (rowData.summary_status.isInvalid) {
        rowClassNames.push('invalid')
        tooltipContent = "Cannot select the primary key of a table as this results in overfitting of the model."
        iconColor = 'rgb(180, 0, 0)'
        if (j == 0 ) {
          rowClassNames.push('title-icon')
        }
      } else if (rowData.summary_status.isWarning) {
        rowClassNames.push('warning')
        tooltipContent = "This column contains many distinct values. Be cautious as this may cause overfitting."
        iconColor = 'gray'
        if (j == 0 ) {
          rowClassNames.push('title-icon')
        }
      }

      return (
      
          <Tooltip content={tooltipContent}>
            <td className={rowClassNames.join(' ')} key={j}>
                { (j == 0 && (rowData.summary_status.isInvalid || rowData.summary_status.isWarning)) && <Icon color={iconColor} icon={<Error/>}/>}
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
