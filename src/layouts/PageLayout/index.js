import { Outlet } from "react-router-dom";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import PageNavbar from "layouts/PageLayout/components/PageNavbar";
import ErrorBoundary from "components/ErrorBoundary";
import { useRef } from "react";
import HelpSidebar from "./components/HelpSidebar";
import { Fab, Icon, Tooltip, Zoom, useTheme } from "@mui/material";
import { useYADialog } from "components/YADialog";
import { useAppController } from "context";

const fabStyle = {
  position: 'absolute',
  bottom: 16,
  right: 16,
};

const AskMeButton = () => {
  const theme = useTheme();
  const { showGlobalSearch } = useYADialog();
  const [controller,] = useAppController();
  const { askYarkenEnabled } = controller;

  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  };

  if (!askYarkenEnabled)
    return <span></span>

  return (
    <Zoom
      in
      timeout={transitionDuration}
      style={{
        transitionDelay: `${transitionDuration.exit}ms`,
      }}
      unmountOnExit
    >
      <Tooltip title="Ask Yärken" placement="left">
        <Fab disableRipple={true} disableTouchRipple sx={fabStyle} aria-label={"Ask Yarken"} color={"primary"} onClick={showGlobalSearch}>
          <Icon fontSize="medium">question_answer</Icon>
        </Fab>
      </Tooltip>
    </Zoom>
  );
}

const PageLayout = () => {
  const contentBodyRef = useRef();
  return (
    <>
      <PageNavbar />
      <MDBox
        sx={() => ({
          height: "calc(100vh - 48px)",
          position: "relative",
          overflow: 'auto'
        })}
      >
        <MDBox ref={contentBodyRef}>
          <ErrorBoundary page>
            <Outlet />
          </ErrorBoundary>
        </MDBox>
      </MDBox>
      <AskMeButton />
      <HelpSidebar contentBodyRef={contentBodyRef} />
    </>
  );
}

// Setting default values for the props for PageLayout
PageLayout.defaultProps = {
  background: "default",
};

// Typechecking props for the PageLayout
PageLayout.propTypes = {
  background: PropTypes.oneOf(["white", "light", "default"]),
  children: PropTypes.node,//.isRequired,
  title: PropTypes.string,//.isRequired,
  subtitle: PropTypes.string,
  primaryActionComponent: PropTypes.func
};

export default PageLayout;
