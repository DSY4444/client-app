import { useState, useEffect, useRef, useCallback } from "react";
import { Link as RouterLink, useMatch } from "react-router-dom";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import {
  navbarMenuButton,
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
} from "layouts/PageLayout/components/PageNavbar/styles";
import logo from "assets/images/ya-tag.png";
import { Accordion, AccordionDetails, AccordionSummary, ClickAwayListener, Grid, MenuItem, Popper } from "@mui/material";
import { styled } from '@mui/material/styles';
import MDButton from "components/MDButton";
import MDAvatar from "components/MDAvatar";
import { useAppController } from "context";
import _ from "lodash";
import { useYADialog } from "components/YADialog";
import UserInfoDrawer from "./components/UserInfoDrawer";
import { toggleHelpSideBar } from "context";
import useFullscreen from "hooks/useFullscreen";
import MDTypography from "components/MDTypography";
import YAScrollbar from "components/YAScrollbar";

const StyledPopper = styled(Popper)(({ theme }) => ({
  border: `1px solid ${theme.palette.mode === 'light' ? '#e1e4e8' : '#30363d'}`,
  boxShadow: `0 8px 24px ${theme.palette.mode === 'light' ? 'rgba(149, 157, 165, 0.2)' : 'rgb(1, 4, 9)'}`,
  borderRadius: 4,
  // width: 235,
  padding: 8,
  zIndex: theme.zIndex.modal,
  fontSize: 13,
  color: theme.palette.mode === 'light' ? '#24292e' : '#c9d1d9',
  backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#1c2128',
}));

const isMenuSelected = (menuItem) => {
  let menuSelected = false;
  if (menuItem.subMenu) {
    menuItem.subMenu?.forEach(i => {
      if (isMenuSelected(i)) {
        menuSelected = true;
        return;
      }
    });
    return menuSelected;
  }
  return window.location.pathname === menuItem.href;
}

const MenuBar = props => {
  const { item } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  let dashboardDrilldownMatches = useMatch({ path: "/dashboard/:dashboardId/report/:reportId" });
  let budgetDetailsPathMatches = useMatch({ path: "/budget/:budgetId/budget-details" });
  let budgetCostCentreDetailsPathMatches = useMatch({ path: "/cost-center-budget/:budgetId/budget-details" });

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    if (anchorEl) {
      anchorEl.focus();
    }
    setAnchorEl(null);
  };

  let selected = isMenuSelected(item);
  if (dashboardDrilldownMatches) {
    selected = _.find(item.subMenu, { href: `/dashboard/${dashboardDrilldownMatches.params.dashboardId}` });
  }
  else if (budgetDetailsPathMatches || budgetCostCentreDetailsPathMatches) {
    selected = _.find(item.subMenu, { href: '/budget' }) || _.find(item.subMenu, { href: '/cost-center-budget' });
  }

  return (
    <Grid item>
      {item.subMenu ? (
        <MDBox
          onMouseEnter={handleClick}
          onMouseLeave={handleClose}
        >
          <MDButton
            key={item.title}
            disableRipple
            variant="text"
            size="medium"
            endIcon={<Icon sx={{ fontSize: "16px!important" }}>keyboard_arrow_down</Icon>}
            sx={(theme) => navbarMenuButton(theme, { selected: selected || anchorEl, hasSubMenu: true })}
            onClick={handleClick}
          >
            {item.title}
          </MDButton>
          <StyledPopper
            key={`"Menu-"${item.title}`}
            id={item.title}
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            getContentAnchorEl={null}
            placement="bottom-start"
            modifiers={[
              {
                name: 'offset',
                options: {
                  offset: [0, 0],
                },
              },
            ]}
            onClose={handleClose}
            sx={{ mt: 2, maxHeight: "calc(100vh - 60px)", overflowY: "auto" }}
          >
            <ClickAwayListener onClickAway={handleClose}>
              <MDBox>
                {item.subMenu &&
                  item.subMenu.map(item1 => {
                    if (item1.subMenu)
                      return (
                        <SubMenuBar
                          key={item1.title}
                          item={item1}
                          closeParent={handleClose}
                        />
                      );
                    else if (item1.href === "")
                      return (
                        <MenuItem
                          disabled={true}
                          onClick={handleClose}
                          key={item1.title}
                        >
                          {item1.title}
                        </MenuItem>
                      );
                    else
                      return (
                        <MenuItem
                          onClick={handleClose}
                          component={RouterLink}
                          key={item1.title}
                          to={item1.href}
                        >
                          {item1.title}
                        </MenuItem>
                      );
                  })}
              </MDBox>
            </ClickAwayListener>
          </StyledPopper>
        </MDBox>
      ) : (
        <>
          <MDButton
            disableRipple
            key={item.title}
            variant="text"
            size="medium"
            component={RouterLink}
            to={item.href}
            sx={(theme) => navbarMenuButton(theme, { selected })}
          >
            {item.title}
          </MDButton>
        </>
      )}
    </Grid>
  );
};

