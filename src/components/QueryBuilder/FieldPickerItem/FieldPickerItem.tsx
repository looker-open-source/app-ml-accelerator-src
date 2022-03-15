import React, { FC, createContext, useContext } from 'react'
import {
  FilterList,
} from '@styled-icons/material'
import {
  LkFieldItem,
  ToggleColor,
  IconButton,
  Flex,
  Truncate,
  listItemDimensions,
  HoverDisclosure,
  ReplaceText,
  Span
} from '@looker/components'
import Spinner from '../../Spinner'
import { useStore } from '../../../contexts/StoreProvider'
import { QueryBuilderContext } from '../../../contexts/QueryBuilderProvider'

export const HighlightContext = createContext({ term: '' })

type FieldPickerItemProps = {
  field: any
  selectorAction: 'setSelectedDimension' | 'setSelectedMeasure' | 'setSelectedParameter'
  color?: ToggleColor
  filter?: boolean
  pivot?: boolean
  selected?: boolean
  hideActions?: boolean
  isLoading?: boolean
}

export const FieldPickerItem: FC<FieldPickerItemProps> = ({
  field,
  selectorAction,
  children,
  color = 'dimension',
  selected = false,
  hideActions = false,
  isLoading = false
}) => {
  const { stepData } = useContext(QueryBuilderContext)
  const { dispatch } = useStore()
  const { term } = useContext(HighlightContext)
  const { selectedFields } = stepData

  const toggleField = () => {
    dispatch({ type: selectorAction, field })
  }
  const filterToggle = () => {
    dispatch({ type: 'setSelectedFilter', field })
    dispatch({ type: 'setFiltersOpen', value: true })
  }

  const { height } = listItemDimensions(-3)

  const renderActions = () => {
    if (isLoading) {
      return (
        <Spinner size={22}/>
      )
    }

    let actions: React.ReactElement[] = []
    if (!hideActions) {
      const isFilter = selectedFields.filters.hasOwnProperty(field.name)
      actions.push((
        <HoverDisclosure visible={isFilter} key="filter-button">
          <IconButton
            onClick={filterToggle}
            shape="square"
            toggle={isFilter}
            toggleBackground
            toggleColor={color}
            icon={<FilterList />}
            label="Filter"
            tooltipPlacement="top"
          />
        </HoverDisclosure>
      ))
    }
    return actions
  }

  return (
    <LkFieldItem
      color={color}
      className="field-picker-item"
      selected={selected}
      onKeyDown={event => {
        if (event.key === 'Enter' && event.metaKey) {
          alert(`CMD + Enter'ed on ${children}!`)
        } else if (
          event.key === 'Enter' &&
          event.currentTarget === event.target
        ) {
          toggleField()
        }
      }}
    >
      <Flex>
        <Flex
          onClick={toggleField}
          height={height}
          alignItems="center"
          overflow="hidden"
          width="100%"
        >
          <Truncate>
            <ReplaceText
              match={term}
              replace={(str, index) => (
                <Span
                  fontWeight="semiBold"
                  textDecoration="underline"
                  key={index}
                >
                  {str}
                </Span>
              )}
            >
              {children}
            </ReplaceText>
          </Truncate>
        </Flex>
        {renderActions()}
      </Flex>
    </LkFieldItem>
  )
}
