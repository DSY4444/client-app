import DashboardLayoutContainer from "components/DashboardLayoutContainer";
import { useCallback, useEffect, useMemo, useState } from "react";
import fetchRequest from "utils/fetchRequest";
import { useImmer } from "use-immer";
import MDBox from "components/MDBox";
import YASkeleton from "components/YASkeleton";
import useHandleError from "hooks/useHandleError";
import VisualizationRenderer from "components/VisualizationRenderer";
import { generateUUID } from "utils";
import { ClickAwayListener, Icon, IconButton } from "@mui/material";
import useFullscreen from "hooks/useFullscreen";
import { useYADialog } from "components/YADialog";
import _ from "lodash";
import { parseJsonString } from "utils";
import produce from "immer";
import EditorEmptyState from "./components/EditorEmptyState";
import WidgetListDrawer from "./components/WidgetListDrawer";
import WidgetConfigDrawer from "./components/WidgetConfigDrawer";
import FilterConfigDrawer from "./components/FilterConfigDrawer";
import WidgetItem from "./components/WidgetItem";
import YAScrollbar from "components/YAScrollbar";
import EditorToolbar from "./components/EditorToolbar";
import colors from "assets/theme/base/colors";
import FilterContainer from "./components/FilterContainer";
import {
  CustomDashboardEditorContextProvider,
  useCustomDashboardEditorContext,
  initDashboard,
  addWidget,
  duplicateWidget,
  deleteWidget,
  widgetConfigChange,
  widgetFilterChange,
  layoutChange,
  resetDashboard
} from "context/CustomDashboardEditorContext";

const getCurrentScreenSizeWidth = (screenSizeName) => {
  let currentScreenSizeWidth = screenSizes.find(s => s.name === screenSizeName);
  return currentScreenSizeWidth ? currentScreenSizeWidth.width : null;
};

const screenSizes = [
  { name: "lg", icon: "laptop", width: 1200, title: "Laptop", subtitle: "1024px and down", desc: "Style changes made here will apply at 1024px and down" },
  { name: "md", icon: "tablet_mac", width: 768, title: "Tablet", subtitle: "768px and down", desc: "Style changes made here will apply at 768px and down" },
  { name: "sm", icon: "phone_iphone", width: 480, title: "Mobile", subtitle: "480px and down", desc: "Style changes made here will apply at 480px and down" },
];

const scrollToWidget = (wId) => {
  if (wId) {
    setTimeout(() => {
      document.getElementById(wId).scrollIntoView({
        behavior: 'smooth'
      });
    }, 500);
  }
}

const getCurrentLayout = (layouts) => {
  return layouts["lg"] || [];
};

const resizeHandles = ["s", "e", "se"];

const DEFAULT_DASHBOARDCONFIG = {
  layouts: { lg: [] },
  widgets: [],
  filters: [],
};

