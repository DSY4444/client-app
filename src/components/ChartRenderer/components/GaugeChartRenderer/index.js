import Highcharts from 'highcharts/highcharts.src.js';
import HighchartsReact from 'highcharts-react-official';
import { useResizeDetector } from 'react-resize-detector';
import colors from 'assets/theme/base/colors';
import { useNavigate, useLocation } from "react-router-dom";
import numeral from 'numeral';
import { getDrilldownPath, removeSessionFilter } from 'utils';
import { useYADialog } from "components/YADialog";
import DashboardItem from 'components/DashboardItem';
import { createRef } from 'react';
import _ from 'lodash';
import { parseTableResultset } from 'utils/charts';
import { isTimeDimensionQuery } from 'utils/dashboard';
import { useDashboardContext } from 'components/DashboardContext';

// eslint-disable-next-line no-undef
require("highcharts/modules/exporting")(Highcharts);
// eslint-disable-next-line no-undef
require("highcharts/highcharts-more")(Highcharts);
// eslint-disable-next-line no-undef
require("highcharts/modules/solid-gauge")(Highcharts);

function GaugeGraph(props) { 
    const {showReport, currentFilters, vizOptions, chartRef, name, subname, dispname, lable, sublable, variance, data } = props;
    const maxValue = 150;

    let navigate = useNavigate()
    let location = useLocation()

    var value = data ? (data > maxValue ? maxValue : data) : data;
    var overind = data ? (data > maxValue ? '+' : '') : '';

    var opts = {
        chart: {
            type: 'solidgauge',
            height: 150,
            width: 200,
            backgroundColor:colors.chartBackground
        },
        title: '',
        pane: {
            center: ['50%', '85%'],
            size: '140%',
            startAngle: -90,
            endAngle: 90,
            background: {
                backgroundColor:
                    Highcharts.defaultOptions.legend.backgroundColor || '#EEE',
                innerRadius: '60%',
                outerRadius: '100%',
                shape: 'arc'
            }
        },
        exporting: {
            enabled: false
        },
        tooltip: {
            enabled: true,
            outside: true,
            distance: 70,
            formatter: function () {
                return '<span style="font-size:12px">' + lable + ': <b>' + name + 
                        '</b><br/>' + sublable + ': <b>' + (dispname ? dispname : 'NOT KNOWN') + 
                        '</b><br/>Actual: <b>' + numeral(Number(props.value).toFixed(2)).format('$0,0')  + 
                        '</b><br/>' + (vizOptions.compareTo === 'prior' ? 'Prior Year YTD' : 'Budget YTD') + ': <b>' + numeral(Number(props.priorvalue).toFixed(2)).format('$0,0')  + 
                        '</b><br/>Variance: <b>' + numeral(Number(variance).toFixed(2)).format('$0,0') + ' (' + value + overind +  '</b>%)</span>'
            }     
        },
        // the value axis
        yAxis: {
            stops: [
                [0.0, '#55BF3B'], // green
                [0.46, '#DDDF0D'], // yellow
                [0.675, '#DF5353'], // red
            ],
            lineWidth: 0,
            tickWidth: 0,
            minorTickInterval: null,
            tickAmount: 1,
            labels: {
                y: 16
            },
            tickPositioner: function() {
                return [0, maxValue];    
            },            
            min: 0,
            max: maxValue,
            title: {
                style: {
                    fontSize: '0.75rem',
                    fontWeight: 400,
                },
                text: dispname ? dispname : 'NOT KNOWN',
                y: -50 
            }            
        },
        plotOptions: {
            solidgauge: {
                dataLabels: {
                    y: 20,
                    borderWidth: 0,
                    useHTML: true
                }
            },
            series: {
                cursor: "pointer",
                point: {
                    events: {
                        click: function () {
                            var obj = Object.assign([], [...currentFilters]);
                            if (vizOptions.category)
                                if (obj.find((({name}) => name === vizOptions.category))) 
                                {
                                    _.remove(obj, {name: vizOptions.category})
                                    obj.push({ "name": vizOptions.category, "values": [name] })
                                }
                                else
                                {
                                    obj.push({ "name": vizOptions.category, "values": [name] })
                                }   
                               if (vizOptions.subCategory)
                                if (obj.find((({name}) => name === vizOptions.subCategory))) 
                                {
                                    _.remove(obj, {name: vizOptions.subCategory})
                                    obj.push({ "name": vizOptions.subCategory, "values": [subname] })
                                }
                                else
                                {
                                    obj.push({ "name": vizOptions.subCategory, "values": [subname] })
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
        credits: {
            enabled: false
        },
        series: [{
            name: 'Cost Pool Variance',
            data: [value],
            dataLabels: {
                format:
                    '<div style="text-align:center">' +
                    '<span style="font-size:12px">' + numeral(variance.toFixed(2)).format('$0,0') + '</span><br>' +
                    '<span style="font-size:12px">({y}</span>' + overind + 
                    '<span style="font-size:10px;opacity:0.7">%)</span>' +
                    '</div>'
            },
            tooltip: {
                valueSuffix: ' %'
            }
        }]
    };      

    return (
        <div style={{display: 'inline-block', position: 'relative'}}>
            <HighchartsReact ref={chartRef} highcharts={Highcharts} options={opts} />
            {/* <div style={{textAlign: 'center', padding: 0, margin: 0}}>{subname ? subname : ' - '}</div> */}
        </div>
    );
}

const GaugeChartRenderer = ({ loading, title, subtitle, chartHelpContextKey, resultSet, vizOptions }) => {

    const chartRef = createRef();
    const { ref: rref } = useResizeDetector();
    const [state,] = useDashboardContext();
    const {showReport} = useYADialog();
    let range = {};
    let categories = new Set();
    let currentFilters
    
    if(loading)
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

    // var count = vizOptions.series.length
    // var graphData = convertRStoGraph(parsedResultset, vizOptions.wigetType === "leftrightbar" ? colors.varianceColors : count === 1 ? colors.singleDataColors : colors.graphColors, "bar", vizOptions)


    parsedResultset.forEach((item) => {
        categories.add(item[vizOptions.category]);

        if (!range["series1"]) {
            range["series1"] = {
                name: "series1",
                data: [],
            };
        }

        range["series1"].data.push({
            name: item[vizOptions.category],
            subname: item[vizOptions.subCategory],
            dispname: item[vizOptions.displayCategory],
            lable: vizOptions.categoryName,
            sublable: vizOptions.subCategoryName,
            value: item[vizOptions.banner.value1],
            priorValue: item[vizOptions.banner.value2],
            variance: item[vizOptions.banner.value2] ? item[vizOptions.banner.value1] - item[vizOptions.banner.value2] : 0,
            variancePercentage: item[vizOptions.banner.value2] ? (Math.round(((item[vizOptions.banner.value1] - item[vizOptions.banner.value2]) / item[vizOptions.banner.value2]) * 100)) : 0
        });

    });

    const nodata = Object.values(range)[0]?.data?.size === 0;
    let data = {};
    Object.values(range)[0]?.data.map((item) => {
        if (!data[item.name]) {
            data[item.name] = {
                name: item.name,
                subdata: [],
            };
        }            
        data[item.name].subdata.push(
            {
                name: item.name,
                subname: item.subname,
                dispname: item.dispname,
                lable: item.lable,
                sublable: item.sublable,
                value: item.value,
                priorValue: item.priorValue,
                variance: item.variance,
                variancePercentage: item.variancePercentage
            }
        )
    })

    return(
        <div>
         { Object.values(data).map(element => {

//calculation for risponsive screen size for RAG reports 

            const numberOfItems = Object.values(element.subdata).length
            const totWidthScreen = window.innerWidth
            const itemInLine = Math.floor((totWidthScreen-95)/200)
            const numberOfLine = Math.ceil(numberOfItems/itemInLine)
            const heightOfDiv = numberOfLine*200


            return(
                
                <DashboardItem key={element.name} nodata={nodata} title={element.name} subtitle={subtitle} chartHelpContextKey={chartHelpContextKey} chartRef={chartRef} noOptions={true} p={0}>
                    <div ref={rref} style={{display: 'block', padding: 0, height:heightOfDiv , marginBottom: '-50px'}}>
                        {element.subdata.map((item) => {
                             return (
                                <>
                                <GaugeGraph key={item.name} chartRef={chartRef} showReport={showReport} currentFilters={currentFilters} vizOptions={vizOptions} name={item.name} subname={item.subname} dispname={item.dispname} lable={item.lable} sublable={item.sublable} value={item.value} priorvalue={item.priorValue} variance={item.variance} data={item.priorValue > 0 ? Math.round(100 * item.value / item.priorValue) : (item.value > 0 ? 100 : 0)}/>
                                </>
                             )
                        })}
                    </div>
                </DashboardItem>
                
            )
        })
    }
    </div>
    );
}

export default GaugeChartRenderer;