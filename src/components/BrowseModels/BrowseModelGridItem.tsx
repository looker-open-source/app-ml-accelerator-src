import React, { useEffect } from "react"
import { Card, CardContent, CardMedia, Heading, IconButton, Menu, MenuItem, Paragraph, Span } from "@looker/components"
import { DateFormat, TimeFormat } from "@looker/components-date"
import { MoreVert } from "@styled-icons/material"
import { MODEL_STATE_TABLE_COLUMNS, WIZARD_STEPS } from "../../constants"
import './BrowseModels.scss'
import { MODEL_TYPES } from "../../services/modelTypes"
import { startCase } from 'lodash'


const { modelName, createdByFirstName, createdByLastName, modelUpdatedAt } = MODEL_STATE_TABLE_COLUMNS

type BrowseModelGridItemProps = {
  model: any,
  navigate: (path: string) => void,
  openDialog: (model: any, dialog: 'share' | 'metadata' | 'delete') => void,
  isShared?: boolean
}

export const BrowseModelGridItem: React.FC<BrowseModelGridItemProps> = ({ model, navigate, openDialog, isShared }) => {
  const hoverRef = React.useRef()

  const handleModelSelect = () => {
    navigate(`/ml/${model[modelName]}/${WIZARD_STEPS['step5']}`)
  }

  return (
    <Card ref={hoverRef} className="model-card" style={{backgroundColor: '#CCC'}}>
      <CardMedia
        image='https://codelabs.developers.google.com/ml-for-developers/img/ml-for-developers.svg'
        className="model-card-media"
        style={{ 
          height: 100, 
          width: 100, 
          marginRight: 'auto', 
          marginLeft: 'auto', 
          backgroundColor: '#CCC',
        }}
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
              { isShared ? <></> : <MenuItem onClick={() => openDialog(model, 'delete')}>Delete</MenuItem> }
            </>
          }
        >
          <IconButton icon={<MoreVert />} label="More Options" className="model-card-more-button"/>
        </Menu>
      </CardMedia>
      <CardContent onClick={handleModelSelect} className="model-card-content" style={{backgroundColor: '#FFF'}}>
        <Heading as="h4" fontSize="medium" fontWeight="semiBold" truncate>
          { startCase(model[modelName]) }
        </Heading>
        <Span
          fontSize="xsmall"
          textTransform="uppercase"
          fontWeight="semiBold"
          color="text1"
        >
          { model.objective ? MODEL_TYPES[model.objective].techLabel : '' }
        </Span>
        <Paragraph fontSize="small">
          { 'Created by ' + model[createdByFirstName] + ' ' + model[createdByLastName]}
        </Paragraph>
        {
          model[modelUpdatedAt] ? (
            <div className="model-card-time">
              Updated: { ' ' }
              <DateFormat>{new Date(model[modelUpdatedAt])}</DateFormat>{' '}
              <TimeFormat timeZone={model.timezone}>{model[modelUpdatedAt]}</TimeFormat>
            </div>
          ) : ''
        }
      </CardContent>
    </Card>
  )
}
