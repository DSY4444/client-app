import { useCubeQuery } from '@cubejs-client/react';
import FilterChip from 'components/FilterChip';
import { useMemo, useState } from 'react';

function FilterItem({ filter, setFilter, onDelete, sessionFilters, headerShadow }) {
  const { resultSet, isLoading, error } = useCubeQuery(filter.query);
  const [searchVal, setSearchVal] = useState('')
  // console.log("SearchFromItem=====>",searchVal)

const handleSearch = (value) => {
  setSearchVal(value)
  return searchVal
}

  const options = useMemo(() => {
    return resultSet ? resultSet.tablePivot().map(item => item[filter.query.dimensions[0]] || "(empty)") : []
  }, [filter, resultSet])

  const handleOnFilterDelete = (id) => {
    if (onDelete)
      onDelete(filter, id)
  }

  const handleOnFilterSave = (selectedFilter) => {
    setFilter({
      name: selectedFilter.name,
      type: selectedFilter.type,
      dimension: filter.query.dimensions[0],
      operator: selectedFilter.operator,
      values: selectedFilter.values,
      session: sessionFilters
    });
  };

  if (error) {
    console.error(error)
  }

  const filterValue = { name: filter.name, operator: filter.operator || "equals", values: filter.values };
  return (
    <FilterChip isCubeFilter={true} valueLimit={filter.valueLimit} openOnMount={filter.passed ? false : !filter.defaultSelected} dismissible={!filter.required} defaultSelected={filter.defaultSelected} dataType={filter.filterType || "textbox"} name={filter.name} field={filter.name} filterValue={filterValue} options={options} optionsLoading={isLoading} onFilterDelete={handleOnFilterDelete} onFilterSave={handleOnFilterSave} sessionFilters={sessionFilters} onSearchVal={handleSearch} searchVal={searchVal} headerShadow={headerShadow} />
  )

}

export default FilterItem;