import React from "react"
import { Card, CardContent, CardMedia, Heading, IconButton, Menu, MenuItem, Paragraph, Span } from "@looker/components"
import { DateFormat, TimeFormat } from "@looker/components-date"
import { MoreVert } from "@styled-icons/material"
import { MODEL_STATE_TABLE_COLUMNS, WIZARD_STEPS } from "../../constants"
import './BrowseModels.scss'

const { modelName, createdByEmail, stateJson, modelUpdatedAt } = MODEL_STATE_TABLE_COLUMNS

type BrowseModelGridItemProps = {
  model: any,
  navigate: (path: string) => void,
  openDialog: (model: any, dialog: 'share' | 'metadata') => void,
  isShared?: boolean
}

export const BrowseModelGridItem: React.FC<BrowseModelGridItemProps> = ({ model, navigate, openDialog, isShared }) => {
  const hoverRef = React.useRef()

  const handleModelSelect = () => {
    navigate(`/ml/${model[modelName]}/${WIZARD_STEPS['step5']}`)
  }

  return (
    <Card ref={hoverRef} className="model-card">
      <CardMedia
        image="https://placeimg.com/640/480/nature"
        className="model-card-media"
      >
        <div className="model-card-hover-overlay"></div>
        <Menu
          // @ts-ignore
          hoverDisclosureRef={hoverRef}
          content={
            <>
              { isShared ? <></> : <MenuItem onClick={() => openDialog(model, 'share')}>Share</MenuItem> }
              <MenuItem onClick={() => openDialog(model, 'metadata')}>Info</MenuItem>
              <MenuItem onClick={handleModelSelect}>Edit</MenuItem>
              { isShared ? <></> : <MenuItem >Delete</MenuItem> }
            </>
          }
        >
          <IconButton icon={<MoreVert />} label="More Options" className="model-card-more-button"/>
        </Menu>
      </CardMedia>
      <CardContent onClick={handleModelSelect} className="model-card-content">
        <Heading as="h4" fontSize="medium" fontWeight="semiBold" truncate>
          { model[modelName] }
        </Heading>
        <Span
          fontSize="xsmall"
          textTransform="uppercase"
          fontWeight="semiBold"
          color="text1"
        >
          { model[stateJson].bqModel.objective }
        </Span>
        <Paragraph fontSize="small">
          { 'Created by ' + model[createdByEmail] }
        </Paragraph>
        {
          model[modelUpdatedAt] ? (
            <div className="model-card-time">
              Updated { ' ' }
              <DateFormat>{new Date(model[modelUpdatedAt])}</DateFormat>{' '}
              <TimeFormat>{new Date(model[modelUpdatedAt])}</TimeFormat>
            </div>
          ) : ''
        }
      </CardContent>
    </Card>
  )
}
