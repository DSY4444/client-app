import { createRef } from 'react';
import Highcharts from 'highcharts/highcharts.src.js';
import HighchartsReact from 'highcharts-react-official';
import { useLocation, useNavigate } from "react-router-dom";
import { useResizeDetector } from 'react-resize-detector';
import { getDrilldownPath } from 'utils';
import colors from "assets/theme/base/colors";
import DashboardItem from 'components/DashboardItem';
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import Icon from "@mui/material/Icon";
import numeral from 'numeral';

const PieChartRenderer = ({ loading, title, subtitle, chartHelpContextKey, resultSet, vizOptions }) => {
    
    const chartRef = createRef();
    const { width, height, ref: rref } = useResizeDetector();

    let range = [];
    let navigate = useNavigate()
    let location = useLocation()
    // let currentFilters = []
    let totalValue = 0
    let i = 0

    if(loading)
       return <DashboardItem loading={loading} title={title} subtitle={subtitle}></DashboardItem>

    // currentFilters = resultSet.loadResponse.pivotQuery.filters.map((f) => {
    //     return { name: f.member, operator: f.operator, values: f.values }
    // })
    resultSet.tablePivot().forEach((item) => {

        if (vizOptions && vizOptions.series) {
            vizOptions.series.map((col) => {
                range.push({
                    name:item[vizOptions.category],
                    // name: col.useNameString ? col.name : item[col.name] ? item[col.name] : '',
                    color: colors.pieColors[i++],
                    y: Number(item[col.value]),
                    percentage : 0
                })
                totalValue = totalValue + Number(item[col.value])
            })
        }
    });

    for (let i = 0; i < range.length; i++) {
        range[i].percentage=Number(((range[i].y/totalValue)*100).toFixed(0))
    }

    var opts = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie',
                width: width, 
                height: height*0.945,
                style: {fontFamily: 'inherit', paddingTop: '0', fontSize: '20px', color:"#9EAEE5"},
                backgroundColor:colors.chartBackground
            },
            legend: {
                itemStyle: {fontFamily: 'inherit', fontWeight: 500},
            }, 
            title: vizOptions.showTitle ?{ text: 'Total Spend<br> <b>' + numeral(totalValue).format('$0,0') + '</b><br>',
                    align: 'center',
                    verticalAlign: 'middle',
                    y: 30
                    } : '',
            exporting: {
                enabled: false,
            },
            credits: {
                enabled: false
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },        
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    innerSize: vizOptions.wigetType==="doughnut" ? '60%' : '0',
                    center: ['50%', '50%'],
                    size: vizOptions.showTitle ? '60%':'50%',
                    dataLabels: {
                        enabled: true,
                        style: {
                            fontSize: vizOptions.title ? '15px':'11px',
                            fontFamily: 'inherit',
                            fontWeight: 400,
                          },                          
                        // distance: -40,
                        formatter: function () {
                            return `${this.point.name} (${Highcharts.numberFormat(this.point.percentage,0)}%)`;
                        }
                    },
                    point: {              
                        showInLegend: true,
                        cumulative: 100,
                    },
                },
                states: {
                    inactive: {
                        opacity: 1
                    }
                }
            },
            tooltip: {
                outside: false,
                formatter: function () {
                    return `<b>${this.point.name} : $${Highcharts.numberFormat(this.point.y,0,".",",")}`
                    // return '<b>' + this.point.name + '</b>' + ': $' + Highcharts.numberFormat(this.point.y,0,".",",");
                }
            },
            series: [ {
                name: 'Spend',
                // colorByPoint: true,
                data: range,
            }]
    }
    let navigateToPage = (linkTo) => {
        linkTo && linkTo !== "" && navigate(location.pathname === "/" ? linkTo : getDrilldownPath(location.pathname, linkTo), {state: {}})
    }
    const nodata = range.length === 0;
    return (
        <DashboardItem  nodata={nodata} title={title} subtitle={subtitle} chartHelpContextKey={chartHelpContextKey} chartRef={chartRef}>
            <div ref={rref} style={{position: 'relative', height: '100%'}}>
                <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, right: 0}}>
                    <HighchartsReact ref={chartRef} highcharts={Highcharts} options={opts} />
                    {vizOptions["linkTo"] && vizOptions["linkTo"] !== "" &&
                        <MDBox display="flex" color={colors.linkColour ? colors.linkColour : "dark"} flexDirection="row" justifyContent="flex-end">
                        <MDTypography variant="button" sx={{ "&:hover": { cursor: 'pointer' }}} fontWeight="medium" color={colors.linkColour ? colors.linkColour : "dark"} px={1} whiteSpace="nowrap" onClick={() => { navigateToPage(vizOptions["linkTo"])}}>
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

export default PieChartRenderer;