const SubMenuBar = props => {
  const { item } = props;
  const [sanchorEl, setSanchorEl] = useState(null);

  const handleSClick = event => {
    setSanchorEl(event.currentTarget);
  };

  const handleSClose = () => {
    if (sanchorEl) {
      sanchorEl.focus();
    }
    setSanchorEl(null);
    // props.handleClose();
  };

  return (
    <MDBox
      onMouseEnter={handleSClick}
      onMouseLeave={handleSClose}>
      <MenuItem
        key={item.title}
        color="inherit"
        selected={sanchorEl}
        onClick={handleSClick}
      >
        <MDBox component="span" color="inherit" width="100%">
          {item.title}
        </MDBox>
        <Icon sx={{ fontSize: "18px!important", marginLeft: 1, marginRight: -1 }}>keyboard_arrow_right</Icon>
      </MenuItem>
      <StyledPopper
        id={item.title}
        anchorEl={sanchorEl}
        open={Boolean(sanchorEl)}
        getContentAnchorEl={null}
        placement="right-start"
        onClose={handleSClose}
        sx={{ maxHeight: "100vh", overflowY: "auto" }}
      >
        <ClickAwayListener onClickAway={handleSClose}>
          <MDBox>
            {item.subMenu &&
              item.subMenu.map(sitem => {
                if (sitem.href === "")
                  return (
                    <MenuItem
                      disabled={true}
                      onClick={handleSClose}
                      key={sitem.title}
                    >
                      {sitem.title}
                    </MenuItem>
                  );
                else
                  return (
                    <MenuItem
                      onClick={() => {
                        handleSClose();
                        if (props.closeParent) props.closeParent();
                      }}
                      component={RouterLink}
                      key={sitem.title}
                      to={sitem.href}
                    >
                      {sitem.title}
                    </MenuItem>
                  );
              })}
          </MDBox>
        </ClickAwayListener>
      </StyledPopper>
    </MDBox>
  );
};

const navigationStyles = (theme) => {
  const { palette, functions, borders } = theme;
  const { black } = palette;
  const { pxToRem, rgba } = functions;
  const { borderWidth } = borders;
  return {
    boxShadow: "none",
    "&::before": {
      height: 0
    },
    "& .MuiListItem-root": {
      cursor: 'grab',
      userSelect: 'none',
      border: `${borderWidth[1]} solid transparent`,
    },
    "& .MuiListItem-root:hover": {
      borderRadius: pxToRem(4),
      backgroundColor: '#facd35',
      // backgroundColor: info.main,
      // color: white.main,
      border: `${borderWidth[1]} solid ${rgba(black.main, 0.09)}`,

    },
    "& .MuiListItem-root .dragIcon": {
      visibility: 'hidden'
    },
    "& .MuiListItem-root:hover .dragIcon": {
      visibility: 'visible'
    },
    "& .MuiListItem-root:hover .MuiTypography-root, & .MuiListItem-root:hover .MuiIcon-root": {
      color: black.main
    },
    "& .MuiListItem-root:hover .MuiCheckbox-root .MuiSvgIcon-root": {
      border: `${borderWidth[1]} solid ${black.main}`,
    },
    "& .MuiListItemIcon-root": {
      minWidth: pxToRem(20),
      margin: `${pxToRem(4)} ${pxToRem(8)}`
    },
    "& .MuiAccordionDetails-root": {
      padding: `0 0 0 ${pxToRem(8)}`
    },
    "& .MuiAccordionSummary-content": {
      margin: `${pxToRem(8)} 0`
    },
    "& .MuiAccordionSummary-expandIconWrapper": {
      marginRight: 0
    },
    "& .MuiAccordionSummary-root.Mui-expanded": {
      minHeight: pxToRem(32)
    },
    "& + .Mui-expanded": {
      margin: `0 0 ${pxToRem(8)} 0`
    },
    "& .MuiAccordionSummary-content.Mui-expanded": {
      margin: 0
    },
    "& .MuiAccordionSummary-root": {
      padding: `0 0 0 ${pxToRem(16)}`,
      minHeight: pxToRem(32),
      // flexDirection: "row-reverse"
    }
  };
};

