import TextRenderer from "../TextRenderer";
import DashboardItem from "components/DashboardItem";

const TitleChartRenderer = ({ loading, vizOptions, resultSet }) => {
  if(loading)
    return <DashboardItem loading={loading}></DashboardItem>

  var data = resultSet.tablePivot();
  var textColour = vizOptions ? vizOptions.colour ? vizOptions.colour : '' : '';
  var label1 = '';

  // if (data && data.length > 0) {
    if (vizOptions.wigetType === 'textBanner') {
        label1 = vizOptions.banner.label1 ? vizOptions.banner.label1 : '';
    }
    else if (data && data.length > 0) {
      if (vizOptions && vizOptions.banner) {
        label1 = data[0] ? vizOptions.banner.label1 ? data[0][vizOptions.banner.label1] : '': '';
      }
    }
  // }

  return (
    <TextRenderer
      color={vizOptions?.color || "light"}
      label1={label1}
      textColour={textColour}
      percentage={{
        color: 'success',
        amount: "+55%",
        label: "than last year",
      }}
    />
  );
}

export default TitleChartRenderer;