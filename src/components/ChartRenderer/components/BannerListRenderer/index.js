import YASkeleton from "components/YASkeleton";
import numeral from "numeral";
import StatisticsRenderer3 from "../StatisticsRenderer3";
import { formatAmount } from 'utils';

const BannerListRenderer = ({ loading, title, resultSet, vizOptions }) => {
    if(loading)
        return <YASkeleton variant="dashboard-item"/>
    
    var data = resultSet.tablePivot()

    var allMonths = []
    var allMonthsData = [0,0,0,0,0,0,0,0,0,0,0,0]
    var allMonthsCount = [0,0,0,0,0,0,0,0,0,0,0,0]
    resultSet.tablePivot().forEach((item) => {
        if (vizOptions && vizOptions.bannerType && vizOptions.categoryAll && vizOptions.bannerType === 'yearly') {
            if (allMonths.length === 0)
                allMonths = item[vizOptions.categoryAll].split(",");
            if (parseInt(item[vizOptions.banner.value1]) !== 0) 
                allMonthsData[allMonths.indexOf(item[vizOptions.banner.label1])] = parseInt(item[vizOptions.banner.value1])
            if (parseInt(item[vizOptions.banner.value2]) !== 0) 
                allMonthsCount[allMonths.indexOf(item[vizOptions.banner.label1])] = parseInt(item[vizOptions.banner.value2])
        }
    })
    
    const keyValArr = [];
    if (vizOptions && vizOptions.bannerType && vizOptions.bannerType === 'yearly') {
        if (vizOptions.dataOnly) {
            if (allMonths.length > 0)
                allMonths.map((key) => {
                    keyValArr.push({key: 'X', value: allMonthsCount[allMonths.indexOf(key)] > 0 ? formatAmount(Math.abs(allMonthsData[allMonths.indexOf(key)])).replace(/ /g,'').replace('.0','') : -1})    
                })
            else
                allMonthsCount.map((key) => {
                    keyValArr.push({key: 'X', value: key > 0 ? formatAmount(Math.abs(allMonthsData[allMonths.indexOf(key)])).replace(/ /g,'').replace('.0','') : -1})    
                    // keyValArr.push({key: 'X', value: formatAmount(Math.abs(allMonthsCount[allMonths.indexOf(key)] > 0 ? allMonthsData[allMonths.indexOf(key)] : 0)).replace(/ /g,'').replace('.0','')})    
                    // keyValArr.push({key: (vizOptions.dataOnly ? 'X' : (vizOptions.useNameString ? vizOptions.banner.label1 : key)), value: formatAmount(Math.abs(allMonthsData[allMonths.indexOf(key)])).replace(/ /g,'').replace('.0','')})
                    // numeral(allMonthsData[allMonths.indexOf(key)]).format('$0,0')})
            })     
        }
        else
            allMonths.map((key) => {
                if (vizOptions.notCurrency)
                    keyValArr.push({key: (vizOptions.dataOnly ? 'X' : (vizOptions.useNameString ? vizOptions.banner.label1 : key)), value: numeral(allMonthsData[allMonths.indexOf(key)]).format('0')})
                else if (vizOptions.headerOnly)
                    keyValArr.push({key: vizOptions.useNameString ? vizOptions.banner.label1 : key, value: 'X'})
                else
                    keyValArr.push({key: (vizOptions.useNameString ? vizOptions.banner.label1 : key), value: formatAmount(Math.abs(allMonthsCount[allMonths.indexOf(key)] > 0 ? allMonthsData[allMonths.indexOf(key)] : 0)).replace(/ /g,'').replace('.0','')})    
            })     
    }
    else
        data.map((row) => {
            if (vizOptions.notCurrency)
                keyValArr.push({key: vizOptions.useNameString ? vizOptions.banner.label1 : row[vizOptions.banner.label1], value: numeral(row[vizOptions.banner.value1]).format('0')})
            else
                keyValArr.push({key: vizOptions.useNameString ? vizOptions.banner.label1 : row[vizOptions.banner.label1], value: numeral(row[vizOptions.banner.value1]).format('$0,0')})
        })

    return <StatisticsRenderer3
                color="light"
                title={title}
                keyValArr={keyValArr}
            />
}

export default BannerListRenderer;