const MenuDrawer = props => {
  const handleClose = useCallback(() => {
    if (props.onClose)
      props.onClose();
  }, []);

  const renderSubMenu = (item) => {
    if (!item.subMenu) {
      return <MenuItem key={`${item.title}_m`}
        component={RouterLink}
        to={item.href}
        onClick={handleClose}
      >
        {item.title}
      </MenuItem>
    }
    return <Accordion key={`${item.title}_m`} sx={(theme) => navigationStyles(theme)}>
      <AccordionSummary expandIcon={<Icon>keyboard_arrow_down</Icon>}>
        <MDTypography variant="button" color="text" fontWeight="regular">{item.title}</MDTypography>
      </AccordionSummary>
      <AccordionDetails>
        {
          item.subMenu && item.subMenu?.map(
            subMenuitem => {
              if (!subMenuitem.subMenu) {
                return <MenuItem key={`${subMenuitem.title}_sm`}
                  component={RouterLink}
                  to={subMenuitem.href}
                  onClick={handleClose}
                >
                  {subMenuitem.title}
                </MenuItem>
              }
              return renderSubMenu(subMenuitem);
            }
          )
        }
      </AccordionDetails>
    </Accordion>
  };

  return <ClickAwayListener onClickAway={handleClose}>
    <MDBox height="100vh" pt={6}>
      <Icon
        sx={() => ({
          cursor: "pointer",
          position: "absolute",
          right: 16,
          top: 16
        })}
        onClick={handleClose}
      >
        close
      </Icon>
      <YAScrollbar>
        <MDBox pr={1.5}>
          {props?.menu && props?.menu?.map(item => {
            // return <MenuBar key={item.title} item={item} />;
            if (!item.subMenu) {
              return <MenuItem key={`${item.title}_m`}
                component={RouterLink}
                to={item.href}
                onClick={handleClose}
              >
                {item.title}
              </MenuItem>
            }
            return <Accordion key={`${item.title}_m`} sx={(theme) => navigationStyles(theme)}>
              <AccordionSummary expandIcon={<Icon>keyboard_arrow_down</Icon>}>
                <MDTypography variant="button" color="text" fontWeight="regular">{item.title}</MDTypography>
              </AccordionSummary>
              <AccordionDetails>
                {item.subMenu && item.subMenu?.map(
                  subMenuitem => {
                    if (!subMenuitem.subMenu) {
                      return <MenuItem key={`${subMenuitem.title}_sm`}
                        component={RouterLink}
                        to={subMenuitem.href}
                        onClick={handleClose}
                      >
                        {subMenuitem.title}
                      </MenuItem>
                    }
                    return renderSubMenu(subMenuitem);
                  }
                )}
              </AccordionDetails>
            </Accordion>
          })}
        </MDBox>
      </YAScrollbar>
    </MDBox>
  </ClickAwayListener>
}

