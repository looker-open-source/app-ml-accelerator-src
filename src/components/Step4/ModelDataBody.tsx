import React from 'react'
import { splitFieldName, titilize } from '../../services/string'

export const ModelDataBody: React.FC<{ evalData: any }> = ({ evalData }) => {
  if (!evalData) { return (<></>) }

  const dataItems = []

  for (const key in evalData) {
    dataItems.push(
      <div className="model-data-item" key={key}>
        <div className="model-data-item--name">{titilize(splitFieldName(key))}:</div>
        <div className="model-data-item--value">{evalData[key].value}</div>
      </div>
    )
  }

  return (
    <div>
      { dataItems }
    </div>
  )
}
