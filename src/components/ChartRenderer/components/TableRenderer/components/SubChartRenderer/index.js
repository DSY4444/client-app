import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import colors from "assets/theme/base/colors";
import { convertRStoSubGraph } from "utils"
import MDBox from 'components/MDBox';

const SubChartRenderer = ({ chartType, tableRow, resultSet, vizOptions }) => {
    var graphData = convertRStoSubGraph(resultSet, tableRow, colors.graphColors, chartType || "column", vizOptions)
    var opts = {
        chart: {
            backgroundColor: null,
            borderWidth: 0,
            type: chartType || 'column',
            margin: [0, 0, 0, 0],
            width: 100,
            height: 20,
            style: {
                overflow: 'visible',
                fontFamily: 'inherit',
                fontSize: '14px',
            },

            // small optimalization, saves 1-2 ms each sparkline
            skipClone: true
        },
        lang: {
            thousandsSep: ',',
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        title: {
            text: '',
        },
        xAxis: {
            categories: Object.values(graphData.categories), 
            labels: {
                enabled: false
            },
            title: {
                text: null
            },
            startOnTick: false,
            endOnTick: false,
            tickPositions: []
        },
        yAxis: {
            endOnTick: false,
            startOnTick: false,
            labels: {
                enabled: false
            },
            title: {
                text: null
            },
            tickPositions: [0]
        },
        legend: {
            enabled: false
        },
        tooltip: {
            backgroundColor: 'white',
            borderWidth: 0,
            hideDelay: 0,
            shared: true,
            padding: 2,
            borderColor: 'silver',
            borderRadius: 3,
            outside: true,
            valuePrefix: '$',
            // headerFormat: Object.values(graphData.categories)[`{point.x}`] + '<br>',
            headerFormat: `{point.x}` + '<br>',
            pointFormat: ' <b>{point.y}</b>',
            pointFormatter: function () { return '<b>' + (this.y < 0 ? '-' : '') + ' $' + Highcharts.numberFormat(Math.abs(this.y), 0, ".", ",") + '</b>'; },
        },
        plotOptions: {
            series: {
                animation: false,
                lineWidth: 1,
                shadow: false,
                pointStart: 0,
                // pointPadding: 0.3,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                marker: {
                    radius: 1,
                    states: {
                        hover: {
                            radius: 2
                        }
                    }
                },
                // fillOpacity: 0.25
            },
            column: {
                negativeColor: '#ff6c00',
            }
        },
        series: Object.values(graphData.range)
    };

    return <MDBox display="inline-block">
           <HighchartsReact highcharts={Highcharts} options={opts} />
          </MDBox>
}

export default SubChartRenderer;