const PageNavbar = ({ absolute, light, isMini }) => {
  const [controller, dispatch] = useAppController();
  const { userInfo, appDef, showHelpSideBar, helpCenterUrl, showinapphelp, helpCenterToken } = controller;
  const [navbarType, setNavbarType] = useState();
  const [transparentNavbar, setTransparentNavbar] = useState();
  const fixedNavbar = true;
  const darkMode = false;
  const { showCustomDrawer, hideDrawer } = useYADialog();
  const drawerRef = useRef();
  const menuDrawerRef = useRef();
  const { isFullscreenEnabled, isFullscreen, toggleFullscreen } = useFullscreen();

  useEffect(() => {
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar((fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    window.addEventListener("scroll", handleTransparentNavbar);

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [fixedNavbar]);

  const handleOpenUserPanel = () => {
    // setOpenMenu(event.currentTarget)
    drawerRef.current = showCustomDrawer(() => <UserInfoDrawer onClose={handleCloseUserPanel} />);
  };
  
  const handleCloseUserPanel = () => {
    // setOpenMenu(false)
    hideDrawer(drawerRef.current);
  };

  const handleOpenMenu = () => {
    // setOpenMenu(event.currentTarget)
    menuDrawerRef.current = showCustomDrawer(() => <>
     <RouterLink onClick={handleCloseMenu}  to="/" >
       <MDBox color="inherit" sx={(theme) => navbarRow(theme, { isMini })} display={{ xs: "inherit", lg: "none" }} style={{margin:15}}>
         <img src={logo} alt="Yä" style={{ position: 'absolute', top: -8, height: 64, marginLeft: 0 , overFlow: 'hidden' }} />
        </MDBox>
     </RouterLink>
     <MenuDrawer menu={appDef?.menu} onClose={handleCloseMenu}/>
    </>, null, null, "left");
  };

  const handleCloseMenu = () => {
    // setOpenMenu(false)
    setTimeout(() => {
      hideDrawer(menuDrawerRef.current);
    },100);
  };

  const handleToggleHelp1 = () => {
      window.open(helpCenterUrl+'?t='+helpCenterToken,'yarkenhelp');
  };

  const handleToggleHelp = () => {
      showinapphelp ? showinapphelp === 'true' ? toggleHelpSideBar(dispatch, !showHelpSideBar) :  window.open(helpCenterUrl+'?t='+helpCenterToken,'yarkenhelp') :  window.open(helpCenterUrl+'?t='+helpCenterToken,'yarkenhelp');
    //toggleHelpSideBar(dispatch, !showHelpSideBar);
  };

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox>
          <MDBox color="inherit" sx={(theme) => navbarRow(theme, { isMini })} display={{ lg: "inherit", xs: "none" }}>
            <RouterLink to="/">
              <img src={logo} alt="Yä" style={{ position: 'absolute', top: -8, height: 64, marginLeft: 6, overFlow: 'hidden' }} />
            </RouterLink>
          </MDBox>
          <MDBox color={"white"} ml={8} display={{ xs: "inherit", lg: "none" }} style={{ position: 'absolute', top: 5, height: 64, marginLeft: 6, overFlow: 'hidden' }}>
            <IconButton
              size="small"
              disableRipple
              color="inherit"
              sx={navbarIconButton}
              variant="contained"
              onClick={handleOpenMenu}
            >
              <Icon
              // sx={iconsStyle}
              >menu</Icon>
            </IconButton>
          </MDBox>
          <MDBox color="inherit" display={{ xs: "none", lg: "flex" }} m={0} p={0} pl={16}>
            {appDef?.menu && appDef?.menu?.map(item => {
              return <MenuBar key={item.title} item={item} />;
            })}
          </MDBox>
        </MDBox>
        <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
          {/* <MDBox pr={1} px={1} borderRadius="6px" border={1} borderColor="#656aa2" height={36} width={164}
            display="flex" justifyItems="center" sx={{ cursor: "pointer" }}
          // onClick={openGlobalSearch}
          >
            <MDBox flex={1} display="flex" alignItems="center" justifyContent="space-between">
              <MDBox display="flex" alignItems="center">
                <Icon sx={iconsStyle}>search</Icon>
                <MDTypography ml={1} variant="caption" color="white">Search...</MDTypography>
              </MDBox>
              <MDTypography variant="caption" color="white"
                sx={{
                  border: 1,
                  borderColor: "#656aa2",
                  borderRadius: 1,
                  padding: 0.2
                }}
              >⌘K</MDTypography>
            </MDBox>
          </MDBox> */}
          {
            isFullscreenEnabled && isFullscreen &&
            <MDBox color={"white"} ml={2}>
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                variant="contained"
                onClick={toggleFullscreen}
              >
                <Icon>{isFullscreen ? "close_fullscreen" : "open_in_full"}</Icon>
              </IconButton>
            </MDBox>
          }
          {
            (helpCenterUrl || "") !== "" &&
            <>
              <MDBox color={"white"} ml={2} display={{ lg: "none", md: "flex", sm: "flex", xs: "flex" }}>
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  variant="contained"
                  onClick={handleToggleHelp1}
                >
                  <Icon
                  // sx={iconsStyle}
                  >help</Icon>
                </IconButton>
              </MDBox>
              <MDBox color={"white"} ml={2} display={{ lg: "flex", md: "none", sm: "none", xs: "none" }}>
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  variant="contained"
                  onClick={handleToggleHelp}
                >
                  <Icon
                  // sx={iconsStyle}
                  >help</Icon>
                </IconButton>
              </MDBox>
            </>
          }
          <MDBox color={"white"} ml={1}>
            <IconButton
              size="small"
              disableRipple
              color="inherit"
              sx={navbarIconButton}
              aria-controls="user-profile-menu"
              aria-haspopup="true"
              variant="contained"
              onClick={handleOpenUserPanel}
            >
              <MDAvatar name={userInfo?.displayName} size="sm" />
            </IconButton>
          </MDBox>
        </MDBox>
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
PageNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the DashboardNavbar
PageNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default PageNavbar;
