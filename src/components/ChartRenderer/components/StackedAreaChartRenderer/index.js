import { createRef } from 'react';
import Highcharts from 'highcharts/highcharts.src.js';
import HighchartsReact from 'highcharts-react-official';
import { useLocation, useNavigate } from "react-router-dom";
import { useResizeDetector } from 'react-resize-detector';
import { formatAmount, getDrilldownPath, convertRStoGraphYearlyStackedAreaSpline,getName } from 'utils';
import colors from "assets/theme/base/colors";
import DashboardItem from 'components/DashboardItem';
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import Icon from "@mui/material/Icon";
import numeral from 'numeral';

const StackedAreaChartRenderer = ({ loading, title, subtitle, chartHelpContextKey, resultSet, vizOptions }) => {
    
    const chartRef = createRef();
    const { width, height, ref: rref } = useResizeDetector();

    let navigate = useNavigate()
    let location = useLocation()
    let totalValue = 0

    if(loading)
       return <DashboardItem loading={loading} title={title} subtitle={subtitle}></DashboardItem>
    
    var graphData = convertRStoGraphYearlyStackedAreaSpline(resultSet, vizOptions.labor? colors.areaColors1 : colors.areaColors2, "", vizOptions)
    if (vizOptions.groupItems) {
            Object.keys(graphData.range).forEach((item)=>{
            graphData.range[item].name=getName(item,vizOptions)
        })
    }

    var opts = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type:'areaspline',
                width: width, 
                height: height-14,
                style: {fontFamily: 'inherit', paddingTop: '0', fontSize: '20px', color:"#9EAEE5"}
            },
            title: vizOptions.showTitle ? { text: 'Total Spend<br> <b>' + numeral(totalValue).format('$0,0') + '</b><br>',
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
            xAxis: {
                categories: Array.from(graphData.categories),
                visible: vizOptions.showLegend,
                tickLength: 0,
                tickWidth: 0,
            },
            yAxis: [{
                visible: vizOptions.showLegend,
                reversed: false,
                title: null,
                labels: {
                enabled: false,
                formatter: function () {
                    return formatAmount(Math.abs(this.value)).replace(/ /g, '').replace('.0', '');
                }
                },
            }
            ],
            legend: {
                enabled: false
            },  
            tooltip: {
                outside: false,
                formatter: function () {
                    // return '<b>' + this.point.name + '</b>' + ': $' + Highcharts.numberFormat(this.point.y,0,".",",");
                    return `<b>${this.point.category}</b><br/>${this.point.series.name}: <b>$${Highcharts.numberFormat(this.point.y,0,".",",")}</b>`;
                }
            },            
            plotOptions: {
                series:{
                    stacking:'normal',
                    marker: {
                        enabled: false
                      },
                    lineWidth:null,
                    states: {
                        inactive: {
                            opacity: 1
                        }
                    }
                },
            },
            series: Object.values(graphData.range)
    }
    let navigateToPage = (linkTo) => {
        linkTo && linkTo !== "" && navigate(location.pathname === "/" ? linkTo : getDrilldownPath(location.pathname, linkTo), {state: {}})
    }
    const nodata = Object.values(graphData.range).length === 0;
    return (
        <DashboardItem  nodata={nodata} title={title} subtitle={subtitle} chartHelpContextKey={chartHelpContextKey} chartRef={chartRef}>
            <div ref={rref} style={{position: 'relative', height: '100%'}}>
                <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, right: 0}}>
                    <HighchartsReact ref={chartRef} highcharts={Highcharts} options={opts} />
                    {vizOptions["linkTo"] && vizOptions["linkTo"] !== "" &&
                        <MDBox display="flex" flexDirection="row" justifyContent="flex-end">
                            <MDTypography style={{position: 'absolute', bottom: '-10px', right: '5px'}} variant="button" px={0.5} py={0.5} fontWeight="medium" whiteSpace="nowrap" sx={{ "&:hover": { cursor: 'pointer', backgroundColor: colors.linkBackColour ? colors.linkBackColour : "light" }, color: colors.linkColour, borderRadius: "5px"}} color={colors.linkColour ? colors.linkColour : "dark"} onClick={() => { navigateToPage(vizOptions["linkTo"])}}>
                            {vizOptions.linkText.toUpperCase()}&nbsp;<Icon sx={{ pt: 0.25 }} variant="contained">east</Icon>
                            </MDTypography>
                        </MDBox>

                    }
                </div>
            </div>
        </DashboardItem>
    )
}

export default StackedAreaChartRenderer;