import { createRef } from 'react';
import Highcharts from 'highcharts/highcharts.src.js';
import HighchartsReact from 'highcharts-react-official';
import { useNavigate, useLocation } from "react-router-dom";
import { formatAmount, getDrilldownPath, removeSessionFilter } from 'utils';
import colors from "assets/theme/base/colors";
import { useResizeDetector, withResizeDetector } from 'react-resize-detector';
import { useYADialog } from "components/YADialog";
import DashboardItem from 'components/DashboardItem';
import _ from 'lodash';
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import Icon from "@mui/material/Icon";
import { useDashboardContext } from 'components/DashboardContext';
import { isTimeDimensionQuery } from 'utils/dashboard';
import { parseTableResultset, convertRStoGraph ,multiCategoryGraphData } from 'utils/charts';

const ColumnChartRenderer = ({ loading, title, subtitle, chartHelpContextKey, resultSet, vizOptions }) => {
    
    const [state,] = useDashboardContext();
    const chartRef = createRef();
    const { width, height, ref: rref } = useResizeDetector();
    const { showReport } = useYADialog();
    let navigate = useNavigate()
    let location = useLocation()
    let currentFilters
    if (loading)
        return <DashboardItem loading={loading} title={title} subtitle={subtitle}></DashboardItem>

    let parsedResultset = [];
    if (isTimeDimensionQuery(resultSet.loadResponses[0].query)) {
        parsedResultset = parseTableResultset(resultSet, state, vizOptions)
        currentFilters = removeSessionFilter(resultSet.loadResponses[0].query.filters, vizOptions)
    }
    else {
        parsedResultset = resultSet.tablePivot();
        currentFilters = removeSessionFilter(resultSet.loadResponse.pivotQuery.filters, vizOptions)
    }
   
    var count = vizOptions.series.length;
    var graphData = convertRStoGraph(parsedResultset, count === 1 ? colors.singleDataColors : colors.graphColors, "column", vizOptions)
    let graphDataMultiple = multiCategoryGraphData(vizOptions, parsedResultset , colors)
    graphDataMultiple ? graphData = graphDataMultiple :graphData
    
    var opts = {
        chart: {
            // height: location.pathname.indexOf("report") > 0 ? 450 : 250, 
            width: width,
            height: height,
            type: 'column', style: { fontFamily: 'inherit', fontSize: '14px', },
            spacingBottom: 0,
            // spacingTop: 0,
            spacingRight: 0,
            spacingLeft: 3,
            backgroundColor: colors.chartBackground
        },
        title: { text: '' },
        exporting: { enabled: false },
        lang: { thousandsSep: ',' },
        credits: { enabled: false },
        tooltip: {
            outside: false,
            formatter: function () {
                return `<b>${this.point.category}</b><br/>${this.point.series.name}: <b>$${Highcharts.numberFormat(this.point.y, 0, ".", ",")}</b>`;
            }
        },
        xAxis: {
            categories: Array.from(graphData.categories)
        },
        yAxis: [{
            // visible:false,
            // gridLineColor: 'transparent',
            reversed: false,
            title: {
                text: ''
            },
            labels: {
                formatter: function () {
                    return formatAmount(Math.abs(this.value)).replace(/ /g, '').replace('.0', '');
                }
            },
        }
        ],
        plotOptions: {
            series: {
                cursor: "pointer",
                groupPadding: 0.1,
                // pointPadding: 0,
                borderWidth: 0,
                borderRadius: 4,
                states: {
                    inactive: {
                        opacity: 1
                    }
                },
                point: {
                    events: {
                        click: function (event) {
                            var obj = Object.assign([], [...currentFilters]);
                            if (vizOptions.category)
                                if (obj.find((({ name }) => name === vizOptions.category))) {
                                    _.remove(obj, { name: vizOptions.category })
                                    obj.push({ "name": vizOptions.category, "values": [event.point.category] })
                                }
                                else {
                                    obj.push({ "name": vizOptions.category, "values": [event.point.category] })
                                }
                            if (obj.find((({ name }) => name === "Years.year")) && (vizOptions.series[0].name.indexOf(".previousYear") !== -1) && vizOptions["popupTo"] && (vizOptions["popupTo"] !== "")) {
                                _.remove(obj, { name: "Years.year" })
                                obj.push({ name: "Years.year", "values": [event.point.series.name.replace(" YTD", "")] })
                            }
                            var popupkey = ""
                            var popupTo = vizOptions["popupTo"] ? vizOptions["popupTo"] : ''
                            if (vizOptions["popupToKey"]) {
                                popupkey = obj.find((({ name }) => name === vizOptions["popupToKey"])) ? obj.find((({ name }) => name === vizOptions["popupToKey"])).values[0] : ''
                                popupTo =  vizOptions["popupTo"] ? vizOptions["popupTo"].replace("changeme",popupkey.toLowerCase()).replace(' ','') : ''
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
                            if(vizOptions?.conditionalFilter){
                                vizOptions?.conditionalFilter.map((item) =>{
                                    obj.map((fil) => {
                                        if(fil.name == item.if.filter){
                                            fil.values.map((i) => {
                                                if(i == item.if.value){
                                                    obj.push({ "name": item.then.filter, "values": [item.then.value] })
                                                }
                                            })
                                        }
                                    })
                                })
                            }
                            vizOptions["drillTo"] && vizOptions["drillTo"] !== "" && navigate(location.pathname === "/" ? vizOptions.drillTo : getDrilldownPath(location.pathname, vizOptions.drillTo), { state: obj })
                            // vizOptions["drillTo"] && vizOptions["drillTo"] !== "" && navigate(vizOptions.drillTo, { state: obj})
                            popupTo && popupTo !== "" && showReport(popupTo, obj, null);
                        }
                    }
                }
            },
            column: {
                dataLabels: {
                    //   enabled: true,
                    //   rotation: -90,    
                    //   x: 0,
                    //   y: -20,
                    style: {
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        fontWeight: 400,
                    },
                    formatter: function () {
                        return formatAmount(Math.abs(this.y)).replace(/ /g, '').replace('.0', '');
                    }
                }
            }
        },
        series: Object.values(graphData.range)
    }
    const nodata = vizOptions.queryType === "AllAboveYears"  && graphData.categories.length == 0 ? true : graphData.categories?.size === 0;
    let navigateToPage = () => {
        vizOptions["linkTo"] && vizOptions["linkTo"] !== "" && navigate(location.pathname === "/" ? vizOptions.linkTo : getDrilldownPath(location.pathname, vizOptions.linkTo), { state: {} })
    }
    return (
        <DashboardItem nodata={nodata} title={title} subtitle={subtitle} chartHelpContextKey={chartHelpContextKey} chartRef={chartRef}>
            <div ref={rref} style={{ position: 'relative', height: '100%' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, right: 0 }}>
                    <HighchartsReact ref={chartRef} highcharts={Highcharts} options={opts} />
                    {vizOptions["linkTo"] && vizOptions["linkTo"] !== "" &&
                        <MDBox data-testid = {vizOptions.linkText?.toLowerCase().replaceAll(' ', '')} display="flex" color={colors.linkColour ? colors.linkColour : "dark"} flexDirection="row" justifyContent="flex-end">
                            <MDTypography style={{ position: 'absolute', bottom: '-10px', right: '5px' }} variant="button" sx={{ "&:hover": { cursor: 'pointer' } }} fontWeight="medium" color={colors.linkColour ? colors.linkColour : "dark"} px={1} whiteSpace="nowrap" onClick={() => { navigateToPage() }}>
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

export default withResizeDetector(ColumnChartRenderer);