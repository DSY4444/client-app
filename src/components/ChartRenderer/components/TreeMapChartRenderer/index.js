import Highcharts from 'highcharts/highcharts.src.js';
import HighchartsReact from 'highcharts-react-official';
import treemap from "highcharts/modules/treemap.js";
import colors from 'assets/theme/base/colors';
import { useResizeDetector } from 'react-resize-detector';
import { useNavigate, useLocation } from "react-router-dom";
import { formatAmount, getDrilldownPath, removeSessionFilter } from 'utils';
import { useYADialog } from "components/YADialog";
import DashboardItem from 'components/DashboardItem';
import { createRef } from 'react';
import _ from 'lodash';
import { useDashboardContext } from 'components/DashboardContext';
import { isTimeDimensionQuery } from 'utils/dashboard';
import { parseTableResultset } from 'utils/charts';

treemap(Highcharts);

const mapColors = colors.treemapColors

const TreeMapChartRenderer = ({ loading, title, subtitle, chartHelpContextKey, resultSet, vizOptions }) => {

    const [state,] = useDashboardContext();
    const chartRef = createRef();
    const { width, height, ref: rref } = useResizeDetector();

    const { showReport } = useYADialog();
    let range = {};
    let categories = new Set();
    let navigate = useNavigate();
    let location = useLocation();
    let currentFilters;

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

    parsedResultset.forEach((item, i) => {
        categories.add(item[vizOptions.category]);

        if (!range["series1"]) {
            range["series1"] = {
                name: "series1",
                data: [],
            };
        }

        let val = Number(item[vizOptions.banner.value1]);
        if (isNaN(val)) val = 0;
        let prevVal = Number(item[vizOptions.banner.value2]);
        if (isNaN(prevVal)) prevVal = 0;

        range["series1"].data.push({
            name: item[vizOptions.category] + '<b>' +
                (prevVal > 0 ?
                    (val > prevVal ?
                        ' <span style="color:#ff1a1a">▲</span>'
                        :
                        ' <span style="color:#009900">▼</span>') : (val > 0 ?
                            ' <span style="color:#ff1a1a">▲</span>'
                            :
                            '')) +
                '</b>',
            measure: vizOptions.banner.useNameString1 ? vizOptions.banner.label1 : item[vizOptions.banner.label1],
            priorMeasure: vizOptions.banner.useNameString2 ? vizOptions.banner.label2 : item[vizOptions.banner.label2],
            tootipName: item[vizOptions.category],
            color: mapColors[i % mapColors.length],
            value: val,
            priorValue: prevVal,
            variance: prevVal > 0 ? val - prevVal : val,
            variancePercentage: prevVal > 0 ? Math.round(((val - prevVal) / prevVal) * 100) : 100
        });
    });

    var opts = {
        chart: {
            width: width,
            height: height,
            type: 'treemap',
            style: { fontFamily: 'inherit', fontSize: '14px', },
            spacingBottom: 0,
            spacingTop: 0,
            spacingRight: 0,
            spacingLeft: 0,
            backgroundColor: colors.chartBackground
        },
        title: { text: '' },
        exporting: { enabled: false },
        credits: { enabled: false },
        tooltip: {
            outside: false,
            backgroundColor: '#fff',
            style: {
                fontSize: '12px',
                fontFamily: 'inherit',
                fontWeight: 400,
                color: '#000',
            },

            formatter: function () {
                return '<span style="font-size:12px"><b>' + this.point.name +
                    '</b><br/>' + this.point.measure + ' YTD:<b> $' +
                    Highcharts.numberFormat(this.point.value, 0, ".", ",") +
                    (this.point.priorMeasure ? '</b></br>' + this.point.priorMeasure + ' YTD:<b> $' + Highcharts.numberFormat(this.point.priorValue, 0, ".", ",") : '') +
                    '</b></br>Variance: ' +
                    (this.point.variance > 0 ?
                        '<span style="color:#ff1a1a"><b>$'
                        + Highcharts.numberFormat(this.point.variance, 0, ".", ",")
                        :
                        '<span style="color:#009900"><b>' + (this.point.variance < 0 ? '-' : '') + '$'
                        + Highcharts.numberFormat(Math.abs(this.point.variance), 0, ".", ","))
                    + '</b> (' + Math.abs(this.point.variancePercentage) + '%)' +
                    '</span></span>';
                // return `<b>${this.point.category}</b><br/>Spend: <b>$${Highcharts.numberFormat(this.point.value,0,".",",")}</b>`;
            }
        },
        xAxis: {
            categories: Array.from(categories)
        },
        plotOptions: {
            series: {
                cursor: "pointer",
                groupPadding: 0.1,
                // pointPadding: 0,
                borderWidth: 0,
                point: {
                    events: {
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
                            if (vizOptions.queryType && vizOptions.queryType === "CompareWithPrevYearTrend" && vizOptions["popupTo"] && vizOptions["popupTo"] !== "") {
                                if (obj.find((({ name }) => name === "Years.year")))
                                    _.remove(obj, { name: "Years.year" })
                                obj.unshift({name: "Years.year", "values": [event.point.measure]})
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
                }
            }
        },
        yAxis: [{
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
        series: [
            {
                type: 'treemap',
                layoutAlgotithm: 'squarified',
                allowDrillToNode: false,
                levels: [
                    {
                        level: 1,
                        layoutAlgorithm: 'squarified',
                        dataLabels: {
                            enabled: true
                        },
                        borderWidth: 1,
                        levelIsConstant: false
                    },
                    {
                        level: 1,
                        dataLabels: {
                            // color: '#fff',
                            // borderColor: '#fff',
                            shadow: false,
                            style: {
                                fontSize: '12px',
                                fontFamily: 'inherit',
                                fontWeight: 400,
                                // color: '#fff',
                            }
                        }
                    }
                ],
                data: Object.values(range)[0]?.data.slice(0, 20)
            }
        ]
    }
    const nodata = categories?.size === 0;
    return (
        <DashboardItem nodata={nodata} title={title} subtitle={subtitle} chartHelpContextKey={chartHelpContextKey} chartRef={chartRef}>
            <div ref={rref} style={{ position: 'relative', height: '100%' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, right: 0 }}>
                    <HighchartsReact ref={chartRef} highcharts={Highcharts} options={opts} />
                </div>
            </div>
        </DashboardItem>
    );
}

export default TreeMapChartRenderer;