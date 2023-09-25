import { createRef } from 'react';
import Highcharts from 'highcharts/highcharts.src.js';
import HighchartsReact from 'highcharts-react-official';
import { useNavigate, useLocation } from "react-router-dom";
import { formatAmount, getDrilldownPath } from 'utils';
import colors from "assets/theme/base/colors";
import { useResizeDetector } from 'react-resize-detector';
import { useYADialog } from "components/YADialog";
import { convertRStoGraphYearlyLine, removeSessionFilter } from "utils"
import DashboardItem from 'components/DashboardItem';
import _ from 'lodash';
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import Icon from "@mui/material/Icon";

const ColumnYearlyLineChartRenderer = ({ loading, title, subtitle, chartHelpContextKey, resultSet, vizOptions }) => {
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
    var graphData = convertRStoGraphYearlyLine(resultSet, count === 1 ? colors.singleDataColors : colors.graphColors, vizOptions)

    Object.values(graphData.range).forEach(item => {
        if (item.name.indexOf("YTD") > 0) {
            if (item.name.indexOf("Spend") > 0) 
                item.name = "Cumulative Spend"
            if (item.name.indexOf("Budget") > 0) 
                item.name = "Cumulative Budget"
        }
    })

    var opts = {
        chart: {
            width: width,
            height: height-13,
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
                cursor: "pointer",
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
                            if (vizOptions.queryType && vizOptions.queryType === "CompareWithPrevYearTrend" && vizOptions["popupTo"] && vizOptions["popupTo"] !== "") {
                                if (obj.find((({ name }) => name === "Years.year")))
                                    _.remove(obj, { name: "Years.year" })
                                obj.unshift({name: "Years.year", "values": [event.point.series.name.replace(" YTD","")]})
                            }
                            if (vizOptions.excludeFilters && vizOptions.excludeFilters.length > 0) {
                                vizOptions.excludeFilters.map((fil) => {
                                    if (obj.find((({name}) => name === fil)))
                                        _.remove(obj, {name: fil})                                
                                })
                            }
                            vizOptions["drillTo"] && vizOptions["drillTo"] !== "" && navigate(location.pathname === "/" ? vizOptions.drillTo : getDrilldownPath(location.pathname, vizOptions.drillTo), { state: obj})
                            vizOptions["popupTo"] && vizOptions["popupTo"] !== "" && showReport(vizOptions["popupTo"], obj, null);
                        }
                    }
                }
            }
        },
        series: Object.values(graphData.range)

    }
    const nodata = graphData.categories?.size === 0;

    let navigateToPage = () => {
        vizOptions["linkTo"] && vizOptions["linkTo"] !== "" && navigate(location.pathname === "/" ? vizOptions.linkTo : getDrilldownPath(location.pathname, vizOptions.linkTo), {state: {}})
    }
    return (
        <DashboardItem nodata={nodata} title={title} subtitle={subtitle} chartHelpContextKey={chartHelpContextKey} chartRef={chartRef}>
            <div ref={rref} style={{position: 'relative', height: '100%'}}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, right: 0 }}>
                    <HighchartsReact ref={chartRef} highcharts={Highcharts} options={opts} />
                    {vizOptions["linkTo"] && vizOptions["linkTo"] !== "" &&
                        <MDBox display="flex" color={colors.linkColour ? colors.linkColour : "dark"} flexDirection="row" justifyContent="flex-end">
                        <MDTypography style={{position: 'absolute', bottom: '-10px', right: '5px'}} variant="button" sx={{ "&:hover": { cursor: 'pointer' }}} fontWeight="medium" color={colors.linkColour ? colors.linkColour : "dark"} px={1} whiteSpace="nowrap" onClick={() => { navigateToPage()}}>
                            {vizOptions.linkText.toUpperCase()} 
                        </MDTypography>
                        <Icon>east</Icon>
                        </MDBox>
                  }
                </div>
            </div>
        </DashboardItem>
    )
}

export default ColumnYearlyLineChartRenderer;