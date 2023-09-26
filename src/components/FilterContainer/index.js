import { Icon } from '@mui/material';
import FilterItem from 'components/FilterItem';
import MDBox from "components/MDBox";
import FilterSelector from 'components/FilterSelector';
import MDButton from 'components/MDButton';
import MDTypography from "components/MDTypography"

function FilterContainer({ dashboardDef, selectFilter, setFilter, clearFilters, deleteFilter, sessionFilters, headerShadow }) {
  const handleOnFilterSelect = (selectedFilter) => {
    selectFilter(selectedFilter)
  };

  const availableFields = dashboardDef.filters.filter((item) => !item.selected && !item.defaultSelected);
  const selectedFilters = dashboardDef.filters.filter((item) => item.selected && !item.defaultSelected  && !item.session);
// console.log('zzzz', selectedFilters)
  return (
    <>
      <MDBox  px={2.5} sx={ () => ({
                              // border: sessionFilters ? 'none' : '1px solid rgba(0, 0, 0, 0.125)',
                              // borderRadius: '6px',
                          })
                                }>
        <MDBox display="flex" flex={1} justifyContent="flex-start" alignItems="center" flexWrap="wrap">
          <>
            {
              dashboardDef.filters?.filter((item) => item.selected || item.defaultSelected).map((item, idx) => {
                if (item.session && sessionFilters) {
                  return <> {(idx === 0 ? <MDTypography sx={() => ({
                    marginTop: -0.2,
                    marginRight: 0,
                    marginLeft: -0.5,
                    color: "#454545",
                    fontSize: '14px',
                  // })}>Show data for</MDTypography><FilterContainer dashboardDef={dashboardDef} selectFilter={selectFilter} setFilter={setFilter} deleteFilter={deleteFilter} clearFilters={clearFilters} sessionFilters={true}/> </>
                  })} display={{ lg: "flex", md: "none", sm: "none", xs: "none" }}>Show data for &nbsp;</MDTypography>  : '')} <FilterItem key={item.name} filter={item} setFilter={setFilter} onDelete={() => deleteFilter(item)} sessionFilters={true} headerShadow={headerShadow} /></>
                }
              })
            }
          </>
          <>
            {
              dashboardDef.filters?.filter((item) => item.selected || item.defaultSelected).map((item) => {
                if (!item.session && !sessionFilters)
                  return <FilterItem key={item.name} filter={item} setFilter={setFilter} onDelete={() => deleteFilter(item)} sessionFilters={false} headerShadow={headerShadow}/>
              })
            }
          </>          
          {!sessionFilters ? 
          <MDBox>
            <FilterSelector fields={availableFields} onFilterSelect={handleOnFilterSelect} headerShadow={headerShadow}/>
            {selectedFilters?.length > 0 &&
              <MDButton
                disableRipple
                size="large"
                startIcon={<Icon fontSize="medium">clear</Icon>}
                sx={{ height: 32, ml: .5, mt: headerShadow ? 2 : '', textTransform: 'none', fontSize: 13, p: 1.5 }}
                variant="text"
                color="text"
                onClick={clearFilters}
              >
                Clear
              </MDButton>
            }
          </MDBox> : ''}
        </MDBox>
      </MDBox>
    </>
  )
}

export default FilterContainer;