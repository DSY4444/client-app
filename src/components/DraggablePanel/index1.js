import React, { useCallback } from "react";
import { styled } from "@mui/material/styles";
import { Drawer } from "@mui/material";
import { useTheme } from "@emotion/react";
import { Icon } from "@mui/material";
import PerfectScrollbar from 'react-perfect-scrollbar';
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { useState } from "react";
import { DraggablePanelStyles } from "./styles";

export const defaultDrawerHeight = 150;
const minDrawerHeight = 150;
const maxDrawerHeight = 1000;

const useStyles = styled((theme) => ({
  drawer: {
    flexShrink: 0
  },
  toolbar: theme.mixins.toolbar,
  dragger: {
    height: "4px",
    cursor: "ew-resize",
    padding: "14px 0 0",
    borderTop: "10px solid #ff0000",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 100,
    backgroundColor: "#f4f7f9"
  }
}));

const theme = useTheme();

  const classes = useStyles(theme);
  const [drawerHeight, setDrawerHeight] = React.useState(defaultDrawerHeight);

  const handleMouseDown = () => {
    document.addEventListener("mouseup", handleMouseUp, true);
    document.addEventListener("mousemove", handleMouseMove, true);
  };

  const handleMouseUp = () => {
    document.removeEventListener("mouseup", handleMouseUp, true);
    document.removeEventListener("mousemove", handleMouseMove, true);
  };

  const handleMouseMove = useCallback((e) => {
    const newHeight = e.clientY;
    if (newHeight > minDrawerHeight && newHeight < maxDrawerHeight) {
      setDrawerHeight(newHeight);
    }
  }, []);

const DraggablePanel = (props) => {
  const {
      title,
      initialCollapse,
      togglePanel,
      width,
      directionBottom,
      children,
      onClickTitle,
  } = props;
  const [collapse, setCollapse] = useState(initialCollapse);
  const handleTogglePanel = () => {
      setCollapse(!collapse);
      if (togglePanel)
          togglePanel(!collapse) 
  }

  return (
      <MDBox className="collapsiblePanel-root" sx={theme => DraggablePanelStyles(theme, { collapse, width })}>
          <MDBox className="iconContainer">
              <MDButton
                  size="medium"
                  variant="text"
                  disableRipple
                  color="dark"
                  onClick={handleTogglePanel}
                  iconOnly
              >
                  <Icon sx={{ fontSize: "18px!important" }}>drag_handle</Icon>
              </MDButton>
          </MDBox>
          {collapse && (
              <MDBox className={!directionBottom ? "collapseLabel": "collapseLabelBottom" }onClick={handleTogglePanel}>
                  <MDTypography variant="button" fontWeight="medium">{!onClickTitle && title}</MDTypography>
              </MDBox>
          )}
          {!collapse && (
              <MDBox height="100%" overflow="auto">
                  <PerfectScrollbar>
                  <Drawer
                    anchor="bottom"
                    className={classes.drawer}
                    variant="permanent"
                    PaperProps={{ style: { paddingTop: "10px", paddingBottom: "10px", height: drawerHeight, width: "100%" } }}
                  >
                    <div className={classes.toolbar} />
                    <div
                      onMouseDown={(e) => handleMouseDown(e)}
                      className={classes.dragger}
                    />
                  {children}
                  </Drawer>
                      {children}
                  </PerfectScrollbar>
              </MDBox>
          )}
      </MDBox>
  );
};

DraggablePanel.defaultProps = {
  direction: "right",
  initialCollapse: false,
};

export default DraggablePanel;