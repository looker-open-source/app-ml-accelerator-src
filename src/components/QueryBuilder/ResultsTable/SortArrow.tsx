import React from 'react'
import { ResultsTableHeaderItem } from '../../../types'
import { findSortedHeader } from '../../../services/resultsTable'
import { Chevron } from '../Icons/Chevron'

type SortArrowProps = {
  sorts: string[]
  header: ResultsTableHeaderItem
}

export const SortArrow: React.FC<SortArrowProps> = ({ sorts = [], header }) => {

  if (sorts.length > 0) {
    const sortedHeader = findSortedHeader(
      sorts,
      header
    )

    if (sortedHeader) {
      const isASC = sortedHeader && sortedHeader.indexOf('desc') < 0;

      return (
        <Chevron
          height={12}
          width={18}
          rotationDirection={!isASC ? "down" : "up"}
        />
      )
    }
  }

  return null
}
