import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import bullet from "highcharts/modules/bullet.js";
import { useResizeDetector } from 'react-resize-detector';
import { useNavigate } from "react-router-dom";
import { useYADialog } from "components/YADialog";
import DashboardItem from 'components/DashboardItem';
import { createRef } from 'react';
import _ from 'lodash';
import SquareIcon from '@mui/icons-material/Square';
import { formatAmount, removeSessionFilter } from 'utils';

// eslint-disable-next-line no-undef
require("highcharts/modules/exporting")(Highcharts);
// eslint-disable-next-line no-undef
require("highcharts/highcharts-more")(Highcharts);
bullet(Highcharts);

function SubCostPoolsGraph(props) { 
    const {showReport, currentFilters, vizOptions, chartRef, name } = props;
    const totWidthScreen = window.innerWidth
    var sizeMarginRight
    if(totWidthScreen<= 500){sizeMarginRight = 300}
    else if (totWidthScreen <=560 && totWidthScreen > 500){sizeMarginRight = 200}
    else if (totWidthScreen <=660 && totWidthScreen > 560){sizeMarginRight = 100}
    else if (totWidthScreen <=1040 && totWidthScreen > 660){sizeMarginRight = 0}
    else if (totWidthScreen <=1200 && totWidthScreen > 1040){sizeMarginRight = 300}
    else if (totWidthScreen <=1300 && totWidthScreen > 1200){sizeMarginRight = 250}
    else if (totWidthScreen <=1600 && totWidthScreen > 1300){sizeMarginRight = 200}
    else if (totWidthScreen >1600){sizeMarginRight = 100}

    let navigate = useNavigate()
   
    var opts = {
        chart: {
            inverted: true,
            marginLeft: 10,
            marginRight: sizeMarginRight,
            marginTop: 10,
            height: 90,
            type: 'bullet', 
        },
        title: {
            text: null
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                pointPadding: 0.3,
                borderWidth: 0,
                color: '#FFD700',
                targetOptions: {
                    color: '#FF4500',
                    width: '100%'
                },

                cursor: "pointer",
                point: {
                    events: {
                        click: function () {
                            var obj = Object.assign([], [...currentFilters]);
                            if (vizOptions.category)
                                obj.push({ "name": vizOptions.category, "values": [name] })
                            vizOptions["drillTo"] && vizOptions["drillTo"] !== "" && navigate(vizOptions.drillTo, { state: obj})
                            vizOptions["popupTo"] && vizOptions["popupTo"] !== "" && showReport(vizOptions["popupTo"], obj, null);
                            if (vizOptions.excludeFilters && vizOptions.excludeFilters.length > 0) {
                                vizOptions.excludeFilters.map((fil) => {
                                    if (obj.find((({name}) => name === fil)))
                                        _.remove(obj, {name: fil})                                
                                })
                            }
                        }
                    }
                }

            }
        },
        credits: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        xAxis: {
             //categories: ['<span class="hc-cat-title">' + props.name + '</span>']<br/>$(1,000s)
             // categories: [props.styleb + props.name + props.stylee] ,//[props.name] //<br/>$(1,000s)
        },
        yAxis: {
           gridLineWidth: 0,
            plotBands: [
                {
                    from: 0,
                    to: Math.round(0.8 * props.priorValue/1), 
                    color: '#3B9C9C'
                }, 
                {
                    from: Math.round(0.8 * props.priorValue/1), 
                    to: Math.round(0.9 * props.priorValue/1), 
                    color: '#3B9C9C'
                }, 
                {
                    from: Math.round(0.9 * props.priorValue/1), 
                    to: 9e9,
                    color: '#3B9C9C'
                }
            ],
            labels: {
                padding: 15,
                formatter: function () {
                    return formatAmount(Math.abs(this.value)).replace(/ /g,'').replace('.0','');
                }
            },
            //max: Math.max(props.priorvalue/1, 5000000),
            max: props.maxVal,
            title: null
        },
        series: [{
            data: [{
                y: Math.round(props.value/1), 
                target: Math.round(props.priorvalue/1), 
                variance:  Math.round(props.value/1) -  Math.round(props.priorvalue/1),
            }]
        }],
        tooltip: {
            outside: true,
            formatter: function () {
                return (props.name ? props.name : 'NOT KNOWN') + '<br/><b>$' + Highcharts.numberFormat(this.point.y,0,'.',',') + '</b> (Budget: <b>$' + Highcharts.numberFormat(this.point.target,0,'.',',') + '</b>)</br> Variance: <b>$' +  Highcharts.numberFormat(this.point.variance,0,'.',',') + '</b>';
            }
        }
    }

    return (
        <div style={{display: 'inline-block', position: 'relative'}}>
            <HighchartsReact ref={chartRef} highcharts={Highcharts} options={opts} />
        </div>
    );
}

