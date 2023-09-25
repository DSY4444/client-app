import YASkeleton from "components/YASkeleton";
import numeral from "numeral";
import StatisticsRenderer2 from "../StatisticsRenderer2";

const BannerStackRenderer = ({ loading, title, resultSet, vizOptions }) => {
    if(loading)
        return <YASkeleton variant="dashboard-item"/>
    
    var data = resultSet.tablePivot()
    const keyValArr = [];
    data.map((row) => {
        if (vizOptions.bannerType === 'yearly')
            if (vizOptions.notCurrency)
                keyValArr.push({key: row[vizOptions.banner.label1], value: numeral(row[vizOptions.banner.value1]).format('0')})
            else
                keyValArr.push({key: row[vizOptions.banner.label1], value: numeral(row[vizOptions.banner.value1]).format('$0,0')})
        else
            keyValArr.push({key: row[vizOptions.banner.label1] + ' (' + row[vizOptions.banner.label2] + ')', value: numeral(row[vizOptions.banner.value1]).format('$0,0')})
    })

    return <StatisticsRenderer2
                color="light"
                title={title}
                keyValArr={keyValArr}
            />
}

export default BannerStackRenderer;