import { Button, ButtonTransparent, DialogContent, DialogFooter, DialogHeader, FieldText, Icon, Label } from '@looker/components'
import { Check, Save } from '@styled-icons/material'
import React, { useContext, useEffect, useState } from "react"
import { DateFormat, TimeFormat } from "@looker/components-date"
import { MODEL_STATE_TABLE_COLUMNS } from "../../constants"
import { AdminContext } from "../../contexts/AdminProvider"
import { formatMetaData, METADATA_LABEL_MAP } from '../../services/admin'
import Spinner from "../Spinner"

type ModelMetadataDialogProps = {
  model: any,
  closeDialog: () => void
}

export const ModelMetadataDialog: React.FC<ModelMetadataDialogProps> = ({ model, closeDialog }) => {
  const [ isLoading, setIsLoading ] = useState<boolean>(false)
  const [ isSaved, setIsSaved ] = useState<boolean>(false)
  const [ metadataRaw, setMetadataRaw ] = useState<any>()
  const [ formattedMetadata, setFormattedMetadata ] = useState<any>({})
  const [ description, setDescription ] = useState<string>('')
  const [ labels, setLabels ] = useState<any>({})
  const { getModelMetadata, saveModelMetadata } = useContext(AdminContext)
  const bqModelName = model[MODEL_STATE_TABLE_COLUMNS.modelName]

  useEffect(() => {
    fetchMetadata(bqModelName)
  }, [bqModelName])

  useEffect(() => {
    setDescription(formattedMetadata.description || '')
    setLabels(formattedMetadata.labels || {})
  }, [formattedMetadata])

  const fetchMetadata = async (modelName: string) => {
    setIsLoading(true)
    const { ok, body } = await getModelMetadata?.(bqModelName)
    setIsLoading(false)
    if (!ok) { return }
    setMetadataRaw(body)
    setFormattedMetadata(formatMetaData(body))
  }

  const onDescChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value)
    setIsSaved(false)
  }

  const onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow setting/updating only one label, always with key 'accelerator'
    setLabels({...labels, ['accelerator']: e.target.value})
    setIsSaved(false)
  }

  const handleSave = async () => {
    setIsSaved(false)
    if (!metadataRaw || !bqModelName) {
      fetchMetadata(bqModelName)
      return
    }

    const fieldsToUpdate = {
      description,
      "labels": labels
    }

    setIsLoading(true)
    const {ok} = await saveModelMetadata?.(fieldsToUpdate, bqModelName)
    setIsLoading(false)
    if (ok) { setIsSaved(true) }
  }

  const buildMetadataContent = () => {
    return Object.keys(formattedMetadata).map((key) => {
      let fieldValue: any

      switch (key) {
        case 'description':
          fieldValue = <FieldText value={description} onChange={onDescChange}/>
          break
        case 'labels':
          fieldValue = <FieldText value={labels.accelerator} onChange={onLabelChange} />
          break
        case 'creationTime':
        case 'modifiedTime':
        case 'expiration':
          if (typeof formattedMetadata[key] !== 'string') {
            fieldValue = (<>
              <DateFormat>{formattedMetadata[key]}</DateFormat> { ' ' }
              <TimeFormat>{formattedMetadata[key]}</TimeFormat>
            </>)
            break
          }
        default:
          fieldValue = formattedMetadata[key]
      }

      return (
        <div className="metadata-item" key={key}>
          <Label>{ METADATA_LABEL_MAP[key] }</Label>
          <div className="metadata-item--value">
            { fieldValue }
          </div>
        </div>
      )
    })
  }


  return (
    <>
      <DialogHeader hideClose="true" borderBottom="transparent" className="share-dialog--header">
        Model Details
        <span className="share-dialog--modelname">{bqModelName}</span>
      </DialogHeader>
      <DialogContent className="share-dialog--content">
        <div className="metadata-dialog--container modal-pane">
          {
            buildMetadataContent()
          }
        </div>
      </DialogContent>
      <DialogFooter className="settings-dialog--footer">
        <div className="settings-dialog--footer-content">
          <div className="settings-dialog--buttons">
            <ButtonTransparent
              color="neutral"
              onClick={closeDialog}
              className="cancel-button"
              disabled={isLoading}
            >
              Close
            </ButtonTransparent>
            <Button
              className="action-button"
              color="key"
              iconBefore={<Save />}
              onClick={handleSave}
              disabled={isLoading}
            >
              Save
            </Button>
            { isLoading && <Spinner className="inline-spinner" size={28} />}
            { /* @ts-ignore */ }
            { isSaved && <Icon icon={<Check />} color="positive" size="small" className="inline-spinner" />}
          </div>
        </div>
      </DialogFooter>
    </>
  )
}
