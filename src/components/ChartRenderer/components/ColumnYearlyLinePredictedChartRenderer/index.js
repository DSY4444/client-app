import { createRef } from 'react';
import Highcharts from 'highcharts/highcharts.src.js';
import HighchartsReact from 'highcharts-react-official';
import { useNavigate, useLocation } from "react-router-dom";
import { formatAmount, getDrilldownPath, removeSessionFilter } from 'utils';
import colors from "assets/theme/base/colors";
import { useResizeDetector } from 'react-resize-detector';
import { useYADialog } from "components/YADialog";
import { convertRStoGraphYearlyPredicted } from "utils"
import DashboardItem from 'components/DashboardItem';
import _ from 'lodash';
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import Icon from "@mui/material/Icon";
import { useContext, useEffect, useState } from 'react';
import { CubeContext } from '@cubejs-client/react';
import { useImmer } from 'use-immer';

const ColumnYearlyLinePredictedChartRenderer = ({ title, subtitle, chartHelpContextKey, vizState, vizOptions }) => {
    const chartRef = createRef();
    let { width, height, ref: rref } = useResizeDetector();

    const { showReport } = useYADialog();
    let navigate = useNavigate()
    let location = useLocation()

    const { query } = vizState;
    const [cubeQuery, setCubeQuery] = useImmer(query);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setCubeQuery(query);
    }, [query]);

    const { cubejsApi } = useContext(CubeContext);
    const [resultSet1, setResultSet1] = useState(null);
    const [resultSet2, setResultSet2] = useState(null);
    const [currentfilters, setCurrrentFilters] = useState();

    useEffect(() => {
        async function getData() {
            setResultSet1(null)
            setResultSet2(null)
            if (cubeQuery.length > 0) {
                cubejsApi.load(cubeQuery[0]).then((resultSet) => {
                    setResultSet1(resultSet);
                });
            } else {
                setResultSet1([])
            }

            if (cubeQuery.length > 1) {
                cubejsApi.load(cubeQuery[1]).then((resultSet) => {
                    setResultSet2(resultSet);
                    setCurrrentFilters(removeSessionFilter(resultSet.loadResponse.pivotQuery.filters, vizOptions))
                });
            } else {
                setResultSet2([])
            }

            setLoading(false);
        }
        getData();
    }, [cubeQuery]);

    if (width === 0) {
        width = undefined
    }

    var plotData = {
        categories: [],
        filters: {},
        range: {}
    }

    if (resultSet1 && resultSet2) {
        // currentFilters = removeSessionFilter(resultSet2.loadResponse.pivotQuery.filters, vizOptions)
        var count = vizOptions.series.length;
        var prvData = convertRStoGraphYearlyPredicted(resultSet1, count === 1 ? colors.singleDataColors : colors.graphColors, vizOptions)
        var currData = convertRStoGraphYearlyPredicted(resultSet2, count === 1 ? colors.singleDataColors : colors.graphColors, vizOptions)
        plotData.categories = currData.categories
        plotData.filters = currentfilters
        plotData.range = {}
        if (prvData.categories.length > 0 && currData.categories.length > 0) {
            plotData.range[vizOptions.series[0].value] = prvData.range[vizOptions.series[0].value]
            plotData.range[vizOptions.series[0].value + " YTD"] = prvData.range[vizOptions.series[0].value + " YTD"]
            plotData.range[vizOptions.series[1].value] = currData.range[vizOptions.series[1].value]
            plotData.range[vizOptions.series[1].value + " YTD"] = currData.range[vizOptions.series[1].value + " YTD"]
        }
    }

    let opts = {
        plotData,
        chartOptions: {
            chart: {
                width: width,
                height: vizOptions.drillTo ? 284 : vizOptions.linkText ? height - 25 : height,
                style: { fontFamily: 'inherit', fontSize: '14px', },
                spacingBottom: 0,
                // spacingTop: 0,
                spacingRight: 0,
                spacingLeft: 0,
                backgroundColor: colors.chartBackground
            },
            title: { text: '' },
            exporting: { enabled: false },
            lang: { thousandsSep: ',' },
            credits: { enabled: false },
            xAxis: {
                categories: Array.from(plotData.categories)
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
                    cursor: (vizOptions["popupTo"] || vizOptions["drillTo"]) ? "pointer" : "default",
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
                                var obj = Object.assign([], [...plotData.filters]);
                                if (obj.find((({ name }) => name === "Months.month")))
                                    _.remove(obj, { name: "Months.month" })
                                if (vizOptions.category.length > 0)
                                    // if (!obj.find((({name}) => name === vizOptions.category))) 
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
                                    popupTo = vizOptions["popupTo"] ? vizOptions["popupTo"].replace("changeme", popupkey.toLowerCase()).replace(' ', '') : ''
                                }
                                if (vizOptions.queryType && vizOptions.queryType === "CompareWithPrevYearTrend" && vizOptions["popupTo"] && vizOptions["popupTo"] !== "") {
                                    if (obj.find((({ name }) => name === "Years.year")))
                                        _.remove(obj, { name: "Years.year" })
                                    obj.unshift({ name: "Years.year", "values": [event.point.series.name.replace(" YTD", "")] })
                                }
                                if (vizOptions.excludeFilters && vizOptions.excludeFilters.length > 0) {
                                    vizOptions.excludeFilters.map((fil) => {
                                        if (obj.find((({ name }) => name === fil)))
                                            _.remove(obj, { name: fil })
                                    })
                                }
                                // setObject1(obj)
                                vizOptions["drillTo"] && vizOptions["drillTo"] !== "" && navigate(location.pathname === "/" ? vizOptions.drillTo : getDrilldownPath(location.pathname, vizOptions.drillTo), { state: obj })
                                // vizOptions["drillTo"] && vizOptions["drillTo"] !== "" && navigate(vizOptions.drillTo, { state: obj})
                                popupTo && popupTo !== "" && showReport(popupTo, obj, null);
                            }
                        }
                    }
                }
            },
            series: Object.values(plotData.range)

        }
    }

    if (loading || !resultSet1 || !resultSet2)
        return <DashboardItem loading={loading} title={title} subtitle={subtitle}></DashboardItem>


    const nodata = opts.plotData.categories?.length === 0;

    let navigateToPage = () => {
        vizOptions["linkTo"] && vizOptions["linkTo"] !== "" && navigate(location.pathname === "/" ? vizOptions.linkTo : getDrilldownPath(location.pathname, vizOptions.linkTo), { state: {} })
    }

    return (
        <DashboardItem nodata={nodata} title={title} subtitle={subtitle} chartHelpContextKey={chartHelpContextKey} chartRef={chartRef}>
            <div ref={rref} style={{ position: 'relative', height: '100%' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, right: 0 }}>
                    <HighchartsReact ref={chartRef} highcharts={Highcharts} options={opts.chartOptions} />
                    {vizOptions["linkTo"] && vizOptions["linkTo"] !== "" &&
                        <MDBox display="flex" flexDirection="row" justifyContent="flex-end">
                            <MDTypography style={{ position: 'absolute', bottom: '-10px', right: '5px' }} variant="button" px={0.5} mt={{ lg: 17, md: 5.25, sm: 5.25, xs: 5.25 }} py={0.5} fontWeight="medium" whiteSpace="nowrap" sx={{ "&:hover": { cursor: 'pointer', backgroundColor: colors.linkBackColour ? colors.linkBackColour : "light" }, color: colors.linkColour, borderRadius: "5px" }} color={colors.linkColour ? colors.linkColour : "dark"} onClick={() => { navigateToPage(vizOptions["linkTo"]) }}>
                                {vizOptions.linkText.toUpperCase()}&nbsp;<Icon sx={{ pt: 0.25 }} variant="contained">east</Icon>
                            </MDTypography>
                        </MDBox>
                    }
                </div>
            </div>
        </DashboardItem>
    )
}

export default ColumnYearlyLinePredictedChartRenderer;
