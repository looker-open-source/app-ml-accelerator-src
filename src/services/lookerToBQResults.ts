export const lookerToBqResults = (lookerQueryResponse: any)  => {
  const fields = Object.keys(lookerQueryResponse[0]).map((columnName) => {
    return { "name": columnName, "type": dataType(columnName, lookerQueryResponse)}
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

const dataType = (columnName: any, lookerQueryResponse: any) => {
  const value = lookerQueryResponse[0][columnName]
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