const BulletChartRenderer = ({ loading, title, subtitle, resultSet, vizOptions }) => {

    const chartRef = createRef();
    const { ref: rref } = useResizeDetector();

    const {showReport} = useYADialog();
    let range = {};
    let categories = new Set();
    let currentFilters
    
    if(loading)
       return <DashboardItem loading={loading} title={title} subtitle={subtitle}></DashboardItem>
    
    currentFilters = removeSessionFilter(resultSet.loadResponse.pivotQuery.filters, vizOptions)

    resultSet.tablePivot().forEach((item) => {
        categories.add(item[vizOptions.category]);

        if (!range["series1"]) {
            range["series1"] = {
                name: "series1",
                data: [],
            };
        }

        range["series1"].data.push({
            name: item[vizOptions.category],
            value: item[vizOptions.banner.value1] ? parseFloat(item[vizOptions.banner.value1]) : 0,
            priorValue: item[vizOptions.banner.value2] ? parseFloat(item[vizOptions.banner.value2]) : 0,
            variance: item[vizOptions.banner.value2] ? parseFloat(item[vizOptions.banner.value1]) - parseFloat(item[vizOptions.banner.value2]) : 0,
            variancePercentage: item[vizOptions.banner.value2] ? (Math.round(((parseFloat(item[vizOptions.banner.value1]) - parseFloat(item[vizOptions.banner.value2])) / parseFloat(item[vizOptions.banner.value2])) * 100)) : 0
        });

    });

    const nodata = Object.values(range)[0]?.data?.size === 0;
    let data = {};
    let maxVal = 0;

    Object.values(range)[0]?.data.map((item) => {
        if (item.value > maxVal)
            maxVal = item.value;
        if (item.priorValue > maxVal)
            maxVal = item.priorValue;
        if (!data[item.name]) {
            data[item.name] = {
                name: item.name,
                value: item.value,
                priorValue: item.priorValue,
                variance: item.variance,
                variancePercentage: item.variancePercentage,                
                subdata: [],
            };
        }            
        data[item.name].subdata.push(
            {
                name: item.name,
                value: item.value,
                priorValue: item.priorValue,
                variance: item.variance,
                variancePercentage: item.variancePercentage
            }
        )
    })

    return(
        <>
            <div style={{display: 'inline-block', fontSize: '14px'}}>
                <div style={{display: 'inline-block', marginLeft: '5px', marginRight: '0px', fontSize: '14px'}}>
                    {/* All values in $(1,000s) */}
                </div>
                <div style={{display: 'inline-block', marginRight: '20px', fontSize: '14px'}}>
                    <SquareIcon style={{ marginBottom: '-3px', height: '16px', width: '16px', color: "#FF4500" }} />Budget 
                </div>
                <div style={{display: 'inline-block', fontSize: '14px'}}>
                    <SquareIcon style={{ marginBottom: '-3px', height: '16px', width: '16px', color: "#FFD700" }} />Spend
                </div>
            </div>        
            {
                Object.values(data).map(item => {
                    return(
                        <DashboardItem key={title} nodata={nodata} title={title} subtitle={subtitle} chartRef={chartRef} noOptions={true}>
                            <div ref={rref} style={{display: 'block', position: 'absolute', left: 10, top: 10, padding: 0, margin: 0, marginBottom: '-50px'}}>
                                <div style={{fontSize: '1rem', fontWeight: 700}}>{item.name ? item.name : 'NOT KNOWN'}</div>
                                    <SubCostPoolsGraph showReport={showReport} currentFilters={currentFilters} vizOptions={vizOptions} name={item.name} value={item.value} priorvalue={item.priorValue} maxVal={maxVal} />  
                            </div>
                        </DashboardItem>
                    )
                })
            }
        </>
    );
}

export default BulletChartRenderer;