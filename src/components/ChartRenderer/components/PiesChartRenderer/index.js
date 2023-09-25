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
import { useContext, useEffect, useState } from 'react';
import { CubeContext } from '@cubejs-client/react';
import { useImmer } from 'use-immer';
import numeral from 'numeral';


const PiesChartRenderer = ({ title, subtitle, chartHelpContextKey, vizState, vizOptions }) => {

    const chartRef = createRef();
    const { width, height, ref: rref } = useResizeDetector();

    let range = [];
    let navigate = useNavigate()
    let location = useLocation()
    let totalValue = 0
    let nonCloudSpend = 0
    let cloudSpend = 0
    let totalPercentage = 0
    let totalPrevValue = 0
    let perValue = 0
    let i = 0

    const { query } = vizState;
    const [cubeQuery, setCubeQuery] = useImmer(query);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setCubeQuery(query);
    }, [query]);

    const { cubejsApi } = useContext(CubeContext);
    const [resultSet1, setResultSet1] = useState(null);
    const [resultSet2, setResultSet2] = useState(null);
    const [resultSetSub, setResultSetSub] = useState([]);
    useEffect(() => {
        async function getData() {
            if (query.length > 0) {
                cubejsApi.load(query[0]).then((resultSet) => {
                    setResultSet1(resultSet.tablePivot());
                });
            } else {
                setResultSet1([])
            }

            if (query.length > 1) {
                cubejsApi.load(query[1]).then((resultSet) => {
                    setResultSet2(resultSet.tablePivot());
                });
            } else {
                setResultSet2([])
            }
            if (vizOptions.subcategories) {
                let subResults = []
                for (i = 2; i < query.length; i++) {
                    await cubejsApi.load(query[i]).then((resultSet) => {
                        subResults.push(resultSet.tablePivot());
                    });
                }
                setResultSetSub(subResults)
            }
            setLoading(false);
        }
        getData();
    }, [cubeQuery]);

    if (loading || !resultSet1 || !resultSet2)
        return <DashboardItem loading={loading} title={title} subtitle={subtitle}></DashboardItem>
    if (resultSetSub.length > 0) {
        if (loading || !resultSet1 || !resultSet2 || resultSetSub.length === 0)
            return <DashboardItem loading={loading} title={title} subtitle={subtitle}></DashboardItem>
    }
    resultSet1.map((item) => {
        if (vizOptions && vizOptions.series) {
            vizOptions.series.map((col) => {
                range.push({
                    name: col.useNameString ? col.name : item[col.name] ? item[col.name] : '',
                    color: colors.pieColors[i++],
                    y: Number(item[col.value]),
                    percentage: 0
                })
                totalValue = totalValue + Number(item[col.value])
            })
        }
    });

    resultSet2.map((item) => {
        if (vizOptions && vizOptions.series) {
            vizOptions.series.map((col) => {
                totalPrevValue = totalPrevValue + Number(item[col.value])
            })
        }
    });

    for (let i = 0; i < range.length; i++) {
        range[i].percentage = Number(((range[i].y / totalValue) * 100).toFixed(0))
    }

    perValue = totalPrevValue === 0 ? 0 : vizOptions.wigetType === "doughnutpercent" ? Math.round((totalPrevValue / totalValue) * 100) : Math.round(((totalValue - totalPrevValue) / totalPrevValue) * 100);

    var obj = [
        {
            name: 'Total Spend',
            color: colors.grey[400],
            y: 100 - perValue,
            percentage: 0
        },
        {
            name: 'Cloud Spend',
            color: colors.pieColors[1],
            y: perValue,
            percentage: 0
        }
    ]

    if (vizOptions.subcategories) {
        let subcategoryTotal = 0
        resultSetSub.map(item => {
            if (vizOptions && vizOptions.series) {
                vizOptions.series.map((col) => {
                    subcategoryTotal = subcategoryTotal + Number(item[0][col.value])
                })
            }
            let categoryDiffValue = totalPrevValue - subcategoryTotal
            let totalDiffValue = totalValue - totalPrevValue
            // obj = [
            //     {
            //         name: 'Others',
            //         color: colors.grey[400],
            //         y: Math.round((totalDiffValue / totalValue) * 100),
            //         amount: totalDiffValue,
            //         percentage: 0
            //     },
            //     {
            //         name: 'Cloud',
            //         color: colors.pieColors[1],
            //         y: Math.round((categoryDiffValue / totalValue) * 100),
            //         amount: categoryDiffValue,
            //         percentage: 0
            //     },
            //     {
            //         name: ' Cloud Service Provider',
            //         color: colors.pieColors[2],
            //         y: Math.round((subcategoryTotal / totalValue) * 100),
            //         amount: subcategoryTotal,
            //         percentage: 0
            //     }
            // ]
            nonCloudSpend = Math.round((subcategoryTotal / totalValue) * 100)
            cloudSpend =  Math.round((categoryDiffValue / totalValue) * 100)
            totalPercentage = nonCloudSpend + cloudSpend
            obj = [
                {
                    name: 'Non-Cloud Spend',
                    color: colors.grey[400],
                    y: Math.round((totalDiffValue / totalValue) * 100),
                    amount: totalDiffValue,
                    percentage: 0
                },
                {
                    name: 'Cloud Service Provider Spend',
                    color: colors.pieColors[1],
                    y: Math.round((subcategoryTotal / totalValue) * 100),
                    amount: subcategoryTotal,
                    percentage: 0
                },
                {
                    name: 'Other Cloud Spend',
                    color: colors.pieColors[2],
                    y: Math.round((categoryDiffValue / totalValue) * 100),
                    amount: categoryDiffValue,
                    percentage: 0
                }
            ]

        })

    }

    range = vizOptions.wigetType === "doughnutpercent" ? obj : range
    var textColour = (totalValue > totalPrevValue ? "red" : "green");
    // var perText = (textColour === 'green' ? ' ▼ ' : textColour === 'red' ? ' ▲ ' : '') + '' + (Math.abs(perValue) + '% ' + (textColour === 'green' ? ' down ' : textColour === 'red' ? ' up ' : '') )
    var perText = vizOptions.wigetType === "doughnutpercent" ? (Math.abs(perValue) + '%') : (textColour === 'green' ? ' ▼ ' : textColour === 'red' ? ' ▲ ' : '') + '' + (Math.abs(perValue) + '% ')
    var withText = (textColour === 'green' ? ' down from last month' : textColour === 'red' ? ' up from last month' : '')

    const totWidthScreen = window.innerWidth
    var titleSize, subtitleSize, ySize

    // if (totWidthScreen <= 360) { titleSize = 15; subtitleSize = 8 }
    // else if (totWidthScreen <= 450 && totWidthScreen > 360) { titleSize = 19; subtitleSize = 15 }
    // else if (totWidthScreen <= 660 && totWidthScreen > 450) { titleSize = 20; subtitleSize = 15 }
    // else if (totWidthScreen <= 1024 && totWidthScreen > 660) { titleSize = 20; subtitleSize = 14 }
    // else if (totWidthScreen <= 1090 && totWidthScreen > 1024) { titleSize = 18; subtitleSize = 10 }
    // else if (totWidthScreen <= 1280 && totWidthScreen > 1090) { titleSize = 20; subtitleSize = 12 }
    // else if (totWidthScreen <= 1400 && totWidthScreen > 1280) { titleSize = 20; subtitleSize = 15 }
    // else if (totWidthScreen > 1400) { titleSize = 20; subtitleSize = 15 }

    if (totWidthScreen <= 360) { titleSize = vizOptions.wigetType === "doughnutpercent" ? 20 : 15; subtitleSize = vizOptions.wigetType === "doughnutpercent" ? 10 : 8; ySize = 20 }
    else if (totWidthScreen <= 450 && totWidthScreen > 360) { titleSize = vizOptions.wigetType === "doughnutpercent" ? 30 : 19; subtitleSize = 15; ySize = 26 }
    else if (totWidthScreen <= 660 && totWidthScreen > 450) { titleSize = vizOptions.wigetType === "doughnutpercent" ? 36 : 20; subtitleSize = 15; ySize = 26 }
    else if (totWidthScreen <= 1024 && totWidthScreen > 660) { titleSize = vizOptions.wigetType === "doughnutpercent" ? 36 : 20; subtitleSize = 14; ySize = 32 }
    else if (totWidthScreen <= 1090 && totWidthScreen > 1024) { titleSize = vizOptions.wigetType === "doughnutpercent" ? 30 : 18; subtitleSize = 10; ySize = 32 }
    else if (totWidthScreen <= 1280 && totWidthScreen > 1090) { titleSize = vizOptions.wigetType === "doughnutpercent" ? 36 : 20; subtitleSize = 12; ySize = 32 }
    else if (totWidthScreen <= 1400 && totWidthScreen > 1280) { titleSize = vizOptions.wigetType === "doughnutpercent" ? 36 : 20; subtitleSize = 15; ySize = 32 }
    else if (totWidthScreen > 1400) { titleSize = vizOptions.wigetType === "doughnutpercent" ? 36 : 20; subtitleSize = 15; ySize = 32 }

    var opts = {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
            width: width,
            height: vizOptions.wigetType === "doughnutpercent" ? height : height * 0.945,
            style: { fontFamily: 'inherit', paddingTop: '0', fontSize: '20px', color: "#9EAEE5" }
        },
        legend: {
            itemStyle: { fontFamily: 'inherit', fontWeight: 500 },
        },
        title: vizOptions.showTitle ?
            // {
            //     text: vizOptions.wigetType === "doughnutpercent" ? vizOptions.subcategories ? '<span style="font-size: ' + subtitleSize + 'px;">Total Cloud Spend</span><br> <b><span style="font-size: ' + titleSize + 'px;">' + numeral(totalPrevValue.toFixed(2)).format('$0,0') + '</span></b>' :
            //         '<span style="font-weight: bold; font-size: 25px;"><br>' + perText + '</span>'
            //         :
            //         '<span style="font-size: ' + titleSize + 'px;">Total Spend</span><br> <b><span style="font-size: ' + titleSize + 'px;">' + numeral(totalValue.toFixed(2)).format('$0,0') + '</span></b><br/><span style="font-size: ' + subtitleSize + 'px;"><span style="color:' + textColour + '">' + perText + '</span><br/>' + withText + '</span>',
            //     align: 'center',
            //     verticalAlign: 'middle',
            //     y: 12
            // }
            {
                text: vizOptions.wigetType === "doughnutpercent" ? vizOptions.subcategories ? ' <span style="font-size: ' + subtitleSize + 'px;">'+"  "+'</span><br> <b><span style="font-size: ' + titleSize + 'px;">' + totalPercentage + '%' + '</span></b>' :
                    '<span style="font-weight: bold; font-size: 25px;"><br>&nbsp;' + perText + '</span>'
                    :
                    '<span style="font-size: ' + titleSize + 'px;">Total Spend</span><br> <b><span style="font-size: ' + titleSize + 'px;">' + numeral(totalValue.toFixed(2)).format('$0,0') + '</span></b><br/><span style="font-size: ' + subtitleSize + 'px;"><span style="color:' + textColour + '">' + perText + '</span><br/>' + withText + '</span>',
                align: 'center',
                verticalAlign: 'middle',
                y: vizOptions.wigetType === "doughnutpercent" ? ySize : 12
            }
            : '',
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
                allowPointSelect: vizOptions.wigetType === "doughnutpercent" ? false : true,
                cursor: (vizOptions["popupTo"] || vizOptions["drillTo"]) ? "pointer" : "default",
                innerSize: vizOptions.wigetType === "doughnut" ? '80%' : vizOptions.wigetType === "doughnutpercent" ? '60%' : '0',
                center: ['50%', '50%'],
                size: vizOptions.showTitle ? '60%' : '50%',
                dataLabels: {
                    // enabled: vizOptions.wigetType === "doughnutpercent" ? false : true,
                    enabled: true,
                    style: {
                        fontSize: vizOptions.title ? '15px' : '11px',
                        fontFamily: 'inherit',
                        fontWeight: 400,
                    },
                    // distance: -40,
                    // formatter: function () {
                    //     return `${this.point.name}<br><b>${Highcharts.numberFormat(this.point.percentage, 0)}%</b>&nbsp;($${Highcharts.numberFormat(this.point.y, 0, ".", ",")})`;
                    // }
                    formatter: vizOptions.wigetType === "doughnutpercent" ? function () {
                        return '<b>' + this.point.name + '</b>' + ': $' + Highcharts.numberFormat(this.point.amount, 0, ".", ",") + ` (${Highcharts.numberFormat(this.point.percentage, 0)}%)`;
                    } :
                        function () {
                        return `${this.point.name}<br><b>${Highcharts.numberFormat(this.point.percentage, 0)}%</b>&nbsp;($${Highcharts.numberFormat(this.point.y, 0, ".", ",")})`;
                    }
                },
                point: {
                    showInLegend: true,
                    cumulative: 100,
                },
            },
            series: {
                states: {
                    inactive: {
                        opacity: 1
                    },
                    hover: {
                        enabled: vizOptions.wigetType === "doughnutpercent" ? false : true
                    }
                }
            }
        },
        tooltip: {
            enabled: vizOptions.wigetType === "doughnutpercent" ? true : true,
            outside: false,
            formatter: vizOptions.wigetType === "doughnutpercent" ? vizOptions.subcategories ? function () {
                return '<b>' + this.point.name + '</b>' + ': $' + Highcharts.numberFormat(this.point.amount, 0, ".", ",") + ` (${this.point.y}%)`;
            } :
                function () {
                    return '<b>' + this.point.name + '</b>' + ': ' + this.point.y + '%';
                }
                :
                function () {
                    return '<b>' + this.point.name + '</b>' + ': $' + Highcharts.numberFormat(this.point.y, 0, ".", ",");
                }
        },
        series: [{
            name: 'Spend',
            // colorByPoint: true,
            data: range,
        }]
    }
    let navigateToPage = (linkTo) => {
        linkTo && linkTo !== "" && navigate(location.pathname === "/" ? linkTo : getDrilldownPath(location.pathname, linkTo), { state: {} })
    }
    const nodata = range.length === 0;
    return (
        <DashboardItem nodata={nodata} title={title} subtitle={subtitle} chartHelpContextKey={chartHelpContextKey} chartRef={chartRef}>
            <div ref={rref} style={{ position: 'relative', height: '100%' }}>
                <div style={{ position: 'absolute', left: 0, top: -10, bottom: 0, right: 0 }}>
                    <HighchartsReact ref={chartRef} highcharts={Highcharts} options={opts} />
                    {vizOptions["linkTo"] && vizOptions["linkTo"] !== "" &&
                        <MDBox display="flex" pt={1.5} flexDirection="row" justifyContent="flex-end">
                            <MDTypography style={{ position: 'absolute', bottom: '-10px', right: '5px' }} variant="button" px={0.5} py={0.5} fontWeight="medium" whiteSpace="nowrap" sx={{ "&:hover": { cursor: 'pointer', backgroundColor: colors.linkBackColour ? colors.linkBackColour : "light" }, color: colors.linkColour, borderRadius: "5px" }} color={colors.linkColour ? colors.linkColour : "dark"} onClick={() => { navigateToPage(vizOptions["linkTo"]) }}>
                                {vizOptions.linkText.toUpperCase()}&nbsp;<Icon sx={{ pt: 0.25 }} variant="contained">east</Icon>
                            </MDTypography>
                        </MDBox>
                    }
                </div>
            </div>
        </DashboardItem>
    )
}

export default PiesChartRenderer;