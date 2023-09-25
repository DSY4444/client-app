import  { createRef } from 'react';
import Highcharts from 'highcharts/highcharts.src.js';
import HighchartsReact from 'highcharts-react-official';
import { useNavigate, useLocation } from "react-router-dom";
import { formatAmount, getDrilldownPath, removeSessionFilter } from 'utils';
import colors from "assets/theme/base/colors";
import { useResizeDetector } from 'react-resize-detector';
import { useYADialog } from "components/YADialog";
import { convertRStoGraphYearlyPredicted } from "utils"
import DashboardItem from 'components/DashboardItem';
import _ from 'lodash';
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import Icon from "@mui/material/Icon";

const ColumnYearlyLinePredictedChartRenderer = ({ loading, title, subtitle, chartHelpContextKey, resultSet, vizOptions }) => {
    const chartRef = createRef();
    const { width, height, ref: rref } = useResizeDetector();
    
    const {showReport} = useYADialog();
    let navigate = useNavigate()
    let location = useLocation()

    let currentFilters

    if(loading)
       return <DashboardItem loading={loading} title={title} subtitle={subtitle}></DashboardItem>

    currentFilters = removeSessionFilter(resultSet.loadResponse.pivotQuery.filters, vizOptions)

    var count = vizOptions.series.length;
    var graphData = convertRStoGraphYearlyPredicted(resultSet, count === 1 ? colors.singleDataColors : colors.graphColors, vizOptions)

    var opts = {
        chart: {
            width: width,
            height: height-16,
            style: { fontFamily: 'inherit', fontSize: '14px', },
            spacingBottom: 0,
            // spacingTop: 0,
            spacingRight: 0,
            spacingLeft: 0,
            backgroundColor:colors.chartBackground
        },
        title: { text: '' },
        exporting: { enabled: false },
        lang: { thousandsSep: ',' },
        credits: { enabled: false },
        xAxis: {
            categories: Array.from(graphData.categories)
        },
        tooltip: {
            outside: false,
            formatter: function () {
                return `<b>${this.point.category}</b><br/>${this.point.series.name}: <b>$${Highcharts.numberFormat(this.point.y, 0, ".", ",")}</b>`;
            }
        },
        yAxis: [
            {
                labels: {
                    formatter: function () {
                        return formatAmount(this.value).replace(/ /g, "").replace(".0", "");
                    },
                },
                title: {
                    text: "Year to Date Spend",
                },
                opposite: true,
            },
            {
                title: {
                    text: "Monthly Spend",
                },
                labels: {
                    formatter: function () {
                        return formatAmount(this.value).replace(/ /g, "").replace(".0", "");
                    },
                },
            },
        ],
        plotOptions: {
            series: {
                cursor: (vizOptions["popupTo"] || vizOptions["drillTo"]) ? "pointer": "default",
                groupPadding: 0.1,
                // pointPadding: 0,
                borderWidth: 0,
                borderRadius: 4,
                marker: {
                    enabled: false
                },
                states: {
                    inactive: {
                        opacity: 1
                    }
                },
                point: {
                    events: {
                        click: function (event) {
                            var obj = Object.assign([], [...currentFilters]);
                            if (obj.find((({name}) => name === "Months.month")))
                                _.remove(obj, {name: "Months.month"})                            
                            if (vizOptions.category.length > 0)
                                // if (!obj.find((({name}) => name === vizOptions.category))) 
                                if (obj.find((({name}) => name === vizOptions.category))) 
                                {
                                   _.remove(obj, {name: vizOptions.category})
                                   obj.push({ "name": vizOptions.category, "values": [event.point.category] })
                                }
                                else
                                {
                                   obj.push({ "name": vizOptions.category, "values": [event.point.category] })
                                }
                            if (obj.find((({name}) => name === "Years.year")) && (vizOptions.series[0].name.indexOf(".previousYear") !== -1) && vizOptions["popupTo"] && (vizOptions["popupTo"] !== "")) {
                                _.remove(obj, {name: "Years.year"})
                                obj.push({name: "Years.year", "values": [event.point.series.name.replace(" YTD","")]})
                            }
                            vizOptions["drillTo"] && vizOptions["drillTo"] !== "" && navigate(location.pathname === "/" ? vizOptions.drillTo : getDrilldownPath(location.pathname, vizOptions.drillTo), { state: obj})
                            // vizOptions["drillTo"] && vizOptions["drillTo"] !== "" && navigate(vizOptions.drillTo, { state: obj})
                            vizOptions["popupTo"] && vizOptions["popupTo"] !== "" && showReport(vizOptions["popupTo"], obj, null);
                        }
                    }
                }
            }
        },
        series: Object.values(graphData.range)

    }
    const nodata = graphData.categories?.length === 0;

    let navigateToPage = () => {
        vizOptions["linkTo"] && vizOptions["linkTo"] !== "" && navigate(location.pathname === "/" ? vizOptions.linkTo : getDrilldownPath(location.pathname, vizOptions.linkTo), {state: {}})
    }

    return (
        <DashboardItem nodata={nodata} title={title} subtitle={subtitle} chartHelpContextKey={chartHelpContextKey} chartRef={chartRef}>
            <div ref={rref} style={{position: 'relative', height: '100%'}}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, right: 0 }}>
                    <HighchartsReact ref={chartRef} highcharts={Highcharts} options={opts} />
                    {vizOptions["linkTo"] && vizOptions["linkTo"] !== "" &&
                    <MDBox display="flex" flexDirection="row" justifyContent="flex-end">
                        <MDTypography variant="button" px={0.5} py={0.5} fontWeight="medium" whiteSpace="nowrap" sx={{ "&:hover": { cursor: 'pointer', backgroundColor: colors.linkBackColour ? colors.linkBackColour : "light" }, color: colors.linkColour, borderRadius: "5px"}} color={colors.linkColour ? colors.linkColour : "dark"} onClick={() => { navigateToPage(vizOptions["linkTo"])}}>
                        {vizOptions.linkText.toUpperCase()}&nbsp;<Icon sx={{ pt: 0.25 }} variant="contained">east</Icon>
                        </MDTypography>
                    </MDBox>
              }                    
                </div>
            </div>
        </DashboardItem>
    )
}

export default ColumnYearlyLinePredictedChartRenderer;