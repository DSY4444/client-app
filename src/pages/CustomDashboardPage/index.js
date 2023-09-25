import { CustomDashboardResponsiveContainer } from "components/DashboardLayoutContainer";
import { useNavigate, useParams } from "react-router-dom";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import fetchRequest from "utils/fetchRequest";
import PageHeader1 from "components/PageHeader1";
import AnimatedRoute from "components/AnimatedRoute";
import MDBox from "components/MDBox";
import YASkeleton from "components/YASkeleton";
import useHandleError from "hooks/useHandleError";
import VisualizationRenderer from "components/VisualizationRenderer";
import useFullscreen from "hooks/useFullscreen";
import { Dialog, Icon, Slide } from "@mui/material";
import EmptyState from "components/EmptyState";
import new_dashboard_img from "assets/svg/new_dashboard.svg";
import DashboardEditor from "pages/DashboardEditor";
import MDButton from "components/MDButton";
import { useAppController } from "context";
import _ from "lodash";
import DashboardForm from "pages/Dashboards/components/DashboardForm";
import { useYADialog } from "components/YADialog";
import CommentsDrawer from "components/CommentsDrawer";
import colors from "assets/theme/base/colors";
import WidgetItem from "./components/WidgetItem";
import { CustomDashboardContextProvider, initDashboard, useCustomDashboardContext } from "context/CustomDashboardContext";
import FilterContainer from "./components/FilterContainer";
import { clearFilters } from "context/CustomDashboardContext";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DashboardEditorDialog = ({ open, dashboardId, onEditorClose }) => {
  return <Dialog open={open}
    fullScreen={true}
    TransitionComponent={Transition}
  >
    {open && <DashboardEditor dashboardId={dashboardId} onEditorClose={onEditorClose} />}
  </Dialog>
};

