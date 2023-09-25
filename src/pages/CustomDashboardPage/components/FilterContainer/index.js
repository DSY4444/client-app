import { Icon } from '@mui/material';
import MDBox from "components/MDBox";
import FilterSelector from 'components/FilterSelector';
import MDButton from 'components/MDButton';
import { useCustomDashboardContext } from 'context/CustomDashboardContext';
import { useCallback, useMemo } from 'react';
import { selectFilter, setFilter, clearFilters, deleteFilter } from 'context/CustomDashboardContext';
import FilterItem from '../FilterItem';

function FilterContainer() {

  const [state, dispatch] = useCustomDashboardContext();

  const handleSelectFilter = useCallback((selectedFilter) => {
    selectFilter(dispatch, selectedFilter);
  }, []);

  const handleSetFilter = useCallback((selectedFilter) => {
    setFilter(dispatch, selectedFilter);
  }, []);

  const handleDeleteFilter = useCallback((selectedFilterName) => {
    deleteFilter(dispatch, selectedFilterName);
  }, []);

  const handleClearFilters = useCallback(() => {
    clearFilters(dispatch);
  }, []);

  const availableFields = useMemo(() => {
    const selectedFiltersNames = state.selectedFilters.map(f => f.name) || [];
    const optinalFilters = (state.filters || []).filter(f => !f.required);
    return optinalFilters?.filter(f => !selectedFiltersNames.includes(f.name));
  }, [state]);

  if ((state.filters || [])?.length === 0)
    return <span></span>

  const mandatoryFilters = (state.filters || []).filter(f => f.required);

  return (
    <MDBox mt={2.5} px={2.5}>
      <MDBox display="flex" flex={1} justifyContent="flex-start" alignItems="center" flexWrap="wrap">
        <>
          {
            mandatoryFilters?.map((item) => {
              return <FilterItem key={item.name} filter={item} setFilter={handleSetFilter} onDelete={() => handleDeleteFilter(item.queryName)} />
            })
          }
          {
            state.selectedFilters?.map((item) => {
              return <FilterItem key={item.name} filter={item} setFilter={handleSetFilter} onDelete={() => handleDeleteFilter(item.queryName)} />
            })
          }
        </>
        <MDBox>
          <FilterSelector fields={availableFields} onFilterSelect={handleSelectFilter} />
          {state.selectedFilters?.length > 0 &&
            <MDButton
              disableRipple
              size="large"
              startIcon={<Icon fontSize="medium">clear</Icon>}
              sx={{ height: 32, ml: .5, textTransform: 'none', fontSize: 13, p: 1.5 }}
              variant="text"
              color="text"
              onClick={handleClearFilters}
            >
              Clear
            </MDButton>
          }
        </MDBox>
      </MDBox>
    </MDBox>
  )
}

export default FilterContainer;