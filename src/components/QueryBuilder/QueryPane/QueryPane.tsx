import React from 'react'
import './QueryPane.scss'
import ExpanderBar from '../Expander'
import FilterPanel from '../FilterPanel'
import QueryLimitField from '../QueryLimitField'
import ResultsTable from '../ResultsTable'
import { useStore } from '../../../contexts/StoreProvider'

type QueryPaneProps = {
  runQuery: () => void
}

export const QueryPane: React.FC<QueryPaneProps> = ({ runQuery }) => {
  const { state, dispatch } = useStore()
  const { selectedFields, limit } = state.wizard.steps.step2

  const onFilterChange = (filter: string, expression: string) => {
    dispatch({
      type: 'setFilterValue',
      key: filter,
      expression
    })
  }

  const onFilterRemove = (filter: string) => {
    dispatch({ type: 'setSelectedFilter', field: {name: filter} })
  }

  const limitChange = (value: string) => {
    dispatch({ type: 'addToStepData', step: 'step2', limit: value })
  }

  return (
    <div>
      <div>
        <button onClick={runQuery}>Run</button>
      </div>
      <ExpanderBar
          title="Filters"
          expanderBodyClasses="filter-expander"
          isOpen={state.ui.filtersOpen}
          setIsOpen={() => dispatch({type: 'setFiltersOpen', value: !state.ui.filtersOpen})}
          showFieldsEvenWhenClosed
      >
        <div>
          <FilterPanel
            filters={selectedFields.filters}
            onChange={onFilterChange}
            onRemove={onFilterRemove}
          />
        </div>
      </ExpanderBar>
      <ExpanderBar
        title="Data"
        expanderBodyClasses="filter-expander"
        isOpen={state.ui.dataOpen}
        setIsOpen={() => dispatch({type: 'setDataOpen', value: !state.ui.dataOpen})}
        fields={[(<QueryLimitField onChange={limitChange} limitValue={limit}/>)]}
      >
        <div>
          <ResultsTable />
        </div>
      </ExpanderBar>
    </div>
  )
}
