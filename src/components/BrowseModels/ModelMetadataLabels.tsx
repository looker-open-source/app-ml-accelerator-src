import React, { useState } from "react"
import { metadataLabelOnly } from '../../services/common'
import { FieldText, IconButton } from '@looker/components'
import { Add, Delete } from '@styled-icons/material'

type ModelMetadataLabelsProps = {
  labels: any,
  setLabels: (labels: any) => void
}

export const ModelMetadataLabels: React.FC<ModelMetadataLabelsProps> = ({ labels, setLabels }) => {
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [keyToAdd, setKeyToAdd] = useState<string>('')
  const [valueToAdd, setValueToAdd] = useState<string>('')

  const handleAdd = () => {
    if (isAdding) {
      if (keyToAdd && valueToAdd) {
        setLabels({
          ...labels,
          [keyToAdd]: valueToAdd
        })
      }
      setKeyToAdd('')
      setValueToAdd('')
      setIsAdding(false)
    } else {
      setIsAdding(true)
    }
  }

  const handleRemove = (key: string) => {
    setLabels({
      ...labels,
      [key]: null
    })
  }

  const onKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyToAdd(e.target.value)
  }

  const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValueToAdd(e.target.value)
  }

  const buildLabels = () => {
    return Object.keys(labels).map((key) => {
      if (!labels[key]) { return <></> }
      return (
        <div className="metadata-label-container">
          <div className="metadata-label">
            <span className="metadata-label--key">
              { key }:
            </span>
            <span className="metadata-label--value">
              { labels[key] }
            </span>
          </div>
          <IconButton
            icon={<Delete/>}
            className="metadata-label--delete"
            onClick={() => handleRemove(key)}
            label="Remove Label"/>
        </div>
      )
    })
  }

  return (
    <>
      <div className="metadata-labels">
        { buildLabels() }
      </div>
      <div className="metadata-item--add-label">
        { isAdding &&
          (
            <>
              <div className="metadata-item--add-label-key">
                <FieldText
                  placeholder="Label Key"
                  value={keyToAdd}
                  onChange={onKeyChange}
                  onKeyPress={metadataLabelOnly}
                  maxLength={63}
                />
              </div>:
              <div className="metadata-item--add-label-val">
                <FieldText
                  placeholder="Label Value"
                  value={valueToAdd}
                  onChange={onValueChange}
                  onKeyPress={metadataLabelOnly}
                  maxLength={63}
                />
              </div>
            </>
          )
        }
        <IconButton
          icon={<Add />}
          className="metadata-item--add-label-btn"
          onClick={handleAdd}
          label="Add Label"/>
      </div>
    </>
  )
}
