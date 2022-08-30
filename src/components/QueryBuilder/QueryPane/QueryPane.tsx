import React, { useContext, useState } from 'react'
import ExpanderBar from '../Expander'
import FilterPanel from '../FilterPanel'
import ResultsTable from '../ResultsTable'
import { useStore } from '../../../contexts/StoreProvider'
import { QueryBuilderContext } from '../../../contexts/QueryBuilderProvider'
import { VizContainer } from '../../Visualizations/VizContainer'
import { VizButtons } from './VizButtons'
import { AllChartTypes } from '../../../services/visualizations/vizConstants'
import './QueryPane.scss'
import { isArima } from '../../../services/modelTypes'

export const QueryPane: React.FC = () => {
  const { stepData, stepName } = useContext(QueryBuilderContext)
  const { state, dispatch } = useStore()
  const { selectedFields } = stepData
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

  const showFilters = () => (
    !(stepName === 'step5' && isArima(state.bqModel.objective || ''))
  )

  return (
    <div>
      { showFilters() &&
        <ExpanderBar
          title="Filters"
          expanderBodyClasses="filter-expander"
          isOpen={state.ui.filtersOpen}
          setIsOpen={() => dispatch({type: 'setFiltersOpen', value: !state.ui.filtersOpen})}
          showFieldsEvenWhenClosed
        >
          <div style={{maxHeight: '200px', overflowY: 'auto'}}>
            <FilterPanel
              filters={selectedFields.filters}
              onChange={onFilterChange}
              onRemove={onFilterRemove}
            />
          </div>
        </ExpanderBar>
      }
      { stepName === 'step2' &&
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
      >
        <ResultsTable />
      </ExpanderBar>
    </div>
  )
}
