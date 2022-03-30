import React, { useContext } from "react"
import { useStore } from '../../../contexts/StoreProvider'
import {
  TreeCollection,
  LkFieldViewTree,
} from '@looker/components'
import { QueryBuilderContext } from "../../../contexts/QueryBuilderProvider"
import { FieldsListByType } from "./FieldsListByType"
import { collapseViewsWithSameLabel } from '../../../services/views'
import "./FieldsDirectory.scss"


export const FieldsDirectory: React.FC = () => {
  const { stepData } = useContext(QueryBuilderContext)
  const { dispatch } = useStore()
  const { exploreData, selectedFields } = stepData
  if (!exploreData?.views) {
    dispatch({ type: 'addError', errorString: 'Explore has incomplete data.'})
    return (<></>)
  }
  const viewsToRender = collapseViewsWithSameLabel(Array.from(exploreData.views))

  const viewItems = Array.from(viewsToRender, ([, view], index) => {
    return (
      <TreeCollection key={index}>
        <LkFieldViewTree defaultOpen={!index} label={<strong>{view.label}</strong>} className="field-directory">
          <FieldsListByType
            fields={view.parameters}
            name="Filter-Only Fields"
            selectorAction="setSelectedParameter"
            selectedFields={selectedFields.parameters}
            key="parameters"/>
          <FieldsListByType
            fields={view.dimensions}
            color="dimension"
            name="DIMENSIONS"
            selectorAction="setSelectedDimension"
            selectedFields={selectedFields.dimensions}
            key="dimensions"/>
          <FieldsListByType
            fields={view.measures}
            color="measure"
            name="MEASURES"
            selectorAction="setSelectedMeasure"
            selectedFields={selectedFields.measures}
            key="measures"/>
        </LkFieldViewTree>
      </TreeCollection>
    )
  })

  return (
    <div className="fields-directory-container">
      {viewItems}
    </div>
  )
}
