import { createRef } from 'react';
import Highcharts from 'highcharts/highcharts.src.js';
import HighchartsReact from 'highcharts-react-official';
import { useLocation, useNavigate } from "react-router-dom";
import { useResizeDetector } from 'react-resize-detector';
import { formatAmount, getDrilldownPath, removeSessionFilter } from 'utils';
import colors from "assets/theme/base/colors";
import { useYADialog } from "components/YADialog";
import DashboardItem from 'components/DashboardItem';
import _ from 'lodash';
import { useDashboardContext } from 'components/DashboardContext';
import { parseTableResultset, convertRStoGraph, multiCategoryGraphData } from 'utils/charts';
import { isTimeDimensionQuery } from 'utils/dashboard';

const BarChartRenderer = ({ loading, title, subtitle, chartHelpContextKey, resultSet, vizOptions }) => {
    
    const [state,] = useDashboardContext();
    const chartRef = createRef();
    const { width, height, ref: rref } = useResizeDetector();

    const {showReport} = useYADialog();
    let navigate = useNavigate()
    let location = useLocation()
 
    if(loading)
       return <DashboardItem loading={loading} title={title} subtitle={subtitle}></DashboardItem>
    
    let scrollablePlotAreaMinHeight = 300;
    let currentFilters;

    let parsedResultset = [];
    if (isTimeDimensionQuery(resultSet.loadResponses[0].query)) {
        parsedResultset = parseTableResultset(resultSet, state, vizOptions)
        currentFilters = removeSessionFilter(resultSet.loadResponses[0].query.filters, vizOptions)
    }
    else {
        parsedResultset = resultSet.tablePivot();
        currentFilters = removeSessionFilter(resultSet.loadResponse.pivotQuery.filters, vizOptions)
    }

    var count = vizOptions.series.length
    var graphData = convertRStoGraph(parsedResultset, vizOptions.wigetType === "leftrightbar" ? colors.varianceColors : count === 1 ? colors.singleDataColors : colors.graphColors, "bar", vizOptions)
    let graphDataMultiple = multiCategoryGraphData(vizOptions, parsedResultset, colors)
    graphDataMultiple ? graphData = graphDataMultiple : graphData
    //calculate scrollablePlotAreaMinHeight
    scrollablePlotAreaMinHeight = vizOptions.queryType === "AllAboveYears" ? 40 * graphData.categories.length * Object.keys(graphData.range).length : 40 * graphData.categories.size * Object.keys(graphData.range).length;
    var opts = {
        chart: {  type: 'bar',
        // height: location.pathname.indexOf("report") > 0 ? 450 : 250,
            width: width, 
            height: height,
            scrollablePlotArea: {
                 minHeight:scrollablePlotAreaMinHeight,
                // opacity: 1,
                // marginRight: 30
            },
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
        tooltip: {
            outside: false,
            followPointer:true,
            formatter: function () {
                return `<b>${this.point.category}</b><br/>${this.point.series.name}: <b>$${Highcharts.numberFormat(this.point.y,0,".",",")}</b>`;
            }
        },
        xAxis: {
            categories: Array.from(graphData.categories),
        },
        yAxis: [{
            // visible:false,
            // gridLineColor: 'transparent',
            reversed: false,
            title: {
                text: ''
            },
            labels: {
                padding: 15,
                formatter: function () {
                    return formatAmount(Math.abs(this.value)).replace(/ /g,'').replace('.0','');
                }
            },
        },
    ],
        plotOptions: {
            series: {
                cursor: "pointer",
                groupPadding: 0.1,
                // pointPadding: 0.1,
                // pointWidth: 20,
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
                            // vizOptions["drillTo"] && vizOptions["drillTo"] !== "" && navigate(location.pathname === "/" ? vizOptions.drillTo : location.pathname + vizOptions.drillTo, { state: obj})
                            vizOptions["drillTo"] && vizOptions["drillTo"] !== "" && navigate(location.pathname === "/" ? vizOptions.drillTo : getDrilldownPath(location.pathname, vizOptions.drillTo), { state: obj})
                            vizOptions["popupTo"] && vizOptions["popupTo"] !== "" && showReport(vizOptions["popupTo"], obj, null);
                        }
                    }
                },
            },
            bar: {
                grouping: vizOptions.wigetType === "leftrightbar" ? false : true,
                dataLabels: {
                    // enabled: true,
                    style: {
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        fontWeight: 400,
                    },
                    formatter: function () {
                        if (vizOptions.wigetType === "leftrightbar" && this.y === 0)
                            return '';
                        return formatAmount(Math.abs(this.y)).replace(/ /g, '').replace('.0', '');
                    }
                },
                pointWidth: 20
            }
        },
        series: Object.values(graphData.range)
    }

    const nodata = vizOptions.queryType === "AllAboveYears"  && graphData.categories.length == 0 ? true : graphData.categories?.size === 0;

    return (
        <DashboardItem nodata={nodata} title={title} subtitle={subtitle} chartHelpContextKey={chartHelpContextKey} chartRef={chartRef}>
            <div ref={rref} style={{position: 'relative', height: '100%'}}>
                <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, right: 0}}>
                    <HighchartsReact key={_.uniqueId()} ref={chartRef} highcharts={Highcharts} options={opts} />
                </div>
            </div>
        </DashboardItem>
    )
}

export default BarChartRenderer;