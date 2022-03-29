import React from "react"
import { VIZ_HEIGHT } from "../../services/visualizations/vizConstants";
import { RanQuery } from "../../types";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import { noDot, titilize } from "../../services/string";


type VizSingleRecordProps = {
  ranQuery: RanQuery
}

export const VizSingleRecord : React.FC<VizSingleRecordProps> = ({ ranQuery }) => {
  if (!ranQuery) { return <></> }

  const { data } = ranQuery

  const formattedData = Object.keys(data[0]).map((key) => (
    {
      columnName: titilize(noDot(key)),
      columnValue: data[0][key].value
    }
  ))

  const columns = [{
    field: 'columnName'
  }, {
    field: 'columnValue'
  }]

  const getRowStyle = (params: any) => {
    if (params.node.rowIndex % 2 === 0) {
        return { background: '#f0f1f1' };
    }
  }

  const onGridReady = (params: any) => {
    const gridApi = params.api;
    gridApi.sizeColumnsToFit();
  }

  const defaultColDef = {
    resizable: true,
  }

  return (
    <div className="ag-theme-balham" style={{height: VIZ_HEIGHT, width: '100%'}}>
      <AgGridReact
        defaultColDef={defaultColDef}
        getRowStyle={getRowStyle}
        rowData={formattedData}
        columnDefs={columns}
        onGridReady={onGridReady}
        headerHeight={0}>
      </AgGridReact>
    </div>
  )
}
