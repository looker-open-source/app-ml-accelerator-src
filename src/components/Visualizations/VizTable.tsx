import React from "react"
import { VIZ_HEIGHT } from "../../services/visualizations/vizConstants";
import { RanQuery } from "../../types";
import { AgGridReact } from 'ag-grid-react';
import { titilize } from "../../services/string";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';


type VizTableProps = {
  ranQuery: RanQuery
}

export const VizTable : React.FC<VizTableProps> = ({ ranQuery }) => {
  if (!ranQuery) { return <></> }

  const { data } = ranQuery

  console.log({ data })

  const formattedData = data.map((datum) => {
    const keys = Object.keys(datum)
    const rowObj: { [key: string]: any } = {}
    keys.forEach((key) => rowObj[key.replace(/\./g, '_')] = datum[key].value)
    return rowObj
  })

  const columns = Object.keys(data[0]).map((key) => {
    const formattedKey = key.replace(/\./g, '_')
    return {
      field: formattedKey,
      headerName: titilize(formattedKey)
    }
  })

  const getRowStyle = (params: any) => {
    if (params.node.rowIndex % 2 === 0) {
        return { background: '#f0f1f1' };
    }
  }

  const defaultColDef = {
    resizable: true,
  }

  return (
    <div className="ag-theme-balham" style={{height: VIZ_HEIGHT}}>
      <AgGridReact
        defaultColDef={defaultColDef}
        getRowStyle={getRowStyle}
        rowData={formattedData}
        columnDefs={columns}>
      </AgGridReact>
    </div>
  )
}
