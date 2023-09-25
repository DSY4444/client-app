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
  if (Number(measure2) === 0) {
    trendValueDirectionUpVal = true;
  }
  if ((measure1) === 0) {
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

const MetricYearlyRenderer = ({ vizOptions, resultSet }) => {
  const [state,] = useDashboardContext();
  const vizResult = parseVizResult(resultSet, state, vizOptions)
  const config = vizOptions.config;
  const columns = vizResult?.map((element) => {
    let col = (config.columns || []).map(column => ({ ...column, ...parseColumnValue(column, element) }));
    return (col)
  })
  const renderColumns = useMemo(() => {
    return columns?.map((column, i) =>
    (
      <>
        <MDBox pb={1.5} height="100%" >
          <Card pt={1.5} sx={{ width: "100%", height: "100%", border: "none", boxShadow: "0px 2px 8px rgba(48, 53, 109, 0.1);", borderRadius: "12px" }}>
            <PerfectScrollbar>
              <MDBox pt={1.5} px={1}>
                <MDBox px={1} pb={0.8} display="flex" flexDirection="row" textOverflow="ellipsis">
                  <MDBox key={`c_${i}`} flex={1}>
                    <MDBox display="flex" flexDirection="row" alignItems="center">
                      {column[0].icon && <Icon sx={{ mr: .5 }}>{column[0].icon}</Icon>}
                      <MDTypography variant="h6" component="span" fontWeight="light" color="dark" whiteSpace="nowrap">
                        {column[0].label} {vizResult ? vizResult[i] ? vizResult[i][vizOptions.subqueryfilter] : "" : ""}
                      </MDTypography>
                    </MDBox>
                    {
                      vizResult[i]?.[vizOptions.subqueryfilter] !== "TBA" && <MDBox display="flex" flexDirection="row" textOverflow="ellipsis" alignItems="center">
                      <MDTypography variant="h4" fontWeight="bold" color="dark" textOverflow="ellipsis" whiteSpace="nowrap">{column[0].value}</MDTypography>
                      {vizResult[column[0].trendColumn?.units] !== undefined && <MDTypography sx={{ mt: 0.75 }} variant="h6" fontWeight="bold" color="medium" textOverflow="ellipsis" whiteSpace="nowrap">&nbsp;{vizResult[column[0].trendColumn?.units]}</MDTypography>}
                      {vizResult[column[0]?.units] !== undefined && <MDTypography sx={{ mt: 0.75 }} variant="h6" fontWeight="bold" color="medium" textOverflow="ellipsis" whiteSpace="nowrap">&nbsp;{vizResult[column[0]?.units]}</MDTypography>}
                      {column[0].trendColumn && <MetricTrendValue {...column[0].trendColumn} {...column[0].trendColumnVal} measure1={vizResult ? vizResult[i] ? vizResult[i][column[0].trendColumn?.measure1] : 0 : 0} measure2={vizResult ? vizResult[i] ? vizResult[i][column[0].trendColumn?.measure2] : 0 : 0} />}
                    </MDBox>
                    }
                </MDBox>
                </MDBox>
              </MDBox>
            </PerfectScrollbar>
          </Card>
        </MDBox>
      </>
    ))
  }, [columns, state.filters]);

  return (
    <>
      {renderColumns}
    </>
  );
}
export default MetricYearlyRenderer;