import { createRef } from 'react';
import Highcharts from 'highcharts/highcharts.src.js';
import HighchartsReact from 'highcharts-react-official';
import { useNavigate, useLocation } from "react-router-dom";
import { formatAmount, getDrilldownPath } from 'utils';
import colors from "assets/theme/base/colors";
import { useResizeDetector } from 'react-resize-detector';
import { useYADialog } from "components/YADialog";
import { convertRStoGraph, removeSessionFilter } from "utils"
import DashboardItem from 'components/DashboardItem';
import _ from 'lodash';
const LineChartRenderer = ({ loading, title, subtitle, chartHelpContextKey, resultSet, vizOptions }) => {
    
    const chartRef = createRef();
    const { width, height, ref: rref } = useResizeDetector();
    
    const {showReport} = useYADialog();
    let navigate = useNavigate()
    let location = useLocation()
    let currentFilters

    if(loading)
       return <DashboardItem loading={loading} title={title} subtitle={subtitle}></DashboardItem>

    currentFilters = removeSessionFilter(resultSet.loadResponse.pivotQuery.filters, vizOptions)

    var graphData = convertRStoGraph(resultSet, colors.graphColors, "spline", vizOptions)

    var opts = {
        chart: { 
            width: width, 
            height: height,
            type: 'spline', 
        style: { fontFamily: 'inherit', fontSize: '14px', },
        spacingBottom: 0,
        // spacingTop: 0,
        spacingRight: 0,
        spacingLeft: 0,
     },
        title: { text: '' },
        exporting: { enabled: false },
        lang: { thousandsSep: ',' },        
        credits: { enabled: false },
        tooltip: {
            outside: false,
            formatter: function () {
                return `<b>${this.point.category}</b><br/>${this.point.series.name}: <b>$${Highcharts.numberFormat(this.point.y,0,".",",")}</b>`;
            }
        },
        xAxis: {
            categories: Array.from(graphData.categories)
        },
        yAxis: [{
            reversed: false,
            title: {
                text: ''
            },
            labels: {
                formatter: function () {
                    return formatAmount(Math.abs(this.value)).replace(/ /g,'').replace('.0','');
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
    return (
        <DashboardItem nodata={nodata} title={title} subtitle={subtitle} chartHelpContextKey={chartHelpContextKey} chartRef={chartRef}>
            <div ref={rref} style={{position: 'relative', height: '100%'}}>
                <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, right: 0}}>
                    <HighchartsReact ref={chartRef} highcharts={Highcharts} options={opts} />
                </div>
            </div>
        </DashboardItem>
    )
}

export default LineChartRenderer;