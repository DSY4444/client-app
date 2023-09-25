import ChartRenderer from "components/ChartRenderer";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDrilldownPath } from 'utils';
import fetchRequest from "utils/fetchRequest";
import FilterContainer from "components/FilterContainer";
import { useImmer } from "use-immer";
import PageHeader from "components/PageHeader";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import AnimatedRoute from "components/AnimatedRoute";
import YASkeleton from "components/YASkeleton";
import useHandleError from "hooks/useHandleError";
import colors from "assets/theme/base/colors";
import { getFiscalMonthsArray } from "utils/budget";
import { ResponsiveDashboardContainer1 } from "components/ResponsiveDashboardContainer";
import { Card, Icon, Modal, } from "@mui/material";
import _ from 'lodash'
import { applyDefaultFilters, setDrilldownFilters, setSelectedFilter, deleteSelectedFilter } from "utils/dashboard";
import { DashboardContextProvider, initDashboardContext, setDashboardContextFilters, useDashboardContext } from "components/DashboardContext";
import { current } from "immer";


const ReportPage = () => {
  const handleError = useHandleError();
  const { reportId } = useParams();
  const [loading, setLoading] = useState(true);
  const [dashboardDef, setDashboardDef] = useImmer(null);
  const [filtersCleared, setFiltersCleared] = useState(false);
  const [, dispatch] = useDashboardContext();

  let navigate = useNavigate()
  let location = useLocation()
  const [dialogOpen, setDialogOpen] = useState(true);

  useEffect(() => {
    async function getDashboardDef() {
      var [err, data] = await fetchRequest.get(`/api/report/${reportId}`);
      if (err) {
        handleError(err);
      }
      else {
        let newDashboardDef = setDrilldownFilters(applyDefaultFilters(data), location.state);
        setDashboardDef(newDashboardDef);
        initDashboardContext(dispatch, newDashboardDef.filters, newDashboardDef.variables);
        setLoading(false);
        setFiltersCleared(false);
      }
    }
    getDashboardDef();
  }, [reportId, filtersCleared]);

  const handleDialogOpen = () => {
    setDialogOpen(false)
  }

  const selectFilter = (selectedFilter) => {
    setDashboardDef((draft) => {
      let filter = draft.filters?.find(f => f.name === selectedFilter.name);
      if (filter)
        filter.selected = true;
    });
  }

  const deleteFilter = (deletedFilter) => {
    setDashboardDef((draft) => {
      deleteSelectedFilter(draft, deletedFilter)
      setDashboardContextFilters(dispatch, current(draft.filters));
    });
  }

  const setFilter = (selectedFilter) => {
    const firstMonth = dashboardDef.variables["firstMonth"] || 'Jan';
    const currentMonth = dashboardDef.variables["currentMonth"] || 'Dec';
    const mthArray = getFiscalMonthsArray(firstMonth);
    let fil = selectedFilter
    if (fil.name === "Month" && fil.session) {
      if (selectedFilter.values)
        fil.values = mthArray.slice(0, mthArray.indexOf(selectedFilter.values[0]) + 1)
      else
        fil.values = mthArray.slice(0, mthArray.indexOf(currentMonth) + 1)
    }

    if (selectedFilter.values?.length === 0) {
      setDashboardDef((draft) => {
        deleteSelectedFilter(draft, selectedFilter)
        let filter = draft.filters?.find(f => f.name === selectedFilter.name);
        if (filter)
          filter.selected = true;
        setDashboardContextFilters(dispatch, current(draft.filters));
      });
    }
    else {
      setDashboardDef((draft) => {
        setSelectedFilter(draft, fil.values, fil.name, fil.dimension, fil.operator)
        setDashboardContextFilters(dispatch, current(draft.filters));
      });
    }
  }

  if (loading) {
    return <YASkeleton variant="dashboard-loading" />;
  }

  const dashboardItem = (item) => {
    return (
      <div key={item.id}>
        <ChartRenderer title={item.name} subtitle={item.desc} vizState={item.vizState} vizOptions={item.vizOptions} />
      </div>
    )
  };

  const { displayName, desc, helpContextKey, layouts, filters, parent, headerShadow, widgets } = dashboardDef;

  const goToParent = () => {
    navigate(getDrilldownPath('', `/dashboard/${parent}`))
  }

  const avlFilters = filters.filter((item) => _.isArray(item["values"]) && item.values.length > 0 && !item.session)
  const reqFilters = filters.filter((item) => item.required == true && !item.session)
  const checkFilter = reqFilters.filter(({ name: id1 }) => !avlFilters.some(({ name: id2 }) => id2 === id1));

  return (
    <MDBox bgColor={colors.dashboardBackground} minHeight="calc(100vh - 56px)" paddingBottom={{ lg: 0, md: 6, sm: 6, xs: 6 }}>
      <PageHeader title={displayName} subtitle={desc} usePageTitleForBreadcrumb={true} pageHelpContextKey={helpContextKey} dashboardDef={dashboardDef} selectFilter={selectFilter} setFilter={setFilter} deleteFilter={deleteFilter} clearFilters={() => setFiltersCleared(true)} sessionFilters={true} headerShadow={widgets ? true : headerShadow ? headerShadow :false} />
      {(!checkFilter.length > 0) ?
        <>
          <FilterContainer dashboardDef={dashboardDef} selectFilter={selectFilter} setFilter={setFilter} deleteFilter={deleteFilter} clearFilters={() => setFiltersCleared(true)} sessionFilters={false} headerShadow={widgets ? true : headerShadow ? headerShadow :false} />
          <MDBox px={1} pb={2}>
            <ResponsiveDashboardContainer1 dashboardLayouts={layouts}>
              {widgets.map(dashboardItem)}
            </ResponsiveDashboardContainer1>
          </MDBox>
        </> : <>
          <Modal open={dialogOpen} onClose={handleDialogOpen}>
            <MDBox p={1} mb={1} height="100%" width="100%" display="flex" alignItems="center" justifyContent="center">
              <Card sx={{ minHeight: "160px", width: "400px", overflow: 'hidden', border: "2px solid #000000", boxShadow: "0px 2px 8px rgba(48, 53, 109, 0.1);", borderRadius: "12px" }}>
                <MDBox px={4} pt={2} pb={1} display="flex" justifyContent="space-between" alignItems="center">
                  <br />
                  <Icon fontSize="large" component="span" color="warning">warning</Icon>
                  <MDBox >
                    <MDTypography variant="h6" component="span" color="text">
                      Required filters are not set for this report.<br />
                      Redirecting to the corresponding dashboard.
                    </MDTypography>
                  </MDBox>
                </MDBox>
                <MDBox pt={2} pr={2} pl={2} sx={{ backgroungColor: "white", textAlign: "center" }}>
                  <MDButton
                    variant="gradient"
                    color="info"
                    // sx={{ width:"100%"}}
                    onClick={goToParent}
                  >
                    Go to Dashboard
                  </MDButton>
                </MDBox>
              </Card>
            </MDBox>
          </Modal></>
      }
    </MDBox>
  );
};

const ReportPageWithContext = () => <DashboardContextProvider><ReportPage /></DashboardContextProvider>

export default AnimatedRoute(ReportPageWithContext);