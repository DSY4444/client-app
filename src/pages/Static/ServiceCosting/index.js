import { CubeContext } from '@cubejs-client/react';
import { Card, Icon } from "@mui/material";
import Highcharts from "highcharts";
import HighchartsSankey from "highcharts/modules/sankey";
import HighchartsReact from "highcharts-react-official";
import MDBox from 'components/MDBox';
import FilterContainer from 'components/FilterContainer';
import { useImmer } from "use-immer";
import { useEffect, useState, useContext } from "react";
import { getDomain, applyDefaultFilter1, deleteSelectedFilter1, setSelectedFilter1 } from 'utils';
import Axios from "axios";
import PageHeader from 'components/PageHeader';
import AnimatedRoute from 'components/AnimatedRoute';
import YASkeleton from 'components/YASkeleton';
import MDTypography from 'components/MDTypography';

HighchartsSankey(Highcharts);

const ServiceCosting = () => {
  const reportId = "spend-model"
  const [loading, setLoading] = useState(true);
  const [dashboardDef, setDashboardDef] = useImmer(null);
  const [filtersCleared, setFiltersCleared] = useState(false)
  const [refresh, setRefresh] = useState(null);

  useEffect(() => {
    async function getDashboardDef() {
      const domain = getDomain();
      const response = await Axios.get(`${domain}/api/report/${reportId}?${("nc=" + Math.random()).replace(".", "")}`);
      setDashboardDef(applyDefaultFilter1(response.data));
      setLoading(false);
    }
    getDashboardDef();
  }, [reportId, filtersCleared, refresh]);

  const handleRefreshButtonClick = () => {
    setRefresh(Math.random());
  }

  if (loading) {
    return <YASkeleton variant="dashboard-loading" />;
  }
  return (
     <ShowReport dashboardDef={dashboardDef} setDashboardDef={setDashboardDef} setFiltersCleared={setFiltersCleared} onRefreshButtonClick={handleRefreshButtonClick} />
  )
};

const ShowReport = (props) => {

  const { dashboardDef, setDashboardDef, setFiltersCleared, onRefreshButtonClick } = props
  const { cubejsApi } = useContext(CubeContext);
  const [resultSet1, setResultSet1] = useState(null);
  const [resultSet2, setResultSet2] = useState(null);
  const [resultSet3, setResultSet3] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      if (dashboardDef.widgets[0].vizState.query.length > 0) {
        cubejsApi.load(dashboardDef.widgets[0].vizState.query[0]).then((resultSet) => {
          setResultSet1(resultSet.tablePivot());
        });
      } else {
        setResultSet1([])
      }
      if (dashboardDef.widgets[0].vizState.query.length > 1) {
        cubejsApi.load(dashboardDef.widgets[0].vizState.query[1]).then((resultSet) => {
          setResultSet2(resultSet.tablePivot());
        });
      } else {
        setResultSet2([])
      }
      if (dashboardDef.widgets[0].vizState.query.length > 2) {
        cubejsApi.load(dashboardDef.widgets[0].vizState.query[2]).then((resultSet) => {
          setResultSet3(resultSet.tablePivot());
        });
      } else {
        setResultSet3([])
      }
      setLoading(false);
    }
    getData();
  }, [loading, dashboardDef]);

  if (loading || !resultSet1 || !resultSet2 || !resultSet3) {
    return <YASkeleton variant="dashboard-loading" />;
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
      deleteSelectedFilter1(draft, deletedFilter)
    });
  }
  const setFilter = (selectedFilter) => {
    if (selectedFilter.values?.length === 0) {
      setDashboardDef((draft) => {
        deleteSelectedFilter1(draft, selectedFilter)
        let filter = draft.filters?.find(f => f.name === selectedFilter.name);
        if (filter)
          filter.selected = true;
      });
    }
    else
      setDashboardDef((draft) => {
        setSelectedFilter1(draft, selectedFilter.values, selectedFilter.name, selectedFilter.dimension, selectedFilter.operator)
      });
  }

  
  let links = resultSet1.map((item) => ({ "from": "Total Spend", "to": item[dashboardDef.widgets[0].vizState.query[0].dimensions[0]]+" ", "weight": Number(item[dashboardDef.widgets[0].vizState.query[0].measures[0]]) }))
  links.push(...resultSet2.map((item) => ({ "from": item[dashboardDef.widgets[0].vizState.query[1].dimensions[0]]+" ", "to": item[dashboardDef.widgets[0].vizState.query[1].dimensions[1]]+"  ", "weight": Number(item[dashboardDef.widgets[0].vizState.query[1].measures[0]]) })))
  links.push(...resultSet3.map((item) => ({ "from": item[dashboardDef.widgets[0].vizState.query[2].dimensions[0]]+"  ", "to": item[dashboardDef.widgets[0].vizState.query[2].dimensions[1]], "weight": Number(item[dashboardDef.widgets[0].vizState.query[2].measures[0]]) })))


   let obj = {
    chart: {
      inverted: false,
      height: '600px',
      style: { fontFamily: 'inherit', fontSize: '14px', }
    },
    legend: {
      itemStyle: { fontFamily: 'inherit', fontWeight: 500 },
    },
    title: { text: "" },
    exporting: { enabled: false },
    clip: false,
    credits: { enabled: false },
    tooltip: {
      nodeFormatter: function () {
        return this.name + ": <b> $" + Highcharts.numberFormat(this.sum, 0, ".", ",") + "</b><br/>"
      },
      pointFormatter: function () {
        return this.from + " → " + this.to + ": <b>$" + Highcharts.numberFormat(this.weight, 0, ".", ",") + "</b>"
      }
    },
    series: [
      {
        data: links,
        type: "sankey",
        name: "Cost"
      }
    ]
  }

   const getSecondaryActions = () => {
    onRefreshButtonClick
     return [
       //  { label: "Refresh", onClick: onRefreshButtonClick }
     ];
   }

  return (
    <>
      <PageHeader title={dashboardDef.displayName} subtitle={dashboardDef.desc} secondaryActions={getSecondaryActions} dashboardDef={dashboardDef} selectFilter={selectFilter} setFilter={setFilter} deleteFilter={deleteFilter} clearFilters={() => setFiltersCleared(true)} sessionFilters={true}/>
      <FilterContainer dashboardDef={dashboardDef} selectFilter={selectFilter} setFilter={setFilter} deleteFilter={deleteFilter} clearFilters={() => setFiltersCleared(true)} sessionFilters={false}/>
      <MDBox p={3} pt={1}>
        <Card sx={{ minHeight: "400px" }}>
          {
            links?.length > 0 && (<MDBox p={2}>
              <HighchartsReact highcharts={Highcharts} options={obj} />
            </MDBox>)
          }
          {
            links?.length === 0 && (
              <MDBox width="100%" height="400px" display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                <Icon sx={{ color: "#d0cdcd", fontSize: "64px!important" }}>leaderboard</Icon>
                <MDTypography variant="subtitle2" color="text">No Data</MDTypography>
              </MDBox>
            )
          }
        </Card>
      </MDBox>
    </>
  )
}

export default AnimatedRoute(ServiceCosting);  