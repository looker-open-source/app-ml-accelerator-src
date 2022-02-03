import { SelectedFields, ResultsTableHeaderItem, ExploreData } from '../types'
import { find, some } from 'lodash'

/*
  getHeaderColumns creates an an array of header columns based on the dimensions, measures selected
*/
export const getHeaderColumns = (
  selectedFields: SelectedFields,
  ranQuery: any,
  exploreData: ExploreData | undefined
): ResultsTableHeaderItem[] => {
  if (
    !exploreData ||
    (selectedFields.dimensions.length <= 0 && selectedFields.measures.length <= 0)
  ) {
    return []
  }
  const ranDimensions = ranQuery?.dimensions || []
  const ranMeasures = ranQuery?.measures || []
  const { dimensions: exploreDimensions, measures: exploreMeasures } = exploreData.fieldDetails

  const dimensionHeaders = [...selectedFields.dimensions.map((dimension) => (
    {
      title: getFieldTitle(dimension, exploreDimensions),
      name: dimension,
      type: 'dimension',
      placeholder: !ranDimensions.includes(dimension)
    }
  ))]

  const measureHeaders = [...selectedFields.measures.map((measure) => (
    {
      title: getFieldTitle(measure, exploreMeasures),
      name: measure,
      type: 'measure',
      placeholder: !ranMeasures.includes(measure)
    }
  ))]

  return [{type: 'rowNumber'}, ...dimensionHeaders, ...measureHeaders]
}

const getFieldTitle = (name: string, exploreFields: any[]) => {
  const found = find(exploreFields, {name: name})
  if (!found) { return name }
  return found.label || found.name
}

export const findSortedHeader = (
  sorts: string[],
  header: ResultsTableHeaderItem
) => {
  return find(sorts, (name) => {
      let sortName = name.split(" ")[0]
      return sortName === header.name
  })
}

/*
* Returns a boolean indicating whether there is a sort that no longer applies to the list of selected fields
*
* Running a query with a sorted column that is no longer in the list of selected fields
* will cause the query to fail to retrieve data
*/
export function hasOrphanedSorts(
  fieldCols: ResultsTableHeaderItem[],
  sorts: string[]
) {
  let hasMatchingColumn = false
  if (sorts.length <= 0) { return false }
  for (const sort of sorts) {
    // determine if the sort has a matching table header column
    hasMatchingColumn = some(fieldCols, (col) => {
      if (!col.name) { return false }
      return sort.indexOf(col.name) >= 0
    })
    if (!hasMatchingColumn) { break }
  }
  return !hasMatchingColumn
}
