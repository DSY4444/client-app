import { Icon } from '@mui/material';
import MDBox from "components/MDBox";
import FilterSelector from 'components/FilterSelector';
import { useCustomDashboardEditorContext } from 'context/CustomDashboardEditorContext';
import { useCallback, useMemo } from 'react';
import { selectFilter, setFilter, deleteFilter } from 'context/CustomDashboardEditorContext';
import MDTypography from 'components/MDTypography';
import { DEFAULT_FILTERS } from 'context/CustomDashboardEditorContext';

const filterItemStyles = () => ({
  cursor: 'pointer',
  background: 'white',
  border: '1px solid #d8dadd',
  borderRadius: 1,
  display: 'flex',
  flexDirection: 'row',
  minWidth: '120px',
  margin: .5,
  mb: 1,
  alignItems: 'center',
  justifyContent: 'space-between',
  whiteSpace: 'nowrap',
  fontSize: '15px',
  height: 32,
  boxShadow: "rgba(48, 53, 109, 0.1) 0px 2px 8px",
  "& .filterTitle": {
    flex: 1,
    pr: .75,
    pl: 1.25
  },
  "& .closeIconBox": {
    pl: .75,
    pr: 1.25
  },
  "& .MuiIcon-root": {
    mt: 1
  }
});

const FilterItem = ({ name, selected, onClick, onDelete }) => {
  return (
    <MDBox className={selected ? "selected-widget" : ""} sx={() => filterItemStyles()}>
      <MDBox className="filterTitle" onClick={onClick}>
        <MDTypography variant="caption" fontWeight="medium">{name}</MDTypography>
      </MDBox>
      <MDBox className="closeIconBox">
        <Icon onClick={(e) => { e.preventDefault(); onDelete() }}>close</Icon>
      </MDBox>
    </MDBox>
  )
};

function FilterContainer({ selectedFilterId, onAddFilterClick, onFilterListClose }) {

  const [state, dispatch] = useCustomDashboardEditorContext();

  const handleSelectFilter = useCallback((selectedFilter) => {
    selectFilter(dispatch, selectedFilter);
    onAddFilterClick(selectedFilter.queryName);
  }, []);

  const handleSetFilter = useCallback((selectedFilterIdVal) => {
    setFilter(dispatch, selectedFilterIdVal);
    onAddFilterClick(selectedFilterIdVal);
  }, []);

  const handleCloseFilterConfig = useCallback(() => {
    onFilterListClose();
  }, [onFilterListClose]);

  const handleDeleteFilter = useCallback((selectedFilterIdVal) => {
    if (selectedFilterIdVal === selectedFilterId)
      handleCloseFilterConfig();
    deleteFilter(dispatch, selectedFilterIdVal);
  }, [selectedFilterId]);

  // const handleClearFilters = useCallback(() => {
  //   handleCloseFilterConfig();
  //   clearFilters(dispatch);
  // }, [onFilterListClose]);

  const availableFields = useMemo(() => {
    const selectedFiltersNames = state.config.filters?.map(f => f.queryName) || [];
    return DEFAULT_FILTERS.filter(f => !selectedFiltersNames.includes(f.queryName));
  }, [state.config.filters]);

  return (
    <MDBox pt={3} px={2.5}>
      <MDBox display="flex" flex={1} justifyContent="flex-start" alignItems="center" flexWrap="wrap">
        <>
          {
            state.config.filters?.map((item) => {
              return <FilterItem key={item.name} name={item.name} selected={item.queryName === selectedFilterId} onClick={() => handleSetFilter(item.queryName)} onDelete={() => handleDeleteFilter(item.queryName)} />
            })
          }
        </>
        <MDBox>
          <FilterSelector fields={availableFields} onFilterSelect={handleSelectFilter} />
          {/* {state.selectedFilters?.length > 0 &&
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
          } */}
        </MDBox>
      </MDBox>
    </MDBox>
  )
}

export default FilterContainer;