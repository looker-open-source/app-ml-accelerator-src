import React from "react"
import {
  TreeBranch,
  LkFieldGroupTree,
  Paragraph,
  ParagraphProps,
  ToggleColor,
  Box2
} from '@looker/components'
import { Field } from '../../../types'
import FieldPickerItem from "../FieldPickerItem"
import "./FieldsDirectory.scss"

const FieldGroupHeading = (props: ParagraphProps) => (
  <Paragraph
    color="text1"
    fontSize="xxsmall"
    fontWeight="semiBold"
    truncate
    style={{ lineHeight: '0.75rem' }}
    {...props}
  />
)

type FieldsListByTypeProps = {
  fields: [string, Field][],
  name: string,
  color?: ToggleColor | undefined,
  hideActions?: boolean,
  selectorAction: 'setSelectedDimension' | 'setSelectedMeasure' | 'setSelectedParameter'
  selectedFields: string[]
}

export const FieldsListByType: React.FC<FieldsListByTypeProps> = ({
  fields,
  color,
  name,
  hideActions = false,
  selectorAction,
  selectedFields
}) => {
  if (
    fields.length <= 0 ||
    (
      name === "MEASURES" &&
      fields.filter(([, field]) => !field.isHidden).length <= 0
    )) {
      return null
  }

  const fieldItems = fields.map(([, field], index: number) => {
    if (field.isHidden) { return null }
    if (field.type == 'field_group') {
      return (
        <LkFieldGroupTree color={color} label={<Box2>{field.label}</Box2>} key={index}>
          {[...field.fields].map(([, childField]: [string, Field], cIndex: number) =>
            <FieldPickerItem
              color={color}
              hideActions={hideActions}
              field={childField}
              selectorAction={selectorAction}
              selected={selectedFields.includes(childField.name)}
              key={cIndex}>
                {childField.fieldLabel}
            </FieldPickerItem>
          )}
        </LkFieldGroupTree>
      )
    }
    return (
      <FieldPickerItem
        color={color}
        hideActions={hideActions}
        field={field}
        selectorAction={selectorAction}
        selected={selectedFields.includes(field.name)}
        key={index}>
          {field.fieldLabel}
      </FieldPickerItem>
    )
  })

  return (
    <div className="fields-section">
      <TreeBranch>
        <FieldGroupHeading color={color}>{name}</FieldGroupHeading>
      </TreeBranch>
      { fieldItems }
    </div>
  )
}
