import React from 'react'
import { SummaryTableHeaders } from '../../types'
import { Checkbox, Icon, Tooltip } from "@looker/components"
import { TrackChanges, AccessTime } from '@styled-icons/material'
import { ErrorOutline } from '@styled-icons/material-outlined'
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
         <Checkbox
          checked={selectedFeatures?.indexOf(rowColumnName) >= 0}
          disabled={rowData.summary_status.status == 'invalid'}
          onChange={() => { checkboxChange(rowColumnName) }}
          className="feature-checkbox"
        />
      </td>
    )
  }


  const tableRows = data.map((rowData, i) => {
    
    const tds = Object.keys(headers).map((col: keyof SummaryTableHeaders, j) => {
      const iconRowIdxs = [0, 3] // Which columns to show Warning Icons in
      let rowClassNames = [headers[col].align]
      let tooltipContent = rowData.summary_status.message
      if (rowData.summary_status.status == 'invalid') {
        rowClassNames.push('invalid')
        if (iconRowIdxs.includes(j) ) {
          rowClassNames.push('title-icon')
        }
      } else if (rowData.summary_status.status == 'warning') {
        rowClassNames.push('warning')
        if (iconRowIdxs.includes(j)) {
          rowClassNames.push('title-icon')
        }
      }

      return (
      
          <Tooltip content={tooltipContent} key={j}>
            <td className={rowClassNames.join(' ')}>
                { headers[col].converter(rowData) || "∅" }
                { iconRowIdxs.includes(j) && (rowData.summary_status.status !== 'ok') && <Icon icon={<ErrorOutline/>} size='xsmall'/>}
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
