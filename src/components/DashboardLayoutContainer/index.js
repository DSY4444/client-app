import RGL, { WidthProvider } from 'react-grid-layout';
import MDBox from "components/MDBox";
import Highcharts from 'highcharts/highcharts.src.js';
import { useResizeDetector } from 'react-resize-detector';
import { useEffect, useState } from 'react';
import _ from 'lodash';
// import _ from 'lodash';
// eslint-disable-next-line no-undef
require("highcharts/modules/exporting.src.js")(Highcharts);
// eslint-disable-next-line no-undef
require("highcharts/modules/offline-exporting.src.js")(Highcharts);

const ReactGridLayout2 = WidthProvider(RGL);
const margins = { xl: [16, 16], lg: [8, 8], md: [8, 8], sm: [8, 8] };
const breakpointCols = { xl: 12, lg: 12, md: 2, sm: 2 };
// const breakpointsArr = ["xl", "lg", "md", "sm"].reverse();

const getCurrentLayout = (currentBreakpoint, layouts) => {
  // if (layouts[currentBreakpoint])
  //   return layouts[currentBreakpoint];

  if (["md", "sm"].includes(currentBreakpoint)) {
    const sortedLayout = _.sortBy(layouts["lg"] || [], ['y', 'x']);
    let yIndex = 0;
    return sortedLayout.map((w, wi) => {
      if (wi > 0)
        yIndex = yIndex + sortedLayout[wi - 1].h;
      return {
        ...w,
        y: yIndex
      };
    });
  }

  // if (currentBreakpoint === "xl")
  return layouts["lg"] || [];

  // let currentLayout = [];
  // const currentBreakpointIndex = breakpointsArr.indexOf(currentBreakpoint);
  // for (let index = currentBreakpointIndex; index < breakpointsArr.length; index++) {
  //   if (layouts[breakpointsArr[index]]) {
  //     currentLayout = layouts[breakpointsArr[index]];
  //     break;
  //   }
  // }
  // return currentLayout || [];
};

const getCurrentBreakpoint = (containerWidth) => {
  if (containerWidth <= 768)
    return "sm";
  // else if (containerWidth > 480 && containerWidth <= 768)
  //   return "md";
  else if (containerWidth > 768 && containerWidth <= 1200)
    return "lg";
  return "xl";
};

const CONTAINER_PADDING = 16;

export const CustomDashboardResponsiveContainer = ({ dashboardLayouts, children }) => {
  const { width, ref } = useResizeDetector();
  const [layoutConfig, setLayoutConfig] = useState({ key: _.uniqueId(), width: null, currentBreakpoint: "xs", currentLayout: [] });

  useEffect(() => {
    // if (layoutConfig?.width !== width) {
    const currentBreakpoint = getCurrentBreakpoint(width + CONTAINER_PADDING);
    setLayoutConfig({
      key: _.uniqueId(),
      width,
      currentBreakpoint,
      currentLayout: dashboardLayouts ? getCurrentLayout(currentBreakpoint, dashboardLayouts) : []
    })
    // }
  }, [width, dashboardLayouts]);

  // console.log(layoutConfig);

  return (
    <MDBox ref={ref}>
      {
        !layoutConfig?.width &&
        <div></div>
      }
      {
        layoutConfig?.width &&
        <ReactGridLayout2
          key={layoutConfig?.key}
          rowHeight={40}
          width={layoutConfig?.width}
          layout={layoutConfig?.currentLayout}
          preventCollision={true}
          allowOverlap={false}
          cols={breakpointCols[layoutConfig?.currentBreakpoint]}
          autoSize={true}
          compactType={null}
          margin={margins[layoutConfig?.currentBreakpoint]}
          containerPadding={[16, 16]}
          isDraggable={false}
          isResizable={false}
          useCSSTransforms={false}
          measureBeforeMount={true}
        >
          {children}
        </ReactGridLayout2>
      }
    </MDBox>
  );
}

const DashboardLayoutContainer = ({ currentLayout, currentBreakpoint, transformScale, children, onLayoutsChange }) => {

  const [layoutConfig, setLayoutConfig] = useState({ currentBreakpoint: currentBreakpoint });
  useEffect(() => {
    if (currentBreakpoint !== layoutConfig.currentBreakpoint) {
      setLayoutConfig({
        currentBreakpoint: currentBreakpoint,
      });
    }
  }, [currentBreakpoint]);

  const onLayoutChange = (layout) => {
    if (onLayoutsChange)
      onLayoutsChange(layout);
  };

  // const onDrop = (layout, layoutItem, _event) => {
  //   console.log(layout, layoutItem, _event);
  //   alert(`Dropped element props:\n${JSON.stringify(layoutItem, ['x', 'y', 'w', 'h'], 2)}`);
  // };

  // const sortedL = _.sortBy(currentLayout, ['y', 'x']);
  // console.log(currentBreakpoint, currentLayout);

  return (
    <MDBox px={0}>
      <ReactGridLayout2
        transformScale={transformScale}
        draggableHandle=".drag-handle"
        rowHeight={40}
        layout={currentLayout}
        // preventCollision={true}
        allowOverlap={false}
        cols={breakpointCols[layoutConfig?.currentBreakpoint]}
        autoSize={true}
        compactType={'vertical'}
        margin={margins[layoutConfig?.currentBreakpoint]}
        containerPadding={[16, 16]}
        isDraggable={onLayoutsChange ? true : false}
        isResizable={onLayoutsChange ? true : false}
        // isDroppable={true}
        useCSSTransforms={false}
        measureBeforeMount={true}
        onLayoutChange={onLayoutChange}
      // onDrop={onDrop}
      >
        {children}
      </ReactGridLayout2>
    </MDBox>
  );

}

export default DashboardLayoutContainer;