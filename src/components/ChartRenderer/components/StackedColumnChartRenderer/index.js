import { createRef } from 'react';
import Highcharts from 'highcharts/highcharts.src.js';
import HighchartsReact from 'highcharts-react-official';
import { useNavigate, useLocation } from "react-router-dom";
import { formatAmount, getDrilldownPath } from 'utils';
import colors from "assets/theme/base/colors";
import { useResizeDetector } from 'react-resize-detector';
import { useYADialog } from "components/YADialog";
import { convertRStoGraph ,convertRStoMultiGraph, convertRStoGraphYearlyStackedAreaSpline, removeSessionFilter } from "utils"
import DashboardItem from 'components/DashboardItem';
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import Icon from "@mui/material/Icon";
import _ from 'lodash';
import numeral from 'numeral';

const StackedColumnChartRenderer = ({ loading, title, subtitle, chartHelpContextKey, resultSet, vizOptions }) => {
    
    const chartRef = createRef();
    const { width, height, ref: rref } = useResizeDetector();
    const {showReport} = useYADialog();
    let navigate = useNavigate()
    let location = useLocation()
    var graphData

    if(loading)
       return <DashboardItem loading={loading} title={title} subtitle={subtitle}></DashboardItem>

    let currentFilters

    currentFilters = removeSessionFilter(resultSet.loadResponse.pivotQuery.filters, vizOptions)

    var count = vizOptions.series.length;
    if (vizOptions.homePage)
        {graphData = convertRStoGraphYearlyStackedAreaSpline(resultSet,colors.graphColors, "", vizOptions)}
    else if(vizOptions.multiStack === true)
        {graphData = convertRStoMultiGraph(resultSet, count === 1 ? colors.singleDataColors : colors.stackedgraphcolors, "column", vizOptions)}
    else
        {graphData = convertRStoGraph(resultSet, count === 1 ? colors.singleDataColors :colors.stackedgraphcolors, "column", vizOptions)}
    var opts = {
        chart: { 
            // height: location.pathname.indexOf("report") > 0 ? 450 : 250, 
            width: width, 
            height: vizOptions.homePage ? height-16:height,
            type: 'column', style: { fontFamily: 'inherit', fontSize: '14px', } ,
            spacingBottom: vizOptions.homePage ? null:0,
            // spacingTop: 0,
            spacingRight: vizOptions.homePage ? null:0,
            spacingLeft: vizOptions.homePage ? null:0,
        },
        title: { text: '' },
        exporting: { enabled: false },
        lang: { thousandsSep: ',' },        
        credits: { enabled: false },
        tooltip: {
            outside: false,
            formatter: function () {
                    return `<b>${this.point.category}</b><br/>${this.point.series.name}: 
                    <b>$${Highcharts.numberFormat(this.point.y,0,".",",")}</b> 
                    ${vizOptions.multiStack === true ? `<b>(${Highcharts.numberFormat(this.point.percentage,0,".",",")}%)</b>` : ''}`;
            }
        },
        xAxis: {
            visible:!vizOptions.hideLegend,
            categories: Array.from(graphData.categories)
        },
        legend: {
            enabled: !vizOptions.homePage
        }, 
        yAxis: [{
            visible:!vizOptions.hideLegend,
            reversed: false,
            title: {
                text: ''
            },
            labels: {
                formatter: function () {
                    return vizOptions.stacking ? numeral((this.value || 0) / 100).format('0%') : formatAmount(Math.abs(this.value)).replace(/ /g,'').replace('.0','');
                }
            },
        }
    ],
    plotOptions: {
            series: {
                cursor: "pointer",
                groupPadding: 0.1,
                stacking: vizOptions.stacking ? vizOptions.stacking : "normal",
              // pointPadding: 0,
                borderWidth: 0,
                borderRadius: vizOptions.homePage ? 0:4,
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
            },
            column: {
                dataLabels: {
                    // enabled: true,
                    style: {
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        fontWeight: 100,
                    },                       
                  formatter: function () {
                    return formatAmount(Math.abs(this.y)).replace(/ /g,'').replace('.0','');
                  }
                }
              }
        },
        series: Object.values(graphData.range)

    }
    let navigateToPage = (linkTo) => {
        linkTo && linkTo !== "" && navigate(location.pathname === "/" ? linkTo : getDrilldownPath(location.pathname, linkTo), {state: {}})
    }
    const nodata = graphData.categories?.size === 0;
    return (
        <DashboardItem  nodata={nodata} title={title} subtitle={subtitle} chartHelpContextKey={chartHelpContextKey} chartRef={chartRef}>
            <div ref={rref} style={{position: 'relative', height: '100%'}}>
                <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, right: 0}}>
                    <HighchartsReact ref={chartRef} highcharts={Highcharts} options={opts} />
                    {vizOptions["linkTo"] && vizOptions["linkTo"] !== "" &&
                        <MDBox display="flex" color={colors.linkColour ? colors.linkColour : "dark"} flexDirection="row" justifyContent="flex-end">
                        <MDTypography style={{position: 'absolute', bottom: '-10px', right: '5px'}} variant="button" sx={{ "&:hover": { cursor: 'pointer' }}} fontWeight="medium" color={colors.linkColour ? colors.linkColour : "dark"} px={1} whiteSpace="nowrap" onClick={() => { navigateToPage(vizOptions["linkTo"])}}>
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

export default StackedColumnChartRenderer;