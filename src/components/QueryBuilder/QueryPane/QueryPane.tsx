import React, { useContext, useState } from 'react'
import ExpanderBar from '../Expander'
import FilterPanel from '../FilterPanel'
import QueryLimitField from '../QueryLimitField'
import ResultsTable from '../ResultsTable'
import { useStore } from '../../../contexts/StoreProvider'
import { QueryBuilderContext } from '../../../contexts/QueryBuilderProvider'
import { VizContainer } from '../../Visualizations/VizContainer'
import { VizButtons } from './VizButtons'
import { AllChartTypes } from '../../../services/visualizations/vizConstants'
import './QueryPane.scss'

export const QueryPane: React.FC = () => {
  const { stepData, stepName } = useContext(QueryBuilderContext)
  const { state, dispatch } = useStore()
  const { selectedFields, limit } = stepData
  const [ chartType, setChartType ] = useState<AllChartTypes>('line')

  const onFilterChange = (filter: string, expression: string) => {
    dispatch({
      type: 'setFilterValue',
      key: filter,
      expression,
      step: stepName
    })
  }

  const onFilterRemove = (filter: string) => {
    dispatch({ type: 'setSelectedFilter', field: {name: filter}, step: stepName })
  }

  const limitChange = (value: string) => {
    dispatch({ type: 'addToStepData', step: stepName, data: { limit: value }})
  }

  return (
    <div>
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
      { stepName === 'step5' &&
        <ExpanderBar
          title="Visualization"
          expanderBodyClasses="filter-expander"
          isOpen={state.ui.vizOpen}
          setIsOpen={() => dispatch({type: 'setVizOpen', value: !state.ui.vizOpen})}
          fields={[<VizButtons chartType={chartType} setChartType={setChartType} />]}
        >
          <div className="chart-viz-container">
            <VizContainer ranQuery={stepData.ranQuery} type={chartType}/>
          </div>
        </ExpanderBar>
      }
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
