import React, { useRef } from "react"
import { VIZ_HEIGHT } from "../../services/visualizations/vizConstants";
import { RanQuery } from "../../types";
import { AgGridReact } from 'ag-grid-react';
import { noDot, titilize } from "../../services/string";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import { compact } from "lodash";
import { GridApi } from "ag-grid-community";


type VizTableProps = {
  ranQuery: RanQuery
}

export const VizTable : React.FC<VizTableProps> = ({ ranQuery }) => {
  if (!ranQuery) { return <></> }

  const eTextRef = useRef('eText')

  const { data } = ranQuery
  const { selectedFields } = ranQuery
  const selectedColumns = [...selectedFields.dimensions, ...selectedFields.measures, ...(selectedFields.predictions || [])]

  const formattedData = data.map((datum) => {
    const keys = Object.keys(datum)
    const rowObj: { [key: string]: any } = {}
    keys.forEach((key) => rowObj[noDot(key)] = datum[key].value)
    return rowObj
  })

  const columns = compact(Object.keys(data[0]).map((key) => {
    if (selectedColumns.indexOf(key) <= -1) { return }
    const formattedKey = noDot(key)
    return {
      field: formattedKey,
      headerName: titilize(formattedKey)
    }
  }))

  const getRowStyle = (params: any) => {
    if (params.node.rowIndex % 2 === 0) {
      return { background: '#f0f1f1' };
    }
  }

  const defaultColDef = {
    resizable: true,
    headerComponentParams: {
      template:
        '<div class="ag-cell-label-container" role="presentation">' +
        '  <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"></span>' +
        '  <div ref="eLabel" class="ag-header-cell-label" role="presentation">' +
        '    <span ref="eSortOrder" class="ag-header-icon ag-sort-order"></span>' +
        '    <span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon"></span>' +
        '    <span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon"></span>' +
        '    <span ref="eSortNone" class="ag-header-icon ag-sort-none-icon"></span>' +
        '    <span ref="eText" class="ag-header-cell-text" role="columnheader" style="white-space: normal;"></span>' +
        '    <span ref="eFilter" class="ag-header-icon ag-filter-icon"></span>' +
        '  </div>' +
        '</div>',
    },
  }

  // Dynamic header height example (refer to this when adding sorting as well)
  // https://blog.ag-grid.com/wrapping-column-header-text/

  const headerHeightGetter = (): number => {
    const columnHeaderTexts = document.querySelectorAll('.ag-header-cell-text')
    const clientHeights: number[] = []
    columnHeaderTexts.forEach((headerText) => clientHeights.push(headerText.clientHeight))
    const tallestHeaderTextHeight: number = Math.max(...clientHeights)

    return tallestHeaderTextHeight;
  }

  const setHeaderHeights = (gridApi: any) => {
    const height: number = headerHeightGetter()
    gridApi.api.setHeaderHeight(height + 10);
  }

  return (
    <div className="ag-theme-balham" style={{height: VIZ_HEIGHT}}>
      <AgGridReact
        defaultColDef={defaultColDef}
        getRowStyle={getRowStyle}
        rowData={formattedData}
        columnDefs={columns}
        onFirstDataRendered={setHeaderHeights}
        onColumnResized={setHeaderHeights}>

      </AgGridReact>
    </div>
  )
}
