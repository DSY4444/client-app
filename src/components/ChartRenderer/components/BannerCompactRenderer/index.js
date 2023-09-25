import YASkeleton from "components/YASkeleton";
import numeral from "numeral";
import StatisticsRenderer1 from "../StatisticsRenderer1";
import { convertRStoGraphYearlyPredicted, convertRStoGraphYearly } from "utils"
import colors from "assets/theme/base/colors";
import { normalizeCurrency } from "utils/table";

const BannerCompactRenderer = ({ loading, vizOptions, resultSet }) => {
  if(loading)
    return <YASkeleton variant="dashboard-item"/>

  var data = resultSet.tablePivot()
  var textColour = '';
  var value1 = '';
  var label1 = '';
  var varValue = '';
  var value2 = '';
  var label2 = '';
  var value3 = '';
  var label3 = '';
  var varWith = '';
  var valQualifier = ''; 

  const graphValues = (vizOptions, spend, val1, val2) => {
    var VariancePercentage = 0;
    if(vizOptions.wigetType === 'Predicted')
    {
      label1 = vizOptions.title ? vizOptions.title : '';
      textColour = val1 > 0 ? "error" : "success";
      VariancePercentage = val2 === 0 ? 0 :  Math.round((val1 / val2) * 100)
      varWith = val1 === 0 ? (vizOptions.varianceWith ? `as prior ${vizOptions.varianceWith}` : vizOptions.series[0].value.toLowerCase().includes('budget') ? 'as budgeted' : 
      vizOptions.series[0].value.toLowerCase().includes('previousyear') ? 'as prior year spend' : '') : vizOptions.series[0].value ? (textColour === 'success' ? 'under ' : textColour === 'error' ? 'over ' : '') 
      + (vizOptions.varianceWith ? `prior ${vizOptions.varianceWith}` : vizOptions.series[0].value.toLowerCase().includes('budget') ? 'budget' : vizOptions.series[0].value.toLowerCase().includes('previousyear') ? 'prior year' : '') : ''
      varValue = (val1 != 0 ? (textColour === 'success' ? ` ▼ ${Math.abs(VariancePercentage < 0) && spend !== 0 ? (Math.abs(VariancePercentage) + '%') : ''}`  : textColour === 'error' ? ` ▲ ${Math.abs(VariancePercentage > 0) ? (Math.abs(VariancePercentage) + '%') : ''}`  : '') : '');
    }
    else
    {
      label1 = vizOptions.banner.label1 ? vizOptions.banner.label1 : '';
      textColour = (vizOptions.wigetType === 'spendVariance') ? (val1 > val2 ? "error" : "success") : (val1 > 0 ? "error" : "success");
      VariancePercentage = (val2 === 0 ? 0 : (vizOptions.wigetType === 'spendVariance') ? Math.round(((val1-val2) / val2 ) * 100) : Math.round((val1 / val2) * 100));        
      varWith = val1 === 0 ? (vizOptions.varianceWith ? `as prior ${vizOptions.varianceWith}` : vizOptions.banner.value2.toLowerCase().includes('budget') ? 'as budgeted' : 
      vizOptions.banner.value2.toLowerCase().includes('previousyear') ? 'as prior year' : '') : vizOptions.banner.value2 ? (textColour === 'success' ? 'under ' : textColour === 'error' ? 'over ' : '') 
      + (vizOptions.varianceWith ? `prior ${vizOptions.varianceWith}` : vizOptions.banner.value2.toLowerCase().includes('budget') ? 'budget' : vizOptions.banner.value2.toLowerCase().includes('previousyear') ? 'prior year' : '') : ''
      varValue = (val1 != 0 ? (textColour === 'success' ? ` ▼ ${Math.abs(VariancePercentage < 0) && spend !== 0 ? (Math.abs(VariancePercentage) + '%') : ''}`  : textColour === 'error' ? ` ▲ ${Math.abs(VariancePercentage > 0) ? (Math.abs(VariancePercentage) + '%') : ''}`  : '') : '');
    }
  }


    if(vizOptions.wigetType ==='Predicted')
    {
      let predictedSpnd = 0;
      let budget = 0;
      let val1 = 0;
      let graphData = convertRStoGraphYearlyPredicted(resultSet,['#435cc8', '#ffa500'], vizOptions)
      if(data && data.length >0){
        predictedSpnd = graphData.range[vizOptions.predictColumn + " YTD"].data[graphData.range[vizOptions.predictColumn + " YTD"].data.length-1]
        budget = graphData.range[vizOptions.fillValuesColumn + " YTD"].data[graphData.range[vizOptions.fillValuesColumn + " YTD"].data.length-1]
        val1 = predictedSpnd - budget
        value1 = vizOptions.notCurrency ? numeral(normalizeCurrency(predictedSpnd)).format('0') : numeral(normalizeCurrency(predictedSpnd)).format('$0,0');
        graphValues(vizOptions, '', val1, budget)
      }
      else{
        val1 = predictedSpnd - budget
        value1 = vizOptions.notCurrency ? numeral(normalizeCurrency(predictedSpnd)).format('0') : numeral(normalizeCurrency(predictedSpnd)).format('$0,0');
        graphValues(vizOptions, '', val1, budget)
      }
      // textColour = val1 > 0 ? "error" : "success";
      // let VariancePercentage = (budget === 0 ? 0 : Math.round((val1/budget) * 100));        
      // varWith = (textColour === 'success' ? 'under ' : textColour === 'error' ? 'over ' : '') + "budget"
      // varValue = (textColour === 'success' ? ' ▼ ' : textColour === 'error' ? ' ▲ ' : '') + '' + (Math.abs(VariancePercentage) + '%')
      // label1 = vizOptions.title
    }
    else
    if(vizOptions.wigetType ==='allMonths')
    {
      let currSpend = 0;
      let graphData = convertRStoGraphYearly(resultSet, colors.graphColors, "", vizOptions)
      if(data && data.length >0){
        let filterIndex = resultSet.query().filters.find(filter => filter.member === "Months.month").values.length - 1
        currSpend = graphData.range[vizOptions.series[0].value].data[filterIndex]
        value1 = data[0] ? graphData.range ? vizOptions.notCurrency ? numeral(normalizeCurrency(currSpend)).format('0') : numeral(normalizeCurrency(currSpend)).format('$0,0') : '' : '';
        label1 = vizOptions.series[0].label ? vizOptions.series[0].label : '';
      }
      else{
        value1 = vizOptions.notCurrency ? numeral(normalizeCurrency(currSpend)).format('0') : numeral(normalizeCurrency(currSpend)).format('$0,0')
        label1 = vizOptions.series[0].label ? vizOptions.series[0].label : '';
      }
    }
    else 
    if (vizOptions.wigetType === 'textBanner') {
        value1 = data[0] ? vizOptions.banner.value1 ? data[0][vizOptions.banner.value1] : '' : '';
        label1 = vizOptions.banner.label1 ? vizOptions.banner.label1 : '';
        value2 = data[0] ? vizOptions.banner.value2 ? data[0][vizOptions.banner.value2] : '' : '';
        label2 = vizOptions.banner.label2 ? vizOptions.banner.label2 : ''; 
        value3 = data[0] ? vizOptions.banner.value3 ? data[0][vizOptions.banner.value3] : '' : '';
        label3 = vizOptions.banner.label3 ? vizOptions.banner.label3 : ''; 
    }
    else
    if ((vizOptions.wigetType === 'variance'  || vizOptions.wigetType === 'spendVariance' || vizOptions.wigetType === 'calcVariance')) {
      // if (vizOptions.banner && (Number((data[0] ? vizOptions.banner.value2 ? data[0][vizOptions.banner.value2] : 0 : 0)) !== 0)) {
      if (vizOptions.banner) {
        let val1 = 0;
        let val2 = 0;
        let spend = 0;
        val1 = Number((data[0] ? vizOptions.banner.value1 ? data[0][vizOptions.banner.value1] : 0 : 0))
        val2 = Number((data[0] ? vizOptions.banner.value2 ? data[0][vizOptions.banner.value2] : 0 : 0))
        spend = Number((data[0] ? vizOptions.banner.value1 ? data[0][vizOptions.banner.value1] : 0 : 0))
        if (isNaN(val1))
          val1 = 0;        
        if (isNaN(val2))
          val2 = 0;
        if (vizOptions.wigetType === 'calcVariance')
          val1 = val1 - val2;
        if (isNaN(val1))
          val1 = 0;  
        if (isNaN(spend))
          spend = 0;
        val1 = Math.round(val1)            
        val2 = Math.round(val2)            
        spend = Math.round(spend)            
        if (vizOptions.notCurrency)
            value1 = numeral(normalizeCurrency(val1)).format('0')
        else
            value1 = numeral(normalizeCurrency(val1)).format('$0,0')
        graphValues(vizOptions, spend, val1, val2)
      }
    } 
    else {
      if (vizOptions && vizOptions.banner) {
          value1 = vizOptions.banner.value1 ? data[0] ? vizOptions.notCurrency ? numeral(data[0] ? normalizeCurrency(data[0][vizOptions.banner.value1]) : 0).format('0') : numeral(data[0] ? normalizeCurrency(data[0][vizOptions.banner.value1]) : 0).format('$0,0') : '$0' : '';
          label1 = vizOptions.banner.label1 ? vizOptions.banner.label1 : '';
          value2 = vizOptions.banner.value2 ? data[0] ? vizOptions.notCurrency ? numeral(data[0] ? normalizeCurrency(data[0][vizOptions.banner.value2]) : 0).format('0') : numeral(data[0] ? normalizeCurrency(data[0][vizOptions.banner.value2]):0).format('$0,0') : '$0' : '';
          label2 = vizOptions.banner.label2 ? vizOptions.banner.label2 : '';
          value3 = vizOptions.banner.value3 ? data[0] ? vizOptions.notCurrency ? numeral(data[0] ? normalizeCurrency(data[0][vizOptions.banner.value3]) : 0).format('0') : numeral(data[0] ? normalizeCurrency(data[0][vizOptions.banner.value3]) : 0).format('$0,0') : '$0' : '';
          label3 = vizOptions.banner.label3 ? vizOptions.banner.label3 : '';
          if (vizOptions.valueQualifier) 
            valQualifier = vizOptions.banner.value1 ? data[0] ? data[0][vizOptions.valueQualifier] : '' : '';
        }
      }

  return (
    <StatisticsRenderer1
      color={vizOptions?.color || "light"}
      value1={value1}
      label1={label1}
      varValue={varValue}
      varWith={varWith}
      value2={value2}
      label2={label2}
      value3={value3}
      label3={label3}
      valQualifier={valQualifier}
      textColour={textColour}
      smallFont={vizOptions.smallFont ? vizOptions.smallFont : false}
      bannerIcon={vizOptions.bannerIcon ? vizOptions.bannerIcon : ''}
      percentage={{
        color: 'success',
        amount: "+55%",
        label: "than last year",
      }}
    />
  );
}

export default BannerCompactRenderer;