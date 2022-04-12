import { Button, ButtonTransparent, DialogContent, DialogFooter, DialogHeader, Label } from '@looker/components'
import { Save } from '@styled-icons/material'
import React, { useContext, useEffect, useState } from "react"
import { DateFormat, TimeFormat } from "@looker/components-date"
// import { Add } from "@styled-icons/material"
import { MODEL_STATE_TABLE_COLUMNS } from "../../constants"
// import { toggleArrayEntry } from "../../services/array"
import { AdminContext } from "../../contexts/AdminProvider"
import { formatMetaData, METADATA_LABEL_MAP } from '../../services/admin'
import Spinner from "../Spinner"

type ModelMetadataDialogProps = {
  model: any,
  closeDialog: () => void
}

export const ModelMetadataDialog: React.FC<ModelMetadataDialogProps> = ({ model, closeDialog }) => {
  const [ isLoading, setIsLoading ] = useState<boolean>(false)
  const [ metadataRaw, setMetadataRaw ] = useState<any>()
  const [ formattedMetadata, setFormattedMetadata ] = useState<any>({})
  const { getModelMetadata } = useContext(AdminContext)
  const bqModelName = model[MODEL_STATE_TABLE_COLUMNS.modelName]

  useEffect(() => {
    fetchMetadata(bqModelName)
  }, [bqModelName])

  const fetchMetadata = async (modelName: string) => {
    setIsLoading(true)
    const { ok, body } = await getModelMetadata?.(bqModelName)
    setIsLoading(false)
    if (!ok) { return }
    setMetadataRaw(body)
    setFormattedMetadata(formatMetaData(body))
  }

  const dateFields = ["creationTime", "modifiedTime", "expiration"]

  return (
    <>
      <DialogHeader hideClose="true" borderBottom="transparent" className="share-dialog--header">
        Model Details
        <span className="share-dialog--modelname">{bqModelName}</span>
      </DialogHeader>
      <DialogContent className="share-dialog--content">
        <div className="metadata-dialog--container modal-pane">
          { isLoading ?
            <Spinner className="inline-spinner" size={28} /> :
            Object.keys(formattedMetadata).map((key) => (
              <div className="metadata-item" key={key}>
                <Label>{ METADATA_LABEL_MAP[key] }</Label>
                <div className="metadata-item--value">
                  {
                    dateFields.includes(key) && (typeof formattedMetadata[key] !== 'string') ?
                      (<>
                        <DateFormat>{formattedMetadata[key]}</DateFormat> { ' ' }
                        <TimeFormat>{formattedMetadata[key]}</TimeFormat>
                      </>) :
                      formattedMetadata[key]
                  }
                </div>
              </div>
            ))
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
            {/* <Button
              className="action-button"
              color="key"
              iconBefore={<Save />}
              onClick={handleSave}
              disabled={isLoading}
            >
              Save
            </Button>
            { isLoading && <Spinner className="inline-spinner" size={28} />} */}
          </div>
        </div>
      </DialogFooter>
    </>
  )
}
