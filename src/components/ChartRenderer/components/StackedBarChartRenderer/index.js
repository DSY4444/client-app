import { createRef } from 'react';
import Highcharts from 'highcharts/highcharts.src.js';
import HighchartsReact from 'highcharts-react-official';
import { useLocation, useNavigate } from "react-router-dom";
import { useResizeDetector } from 'react-resize-detector';
import { formatAmount, getDrilldownPath, removeSessionFilter } from 'utils';
import colors from "assets/theme/base/colors";
import { useYADialog } from "components/YADialog";
import { convertRStoGraph } from "utils"
import { useDashboardContext } from 'components/DashboardContext';
import DashboardItem from 'components/DashboardItem';
import { parseVizResult } from "utils/charts";
import _ from 'lodash';

const StackedBarChartRenderer = ({ loading, title, subtitle, chartHelpContextKey, resultSet, vizOptions }) => {

    const [state,] = useDashboardContext();
    const chartRef = createRef();
    const { width, height, ref: rref } = useResizeDetector();
    const {showReport} = useYADialog();
    let navigate = useNavigate()
    let location = useLocation()

    if (loading)
        return <DashboardItem loading={loading} title={title} subtitle={subtitle}></DashboardItem>

    let scrollablePlotAreaMinHeight = 300;
    let currentFilters

    currentFilters = removeSessionFilter(resultSet.loadResponse.pivotQuery.filters, vizOptions)
    var count
    var graphData
    if (vizOptions.plotType && vizOptions.plotType === 'stackedMultiple') {
        const yeardetails = parseVizResult(resultSet, state, vizOptions)
        graphData = convertRStoGraph(resultSet, colors, "bar", vizOptions, yeardetails)
    } else {
        count = vizOptions.series.length;
        graphData = convertRStoGraph(resultSet, count === 1 ? colors.singleDataColors : colors.stackedgraphcolors, "bar", vizOptions)
    }
    //let size =graphData.categories.size
    scrollablePlotAreaMinHeight = vizOptions.plotType && vizOptions.plotType === 'stackedMultiple' ? 2 * graphData.categories.size * Object.keys(graphData.range).length : 25 * graphData.categories.size * Object.keys(graphData.range).length;
    var opts = {
        chart: {  type: 'bar',
        // height: location.pathname.indexOf("report") > 0 ? 450 : 250,
            width: width, 
            height: height,
            scrollablePlotArea: {
                // minHeight:size>=8?(8<=size<15?30*size* Object.keys(graphData.range).length+(height):(30*size* Object.keys(graphData.range).length)*2):scrollablePlotAreaMinHeight,
                minHeight:scrollablePlotAreaMinHeight,
                // opacity: 1,
            // marginRight: 30
            },
            style: { fontFamily: 'inherit', fontSize: '14px', },
            spacingBottom: 0,
            // spacingTop: 0,
            spacingRight: 0,
            spacingLeft: 0,
        },
        colors: graphData.legendColors, 
        title: { text: '' },
        exporting: { enabled: false },
        lang: { thousandsSep: ',' },
        legend: vizOptions.plotType && vizOptions.plotType === 'stackedMultiple' ?{
            labelFormatter: function() {
                {
                    return this.options.stack;
                }
              }
        }: {
            enabled: true
        },
        credits: { enabled: false },
        tooltip: {
            outside: false,
            followPointer: true,
            formatter: function () {
                let toolTip = vizOptions.plotType && vizOptions.plotType === 'stackedMultiple' ? `<b>${this.point.category}</b> [${this.point.series.options.stack}] <br/>${this.point.series.name}: <b>$${Highcharts.numberFormat(this.point.y, 0, ".", ",")}</b>` : `<b>${this.point.category}</b><br/>${this.point.series.name}: <b>$${Highcharts.numberFormat(this.point.y, 0, ".", ",")}</b>`
                return toolTip;
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
                formatter: function () {
                    return formatAmount(Math.abs(this.value)).replace(/ /g, '').replace('.0', '');
                }
            },
        },
        ],
        plotOptions: {
            series: {
                cursor: "pointer",
                groupPadding: 0.1,
                stacking: "normal",
                // pointPadding: 0,
                borderWidth: 0,
                borderRadius: 4,
                states: {
                    inactive: {
                        opacity: 1
                    }
                },
                events:{
                    legendItemClick: function () {
                        return false; // Prevent the legendItemClick event
                      }
                },
                point: {
                    events: {
                        legendItemClick: function (e) {
                            e.preventDefault();
                          },
                        click: function (event) {
                            var obj = Object.assign([], [...currentFilters]);
                            if (vizOptions.category)
                                // if (!obj.find((({name}) => name === vizOptions.category))) 
                                if (obj.find((({ name }) => name === vizOptions.category))) {
                                    _.remove(obj, { name: vizOptions.category })
                                    obj.push({ "name": vizOptions.category, "values": [event.point.category] })
                                }
                                else {
                                    obj.push({ "name": vizOptions.category, "values": [event.point.category] })
                                }
                            if (vizOptions.excludeFilters && vizOptions.excludeFilters.length > 0) {
                                vizOptions.excludeFilters.map((fil) => {
                                    if (obj.find((({ name }) => name === fil)))
                                        _.remove(obj, { name: fil })
                                })
                            }
                            vizOptions["drillTo"] && vizOptions["drillTo"] !== "" && navigate(location.pathname === "/" ? vizOptions.drillTo : getDrilldownPath(location.pathname, vizOptions.drillTo), { state: obj })
                            vizOptions["popupTo"] && vizOptions["popupTo"] !== "" && showReport(vizOptions["popupTo"], obj, null);
                        }
                    }
                },
            },
            bar: {
                dataLabels: {
                    //   enabled: true,
                    style: {
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        fontWeight: 400,
                        // color: '#000',
                    },
                    formatter: function () {
                        return formatAmount(Math.abs(this.y)).replace(/ /g, '').replace('.0', '');
                    }
                },
                pointWidth: 30
              }
        },
        series: Object.values(graphData.range)
    }
    
    const nodata = graphData.categories?.size === 0;
    return (
        <DashboardItem nodata={nodata} title={title} subtitle={subtitle} chartHelpContextKey={chartHelpContextKey} chartRef={chartRef}>
            <div ref={rref} style={{ position: 'relative', height: '100%' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, right: 0 }}>
                    <HighchartsReact key={_.uniqueId()} ref={chartRef} highcharts={Highcharts} options={opts} />
                </div>
            </div>
        </DashboardItem>
    )
}

export default StackedBarChartRenderer;
