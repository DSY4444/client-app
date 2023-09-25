import { createRef } from 'react';
import Highcharts from 'highcharts/highcharts.src.js';
import HighchartsReact from 'highcharts-react-official';
import { useLocation, useNavigate } from "react-router-dom";
import { useResizeDetector } from 'react-resize-detector';
import { formatAmount, getDrilldownPath, convertRStoGraph , getName } from 'utils';
import colors from "assets/theme/base/colors";
import { useYADialog } from "components/YADialog";
import DashboardItem from 'components/DashboardItem';
import _ from 'lodash';
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import numeral from "numeral";
import { useContext, useEffect, useState } from 'react';
import { CubeContext } from '@cubejs-client/react';
import { useImmer } from 'use-immer';

const SpendLineRenderer = ({ title, subtitle, chartHelpContextKey, vizState, vizOptions }) => {
    
    const chartRef = createRef();
    let navigate = useNavigate();
    let location = useLocation(); 
    const { width, height, ref: rref } = useResizeDetector();
    const {showReport} = useYADialog();


    const { query } = vizState;
    const [cubeQuery, setCubeQuery] = useImmer(query);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setCubeQuery(query);
    }, [query]);

    const { cubejsApi } = useContext(CubeContext);
    const [resultSet1, setResultSet1] = useState(null);
    const [resultSet2, setResultSet2] = useState(null);
  
    useEffect(() => {
        async function getData() {
        if (query.length > 0) {
            cubejsApi.load(query[0]).then((resultSet) => {
            setResultSet1(resultSet);
            });
        } else {
            setResultSet1([])
        }

        if (query.length > 1) {
            cubejsApi.load(query[1]).then((resultSet) => {
            setResultSet2(resultSet);
            });
        } else {
            setResultSet2([])
        }

        setLoading(false);
        }
        getData();
    }, [cubeQuery]);

    if (loading || !resultSet1 || !resultSet2)
        return <DashboardItem loading={loading} title={title} subtitle={subtitle}></DashboardItem>

    let scrollablePlotAreaMinHeight = 300;
    let currentFilters = [];

    // currentFilters = resultSet.loadResponse.pivotQuery.filters.map((f) => {
    //     return { name: f.member, operator: f.operator, values: f.values }
    // })
    var count = vizOptions.series.length;
    var graphData1 = convertRStoGraph(resultSet1, count === 1 ? colors.singleDataColors : colors.graphColors, "bar", vizOptions)
    var graphData2 = convertRStoGraph(resultSet2, count === 1 ? colors.singleDataColors : colors.graphColors, "bar", vizOptions)
    scrollablePlotAreaMinHeight = vizOptions.wigetType === 'oneStack' ? 50 : 25*graphData1.categories.size* Object.keys(graphData1.range).length;

    let c = 0;
    let obj1 = {};
    let obj2 = {};
    let tot1 = 0;
    let tot2 = 0;
    let data1 = []
    let datatmp = []

    const calcData = ((graphData) => {
        let obj = {};
        obj.categories = [''];
        obj.range = {};
        let tot = 0;
        
        Array.from(graphData.categories).map((item,i) => {
            if (!obj.range[getName(item,vizOptions)]) {
                obj.range[getName(item,vizOptions)] = {
                    color: colors.graphColors[c++],
                    data : [graphData.range[Object.keys(graphData.range)[0]].data[i]],
                    name : getName(item,vizOptions),
                    type : 'bar'
                }
                tot = tot + Number(graphData.range[Object.keys(graphData.range)[0]].data[i]);
            }
            else {
                obj.range[getName(item,vizOptions)].data[0] =  obj.range[getName(item,vizOptions)].data[0] + graphData.range[Object.keys(graphData.range)[0]].data[i]
                tot = tot + Number(graphData.range[Object.keys(graphData.range)[0]].data[i])
            }
            return
        })
        return ({obj, tot})
    })
 
    obj1 = calcData(graphData1)
    obj2 = calcData(graphData2)

    var colorsToUse = colors.graphColors
    if (vizOptions.colorForGraph==="vendor") {
    colorsToUse=colors.horizontalStackedGraphColors2
    }
    if (vizOptions.colorForGraph==="application") {
    colorsToUse=colors.horizontalStackedGraphColors1            
    }
    if (vizOptions.labor) {
    colorsToUse=colors.horizontalStackedGraphColors3     
    }

    datatmp = Object.values(obj1.obj.range)
    tot1 = obj1.tot
    datatmp.sort(function(a,b) { return parseFloat(b.data[0]) - parseFloat(a.data[0]) });
    data1 = datatmp.slice(0,5);
    data1.sort(function(a,b) { return parseFloat(a.data[0]) - parseFloat(b.data[0]) });
    data1.map((item,idx) => {
        item.color = colorsToUse[idx]
    })
    tot2 = obj2.tot

    var textColour = tot1 > tot2 ? "error" : "success";
    var VariancePercentage = (tot2 === 0 ? 0 : Math.round(((tot1 - tot2) / tot2) * 100));
    var varWith = textColour === 'success' ? ' down from last month ' : textColour === 'error' ? ' up from last month ' : '';
    var varValue = (textColour === 'success' ? ' ▼ ' : textColour === 'error' ? ' ▲ ' : '') + '' + (Math.abs(VariancePercentage) + '%')


    var opts = {
        chart: {  
            type: 'bar',
            width: width, 
            height:  vizOptions.wigetType === 'oneStack' ? 60 : height,
            borderWidth: 0,
            spacingBottom: 0,
            scrollablePlotArea: {
                minHeight:scrollablePlotAreaMinHeight,
                maxHeight:scrollablePlotAreaMinHeight+1,
            },
            style: { fontFamily: 'inherit', fontSize: '14px', },
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
            categories: Array.from(obj1.obj.categories),
            visible:false,
            offset: 7,
            lineWidth: 0,
            tickLength: 0        
        },
        yAxis: [{
            visible:false,
            gridLineColor: 'transparent',
            reversed: false,
            title: {
                text: ''
            },
            labels: {
                formatter: function () {
                    return formatAmount(Math.abs(this.value)).replace(/ /g,'').replace('.0','');
                }
            },
        }],
        legend: {
            layout: 'vertical',
            backgroundColor: '#FFFFFF',
            enabled: false,
            floating: true,
            align: 'left',
            verticalAlign: 'bottom',
            x: 0,
            y: 90,
            labelFormatter: function () {
                return this.name + ' ' + this.dataMax;
            }
        },    
        plotOptions: {
            series: {
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
                },
            },
            bar: {
                stacking:"normal",
                pointPadding: -1,
                borderWidth: 0.3,
                borderRadius: 1,
                relativeXValue: true,                
                dataLabels: {
                  style: {
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    fontWeight: 400,
                  },
                formatter: function () {
                    return formatAmount(Math.abs(this.y)).replace(/ /g,'').replace('.0','');
                  }
                },
                pointWidth: 20
              }
        },
        series: Object.values(data1)

    }
    let navigateToPage = (linkTo) => {
        linkTo && linkTo !== "" && navigate(location.pathname === "/" ? linkTo : getDrilldownPath(location.pathname, linkTo), {state: {}})
    }
    let ShowLegend = (data) => {
        let datarev=data.data.slice().reverse()
        return (
            <MDBox height="66%" display="flex" alignItems="flex-start" flexDirection="column" justifyContent="flex-start">
                { tot1 > 0 && datarev.map((item) => {
                    var legendName = item.name 
                    var legendAmount =  numeral(item.data[0]).format('$0,0')
                    var legendPercentage =  numeral((Number(item.data[0])/tot1)*100).format('0,0')
                    var legendAmountPercentage = legendPercentage + "%"
                    return (
                        <>
                            <MDBox key={`${item.name}-1`} px={0} py={0} display={{ lg: "flex", md: "flex", sm: "none", xs: "none" }} width="100%" flexDirection="row" justifyContent="space-between" alignItems="center">
                                <MDBox key={`${item.name}-2`}  px={0} py={0} color={item.color ? item.color : "dark"} display="flex" overflow="hidden" textOverflow="ellipsis" flexDirection="row" alignItems="center" justifyContent="flex-start">
                                    <Icon baseClassName="material-icons">circle-sharp</Icon>&nbsp; 
                                        <MDTypography key={`${item.name}-3`}  variant="button" fontWeight="medium" px={1} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" >
                                            {item.name} 
                                        </MDTypography>
                                </MDBox>
                                <MDBox key={`${item.name}-4`} display="flex" alignItems="center">
                                    <MDTypography key={`${item.name}-5`} variant="button" fontWeight="medium" px={1} whiteSpace="nowrap">
                                    ({numeral((Number(item.data[0])/tot1)*100).format('0,0')}%) {numeral(item.data[0]).format('$0,0')} 
                                    </MDTypography>
                                </MDBox>
                            </MDBox>
                            <MDBox key={`${item.name}-6`} px={0} py={0} display={{ lg: "none", md: "none", sm: "flex", xs: "flex" }} width="100%" flexDirection="row" justifyContent="space-between" alignItems="center">
                                <MDBox key={`${item.name}-7`} px={0} py={0} color={item.color ? item.color : "dark"} display="flex" overflow="hidden" textOverflow="ellipsis" flexDirection="row" alignItems="center" justifyContent="flex-start">
                                    <Icon baseClassName="material-icons">circle-sharp</Icon>&nbsp; 
                                    <Tooltip placement="bottom" title={
                                        <>
                                            <b>{legendName}</b><br/><p>{"("+legendAmountPercentage+") "+legendAmount}</p>
                                        </>
                                    }>
                                        <MDTypography key={`${item.name}-8`} variant="button" fontWeight="medium" px={1} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" >
                                            {item.name} 
                                        </MDTypography>
                                    </Tooltip>
                                </MDBox>
                                <MDBox key={`${item.name}-9`} display="flex" alignItems="center">
                                    <MDTypography key={`${item.name}-10`} variant="button" fontWeight="medium" px={1} whiteSpace="nowrap">
                                    ({numeral((Number(item.data[0])/tot1)*100).format('0,0')}%) {numeral(item.data[0]).format('$0,0')} 
                                    </MDTypography>
                                </MDBox>
                            </MDBox>
                        </>
                    )
                })}
            </MDBox>
        )
    }

    const nodata = !data1.length>0;
    return (
        <DashboardItem nodata={nodata} title={title} subtitle={subtitle} chartHelpContextKey={chartHelpContextKey} chartRef={chartRef}>
            <div ref={rref} style={{position: 'relative', width: '100%', height: '100%'}}>
                <div style={{position: 'absolute', left: 0, top: -20, bottom: 0, right: 0, width: '100%'}}>
                    <MDBox display="flex" alignItems="center" flexDirection="row" justifyContent="flex-start">
                        <MDTypography variant="h5" fontWeight="medium" px={1} py={0} whiteSpace="nowrap">
                            {numeral(tot1).format('$0,0')}  
                        </MDTypography>
                        <MDTypography color={textColour ? textColour : "dark"} variant="caption" fontWeight="medium" px={0} pt={0.3} whiteSpace="nowrap">
                            {varValue} 
                        </MDTypography>
                        <MDTypography variant="caption" fontWeight="medium" px={1} pt={0.2} whiteSpace="nowrap">
                            {varWith}  
                        </MDTypography>
                    </MDBox>                     
                    <HighchartsReact key={_.uniqueId()} ref={chartRef} highcharts={Highcharts} options={opts} />
                    <ShowLegend key={"legend"} data={data1}/>
                    {vizOptions["linkTo"] && vizOptions["linkTo"] !== "" &&
                    <MDBox display="flex" pb={0} pt={0.6} flexDirection="row" justifyContent="flex-end">
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

export default SpendLineRenderer;
