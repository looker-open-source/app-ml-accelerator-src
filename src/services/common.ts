import { find } from 'lodash'

export const findFieldDetail = (fieldDetails: any, fieldName: string) => {
  const allFields = [
    ...fieldDetails.dimensions || [],
    ...fieldDetails.measures || [],
    ...fieldDetails.parameters || [],
  ]

  return find(allFields, {name: fieldName})
}
