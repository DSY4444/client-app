import { useDashboardContext } from "components/DashboardContext";
import { Card, Icon, Stack } from "@mui/material";
import PerfectScrollbar from 'react-perfect-scrollbar';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useMemo } from "react";
import { parseVizResult, parseColumnValue } from "utils/charts";

function MetricTrendValue({ value, originalValue, negateColorLogic, upTrendContentLabel, downTrendContentLabel, equalTrendContentLabel, measure1, measure2 }) {
  // if (!originalValue)
  //   return null;

  let trendValueDirectionUpVal = (originalValue && originalValue > 0);
  if (measure2 === 0) {
    trendValueDirectionUpVal = true;    
  }
  if (measure1 === 0) {
    trendValueDirectionUpVal = false;    
    value = "--";
  }
  let trendContentLabel = trendValueDirectionUpVal ? upTrendContentLabel : downTrendContentLabel;
  if (Number(measure1).toFixed(0) === Number(measure2).toFixed(0)) {
    value = "--";
    trendContentLabel = equalTrendContentLabel;
    trendValueDirectionUpVal = undefined;
  }
  const deltaColor = negateColorLogic ?
    (trendValueDirectionUpVal ? "error" : "success")
    :
    (trendValueDirectionUpVal ? "success" : "error");

  return <Stack direction="row" spacing={.5} sx={{ alignItems: "center", mt: 0.6, ml: 0.75 }}>
    <MDTypography color={deltaColor} lineHeight="inherit" variant="h5" component="span">
      {trendValueDirectionUpVal === true ? <>▲</> : (trendValueDirectionUpVal === false ? <>▼</> : '')}
    </MDTypography>
    {value && value !== '--' && <MDTypography color={deltaColor} variant="button" whiteSpace="nowrap">{value}</MDTypography>}
    {trendContentLabel && <MDTypography component="p" variant="button" color="text" display="flex" whiteSpace="nowrap">{trendContentLabel}</MDTypography>}
  </Stack>;
}

const MetricRenderer = ({ vizOptions, resultSet }) => {
  const [state,] = useDashboardContext();
  const vizResult = parseVizResult(resultSet, state, vizOptions)
  const config = vizOptions.config;

  const columns = (config.columns || []).map(column => ({ ...column, ...parseColumnValue(column, vizResult) }));

  const renderColumns = useMemo(() => {
    return columns?.map((column, i) =>
    (<MDBox key={`c_${i}`} flex={1}>
      <MDBox display="flex" flexDirection="row" alignItems="center">
        {column.icon && <Icon sx={{ mr: .5 }}>{column.icon}</Icon>}
        <MDTypography data-testid = {column.label?.toLowerCase().replaceAll(' ', '')} variant="h6" component="span" fontWeight="light" color="dark" whiteSpace="nowrap">
          {column.label}
        </MDTypography>
      </MDBox>
      <MDBox display="flex" flexDirection="row" textOverflow="ellipsis" alignItems="center">
        <MDTypography variant="h4" fontWeight="bold" color="dark" textOverflow="ellipsis" whiteSpace="nowrap">{column.value}</MDTypography>
        { vizResult[column.trendColumn?.units] !== undefined && <MDTypography  sx={{ mt: 0.75 }} variant="h6" fontWeight="bold" color="medium" textOverflow="ellipsis" whiteSpace="nowrap">&nbsp;{vizResult[column.trendColumn?.units]}</MDTypography> }
        { vizResult[column?.units] !== undefined && <MDTypography  sx={{ mt: 0.75 }} variant="h6" fontWeight="bold" color="medium" textOverflow="ellipsis" whiteSpace="nowrap">&nbsp;{vizResult[column?.units]}</MDTypography> }
        { column.trendColumn && <MetricTrendValue {...column.trendColumn} {...column.trendColumnVal} measure1 = {vizResult ? vizResult[column.trendColumn?.measure1] : 0} measure2 = {vizResult ? vizResult[column.trendColumn?.measure2] : 0} /> }
      </MDBox>
    </MDBox>
    ))
  }, [columns, state.filters]);

  return (
    <Card sx={{ width: "100%", border: "none", boxShadow: "0px 2px 8px rgba(48, 53, 109, 0.1);", borderRadius: "12px" }}>
      <PerfectScrollbar>
        <MDBox pt={1.5} px={1}>
          <MDBox px={1} pb={0.8} display="flex" flexDirection="row" textOverflow="ellipsis">
            {renderColumns}
          </MDBox>
        </MDBox>
      </PerfectScrollbar>
    </Card>
  );
}

export default MetricRenderer;