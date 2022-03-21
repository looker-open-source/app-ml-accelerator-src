import React, { useContext } from 'react'
import { ExtensionContext2 } from "@looker/extension-sdk-react"
import { QueryBuilderContext } from '../../../contexts/QueryBuilderProvider'
import { findFieldDetail } from '../../../services/common'
import { Filter, useSuggestable } from '@looker/filter-components'
import { IconButton } from '@looker/components'
import { Close } from '@styled-icons/material/Close'
import './FilterPanel.scss'

type FilterPanelProps = {
  filters: any,
  onChange: (filterName: string, value: string) => void
  onRemove: (filterName: string) => void
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  onRemove
}) => {
  const { stepData } = useContext(QueryBuilderContext)

  if (!stepData.exploreData || !stepData.modelName) { return null }
  const fieldDetails = stepData.exploreData.fieldDetails
  if (!fieldDetails) { return null }

  const filterItem = (filter: string, field: any, expression?: string) => (
    <div className="filter-container" key={filter}>
      <span className="filter-label">
        {field.view_label || "unknown view"}
        <strong>
          {field.label_short || "unknown field"}
        </strong>
      </span>
      <div className="filter">
        <FilterItem
          onChange={onChange}
          filter={filter}
          modelName={stepData.modelName || ""}
          expression={expression || ""}
          field={field}
          key={filter}
        />
      </div>
      <div className="filter-remove">
        <IconButton
          icon={<Close />}
          size="small"
          label={'Remove'}
          outline={false}
          onClick={() => onRemove(filter)}
          style={{ marginTop: '2px' }}
        />
      </div>
    </div>
  )

  const filterElements = Object.keys(filters).map((filter) => {
    const field = findFieldDetail(fieldDetails, filter)
    return filterItem(filter, field, filters[filter])
  })

  return (
    <div>
      {filterElements}
    </div>
  )
}

type FilterItemProps = {
  filter: string,
  field: any,
  modelName: string,
  onChange: (filterName: string, value: string) => void,
  expression?: string,
}

const FilterItem: React.FC<FilterItemProps> = ({
  filter, field, modelName, onChange, expression
}) => {
  const { coreSDK: sdk } = useContext(ExtensionContext2);

  const getSuggestableProps = (field: any) => {
    const { errorMessage, suggestableProps } = useSuggestable({
      filter: { field, model: modelName },
      sdk,
    })
    return errorMessage ? {} : suggestableProps
  }

  return (
    <Filter
      onChange={(value) => onChange(filter, value.expression)}
      name={filter}
      expression={expression || ""}
      field={field}
      key={filter}
      {...getSuggestableProps(field)}
    />
  )
}
