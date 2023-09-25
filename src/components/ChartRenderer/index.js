import React from 'react';
import PropTypes from 'prop-types';
import { useCubeQuery } from '@cubejs-client/react';
import BarChartRenderer from 'components/ChartRenderer/components/BarChartRenderer';
import ColumnChartRenderer from 'components/ChartRenderer/components/ColumnChartRenderer';
import TreeMapChartRenderer from 'components/ChartRenderer/components/TreeMapChartRenderer';
import GaugeChartRenderer from 'components/ChartRenderer/components/GaugeChartRenderer';
import BulletChartRenderer from 'components/ChartRenderer/components/BulletChartRenderer';
import TableRenderer from 'components/ChartRenderer/components/TableRenderer';
import SankeyRenderer from './components/SankeyRenderer';
import ColumnYearlyChartRenderer from './components/ColumnYearlyChartRenderer';
import ColumnYearlyLineChartRenderer from './components/ColumnYearlyLineChartRenderer';
import ColumnYearlyLinePredictedChartRenderer from './components/ColumnYearlyLinePredictedChartRenderer';
import ColumnYearlyLinePredictedChartRenderer1 from './components/ColumnYearlyLinePredictedChartRenderer1';
import TitleChartRenderer from './components/TitleChartRenderer';
import BannerCompactRenderer from './components/BannerCompactRenderer';
import MetricRenderer from './components/MetricRenderer';
import MetricYearlyRenderer from './components/MatricYearlyRenderer';
import BannerCompactCategoryRenderer from './components/BannerCompactCategoryRenderer';
import BannerPrimaryRenderer from './components/BannerPrimaryRenderer';
import BannerStackRenderer from './components/BannerStackRenderer';
import BannerListRenderer from './components/BannerListRenderer';
import LineChartRenderer from './components/LineChartRenderer';
import ErrorBoundary from 'components/ErrorBoundary';
import StackedColumnChartRenderer from './components/StackedColumnChartRenderer';
import StackedBarChartRenderer from './components/StackedBarChartRenderer';
import SpendLineRenderer from './components/SpendLineRenderer';
import SubDashboardChartRenderer from './components/SubDashboardChartRenderer';
import StackedColumnYearlyLineChartRenderer from './components/StackedColumnYearlyLineChartRenderer';
import PieChartRenderer from './components/PieChartRenderer';
import PiesChartRenderer from './components/PiesChartRenderer';
import StackedAreaChartRenderer from './components/StackedAreaChartRenderer';
// import SpendLinesRenderer from './components/SpendLinesRenderer';
import ErrorBox from 'components/ErrorBox';
import DashboardItem from 'components/DashboardItem';
import YASkeleton from 'components/YASkeleton';
import {convertYearFilterAll} from 'utils/charts'

const TypeToChartComponent = {
  line: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
    return (
      <LineChartRenderer
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
      />
    );
  },
  bar: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
    return (
      <BarChartRenderer
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
      />
    );
  },
  column: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
    return (
      <ColumnChartRenderer
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
      />
    );
  },
  columnYearly: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
    return (
      <ColumnYearlyChartRenderer
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
      />
    );
  },
  columnYearlyLine: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
    return (
      <ColumnYearlyLineChartRenderer
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
      />
    );
  },
  columnYearlyLinePredicted1: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
    return (
      <ColumnYearlyLinePredictedChartRenderer1
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
      />
    );
  },
  stackedColumn: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
    return (
      <StackedColumnChartRenderer
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
      />
    );
  },
  stackedBar: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
    return (
      <StackedBarChartRenderer
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
      />
    );
  },  
  stackedArea: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
    return (
      <StackedAreaChartRenderer
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
      />
    );
  },  
  pie: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
    return (
      <PieChartRenderer
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
      />
    );
  },  
  subDashboard: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig,currentMonth,previousMonth, onDrilldownRequested}) => {
    return (
      <SubDashboardChartRenderer
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
        currentMonth={currentMonth}
        previousMonth={previousMonth}
      />
    );
  },
  stackedColumnYearlyLine: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
    return (
      <StackedColumnYearlyLineChartRenderer
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
      />
    );
  },
  treemap: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
    return (
      <TreeMapChartRenderer
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
      />
    );
  },
  solidgauge: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
    return (
      <>
      <GaugeChartRenderer
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
      /><br/>
      </>
    );
  },
  bullet: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
    return (
      <>
      <BulletChartRenderer
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
      /><br/>
      </>
    );
  },
  // table: ({ loading, title, subtitle, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
  //   return (
  //     <TableRenderer
  //       loading={loading}
  //       title={title}
  //       subtitle={subtitle}
  //       vizOptions={vizOptions}
  //       resultSet={resultSet}
  //       pivotConfig={pivotConfig}
  //       onDrilldownRequested={onDrilldownRequested}
  //     />
  //   );
  // },
  title: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
    return (
      <TitleChartRenderer
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
      />
    );
  },
  bannerCompact: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
    return (
      <BannerCompactRenderer
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
      />
    );
  },
  metric: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
    return (
      <MetricRenderer
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
      />
    );
  },
  metricYearly: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
    return (
      <MetricYearlyRenderer
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
      />
    );
  },
  bannerPrimary: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
    return (
      <BannerPrimaryRenderer
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
      />
    );
  },
  bannerStack: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
    return (
      <BannerStackRenderer
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
      />
    );
  },
  bannerList: ({ loading, title, subtitle, chartHelpContextKey, vizOptions, resultSet, pivotConfig, onDrilldownRequested }) => {
    return (
      <BannerListRenderer
        loading={loading}
        title={title}
        subtitle={subtitle}
        chartHelpContextKey={chartHelpContextKey}
        vizOptions={vizOptions}
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        onDrilldownRequested={onDrilldownRequested}
      />
    );
  },
};
const TypeToMemoChartComponent = Object.keys(TypeToChartComponent)
  .map((key) => ({
    [key]: React.memo(TypeToChartComponent[key]),
  }))
  .reduce((a, b) => ({ ...a, ...b }));

