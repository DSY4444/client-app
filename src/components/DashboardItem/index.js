import { createContext, useContext, useState } from 'react';
import MDTypography from '../MDTypography';
import { Card, Icon, IconButton, Modal, Tooltip, Menu, MenuItem } from '@mui/material';
import MDBox from '../MDBox';
import YASkeleton from '../YASkeleton';
import moment from "moment";
import { useAppController } from '../../context';
import { openContextHelp } from '../../context';
import { getPageName } from 'utils';
import MDButton from '../MDButton';
import colors from '../../assets/theme/base/colors';

export const DashboardItemContext = createContext();

export const useDashboardItem = () => {
  return useContext(DashboardItemContext);
};

const DashboardItem = ({ children, table, title, subtitle, chartRef, onCsvExport, loading, nodata, noOptions, download, isTable }) => {

  const [controller, dispatch] = useAppController();
  const { helpCenterUrl, showinapphelp, helpCenterToken } = controller;


  const [openMenu, setOpenMenu] = useState(false);
  const handleOpenMenu = (event) => {
    setOpenMenu(event.currentTarget)
    // showCustomDrawer('', () => <UserInfoDrawer />);
  };
  const handleCloseMenu = () => setOpenMenu(false);
  const handleCloseMenuItem = (a) => {
    setOpenMenu(false)
    if (a)
      a();
  };
  
  
  const [fullscreen, setFullscreen] = useState(false);

  const handleImageExport = () => {
    (chartRef.current.chart.options.series[0].type != "sankey") ? chartRef.current.chart.options.chart.spacingTop = 8 : ""
    chartRef.current.chart.options.exporting.fallbackToExportServer = false;
    chartRef.current.chart.options.exporting.filename = title + " - " + subtitle + ' ' + moment(Date()).format("YYYYMMDDHHmmss");
    chartRef.current.chart.options.exporting.scale = 10;
    chartRef.current.chart.options.title.text = title;
    chartRef.current.chart.options.subtitle.text = subtitle;
    chartRef.current.chart.exportChartLocal({ type: "image/jpeg" });
    chartRef.current.chart.options.exporting.error = () => { alert("There is an Error While Exporting") };
  }

  let chartHelpRef = ""
  if (((getPageName().indexOf('rag-status') == -1) && (getPageName().indexOf('cost-center-owners') == -1 ) && (title.indexOf('General Ledger Transactions') == -1 )))
     chartHelpRef = (getPageName() || 'home') + (showinapphelp ? showinapphelp === 'true' ? '' : '?t='+helpCenterToken : '?t='+helpCenterToken) + '#' + title.replaceAll(' ','-').toLowerCase();

  const render = () => {
    return <Card sx={{ height: "100%", overflow: "hidden",border:"none", position: "relative",borderRadius:"12px",boxShadow:"0px 2px 8px rgba(48, 53, 109, 0.1)", backgroundColor:colors.chartBackground, "&:hover": { "& .helpIcon" :{ visibility: 'visible' }} }} px={table && 0}>
      <MDBox px={3} pt={2} display="flex" justifyContent="space-between" width="100%" alignItems="flex-start">
        <MDBox display="flex" flexDirection="row" width="100%" justifyContent="space-between">
          <MDBox display="flex" flexDirection="column" width="90%" justifyContent="space-between">
            <MDTypography variant="h6" component="span" color="text" display="flex" alignItems="center">
              {loading && <YASkeleton variant="title" />}
              {!loading &&
                <>
                <MDBox data-testid = {title?.toLowerCase().replaceAll(' ', '')}>
                  <Tooltip placement='bottom' display={{ lg: "none", md: "block", sm: "block", xs: "block" }} title={subtitle?subtitle:title}>
                    <MDTypography variant="h6" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                      {title}
                    </MDTypography>
                  </Tooltip>
                  <MDTypography   display={{ lg: "block", md: "none", sm: "none", xs: "none" }} variant="h5" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                      {title}
                  </MDTypography>
                </MDBox>  
                  {
                    // (helpCenterUrl || "") !== "" && (chartHelpContextKey || "") !== "" &&
                    (helpCenterUrl || "") !== "" && (chartHelpRef || "") !== "" &&
                    <>
                      <MDBox display={{ lg: "none", md: "flex", sm: "flex", xs: "flex" }} flexDirection="column" alignItems="right">
                        <Tooltip
                          placement="right"
                          title="Click to learn more"
                        >
                          <IconButton className="helpIcon"
                            sx={({ palette: { text } }) => ({
                              marginLeft: .15,
                              color: "#979191",
                              visibility: 'hidden',
                              "& .MuiIcon-root": {
                                fontSize: "16px!important"
                              },
                              "&:hover": {
                                color: text.main
                              }
                            })}
                            size="small"
                            onClick={() => {
                              // showinapphelp ? showinapphelp === 'true' ? openContextHelp(dispatch, chartHelpRef) :  window.open(helpCenterUrl+'/'+chartHelpRef,'yarkenhelp') :  window.open(helpCenterUrl+'/'+chartHelpRef,'yarkenhelp');
                              window.open(helpCenterUrl+'/'+chartHelpRef,'yarkenhelp');
                            }}
                          >
                            <Icon>help</Icon>
                          </IconButton>
                        </Tooltip>
                      </MDBox>
                      <MDBox display={{ lg: "flex", md: "none", sm: "none", xs: "none" }} flexDirection="column" alignItems="right">
                        <Tooltip
                          placement="right"
                          title="Click to learn more"
                        >
                          <IconButton className="helpIcon"
                            sx={({ palette: { text } }) => ({
                              marginLeft: .15,
                              color: "#979191",
                              visibility: 'hidden',
                              "& .MuiIcon-root": {
                                fontSize: "16px!important"
                              },
                              "&:hover": {
                                color: text.main
                              }
                            })}
                            size="small"
                            onClick={() => {
                              showinapphelp ? showinapphelp === 'true' ? openContextHelp(dispatch, chartHelpRef) :  window.open(helpCenterUrl+'/'+chartHelpRef,'yarkenhelp') :  window.open(helpCenterUrl+'/'+chartHelpRef,'yarkenhelp');
                            }}
                          >
                            <Icon>help</Icon>
                          </IconButton>
                        </Tooltip>
                      </MDBox>
                    </>
                  }
                </>
              }
            </MDTypography>
            {
              (loading || subtitle) && (
                  <MDBox data-testid = {subtitle?.toLowerCase().replaceAll(' ', '')} display="flex" flexDirection="row">
                    <MDTypography variant="caption" color="text" display={{ lg: "block", md: "none", sm: "none", xs: "none" }} mt={0.3}>
                      {loading ? <YASkeleton variant="subtitle" /> : subtitle}
                    </MDTypography>
                </MDBox>
              )
            }
          </MDBox>
        { 
          (!loading && !nodata && !noOptions) && (
            <>
              <MDBox color="text" pt={0} mt={0} display="flex" flexDirection="row">
                <Menu
                anchorEl={openMenu}
                anchorReference={null}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(openMenu)}
                onClose={handleCloseMenu}
                >
                      {download ? <MenuItem key={'download'} onClick={() => handleCloseMenuItem((onCsvExport && onCsvExport) || (chartRef && handleImageExport))}>{onCsvExport ? "Download CSV" : "Download Image"}</MenuItem> : isTable ? "" : <MenuItem key={'download'} onClick={() => handleCloseMenuItem((onCsvExport && onCsvExport) || (chartRef && handleImageExport))}>{onCsvExport ? "Download CSV" : "Download Image"}</MenuItem>}
                      {/* <MenuItem key={'download'} onClick={() => handleCloseMenuItem((onCsvExport && onCsvExport) || (chartRef && handleImageExport))}>{onCsvExport ? "Download CSV" : "Download Image"}</MenuItem> */}
                      {!fullscreen && <MenuItem key={'fullscreen'} onClick={() => handleCloseMenuItem(setFullscreen(!fullscreen))}>{fullscreen ? "Exit Fullscreen" : "Show Fullscreen"}</MenuItem>}
                </Menu>

                <MDBox mt={-1} mr={-1} pt={0}>
                  {fullscreen && isTable && !download ? "" : <MDButton
                    // size="medium"
                    disableRipple
                    color="dark"
                    variant="text"
                    onClick={handleOpenMenu}
                    sx={{ "& .MuiIcon-root": { fontSize: "20px!important" } }}
                    iconOnly
                  >
                    <Icon px={0} py={0}>more_horiz</Icon>
                  </MDButton>}
                  {/* <MDButton
                    // size="medium"
                    disableRipple
                    color="dark"
                    variant="text"
                    onClick={handleOpenMenu}
                    sx={{ "& .MuiIcon-root": { fontSize: "20px!important" } }}
                    iconOnly
                  >
                    <Icon px={0} py={0}>more_horiz</Icon>
                  </MDButton> */}
                </MDBox>
                <MDBox  pl={1.5} pt={0}>
                  {/* <MDBox color="text" pr={2} pt={0.2}>
                    <Tooltip title={onCsvExport ? "Download csv" : "Download image"}>
                      <Icon sx={{ cursor: "pointer", fontWeight: "normal" }} fontSize="medium" onClick={(onCsvExport && onCsvExport) || (chartRef && handleImageExport)}>
                        download
                      </Icon>
                    </Tooltip>
                  </MDBox> */}
                  {fullscreen && <Tooltip title={fullscreen ? "Exit fullscreen" : "Show in fullscreen"}>
                    <Icon  sx={{ cursor: "pointer", fontWeight: "normal" }} fontSize="small" onClick={() => { setFullscreen(!fullscreen) }}>
                      {fullscreen ? "close_fullscreen" : "open_in_full"}
                    </Icon>
                  </Tooltip>}
                </MDBox>
              </MDBox>
            </>
          )
        }
      </MDBox>
    </MDBox>
      <MDBox p={table ? 0 : 2} sx={{ height: '100%' }}>
        {nodata && (
          <MDBox width="100%" height="100%" display="flex" alignItems="center" justifyContent="center" flexDirection="column">
            <Icon sx={{ color: "#d0cdcd", fontSize: "64px!important" }}>leaderboard</Icon>
            <MDTypography variant="subtitle2" color="text">No Data</MDTypography>
          </MDBox>
        )
        }
        {loading && (
          <MDBox width="100%" height="100%" display="flex" alignItems="center" justifyContent="center" flexDirection="column">
            <YASkeleton variant="chart" />
          </MDBox>
        )
        }
        {!loading && !nodata && children}
      </MDBox>
    </Card>
  }
  return <DashboardItemContext.Provider value={{ fullscreen }}>
    {fullscreen ? (
      <Modal open={fullscreen} onClose={() => { setFullscreen(false) }}>
        <MDBox p={3} height="100%">
          {render()}
        </MDBox>
      </Modal>
    ) : render()}
  </DashboardItemContext.Provider>
};

DashboardItem.defaultProps = {
  table: false,
  nodata: false,
  loading: false,
};

export default DashboardItem;
