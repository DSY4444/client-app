import { useContext, useEffect, useState } from 'react';
import { createRef } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import colors from 'assets/theme/base/colors';
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsSankey from "highcharts/modules/sankey";
import DashboardItem from 'components/DashboardItem';
import { CubeContext } from '@cubejs-client/react';
import { useImmer } from 'use-immer';
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import { useYADialog } from "components/YADialog";
import Icon from "@mui/material/Icon";
import { useNavigate, useLocation } from "react-router-dom";
import { getDrilldownPath, removeSessionFilter } from 'utils';

HighchartsSankey(Highcharts);

const SankeyRenderer = ({ title, subtitle, chartHelpContextKey, vizState, vizOptions }) => {
  const chartRef = createRef();
  let {width,height, ref: rref } = useResizeDetector();
  const {showReport} = useYADialog();
  const { query } = vizState;
  const [cubeQuery, setCubeQuery] = useImmer(query);
  const [loading, setLoading] = useState(true);
  let navigate = useNavigate()
  let location = useLocation()
  const {innerWidth} = window;
  useEffect(() => {
    setCubeQuery(query);
  }, [query]);
  const { cubejsApi } = useContext(CubeContext);
  const [links,setLinks]=useState([])
  const [labels,setLabels]=useState([])
  useEffect(() => {
    setLoading(true);
    async function getData() {
      let nodeLimit = vizOptions.nodeLimit;
      let spacing= " "
      let ls=[]
      let lb=[]
      let other = []
      for (let i=0; i < query.length; i++) 
        await cubejsApi.load(query[i]).then((result) => {
          let resultData = result.tablePivot() 
          if (i === 0) {
            resultData.sort((a, b) => { return b[query[i].measures[0]] - a[query[i].measures[0]] });
            let toTotalvalue = [...new Set(resultData.map((az) => az[query[i].dimensions[0]]))];
            let topValue = toTotalvalue.slice(0,nodeLimit);
            for (let j = 1; j < resultData.length; j++) 
              if (!topValue.includes(resultData[j][query[i].dimensions[0]]) && toTotalvalue.length > nodeLimit) {
                other.push(resultData[j][query[i].dimensions[0]])
                resultData[j][query[i].dimensions[0]] = 'Others'  //toValue change into Other
              }
            ls.push(...resultData.map((item) => {
              return ({
                "from": vizOptions.startTag, "to": " " + item[query[i].dimensions[0]], "weight":Number(item[query[i].measures[0]])
              })
            }))
            if (result.loadResponses[0].data.length > 0) {
              innerWidth > 700 ? lb = [vizOptions.series[i].name, vizOptions.series[i + 1].name] : lb = [""]
            }
          }
          else {
            let extrapsace = spacing + " "
            resultData.sort((a, b) => { return b[query[i].measures[0]] - a[query[i].measures[0]] })
            if (other.length > 0) 
              for (let j = 0; j < resultData.length; j++) 
                if (other.includes(resultData[j][query[i].dimensions[0]]))
                  resultData[j][query[i].dimensions[0]] = 'Others';  // fromValue change into Others
            
            let toTotalvalue = [...new Set(resultData.map((az) => az[query[i].dimensions[1]]))]
            let topValue = toTotalvalue.slice(0,nodeLimit)
            other.length = 0;
            for (let j = 1; j < resultData.length; j++) 
              if (!topValue.includes(resultData[j][query[i].dimensions[1]]) && toTotalvalue.length > nodeLimit) {
                other.push(resultData[j][query[i].dimensions[1]])
                resultData[j][query[i].dimensions[1]] = 'Others'  //toValue change into Other
            }
            ls.push(...resultData.map((item) => {
              return { "from": spacing + item[query[i].dimensions[0]], "to": extrapsace + item[query[i].dimensions[1]], "weight": Number(item[query[i].measures[0]]) }
            }))
            spacing = extrapsace
            if (result.loadResponses[0].data.length > 0) {
              innerWidth > 700 ? lb.push(vizOptions.series[i + 1].name) : lb.push('')
            }
          }
        });
      
      setLabels(lb)
      setLinks(ls)
      setLoading(false);
    }
    getData();
  }, [cubeQuery]);

  if (loading )
  {
    return <DashboardItem loading={loading} title={title} subtitle={subtitle}></DashboardItem>
  }

if(width==0)
{
  width=undefined
  }
  const currentFilters = removeSessionFilter(cubeQuery[0].filters, vizOptions)

  let colorset=[]
  let i=0
  let fromNodes=links.map(item=>item.from)
  let toNodes=links.map(item=>item.to)
  fromNodes=[...new Set(fromNodes)]
  toNodes=[...new Set(toNodes)]
  toNodes.forEach(item=>{
    let a=fromNodes.includes(item)
    if(a===false){
      fromNodes.push(item)
    }
  })
  fromNodes.forEach(item=>{
  i===colors.sankyColors.length?i=0:i
    let a
  i%2===0?a={id:item,color:colors.sankyColors[i]}:a={id:item,color:colors.sankyColors[colors.sankyColors.length-i]}
    colorset.push(a)
    i++
  })

  const nodata = !links?.length > 0;

  let opts = {

  chart : { 
      inverted: false,
      height: vizOptions["chartHeight"] ? vizOptions["chartHeight"]: height,
      width:width,
      spacingBottom: 15,
      spacingTop: 50,
      spacingLeft: 15,
      spacingRight: 15,
      style: { fontFamily: 'inherit', fontSize: '14px', },
      backgroundColor:colors.chartBackground,

      events: {
        render: function () {
            if(this.series[0].data[0].weight!=0){
            const labelWidth = this.chartWidth / (labels?.length - 1);
            const positions = labels.map((l, i) => {
              if (i === 0)
                return 50
              else if (i === labels.length - 1)
                return this.chartWidth - 50;
              return (labelWidth * i)
            });
            if (this.customLabels) {
              this.customLabels.forEach((customLabel, i) => {
                customLabel.attr({
                  x: positions[i],
                  y: 20,
                  display: "inherit",
                });
              });
            } else {
              this.customLabels = [];
              labels?.forEach((label, i) => {
                this.customLabels.push(
                  this.renderer.text(label)
                    .attr({
                      x: positions[i],
                      y: 20,
                      align: 'center'
                    })
                    .css({
                      fontSize: '14px',
                      fontWeight: '900',
                      fill: '#666666',
                      color: '#666666',
                      fontFamily: 'inherit'
                    })
                    .add()
                );
              });
            }
          }
        }
      }
    },
    legend: {
      itemStyle: { fontFamily: 'inherit', fontWeight: 500 },
    },
    title: { text: "" },
    exporting: { enabled: false },
    clip: false,
    credits: { enabled: false },
    tooltip: {
      nodeFormatter: function () {
        return this.name + ": <b> $" + Highcharts.numberFormat(this.sum, 0, ".", ",") + "</b><br/>"
      },
      pointFormatter: function () {
        return this.from + " → " + this.to + ": <b>$" + Highcharts.numberFormat(this.weight, 0, ".", ",") + "</b>"
      }
    },
    plotOptions: {
      sankey :{
        nodePadding:10,
        nodeWidth:20,
        minLinkWidth:10,

      },
      series: {
        cursor: (vizOptions["popupTo"] || vizOptions["popupToC"]) ? "pointer": "default",
        groupPadding: 0.1,
        // pointPadding: 0,
        borderWidth: 0,
        borderRadius: 0,
        point:{
          events: {
            click: function (event) {
              var obj = Object.assign([], [...currentFilters]);
                    var filterName,f1,f2,value,v1,v2;
                        if((event.point.name.charAt(0)==" " && event.point.name.charAt(1)!=" ")){
                          filterName="CostPools.costPool"
                          value=event.point.name.substring(1,event.point.name.length)
                // if (!obj.find((({name}) => name === vizOptions.category))) 
                          if(!obj.find((({name}) => name===filterName)))
                  obj.push({ "name": filterName, "values": [value] })
                vizOptions["popupTo"] && vizOptions["popupTo"] !== "" && showReport(vizOptions["popupTo"], obj, null);
                vizOptions["popupToC"] && vizOptions["popupToC"] !== "" && showReport(vizOptions["popupToC"], obj, null);
              }
                        else if((event.point.name.charAt(1)==" " && event.point.name.charAt(2)!=" ")){
                          filterName="Towers.tower"
                          value=event.point.name.substring(2,event.point.name.length)
                          if(!obj.find((({name}) => name===filterName)))
                  obj.push({ "name": filterName, "values": [value] })
                vizOptions["popupTo"] && vizOptions["popupTo"] !== "" && showReport(vizOptions["popupTo"], obj, null);
                vizOptions["popupToT"] && vizOptions["popupToT"] !== "" && showReport(vizOptions["popupToT"], obj, null);
                        }else if((event.point.name.charAt(2)==" " && event.point.name.charAt(3)!=" ")){
                          filterName="SolutionTypes.solutionType"
                          value=event.point.name.substring(3,event.point.name.length)
                          if(!obj.find((({name}) => name===filterName)))
                  obj.push({ "name": filterName, "values": [value] })
                vizOptions["popupTo"] && vizOptions["popupTo"] !== "" && showReport(vizOptions["popupTo"], obj, null);
                vizOptions["popupToS"] && vizOptions["popupToS"] !== "" && showReport(vizOptions["popupToS"], obj, null);
                        }else if((event.point.name.charAt(3)==" ")){
                          filterName="Applications.name"
                          value=event.point.name.substring(4,event.point.name.length)
                          if(!obj.find((({name}) => name===filterName)))
                  obj.push({ "name": filterName, "values": [value] })
                vizOptions["popupTo"] && vizOptions["popupTo"] !== "" && showReport(vizOptions["popupTo"], obj, null);
                        }else if(event.point.from=="Total Spend"){
                          filterName="CostPools.costPool"
                          value=event.point.to.substring(1,event.point.to.length)
                // if (!obj.find((({name}) => name === vizOptions.category))) 
                          if(!obj.find((({name}) => name===filterName)))
                  obj.push({ "name": filterName, "values": [value] })
                vizOptions["popupTo"] && vizOptions["popupTo"] !== "" && showReport(vizOptions["popupTo"], obj, null);
                vizOptions["popupToC"] && vizOptions["popupToC"] !== "" && showReport(vizOptions["popupToC"], obj, null);
              }
                        else if(event.point.from.charAt(0)==" " && event.point.from.charAt(1)!=" "){
                         f1="CostPools.costPool"
                         f2="Towers.tower"
                          v1=event.point.from.substring(1,event.point.from.length)
                          v2=event.point.to.substring(2,event.point.to.length)
                // if (!obj.find((({name}) => name === vizOptions.category))) 
                          if(!obj.find((({name}) => name===f1)))
                  obj.push({ "name": f1, "values": [v1] })
                          if(!obj.find((({name}) => name===f2)))
                  obj.push({ "name": f2, "values": [v2] })
                vizOptions["popupTo"] && vizOptions["popupTo"] !== "" && showReport(vizOptions["popupTo"], obj, null);
                vizOptions["popupToT"] && vizOptions["popupToT"] !== "" && showReport(vizOptions["popupToT"], obj, null);
              }
                        else if(event.point.from.charAt(1)==" " && event.point.from.charAt(2)!=" " && event.point.to.charAt(3)!=" " ){
                          f1="Towers.tower"
                          f2="SolutionTypes.solutionType"
                           v1=event.point.from.substring(2,event.point.from.length)
                           v2=event.point.to.substring(3,event.point.to.length)
                // if (!obj.find((({name}) => name === vizOptions.category))) 
                           if(!obj.find((({name}) => name===f1)))
                  obj.push({ "name": f1, "values": [v1] })
                           if(!obj.find((({name}) => name===f2)))
                  obj.push({ "name": f2, "values": [v2] })
                vizOptions["popupToS"] && vizOptions["popupToS"] !== "" && showReport(vizOptions["popupToS"], obj, null);
              }
                         else if(event.point.to.charAt(3)==" "){
                          f1="Towers.tower"
                          f2="Applications.name"
                           v1=event.point.from.substring(2,event.point.from.length)
                           v2=event.point.to.substring(4,event.point.to.length)
                // if (!obj.find((({name}) => name === vizOptions.category))) 
                           if(!obj.find((({name}) => name===f1)))
                  obj.push({ "name": f1, "values": [v1] })
                           if(!obj.find((({name}) => name===f2)))
                  obj.push({ "name": f2, "values": [v2] })
                vizOptions["popupTo"] && vizOptions["popupTo"] !== "" && showReport(vizOptions["popupTo"], obj, null);
              }
              vizOptions["drillTo"] && vizOptions["drillTo"] !== "" && navigate(location.pathname === "/" ? vizOptions.drillTo : getDrilldownPath(location.pathname, vizOptions.drillTo), { state: obj })
            }
          }
        }
      },
    },
    series: [
      {
        keys: ['from', 'to', 'weight'],
        data: links,
        type: "sankey",
        name: "Spend",
        nodes:colorset

      }
    ]
  }

  let navigateToPage = (linkTo) => {
    linkTo && linkTo !== "" && navigate(location.pathname === "/" ? linkTo : getDrilldownPath(location.pathname, linkTo), {state: {}})
  }

  return (
    <DashboardItem  nodata={nodata} title={title} subtitle={subtitle} chartHelpContextKey={chartHelpContextKey} chartRef={chartRef}>
        <div ref={rref} style={{position: 'relative', height: '100%'}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, right: 0}}>
          <HighchartsReact ref={chartRef} highcharts={Highcharts} options={opts} />
          {vizOptions["linkTo"] && vizOptions["linkTo"] !== "" &&
            <MDBox display="flex" pt={1.5} flexDirection="row" justifyContent="flex-end">
                    <MDTypography style={{position:'absolute', bottom:'-10px', right:'5px'}} variant="button" px={0.5} py={0.5} fontWeight="medium" whiteSpace="nowrap" sx={{ "&:hover": { cursor: 'pointer', backgroundColor: colors.linkBackColour ? colors.linkBackColour : "light" }, color: colors.linkColour, borderRadius: "5px"}} color={colors.linkColour ? colors.linkColour : "dark"} onClick={() => { navigateToPage(vizOptions["linkTo"])}}>
                {vizOptions.linkText.toUpperCase()}&nbsp;<Icon sx={{ pt: 0.25 }} variant="contained">east</Icon>
              </MDTypography>
            </MDBox>
          }
        </div>
      </div>
    </DashboardItem>
  )
}

export default SankeyRenderer