const CustomDashboardPage = () => {
  const handleError = useHandleError();
  const { dashboardId } = useParams();
  const [loading, setLoading] = useState(true);
  const [refreshId, setRefreshId] = useState(_.uniqueId());
  const [openEditor, setOpenEditor] = useState(false);
  const { enterFullscreen } = useFullscreen();
  const [controller,] = useAppController();
  const { userInfo } = controller;
  const navigate = useNavigate();
  const { showCustomForm, showCustomDrawer, hideDrawer } = useYADialog();
  const commentsDrawerRef = useRef();
  const [state, dispatch] = useCustomDashboardContext();
  const dashboardDef = state.dashboardDef;
  const widgets = state.widgets;

  useEffect(() => {
    async function getDashboardDef() {
      var [err, data] = await fetchRequest.get(`/api/dashboard/custom/${dashboardId}`)
      if (err) {
        handleError(err);
      }
      else {
        const parsedConfig = JSON.parse(data?.config);
        initDashboard(dispatch, Object.assign({}, data, { config: parsedConfig }));
        setLoading(false);
      }
    }
    getDashboardDef();
  }, [dashboardId, refreshId]);

  const handleCreateOrCopyClose = (returnObj) => {
    if (returnObj && !isNaN(returnObj.dashboardId))
      navigate(`/dashboard/custom/${returnObj.dashboardId}`)
  };

  const handleAddButtonClick = useCallback(
    () => {
      showCustomForm("New Dashboard", () => <DashboardForm onClose={handleCreateOrCopyClose} />, null, null, null, 'sm');
    },
    []
  );

  const handleCopy = (pkId, name) => {
    showCustomForm("Copy Dashboard", () => <DashboardForm mode="copy" dashboardId={pkId} copyText={name} onClose={handleCreateOrCopyClose} />, null, null, null, 'sm');
  };

  const handleRefreshButtonClick = () => {
    setRefreshId(_.uniqueId());
  };

  const handleCloseCommentsDrawer = () => {
    hideDrawer(commentsDrawerRef.current);
  };

  const handleCommentButtonClick = () => {
    commentsDrawerRef.current = showCustomDrawer(() => <CommentsDrawer mode={"edit"} commentType="custom-dashboard" commentTypePkId={dashboardId} onClose={handleCloseCommentsDrawer} />, 400, "permanent");
  };

  const handleEditButtonClick = () => {
    enterFullscreen();
    setOpenEditor(true);
  }

  const handleOnEditorClose = (saved) => {
    setOpenEditor(false);
    clearFilters(dispatch);
    if (saved)
      handleRefreshButtonClick();
  }

  if (loading) {
    return <YASkeleton variant="dashboard-loading" />;
  }

  if (loading === false && dashboardDef === null) {
    return (
      <div>
        no data
      </div>
    );
  }

  const getSecondaryActions = () => {
    if (dashboardDef?.isViewer)
      return [];
    return [
      { label: "Copy dashboard", onClick: () => handleCopy(dashboardId, dashboardDef?.displayName) },
      { label: "Create new dashboard", onClick: handleAddButtonClick },
    ];
  }

  const renderPrimaryActions = () => {
    const editable = !dashboardDef?.isViewer && (userInfo?.sub?.toLowerCase() === dashboardDef?.createdBy?.toLowerCase() || dashboardDef.editable);
    return (
      <MDBox>
        {
          editable &&
          <MDButton sx={{ mr: 1.5, textTransform: "none" }} variant="gradient" color="info" startIcon={<Icon>edit</Icon>} onClick={handleEditButtonClick}>
            Edit
          </MDButton>
        }
        <MDButton
          // size="medium"
          // disableRipple
          // color="light"
          // variant="gradient"
          onClick={handleCommentButtonClick}
          sx={{ "& .MuiIcon-root": { fontSize: "20px!important" } }}
          iconOnly
        >
          <Icon>comment</Icon>
        </MDButton>
      </MDBox>
    )
  };

  const renderEditButton = () => {
    const editable = !dashboardDef?.isViewer && (userInfo?.sub?.toLowerCase() === dashboardDef?.createdBy?.toLowerCase() || dashboardDef.editable);

    return editable ? (
      <MDButton sx={{ textTransform: "none" }} variant="gradient" color="info" startIcon={<Icon>edit</Icon>} onClick={handleEditButtonClick}>
        Edit
      </MDButton>
    ) : null;
  }

  const { displayName, desc, config } = dashboardDef;
  const { layouts, filters } = config;
  const selfCreated = userInfo?.sub?.toLowerCase() === dashboardDef?.createdBy?.toLowerCase();

  return (
    <MDBox bgColor={colors.dashboardBackground} minHeight="calc(100vh - 56px)">
      <MDBox pb={1.25} mb={1} bgColor="white" boxShadow="rgba(48, 53, 109, 0.1) 0px 2px 8px!important">
        <PageHeader1 bottomShadow title={displayName} subtitle={desc} usePageTitleForBreadcrumb={true} primaryActionComponent={renderPrimaryActions} secondaryActions={getSecondaryActions} />
      </MDBox>
      {
        filters?.length > 0 && <FilterContainer />
      }
      <MDBox px={1} pb={8}>
        {
          widgets?.length > 0 &&
          <CustomDashboardResponsiveContainer dashboardLayouts={layouts}>
            {widgets?.map(item =>
              <div key={item.id}>
                <WidgetItem id={item.id} widgetType={item.vizState?.chartType} widgetConfig={item.vizOptions?.config}>
                  <VisualizationRenderer key={item.id} vizState={item.vizState} vizOptions={item.vizOptions} />
                </WidgetItem>
              </div>
            )}
          </CustomDashboardResponsiveContainer>
        }
        {
          widgets?.length === 0 &&
          (
            <MDBox display="flex" alignItems="center" justifyContent="center" minHeight="calc(100vh - 176px)">
              <EmptyState
                size="large"
                variant="info"
                image={new_dashboard_img}
                title={selfCreated ? "Start building your dashboard now" : "This dashboard is empty"}
                description={selfCreated ? "You can add to this dashboard by clicking the 'Edit' button." : null}
                actions={renderEditButton}
              />
            </MDBox>
          )
        }
      </MDBox>
      <DashboardEditorDialog open={openEditor} dashboardId={dashboardId} onEditorClose={handleOnEditorClose} />
    </MDBox>
  );
};

const CustomDashboardPageWithContext = () => <CustomDashboardContextProvider><CustomDashboardPage /></CustomDashboardContextProvider>

export default AnimatedRoute(CustomDashboardPageWithContext);