const renderSkeleton = (title, subtitle, chartType) => {
  if (["bannerStack", "bannerPrimary", "bannerCompact", "metric"].includes(chartType)) {
    return <YASkeleton variant="dashboard-item" />
  }
  return <DashboardItem loading={true} title={title} subtitle={subtitle}></DashboardItem>
};

const renderChart = (title, subtitle, chartType, chartHelpContextKey,currentMonth,previousMonth,vizOptions, Component) =>
  ({ resultSet, error, pivotConfig }) => {
    if (error) {
      return <ErrorBox error={error} />
    }
    if (!resultSet) {
      return renderSkeleton(title, subtitle, chartType);
    }
    return <ErrorBoundary>
      <Component loading={!resultSet} title={title} subtitle={subtitle} chartHelpContextKey={chartHelpContextKey} currentMonth={currentMonth} previousMonth={previousMonth} vizOptions={vizOptions} resultSet={resultSet} pivotConfig={pivotConfig} />
    </ErrorBoundary>
  };

const ChartRenderer = ({ title, subtitle, chartHelpContextKey, vizState, vizOptions,currentMonth,previousMonth }) => {
  const { chartType } = vizState;
  let vizStateNew = convertYearFilterAll(vizState, vizOptions)
  if (chartType === "table") {
    return (
      <ErrorBoundary>
        <TableRenderer
          title={title}
          subtitle={subtitle}
          chartHelpContextKey={chartHelpContextKey}
          vizState={vizStateNew ? vizStateNew : vizState}
          vizOptions={vizOptions}
        />
      </ErrorBoundary>
    );
  } else if(chartType === "sankey"){
    return (
      <ErrorBoundary>
        <SankeyRenderer
          title={title}
          subtitle={subtitle}
          chartHelpContextKey={chartHelpContextKey}
          vizState={vizState}
          vizOptions={vizOptions}
        />
      </ErrorBoundary>
    );
  } else if(chartType === "pies"){
    return (
      <ErrorBoundary>
        <PiesChartRenderer
          title={title}
          subtitle={subtitle}
          chartHelpContextKey={chartHelpContextKey}
          vizState={vizState}
          vizOptions={vizOptions}
        />
      </ErrorBoundary>
    );
  } else if(chartType === "spendLine"){
    return (
      <ErrorBoundary>
        <SpendLineRenderer
          title={title}
          subtitle={subtitle}
          chartHelpContextKey={chartHelpContextKey}
          vizState={vizState}
          vizOptions={vizOptions}
        />
      </ErrorBoundary>
    );
  }
  else if(chartType === "bannerCompactCategory"){
    return (
      <ErrorBoundary>
        <BannerCompactCategoryRenderer
          vizState={vizState}
          vizOptions={vizOptions}
        />
      </ErrorBoundary>
    );
  }
  else if(chartType === "ColumnYearlyLinePredicted"){
    return (
      <ErrorBoundary>
        <ColumnYearlyLinePredictedChartRenderer
          title={title}
          subtitle={subtitle}
          chartHelpContextKey={chartHelpContextKey}
          vizState={vizState}
          vizOptions={vizOptions}
        />
      </ErrorBoundary>
    );
  }
  else
  {
    return (
      <OtherChartRenderer title={title} subtitle={subtitle} chartHelpContextKey={chartHelpContextKey} vizState={vizState} vizOptions={vizOptions} currentMonth={currentMonth}previousMonth={previousMonth}/>
    )
  }
};

const OtherChartRenderer = ({ title, subtitle, chartHelpContextKey, vizState, vizOptions, currentMonth, previousMonth }) => {
  let vizStateNew = convertYearFilterAll(vizState, vizOptions)
  const { query, chartType, pivotConfig } = vizStateNew ? vizStateNew : vizState;
  const component = TypeToMemoChartComponent[chartType];
  let updatedQuery
  if (vizOptions.queryType && vizOptions.queryType === "CompareWithYears") {
    const updatedFilters = query.filters.filter((filter) => filter.member !== "Years.year");
    updatedQuery = { ...query, filters: updatedFilters };
  }
  const renderProps = updatedQuery ? useCubeQuery(updatedQuery) : useCubeQuery(query);
  return component && renderChart(title, subtitle, chartType, chartHelpContextKey, currentMonth, previousMonth, vizOptions, component)({ ...renderProps, pivotConfig });
};

ChartRenderer.propTypes = {
  vizState: PropTypes.object,
  vizOptions: PropTypes.object,
  cubejsApi: PropTypes.object,
};
ChartRenderer.defaultProps = {
  vizState: {},
  vizOptions: {},
  cubejsApi: null,
};
export default ChartRenderer;