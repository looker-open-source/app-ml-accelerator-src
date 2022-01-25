import React from 'react'
import { ResultsTableHeaderItem } from '../../../types'
import { SortArrow } from './SortArrow'

type ResultsTableHeadersProps = {
  headers: ResultsTableHeaderItem[]
  sorts: string[]
  onHeaderClick: (e: any, header: ResultsTableHeaderItem) => void
}

export const ResultsTableHeaders: React.FC<ResultsTableHeadersProps> = ({ headers, sorts, onHeaderClick }) => {
  const buildFieldColumnHeaders = () => {
    return (
      <tr key="field-cols">
        {
          headers.map((col, index) => {
            const headerClass = col.type + (col.placeholder ? ' placeholder' : '')
            return (
              <th
                className={headerClass}
                title={
                  !col.placeholder
                    ? "Click to sort"
                    : undefined
                }
                onClick={(e) => {
                  !col.placeholder && onHeaderClick(e, col)
                }}
                key={`field-${index}`}
              >
                {col.title || ""}
                <SortArrow sorts={sorts} header={col}/>
              </th>
            )
          })
        }
      </tr>
    )
  }

  return (
    <thead>
      { buildFieldColumnHeaders() }
    </thead>
  )
}
