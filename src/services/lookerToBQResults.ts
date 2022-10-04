export const lookerToBqResults = (lookerQueryResponse: any)  => {
  const firstRow = lookerQueryResponse[0]
  const fields = Object.keys(firstRow).map((columnName) => {
    return { "name": columnName, "type": dataType(columnName, firstRow)}
  })
  const rows =  lookerQueryResponse.map((row: any) => { 
    return { f: Object.keys(row).map((key) => {
      return { v: String(row[key])} 
    })}
  })

  const bqResults = {
    "schema": {
      "fields": fields
    },
    "totalRows": String(lookerQueryResponse.length),
    "rows": rows,
  }
  return bqResults
}

const dataType = (columnName: any, row: any) => {
  const value = row[columnName]
  if (typeof value == 'number' && !isNaN(value)) {
    if (Number.isInteger(value)) {
      return 'INTEGER'
    } else {
      return 'FLOAT'
    }
  } else if (typeof value === 'string') {
    return 'STRING'
  } else {
    return undefined
  }
}