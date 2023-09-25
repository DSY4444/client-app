import YASkeleton from "components/YASkeleton";
import numeral from "numeral";
import StatisticsRenderer from "../StatisticsRenderer";

const BannerPrimaryRenderer = ({ loading, title, vizOptions, resultSet }) => {
  if(loading)
    return <YASkeleton variant="dashboard-item"/>

  var data = resultSet.tablePivot()
  var newTitle = title
  var textColour = '';
  var value1 = '';
  var label1 = '';
  var value2 = '';
  var label2 = '';

  if (data && data.length > 0) {
    if (vizOptions.wigetType === 'textBanner' && data.length > 0) {
          value1 = data[0] ? vizOptions.banner.value1 ? data[0][vizOptions.banner.value1] : '' : '';
          label1 = data[0] ? vizOptions.banner.label1 ? data[0][vizOptions.banner.label1] : '' : '';
          value2 = data[0] ? vizOptions.banner.value2 ? data[0][vizOptions.banner.value2] : '' : '';
          label2 = data[0] ? vizOptions.banner.label2 ? data[0][vizOptions.banner.label2] : '' : ''; 
    }
    else
    if (vizOptions.wigetType === 'variance' && data.length > 0) {
      if (vizOptions.banner && (Number((data[0] ? vizOptions.banner.value2 ? data[0][vizOptions.banner.value2] : 0 : 0)) !== 0)) {
        let val1 = 0;
        let val2 = 0;
        val1 = Number((data[0] ? vizOptions.banner.value1 ? data[0][vizOptions.banner.value1] : 0 : 0))
        val2 = Number((data[0] ? vizOptions.banner.value2 ? data[0][vizOptions.banner.value2] : 0 : 0))
        if (isNaN(val1)) 
          val1 = 0;        
        if (isNaN(val2)) 
          val2 = 0; 
        if (vizOptions.notCurrency) 
          value1 = numeral(val1).format('0')          
        else 
          value1 = numeral(val1).format('$0,0')
        label1 = data[0] ? vizOptions.banner.label1 ? data[0][vizOptions.banner.label1] : '' : '';
        textColour = val1 > 0 ? "error" : "success";
        var VariancePercentage = (val2 === 0 ? 0 : Math.round((val1 / val2) * 100));        
        newTitle = newTitle + ' ' + (textColour === 'success' ? ' ↓ ' : textColour === 'error' ? ' ↑ '   : '') + '(' + (VariancePercentage +'%)')
      }
    } else {
      if (vizOptions && vizOptions.banner) {
        if (Number((data[0] ? vizOptions.banner.value1 ? data[0][vizOptions.banner.value1] : 0 : 0)) !== 0) {
          value1 = data[0] ? vizOptions.banner.value1 ? vizOptions.notCurrency ? numeral(data[0][vizOptions.banner.value1]).format('0') : numeral(data[0][vizOptions.banner.value1]).format('$0,0') : '' : '';
          label1 = data[0] ? vizOptions.banner.label1 ? data[0][vizOptions.banner.label1] : '' : '';
        }
        if (Number((data[0] ? vizOptions.banner.value2 ? data[0][vizOptions.banner.value2] : 0 : 0)) !== 0) {
          value2 = data[0] ? vizOptions.banner.value2 ? vizOptions.notCurrency ? numeral(data[0][vizOptions.banner.value2]).format('0') : numeral(data[0][vizOptions.banner.value2]).format('$0,0') : '' : '';
          label2 = data[0] ? vizOptions.banner.label2 ? data[0][vizOptions.banner.label2] : '' : '';
        }
    }
  }
}

  return (
    <StatisticsRenderer
      color={vizOptions?.color || "light"}
      title={newTitle}
      value1={value1}
      label1={label1}
      value2={value2}
      label2={label2}
      textColour={textColour}
      percentage={{
        color: 'success',
        amount: "+55%",
        label: "than last year",
      }}
    />
  );
}

export default BannerPrimaryRenderer;