import RGL, { WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import MDBox from "components/MDBox";
import Highcharts from 'highcharts/highcharts.src.js';
import _ from 'lodash';
// import { withResizeDetector } from 'react-resize-detector';

// eslint-disable-next-line no-undef
require("highcharts/modules/exporting.src.js")(Highcharts);
// eslint-disable-next-line no-undef
require("highcharts/modules/offline-exporting.src.js")(Highcharts);
// const ReactGridLayout = withResizeDetector(RGL);
const ReactGridLayout = WidthProvider(RGL);

const DashboardContainer = ({ layout, children }) => {

   return (
    <MDBox px={0} key={_.uniqueId()}>
      <ReactGridLayout
        //  cols={{ lg: 12 }} 
        rowHeight={56}
        //  verticalCompact={true}
        layout={layout}
        //  breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        //  preventCollision={true}
        allowOverlap={true}
        //  cols={{ lg: 8, md: 8, sm: 4, xs: 2, xxs: 2 }}
        autoSize={true}
        //  margin={{
        //    lg: [20, 20],
        //    md: [20, 20],
        //    sm: [20, 20],
        //    xs: [20, 20],
        //    xxs: [20, 20],
        //  }}
        margin={[8, 8]}
        isDraggable={false}
        isResizable={false}
        useCSSTransforms={false}
        measureBeforeMount={true}
      >
        {children}
      </ReactGridLayout>
    </MDBox>
  );

}

export default DashboardContainer;