const DashboardEditor = ({ dashboardId, onEditorClose }) => {
  const handleError = useHandleError();
  const [loading, setLoading] = useState(true);
  const [widgetList, setWidgetList] = useImmer(null);
  const [showWidgetList, setShowWidgetList] = useState(false);
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useImmer(null);
  const [showFilterConfig, setShowFilterConfig] = useState(false);
  const [selectedFilterId, setSelectedFilterId] = useImmer(null);
  const { exitFullscreen } = useFullscreen();
  const [, setSavingReport] = useState(false);
  const { showSnackbar, showAlert, showPrompt } = useYADialog();
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");
  const [resizeContainerRef, setResizeContainerRef] = useState(_.uniqueId());
  const [breakPointChanged, setBreakPointChanged] = useState(false);
  const [showHelpDrawer, setshowHelpDrawer] = useState(false);

  const [state, dispatch] = useCustomDashboardEditorContext();
  const dashboardConfig = state.config;

  const selectedScreenSize = useMemo(() => getCurrentScreenSizeWidth(currentBreakpoint), [currentBreakpoint]);
  const currentLayout = useMemo(() => {
    return dashboardConfig?.layouts ? getCurrentLayout(dashboardConfig?.layouts) : [];
  }, [currentBreakpoint, dashboardConfig]);

  useEffect(() => {
    async function getWidgetsDef() {
      var [err, data] = await fetchRequest.get(`/api/dashboard/widgets/list`)
      if (err) {
        handleError(err);
      }
      else {
        setWidgetList(data);
        setLoading(false);
      }
    }

    async function getDashboardDef() {
      var [err, data] = await fetchRequest.get(`/api/dashboard/custom/${dashboardId}`)
      if (err) {
        handleError(err);
      }
      else {
        let parsedConfig = parseJsonString(data?.config) || { ...DEFAULT_DASHBOARDCONFIG };
        if (parsedConfig.layouts) {
          parsedConfig.layouts["lg"] = parsedConfig.layouts["lg"].map(l => (
            {
              i: l.i,
              x: l.x,
              y: l.y,
              w: l.w,
              h: l.h,
              resizeHandles
            }
          ))
        }

        initDashboard(dispatch, data.displayName, parsedConfig);
        getWidgetsDef();
        setLoading(false);
      }
    }

    getDashboardDef();
  }, [dashboardId]);

  const handleOpenHelp = () => {
    setshowHelpDrawer(true);
  };

  const handleCloseHelp = () => {
    setshowHelpDrawer(false);
  };

  const handleAddWidget = (wName, widgetConfig) => {
    try {
      if (widgetConfig) {
        const widgetId = generateUUID();
        addWidget(dispatch, widgetId, wName, widgetConfig);
        scrollToWidget(widgetId);
      }

    } catch (error) {
      console.error(error);
      showAlert('Add Widget', 'Something went wrong. Contact your administrator.');
    }
  }

  const handleOnDuplicate = (wId) => {
    const widgetId = generateUUID();
    duplicateWidget(dispatch, wId, widgetId);
    scrollToWidget(widgetId);
  }

  const handleOnLayoutsChange = (layoutVal) => {
    let updatedLayout = layoutVal?.map(w => ({
      i: w.i,
      x: w.x,
      y: w.y,
      w: w.w,
      h: w.h,
      resizeHandles: w.resizeHandles,
    }));

    layoutChange(dispatch, updatedLayout);
  }

  const saveQuery = async (dashboardId, dashboardConfig, onSuccess) => {
    setSavingReport(true);
    const normalizedDashboardConfig = produce(dashboardConfig, draftDashboardConfig => {
      Object.keys(draftDashboardConfig?.layouts)?.forEach(key => {
        draftDashboardConfig.layouts[key] = draftDashboardConfig?.layouts[key].map(w => ({
          i: w.i,
          x: w.x,
          y: w.y,
          w: w.w,
          h: w.h,
        }));
      });
    });

    const formdata = { config: normalizedDashboardConfig };
    const [error, data] = await fetchRequest.post(`/api/dashboard/${dashboardId}`, JSON.stringify(formdata));
    if (error) {
      showAlert('Save Dashboard', error?.data?.message || 'Something went wrong. Contact your administrator.');
      console.error(error);
    }
    else
      if (data && data.result === true) {
        showSnackbar(data.message, "success");
        if (onSuccess) onSuccess();
      }
      else if (data && data.result === false) {
        showAlert('Save Dashboard', data.message || 'Something went wrong. Contact your administrator.');
      }

    setSavingReport(false);
  }

  const handleOnReportSaveClick = useCallback(
    () => {
      saveQuery(dashboardId, dashboardConfig, () => {
        exitFullscreen();
        onEditorClose(true);
      })
    },
    [dashboardId, dashboardConfig]
  );

  const handleOnCloseClick = () => {
    exitFullscreen();
    onEditorClose();
  };

  const handleOnDelete = (id) => {
    showPrompt('Delete Widget', "This action will delete the widget from all the breakpoints. Are you sure you want to proceed?",
      () => {
        deleteWidget(dispatch, id);
        setShowWidgetConfig(false);
      });
  };

  const handleScreenSizeChange = (bp) => {
    setCurrentBreakpoint(bp);
    setBreakPointChanged(true);
    setTimeout(() => {
      setBreakPointChanged(false);
      setResizeContainerRef(_.uniqueId());
    }, 210);
  }

  const handleOnAddWidgetClick = () => {
    setShowWidgetList(true);
    setShowWidgetConfig(false);
  }

  const handleOnAddFilterClick = (selectedFilter) => {
    setSelectedFilterId(selectedFilter);
    setShowFilterConfig(true);
    setShowWidgetList(false);
    setShowWidgetConfig(false);
    setSelectedWidgetId(null);
  }

  const handleOnWidgetConfigClick = (wId) => {
    setSelectedWidgetId(wId);
    setShowWidgetConfig(true);
    setShowWidgetList(false);
    setShowFilterConfig(false);
    setSelectedFilterId(null);
  }

  const handleWidgetConfigChange = (wId, configName, value) => {
    widgetConfigChange(dispatch, wId, configName, value);
  }

  const handleWidgetFilterChange = (wId, filterName, operator, values) => {
    widgetFilterChange(dispatch, wId, filterName, operator, values)
  }

  const handleOnWidgetConfigClose = (event) => {
    if (event && event.target.localName === 'body') {
      return;
    }
    setShowWidgetConfig(false);
    setSelectedWidgetId(null);
  };

  const handleOnResetDashboardClick = () => {
    showPrompt('Reset Dashboard', "This action will clear the dashboard by permanently deleting all the widgets. Are you sure you want to proceed?",
      () => {
        resetDashboard(dispatch);
      });
  };

  const handleOnWidgetListClose = () => {
    setShowWidgetList(false);
  };

  const handleOnFilterListClose = () => {
    setShowFilterConfig(false);
    setSelectedFilterId(null);
  };

  if (loading) {
    return <YASkeleton variant="loading" />;
  }

  if (loading === false && dashboardConfig === null) {
    return (
      <div>
        no data
      </div>
    );
  }
  const dashboardItem = (item) => {
    return (
      <div
        key={item.id} id={item.id}
        className={item.id === selectedWidgetId ? "selected-widget" : ""}
      >
        <WidgetItem
          id={item.id}
          widgetType={item.vizState?.chartType}
          widgetConfig={item.vizOptions?.config}
          onDelete={() => handleOnDelete(item.id)}
          onDuplicate={() => handleOnDuplicate(item.id)}
          onConfigClick={handleOnWidgetConfigClick}
        >
          <VisualizationRenderer vizState={item.vizState} vizOptions={item.vizOptions} />
        </WidgetItem>
      </div>
    )
  };

  const { widgets } = dashboardConfig;
  const windowInnerWidth = window.innerWidth;
  const containerScale = (selectedScreenSize || 0) > windowInnerWidth ? (windowInnerWidth - 32) / selectedScreenSize : 1;
  const selectedWidget = selectedWidgetId ? widgets?.find(c => c.id === selectedWidgetId) : null;

  return (
    <>
      <EditorToolbar
        title={state.displayName}
        hasWidgets={widgets?.length > 0}
        onScreenSizeChange={handleScreenSizeChange}
        onAddWidgetClick={handleOnAddWidgetClick}
        onReportSaveClick={handleOnReportSaveClick}
        onOpenHelp={handleOpenHelp}
        onCloseEditorClick={handleOnCloseClick}
        onResetDashboardClick={handleOnResetDashboardClick}
      />
      <MDBox
        sx={{
          height: "calc(100vh - 54px)",
          backgroundColor: "#56585b!important",
          pt: 1.25,
          pb: 2,
          overflowY: "auto",
          overflowX: "hidden"
        }}
        className="dashboard-editor"
      >
        <MDBox
          key={resizeContainerRef}
          bgColor={colors.dashboardBackground}
          sx={{
            transform: `scale(${containerScale})`,
            transformOrigin: '0 0',
            // backgroundColor: "#fff!important",
            minHeight: "calc(100vh - 80px)",
            borderRadius: 1,
            overflow: "hidden",
            transition: containerScale === 1 ? "width 200ms" : "none",
            "& .column-skeletons": {
              position: 'absolute',
              inset: 0,
              display: 'flex',
              px: 1.5
            },
            "& .column-skeletons div": {
              flex: 1,
              borderLeft: '1px dashed #cec7c7'
            },
            "& .column-skeletons div:last-of-type": {
              borderRight: '1px dashed #cec7c7'
            }
          }}
          width={selectedScreenSize || "100%"}
          mx={containerScale === 1 ? "auto" : 2}
        >
          {
            breakPointChanged && <MDBox>
              <YASkeleton variant="loading" />
            </MDBox>
          }
          {
            !breakPointChanged &&
            <>
              {/* {widgets?.length > 0 && columnSkeletons} */}
              <MDBox>
                {
                  widgets?.length > 0 &&
                  <>
                    <FilterContainer
                      selectedFilterId={selectedFilterId}
                      onAddFilterClick={handleOnAddFilterClick}
                      onFilterListClose={handleOnFilterListClose}
                    />
                    <DashboardLayoutContainer currentLayout={currentLayout} currentBreakpoint={currentBreakpoint} transformScale={containerScale} onLayoutsChange={handleOnLayoutsChange}>
                      {widgets?.map(dashboardItem)}
                    </DashboardLayoutContainer>
                  </>
                }
                {
                  widgets?.length === 0 &&
                  (
                    <MDBox display="flex" alignItems="center" justifyContent="center" minHeight="calc(100vh - 90px)">
                      <EditorEmptyState breakpoint={currentBreakpoint} />
                    </MDBox>
                  )
                }
              </MDBox>
            </>
          }
        </MDBox>
        {
          showWidgetList &&
          <WidgetListDrawer
            widgetList={widgetList}
            onAddWidget={handleAddWidget}
            onClose={handleOnWidgetListClose}
          />
        }
        {
          showFilterConfig && selectedFilterId &&
          <FilterConfigDrawer selectedFilterId={selectedFilterId} onClose={handleOnFilterListClose} />
        }
        {
          showWidgetConfig && selectedWidget &&
          <WidgetConfigDrawer
            key={selectedWidgetId}
            selectedWidgetId={selectedWidgetId}
            selectedWidget={selectedWidget}
            onConfigChange={handleWidgetConfigChange}
            onFilterChange={handleWidgetFilterChange}
            onClose={handleOnWidgetConfigClose}
          />
        }
      </MDBox>
      {
        showHelpDrawer &&
        <ClickAwayListener onClickAway={handleCloseHelp}>
          <MDBox
            backgroundColor="#fff!important"
            position="absolute"
            top={0}
            left={0}
            zIndex={9}
            width={450}
            height="100vh"
            boxShadow="0rem 0.625rem 0.9375rem -0.1875rem rgb(0 0 0 / 10%), 0rem 0.25rem 0.375rem -0.125rem rgb(0 0 0 / 5%)!important"
          >
            <IconButton sx={{ position: "absolute", top: 0, right: 0, zIndex: 10 }} onClick={handleCloseHelp}>
              <Icon>close</Icon>
            </IconButton>
            <YAScrollbar>
              <EditorEmptyState breakpoint={"xs"} />
            </YAScrollbar>
          </MDBox>
        </ClickAwayListener>
      }
    </>
  );
};

const DashboardEditorWithContext = (props) => <CustomDashboardEditorContextProvider><DashboardEditor {...props} /></CustomDashboardEditorContextProvider>

export default DashboardEditorWithContext;