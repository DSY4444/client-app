import YASkeleton from "components/YASkeleton";
import numeral from "numeral";
import StatisticsRenderer1 from "../StatisticsRenderer1";
import { useContext, useEffect, useState } from 'react';
import { CubeContext } from '@cubejs-client/react';
import { useImmer } from 'use-immer';
import { normalizeCurrency } from "utils/table";

const BannerCompactCategoryRenderer = ({ vizState, vizOptions }) => {

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
    return <YASkeleton variant="dashboard-item"/>
  
  var prvArr = resultSet1.tablePivot()
  var currArr = resultSet2.tablePivot()
  var allCategories = []
  var allCategoriesData = []
  var currCategory = ''
  var prvIndex = -1
  var prvValue = 0
  
  if (currArr.length > 0) {
    currCategory = currArr[0][vizOptions.banner.value2]
  }

  if (vizOptions.queryType === "allCategories") {
    if (prvArr.length > 0) {
      prvValue = prvArr[0][vizOptions.banner.value1]
    }
  }
  else 
    if (prvArr.length > 0) {
      allCategories = prvArr[0][vizOptions.categoryAll].split(",")
      allCategories.map(mth => {
        allCategoriesData.push(prvArr.find(v => v[vizOptions.category] === mth) ? prvArr.find(v => v[vizOptions.category] === mth)[vizOptions.banner.value1] : 0)
      })
      prvIndex = allCategories.indexOf(currCategory) - 1
      if (prvIndex >= 0) 
      currArr[0][vizOptions.category] = allCategoriesData[prvIndex]
      else
        prvValue = 0
    }

  var data = currArr
  var textColour = '';
  var value1 = '';
  var label1 = '';
  var varValue = '';
  var value2 = '';
  var label2 = '';
  var value3 = '';
  var label3 = '';
  var varWith = '';

  if ((vizOptions.wigetType === 'variance'  || vizOptions.wigetType === 'spendVariance')) {
    if (vizOptions.banner) {
      let val1 = 0;
      let val2 = 0;
      val1 = Number((data[0] ? vizOptions.banner.value1 ? data[0][vizOptions.banner.value1] : 0 : 0))
      val2 = Number(prvValue)

      if (isNaN(val1))
        val1 = 0;        
      if (isNaN(val2))
        val2 = 0;
      if (vizOptions.notCurrency)
        value1= numeral(normalizeCurrency(val1)).format('0')
      else
        value1= numeral(normalizeCurrency(val1)).format('0,0')

      label1 = vizOptions.banner.label1 ? vizOptions.banner.label1 : '';
      textColour = (vizOptions.wigetType === 'spendVariance') ? (val1 > val2 && val1 > 0 && val2 > 0 ? "error" : "success") : (val1 > 0 ? "error" : "success");
      var VariancePercentage = (val2 === 0 ? 0 : (vizOptions.wigetType === 'spendVariance') ? Math.round(((val1-val2) / val2 ) * 100) : Math.round((val1 / val2) * 100));        
      varWith = (textColour === 'success' ? 'under ' : textColour === 'error' ? 'over ' : '') + (vizOptions.varianceWith ? vizOptions.varianceWith : (vizOptions.banner.value2.toLowerCase().includes('budget') ? 'budget' : vizOptions.banner.value2.toLowerCase().includes('previousyear') ? 'prior year' : ''))
      varValue = (textColour === 'success' ? ' ▼ ' : textColour === 'error' ? ' ▲ ' : '') + '' + (Math.abs(VariancePercentage) + '%')
    }
  } else {
    if (vizOptions && vizOptions.banner) {
        value1 = vizOptions.notCurrency ? numeral(normalizeCurrency(prvValue)).format('0') : numeral(normalizeCurrency(prvValue)).format('$0,0');
        label1 = vizOptions.banner.label1 ? vizOptions.banner.label1 : '';
        // value2 = data[0] ? vizOptions.banner.value2 ? vizOptions.notCurrency ? numeral(data[0][vizOptions.banner.value2]).format('0') : numeral(data[0][vizOptions.banner.value2]).format('$0,0') : '' : '';
        value2 = vizOptions.banner.value2 ? data[0] ? vizOptions.notCurrency ? numeral(normalizeCurrency(data[0][vizOptions.banner.value1])).format('0') : numeral(normalizeCurrency(data[0][vizOptions.banner.value1])).format('$0,0') : '$0' : '';
        label2 = vizOptions.banner.label2 ? vizOptions.banner.label2 : '';
        value3 = vizOptions.banner.value3 ? data[0] ? vizOptions.notCurrency ? numeral(normalizeCurrency(data[0][vizOptions.banner.value3])).format('0') : numeral(normalizeCurrency(data[0][vizOptions.banner.value3])).format('$0,0') : '$0' : '';
        label3 = vizOptions.banner.label3 ? vizOptions.banner.label3 : '';
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
            textColour={textColour}
            smallFont={vizOptions.smallFont ? vizOptions.smallFont : false}
            bannerIcon={vizOptions.bannerIcon ? vizOptions.bannerIcon : ''}
            percentage={{
              color: 'success',
              amount: "+55%",
              label: "than last year",
            }}
          />
  )
  

}

export default BannerCompactCategoryRenderer;