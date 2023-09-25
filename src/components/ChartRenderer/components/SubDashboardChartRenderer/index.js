import numeral from "numeral";
import DashboardItem from 'components/DashboardItem';
import colors from "assets/theme/base/colors";
import { useResizeDetector } from 'react-resize-detector';
import { formatAmount, getDrilldownPath , convertRStoGraphYearlyStackedAreaSpline,getName } from 'utils';
import { useLocation, useNavigate } from "react-router-dom";
import Highcharts from 'highcharts/highcharts.src.js';
import HighchartsReact from 'highcharts-react-official';
import { createRef } from 'react';
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import Icon from "@mui/material/Icon";
import Card from "@mui/material/Card";
import { normalizeCurrency } from "utils/table";
const SubDashboardChartRenderer = ({ loading, title, subtitle, chartHelpContextKey,currentMonth={currentMonth},previousMonth={previousMonth}, vizOptions, resultSet }) => {
  const chartRef = createRef();
  let navigate = useNavigate()
  let location = useLocation()
      currentMonth = currentMonth[0]
      previousMonth = previousMonth[0]
  // useEffect(() => {
  //   async function getDashboardDef() {
  //     var [err, data] = await fetchRequest.get(`/api/home/currentdetails/`);
  //     if (err) {
  //       console.error(err)
  //     }
  //     else {
  //       setCurrentMonth(data.currentMonth);
  //       setPreviousMonth(data.previousMonth);
  //     }      
  //   }

  //   getDashboardDef();
  // }, []);

  if (loading)
    return <DashboardItem loading={loading} title={title} subtitle={subtitle}></DashboardItem>

  var data = resultSet.tablePivot()
  var textColour = '';
  var value1 = '';
  var value3 ='';
  var label1 = '';
  var varValue = '';
  var varWith = '';
  let topval = { name: "", variance: 0, budget: 0, spend: 0}
  if (data && data.length > 0) {
    if (vizOptions.wigetType === 'variance' && data.length > 0) {
      // if (vizOptions.banner && (Number((data[0] ? vizOptions.banner.value2 ? data[0][vizOptions.banner.value2] : 0 : 0)) !== 0)) {
      if (vizOptions.banner) {
        let val1 = 0;
        let val2 = 0;
        let val3=0;
        let obj = {}
        let categories = []
        let dataSet=vizOptions.banner.currentMonthFilter==true? data.filter(item => item[vizOptions.banner.value3] === currentMonth):data
        let dataSet2=vizOptions.banner.currentMonthFilter==true? data.filter(item => item[vizOptions.banner.value3] === previousMonth):data 
    if(!vizOptions.groupItems) {
        dataSet.forEach(item => {
          if (obj[item[vizOptions.category]]) {
            let valv = obj[item[vizOptions.category]].variance
            let valb = obj[item[vizOptions.category]].budget
            let vals = obj[item[vizOptions.category]].spend
            obj[item[vizOptions.category]].variance = Number(item[vizOptions.banner.value1]) + valv
            obj[item[vizOptions.category]].budget = Number(item[vizOptions.banner.value2]) + valb
            obj[item[vizOptions.category]].spend = Number(item[vizOptions.banner.value4]) + vals
          }
          else {
            obj[item[vizOptions.category]] = {
              name: item[vizOptions.category],
              variance: Number(item[vizOptions.banner.value1]),
              budget: Number(item[vizOptions.banner.value2]),
              spend: Number(item[vizOptions.banner.value4])
            },
            categories.push(item[vizOptions.category])
          }
        })
        categories.forEach(item => {
          if(topval.name=='')
          {
            topval = obj[item]
          }
          // obj[item].spend > topval.spend ? topval = obj[item] : topval
          obj[item].variance > topval.variance ? topval = obj[item] : topval
   
        })
        val1 = Number((data[0] ? vizOptions.banner.value1 ? topval.variance : 0 : 0))
        val2 = Number((data[0] ? vizOptions.banner.value2 ? topval.budget : 0 : 0))
        val3 = Number((data[0] ? vizOptions.banner.value4 ? topval.spend : 0 : 0))

        if (vizOptions.notCurrency)
        {
          value1 = numeral(normalizeCurrency(val1)).format('0')
          value3 = numeral(normalizeCurrency(val3)).format('0')
        }
        else {
          value1 = numeral(val1.toFixed(2)).format('$0,0')
          value3 = numeral(val3.toFixed(2)).format('$0,0')
        }
        label1 = topval.name === "" ? "" : topval.name;
      
      }
      else if(vizOptions.groupItems && vizOptions.labor===true) {
      let datasetcreate=(dataSet)=>{
      let spend = 0
      dataSet.forEach(item => {
      let vals = spend
      spend = Number(item[vizOptions.banner.value1]) + vals
      })
     return(spend)
     }
     value3 = numeral(datasetcreate(dataSet).toFixed(2)).format('$0,0')
     val2=datasetcreate(dataSet2)
     val1=datasetcreate(dataSet)-val2
     }
     if(vizOptions.labor===false){
      dataSet=data.filter(item => item[vizOptions.banner.value3] === currentMonth)
      dataSet2=data.filter(item => item[vizOptions.banner.value3] === previousMonth)
      val2=dataSet2.length>0?Number(dataSet2[0][vizOptions.banner.value1[0]])+ Number(dataSet2[0][vizOptions.banner.value1[1]]):0
      val1=dataSet.length>0?Number(dataSet[0][vizOptions.banner.value1[0]])+ Number(dataSet[0][vizOptions.banner.value1[1]])-val2:0
      val3=val1+val2
      if (vizOptions.notCurrency)
        {
          value3 = numeral(val3.toFixed(2)).format('0')
        }
        else {
          value3 = numeral(val3.toFixed(2)).format('$0,0')
        }
     }
     if (isNaN(val1))
     val1 = 0;
     if (isNaN(val2))
     val2 = 0;
     if (isNaN(val3))
     val3 = 0;

        textColour = val1 > 0 ? "error" : "success";
        var VariancePercentage = (val2 === 0 ? 0 : Math.round((val1 / val2) * 100));
        varWith = vizOptions.banner.value2 ? (textColour === 'success' ? ' under ' : textColour === 'error' ? ' over ' : '') + (vizOptions.banner.value2.toLowerCase().includes('budget') ? 'budget' : vizOptions.banner.value2.toLowerCase().includes('previousyear') ? 'prior year' : '') : textColour === 'success' ? ' down from last month ' : textColour === 'error' ? ' up from last month ' : ''
        varValue = (textColour === 'success' ? ' ▼ ' : textColour === 'error' ? ' ▲ ' : '') + '' + (Math.abs(VariancePercentage) + '%')
      }
    }
  }

  let catagoriesColumn = data[0] ? vizOptions.category2 ? data[0][vizOptions.category2].split(',') : [] : []
  let datafiltrd = data.filter(item => item[vizOptions.category] === topval.name)
  let colorset=[]
  catagoriesColumn.forEach(item=>{
    vizOptions.banner.currentMonthFilter? item===currentMonth?colorset.push(colors.graphColors[1]):colorset.push(colors.graphColors[0]):colorset.push(colors.graphColors[1])  })
  let graphdatacolumn = {
    data: [],
    type: "column",
    name: topval.name + ''
  }
  catagoriesColumn.forEach(item => {
    let monthdata = datafiltrd.filter(elem =>
      elem[vizOptions.banner.value3] === item
    )
    monthdata.length > 0 ? graphdatacolumn.data.push(Number(monthdata[0][vizOptions.banner.value4])) : graphdatacolumn.data.push(0)
  })
  let obj1 = {}
  obj1["data"] = graphdatacolumn
  // console.log(catagoriesColumn, graphdatacolumn, obj1)
  function BannerRenderer({ color, label1, varWith, varValue,value3, textColour}) {
    return (
      <Card sx={{width: "100%", border: "none"}}>
        <MDBox 
          variant="gradient"
          bgColor={color === "light" ? "white" : color}
          color={color === "light" ? "dark" : "white"}
          borderRadius="md"
          pl={0}
          >
          <MDBox pt={label1 ? 0 : 1} px={1} pb={label1 ? 2 : 4.5} bgColor={colors.chartBackground}>
            <MDBox px={0} pb={0} display="flex" flexDirection="row" overflow="hidden" textOverflow="ellipsis">
                <MDBox flex={1} data-testid = {label1?.toLowerCase().replaceAll(' ', '')}>
                  {label1 ? 
                  <MDTypography variant="subtitle1" fontWeight="light" color= {(color === "light" ? "dark" : "white")} whiteSpace="nowrap">
                        {label1}&nbsp;
                  </MDTypography> : ''}
                  <MDBox display="flex" flexDirection="row" overflow="hidden" textOverflow="ellipsis">
                    <MDTypography lineHeight={1.5} variant="h6" fontWeight="bold" color= {(color === "light" ? "dark" : "white")}>{value3}&nbsp;</MDTypography>
                    <MDTypography lineHeight={1.5} variant="caption" color= {textColour ? textColour : (color === "light" ? "dark" : "white")} whiteSpace="nowrap">&nbsp;{varValue}&nbsp;</MDTypography>
                    <MDTypography lineHeight={1.5} variant="caption" color= {(color === "light" ? "dark" : "white")} whiteSpace="nowrap">{varWith}</MDTypography>
                  </MDBox>
                </MDBox>
              </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    );
  }  

  const ColumnChartRenderer = ({ title, color, label1, varValue, value1, textColour }) => {
    const { width, height, ref: rref } = useResizeDetector();

    var opts = {
      chart: {
        // height: location.pathname.indexOf("report") > 0 ? 450 : 250, 
        width: width,
        height: height - 60,
        type: 'column', style: { fontFamily: 'inherit', fontSize: '14px', },
        spacingBottom: 0,
        spacingTop: 0,
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
        formatter: function () {
          return `<b>${this.point.category}</b><br/>${this.point.series.name}: <b>$${Highcharts.numberFormat(this.point.y, 0, ".", ",")}</b>`;
        }
      },
      xAxis: {
        categories: catagoriesColumn,
        visible: false,
      },
      yAxis: [{
        visible: false,
        reversed: false,
        title: {
          text: ''
        },
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
      plotOptions: {
        series: {
          states: {
            inactive: {
                opacity: 1
            }
        },
          cursor: (vizOptions["popupTo"] || vizOptions["drillTo"]) ? "pointer": "default",
          groupPadding: 0.1,
          // pointPadding: 0,
          borderWidth: 0,
          borderRadius: 4,
        },
        column: {
          colorByPoint: true,
          dataLabels: {
            enabled: false,
            // rotation: -90,
            // x: 0,
            // y: -30,
            style: {
              fontSize: '12px',
              fontFamily: 'inherit',
              fontWeight: 400,
            },
            formatter: function () {
              return formatAmount(Math.abs(this.y)).replace(/ /g, '').replace('.0', '');
            }
          }
        }
      },
      colors:colorset,
      series: Object.values(obj1)
    }
    
    let navigateToPage = (linkTo) => {
      linkTo && linkTo !== "" && navigate(location.pathname === "/" ? linkTo : getDrilldownPath(location.pathname, linkTo), {state: {}})
    }
    let setingNoData = false
    let nodata = true
    if (obj1.data.data.length === 0) {
     nodata = true
    }
    else {
      obj1.data.data.forEach(a => {
        if (a!==0) {
          setingNoData = true
        }
      });
      if (setingNoData) {
        nodata=false
      }
    }
    

    return (
      <DashboardItem  nodata={nodata} title={title} subtitle={subtitle} chartHelpContextKey={chartHelpContextKey} chartRef={chartRef}>
        <div ref={rref} style={{ position: 'relative',height: '100%', marginTop: '-25px' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, right: 0,  padding:0,  }}>
          <BannerRenderer
              color={color || "light"}
              title={title}
              value1={value1}
              value3={value3}
              label1={label1}
              varWith={varWith}
              varValue={varValue}
              textColour={textColour}
              bgColor={colors.chartBackground}
              percentage={{
                color: 'success',
                amount: "+55%",
                label: "than last year",
              }}
            />
            <HighchartsReact ref={chartRef} highcharts={Highcharts} options={opts} />
            {vizOptions["linkTo"] && vizOptions["linkTo"] !== "" &&
               <MDBox display="flex" pt={1.75} flexDirection="row" justifyContent="flex-end">
               <MDTypography style={{position: 'absolute', bottom: '-35px', right: '5px'}} variant="button" px={0.5} py={0.5} fontWeight="medium" whiteSpace="nowrap" sx={{ "&:hover": { cursor: 'pointer', backgroundColor: colors.linkBackColour ? colors.linkBackColour : "light" }, color: colors.linkColour, borderRadius: "5px"}} color={colors.linkColour ? colors.linkColour : "dark"} onClick={() => { navigateToPage(vizOptions["linkTo"])}}>
               {vizOptions.linkText.toUpperCase()}&nbsp;<Icon sx={{ pt: 0.25 }} variant="contained">east</Icon>
               </MDTypography>
             </MDBox>
            }          
          </div>
        </div>
      </DashboardItem>
    )
  }

  const StackedAreaChartRenderer = ({ loading, title, subtitle, chartHelpContextKey, resultSet, vizOptions ,color}) => {
    
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
                height: height ,
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
                      states: {
                        inactive: {
                            opacity: 1
                        }
                    },
                    lineWidth:null,
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
        <div ref={rref} style={{ position: 'relative',height: '75%', marginTop: '-25px' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, right: 0,  padding:0,  }}>
          <BannerRenderer
              color={color || "light"}
              title={title}
              value1={value1}
              value3={value3}
              varWith={varWith}
              varValue={varValue}
              textColour={textColour}
              bgColor={colors.chartBackground}
              percentage={{
                color: 'success',
                amount: "+55%",
                label: "than last year",
              }}
            />
            <HighchartsReact ref={chartRef} highcharts={Highcharts} options={opts} />
            {vizOptions["linkTo"] && vizOptions["linkTo"] !== "" &&
                <MDBox display="flex" pt={0.5} flexDirection="row" justifyContent="flex-end">
                <MDTypography style={{position: 'absolute', bottom: '-93px', right: '5px'}} variant="button" px={0.5} py={0.5} fontWeight="medium" whiteSpace="nowrap" sx={{ "&:hover": { cursor: 'pointer', backgroundColor: colors.linkBackColour ? colors.linkBackColour : "light" }, color: colors.linkColour, borderRadius: "5px"}} color={colors.linkColour ? colors.linkColour : "dark"} onClick={() => { navigateToPage(vizOptions["linkTo"])}}>
                {vizOptions.linkText.toUpperCase()}&nbsp;<Icon sx={{ pt: 0.25 }} variant="contained">east</Icon>
                </MDTypography>
              </MDBox>
            }          
          </div>
        </div>
      </DashboardItem>
    )
}




if(vizOptions.groupItems ||vizOptions.labor===false){
return(
  <>
  <StackedAreaChartRenderer
   loading={loading}
   title={title} 
   subtitle={subtitle} 
   chartHelpContextKey={chartHelpContextKey} 
   resultSet={resultSet} 
   vizOptions={vizOptions}  
   color={vizOptions?.color || "light"}
  />
  </>
)
}else{
  return (
    <>
      <ColumnChartRenderer 
        color={vizOptions?.color || "light"}
        title={title}
        subtitle={subtitle} 
        chartHelpContextKey={chartHelpContextKey}
        value1={value1}
        label1={label1}
        varValue={varValue}
        textColour={textColour}
        noBorder={true}
        percentage={{
          color: 'success',
          amount: "+55%",
          label: "than last year",
        }}      
      />
    </>
  );
      }
}

export default SubDashboardChartRenderer;