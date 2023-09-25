import AnimatedRoute from 'components/AnimatedRoute';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import PageHeader from 'components/PageHeader';
import YASkeleton from 'components/YASkeleton';
import { useEffect, useState } from 'react';
import useFetchRequest from "hooks/useFetchRequest";
import useHandleError from 'hooks/useHandleError';
import { Card, Icon, Menu, MenuItem, CircularProgress, Modal, IconButton } from '@mui/material';
import MDTypography from 'components/MDTypography';
import DataUploadDialog from "../../../Dataflow/components/DataUploadDialog";
 import CopyFilesDialog from 'pages/Dataflow/components/CopyFilesDialog';
import fetchRequest from "utils/fetchRequest";
import { useYADialog } from "components/YADialog";
import SpendDialog from '../SpendDialog';
import { formatAmount } from 'utils';
import moment from 'moment';
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import PreviewStep from 'components/DataUpload/components/PreviewStep';
import MappingStep from 'components/DataUpload/components/MappingStep';
import FinalStep from 'components/DataUpload/components/FinalStep';
import FilteredUploadedFiles from 'components/FilteredUploadedFiles';
import { toInt } from 'utils';
import AssetView from '../AssetView';
import colors from 'assets/theme/base/colors';
import{backgroundProcessCheck} from '../../../../utils'

const Spend = (props) => {
  const { yearFilter, yearFilterName, typeFilter, tabStyles,uploadType,asset,refresh,setRefresh,title,assets } = props
  const { response, error, loading, reloadData } = asset ? useFetchRequest(`/api/dataflow/assetMonthly/${yearFilter}/${asset}`) : useFetchRequest(`/api/dataflow/${typeFilter.toLowerCase().replace(' ','')}Monthly/${yearFilter}`)
  const handleError = useHandleError();
  const [monthFilter, setMonthFilter] = useState(null);
  const [monthFilterName, setMonthFilterName] = useState(null);
  const [data, setData] = useState(null)
  const [openUpload, setOpenUpload] = useState(false);
  const [openCopyFile, setOpenCopyFile] = useState(false); 
  const [alert, setAlert] = useState()
  const [openView, setOpenView] = useState(false);
  const [selectedTab, setSelectedTab] = useState(typeFilter);
  const [openU, setOpenU] = useState(false)
  const [month, setMonth] = useState("")
  const { showAlert } = useYADialog();
  const handleUploadDialogClose = () => {
    setOpenUpload(false)
    reloadData()
  }
  const handleCopyFileDialogClose = ()=> {
    setOpenCopyFile(false)
    reloadData()
  }
  const handleViewDialogClose = () => {
    setOpenView(false)
  }
  const handleOpenUpload = async (month, monthName,) => {
    let bgData = await backgroundProcessCheck(month,yearFilter);
    if(bgData.length>0)
    {
      showAlert(bgData[0],bgData[1],bgData[2],bgData[3]);
    }else
    {
      setMonthFilter(month)
      setMonthFilterName(monthName)
      setOpenUpload(true)
    }
  }

  const handleOpenCopyFile = async (month, monthName, alert) => {
    setMonthFilter(month)
    setMonthFilterName(monthName)
    setOpenCopyFile(true)
    setAlert(alert)
  }

  const handleOpenView = (month, monthName,) => {
    setMonthFilter(month)
    setMonthFilterName(monthName)
    setOpenView(true)
  }
  const openUploadedFiles = (month) => {
    setOpenU(true)
    setMonth(month)
    setSelectedTab("uploaded")
  }
  if (openU && (selectedTab === typeFilter)) {
    setOpenU(false)
    reloadData()
  }
  useEffect(() => {
    if (!loading) {
      if (error !== null) {
        handleError(error);
      }
      else if (response !== null) {
        setData(response);
      }
    }
  }, [loading, data, yearFilter]);

  if (loading) {
    return <YASkeleton variant="dashboard-loading" />;
  }

  if (loading === false && data === null) {
    return (
      <div>
        no data
      </div>
    );
  }
  if(asset) {
    var assetIcon = assets.filter(asset => {
    return  asset.title == typeFilter
     })
     assetIcon = assetIcon[0].icon
   }
  return (
    <>
      <PageHeader
        title={ title ? title : typeFilter}
        subtitle={`Add your monthly ${ title=="Solutions" ? title.toLowerCase()+"(application to solution mapping)" : title=="Applications" ? title.toLowerCase()+"(asset mapping)" : title=="Business Units" ? title.toLowerCase()+"(solution to business unit mapping)" : typeFilter.toLowerCase()} data to enable TBM allocation and mapping`}
        hideBreadcrumbs={true}
        anchor={typeFilter}
      />
      <MDBox display="flex" width="100%" bgColor={colors.dashboardBackground}  sx={{ borderBottom: "1px solid #edeef3", borderTop: "1px solid #e3e3e3", display: "inline-flex" }} justifyContent="space-between">
        <MDBox display="flex">

         <MDButton data-testid = {(typeFilter==="Spend" ? "SPEND" : typeFilter!=="Spend" && typeFilter!=="Budget" ? "OVERVIEW" :typeFilter==="Budget" ?  "BUDGET": "").toLowerCase().replaceAll(' ', '')} sx={(theme) => tabStyles(theme, { selected: selectedTab === typeFilter })} onClick={() => setSelectedTab(typeFilter)} >
            <Icon color="dark" fontSize="small" sx={{ transform: "rotate(360deg)", marginRight: "6px" }}>{typeFilter==="Budget" ? "pie_chart" : asset ? `${assetIcon}` : "account_balance_wallet"}</Icon>
            {/* {typeFilter==="Budget" ? "BUDGET" : "SPEND"} */}
            {typeFilter==="Spend" ? "SPEND" : typeFilter!=="Spend" && typeFilter!=="Budget" ? "OVERVIEW" :typeFilter==="Budget" ?  "BUDGET": ""}
          </MDButton>
          <MDButton data-testid = {"UPLOADED FILES".toLowerCase().replaceAll(' ', '')} sx={(theme) => tabStyles(theme, { selected: selectedTab === "uploaded" })} onClick={() => setSelectedTab("uploaded")}>
            <Icon color="dark" fontSize="small" sx={{ transform: "rotate(360deg)", marginRight: "6px" }}>file_present</Icon>
            UPLOADED FILES</MDButton>
        </MDBox>
      </MDBox>
      {selectedTab === typeFilter &&
        <MDBox p={3} pt={1} bgColor={colors.dashboardBackground} minHeight="calc(100vh - 190px)" >
          {data.map(item => {
            if (item["amount"] || item["amount1"] || item["count"]>0)
              return (<Month key={item["id"]} handleOpenUpload={handleOpenUpload} asset={asset} handleOpenView={handleOpenView} handleOpenCopyFile={handleOpenCopyFile} yearFilter={yearFilter} yearFilterName={yearFilterName} item={item} reloadData={reloadData} typeFilter={typeFilter} openUploadedFiles={openUploadedFiles} setRefresh={setRefresh} />)
            else
              return (<MonthEmpty key={item["id"]} uploadType={uploadType} asset={asset} handleOpenCopyFile={handleOpenCopyFile} handleOpenUpload={handleOpenUpload} item={item} typeFilter={typeFilter} yearFilter={yearFilter} yearFilterName={yearFilterName} reloadData={reloadData} setRefresh={setRefresh}/>)})
          }
        </MDBox>
      }
      {selectedTab === "uploaded" && !openU && <FilteredUploadedFiles containerHeight="calc(100vh - 370px)" canFilter={true} yearFilterName={yearFilterName} yearFilter={yearFilter}  destination={uploadType}setRefresh={setRefresh}  reloadDataspnd={ reloadData}fileName={typeFilter == "Spend" ? ["Actual Spend","Cloud Consumption"] : typeFilter == "Budget" ? "Budget Allocation" : typeFilter == "Application" ? "Asset Mapping" : typeFilter == "Solution" ? "Capability Offering Mapping" : typeFilter == "Business Unit" ? "Business Unit Offering Mapping" : typeFilter === "Cloud" ? [typeFilter,"Cloud Consumption"] : typeFilter}/>}
      {openUpload && <DataUploadDialog uploadType={uploadType} yearFilter={yearFilter} yearFilterName={yearFilterName} monthFilter={monthFilter} monthFilterName={monthFilterName} reloadData={reloadData} onClose={handleUploadDialogClose} assets = {assets} />}
      {openView && !asset && <SpendDialog typeFilter={typeFilter} yearFilter={yearFilter} yearFilterName={yearFilterName} monthFilter={monthFilter} monthFilterName={monthFilterName} reloadData={reloadData} onClose={handleViewDialogClose} />}
      {openView && asset && <AssetView  asset={asset} refresh={refresh} setRefresh={setRefresh} typeFilter={typeFilter} yearFilter={yearFilter} yearFilterName={yearFilterName} monthFilter={monthFilter} monthFilterName={monthFilterName} reloadData={reloadData} onClose={handleViewDialogClose} />}
      {selectedTab === "uploaded" && openU && <FilteredUploadedFiles containerHeight="calc(100vh - 370px)" canFilter={true} yearFilterName={yearFilterName} yearFilter={yearFilter} monthFilterName={month} destination={uploadType}setRefresh={setRefresh} reloadDataspnd={reloadData} fileName={typeFilter == "Spend" ? ["Actual Spend","Cloud Consumption"] : typeFilter == "Budget" ? "Budget Allocation" : typeFilter == "Application" ? "Asset Mapping" : typeFilter == "Solution" ? "Capability Offering Mapping" : typeFilter == "Business Unit" ? "Business Unit Offering Mapping" : typeFilter === "Cloud" ? [typeFilter,"Cloud Consumption"] : typeFilter}/>}
      {openCopyFile && <CopyFilesDialog typeFilter= {typeFilter} alert = {alert}categoryFilter= "asset" yearFilter={yearFilter} yearFilterName={yearFilterName} monthFilter={monthFilter} monthFilterName={monthFilterName} variant={"copyFiles"} onClose={handleCopyFileDialogClose} data = {data} />}
      
    </>
  );
}

const MonthEmpty = (props) => {
  const { item, handleOpenUpload, handleOpenCopyFile, yearFilter, yearFilterName, reloadData,uploadType , setRefresh, asset, typeFilter} = props
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [activeStep, setActiveStep] = useState(uploadType);
  const [fileChecking, setFileChecking] = useState(false);
  // const [uploadSubType, setUploadSubType] = useState(uploadType);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [ws, setWs] = useState(null);
  const [sourceFields, setSourceFields] = useState([]);
  const [mappingFields, setMappingFields] = useState([]);
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(false)

  const { showAlert } = useYADialog();

  const handleOnMappingBack = () => {
    setActiveStep("preview");
  }
  const handleOpenMenu = (event) => {
    setOpenMenu(event.currentTarget)
  };
  const handleCloseMenu = () => setOpenMenu(false);

  const handleCloseMenuItem = (a)=> {
      setOpenMenu(false)
      if(a)
      a();
  }
  const handleOnMappingNext = async(mappingFields1) => {
    let bgData = await backgroundProcessCheck(item.id,yearFilter);
    if(bgData.length>0)
    {
      showAlert(bgData[0],bgData[1],bgData[2],bgData[3]);
    }else{
    setMappingFields(mappingFields1);
    setActiveStep("finish");
    }
  }

  const handleOnFinish = () => {
    setUploadSuccess(true);
    setRefresh(Math.random());
  }

  const handleUploadDialogClose = () => {
    if (uploadSuccess && reloadData) {
      reloadData();
    }
    else {
      setOpen(false)
    }
  }

  const handleNext = () => {
    switch (activeStep) {
      case "preview": {
        setActiveStep("mapping");
        break;
      }
      case "mapping": {
        setActiveStep("finish");
        break;
      }
      case "finish": {
        break;
      }

      default:
        break;
    }
  };

  const handleBack = () => {
    switch (activeStep) {
      case "preview": {
        setOpen(false)
        setActiveStep("upload");
        break;
      }
      case "mapping": {
        setActiveStep("preview");
        break;
      }
      case "finish": {
        break;
      }

      default:
        break;
    }
  };

  let enableBackBtn = false;
  let enableNextBtn = false;

  switch (activeStep) {
    case "preview": {
      enableBackBtn = true;
      if (ws?.length > 0)
        enableNextBtn = true;
      break;
    }
    case "mapping": {
      enableBackBtn = true;
      if (mappingFields?.length > 0)
        enableNextBtn = true;
      break;
    }
    case "finish": {
      enableBackBtn = false;
      enableNextBtn = false;
      break;
    }

    default:
      break;
  }
  const uploadBoxStyles = (theme, { isDragReject, isDragAccept }) => ({
    "@keyframes myEffect": {
      from: {
        transform: "scale(1.0)"
      },
      to: {
        transform: "scale(1.1)"
      }
    },
    display: (isDragReject || isDragAccept) ? "block" : "none",
    position: "absolute",
    height: 110,
    width: 110,
    top: 25,
    left: 45,
    borderRadius: "50%",
    backgroundColor: isDragReject ? "red" : isDragAccept ? "green" : "inherit",
    border: "4px solid #aca394",
    zIndex: 1,
    animation: "myEffect .7s infinite alternate",
  });

  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel.sheet.binary.macroEnabled.12, application/vnd.ms-excel, application/vnd.ms-excel.sheet.macroEnabled.12, text/csv",
    onDrop: async (acceptedFiles) => {
      try {
        let bgData = await backgroundProcessCheck(item.id,yearFilter);
        if(bgData.length>0)
        {
          showAlert(bgData[0],bgData[1],bgData[2],bgData[3]);
        }
        else{
        handleOpenUpload
        setFileChecking(true);

        var reader = new FileReader();
        reader.onload = function (e) {
          let data1 = new Uint8Array(e.target.result);
          let wb = XLSX.read(data1, { type: 'array', sheetRows: 20000 });
          let wsheet = wb.Sheets[wb.SheetNames[0]];
          let rows = XLSX.utils.sheet_to_json(wsheet, { defval: null });
          let columns = rows?.length > 0 ? Object.keys(rows[0]) : [];

          // if (onFileUpload) {
          //     onFileUpload(
          //         acceptedFiles[0].name,
          //         rows,
          //         columns
          //     );
          // }
          setSelectedFile(acceptedFiles[0]);
          setFileName(acceptedFiles[0].name);
          setWs(rows);
          setSourceFields(columns);
          setActiveStep("preview");
          setOpen(true)


          setTimeout(() => {
            setFileChecking(false);
          }, 1000);
        };
        reader.readAsArrayBuffer(acceptedFiles[0]);
      }
      } catch (err) {
        showAlert("Upload a valid .xls, .xlsx or .csv file");
        console.error("Upload a valid .xls, .xlsx or .csv file", err);
        setFileChecking(false);
      }
    }
  });
  return (
    <Card
      sx={{
        minHeight: "150px",
        minWidth: "200px",
        margin: "10px",
        display: "inline-block",
        overflow: "hidden",
        position: "relative",
        backgroundColor: "#F4F4F4",
        border: "1px dashed #ADADAD",
        "&:hover": {
          border: "1px dashed #495dbd",

        }
      }}>
      <MDBox px={3} pt={2} display="flex" justifyContent="space-between" alignItems="flex-start">
        <MDBox display="flex" width="100%" flexDirection="column" justifyContent="space-between" >
          <MDBox color="text" pt={0} mt={0} display="flex" justifyContent="space-between" flexDirection="row">
            <MDTypography data-testid = {item["name"]?.toLowerCase().replaceAll(' ', '')} variant="h6" component="span" color="#4c4c4c" display="flex">{item["name"]}</MDTypography>
            {asset &&<MDBox>
            <Menu 
             anchorEl={openMenu}
             anchorReference={null}
             anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
             transformOrigin={{ vertical: "top", horizontal: "right" }}
             open={Boolean(openMenu)}
             onClose={handleCloseMenu}
             >
              {<>
                <MenuItem key={'add'} onClick={() => handleCloseMenuItem(() => { handleOpenUpload(item["id"], item["name"]) })}>Add {typeFilter=="Application" ? "Asset Mapping": typeFilter=="Solution" ? "Asset to Solution Mapping":typeFilter=="Business Unit" ? "Solution to BU Mapping":typeFilter}</MenuItem>
                <MenuItem key={'copy'} onClick={() => handleCloseMenuItem(() => {handleOpenCopyFile(item["id"], item["name"], 'monthEmpty')})}>Copy {typeFilter}</MenuItem>
              </>
              }
              </Menu>
              <MDBox mt={-1} mr={-1} pt={0}>
              <MDButton
                // size="medium"
                disableRipple
                color="dark"
                variant="text"
                onClick={handleOpenMenu}
                sx={{ "& .MuiIcon-root": { fontSize: "20px!important" } }}
                iconOnly
              >
                <Icon px={0} py={0} alignItems="end">more_horiz</Icon>
              </MDButton>
              </MDBox>
              </MDBox>}
          </MDBox>
          <MDBox {...getRootProps({ className: 'dropzone' })} pt={2} sx={{ height: '100%', margin: "auto" }} alignItems="center" display="flex">
            <input {...getInputProps()} />
            <MDBox sx={{ position: "absolute", display: "flex", flexDirection: "column", zIndex: 2, mt: 11, width: 100, left: 50, top: -40 }}>
              {isDragReject && (
                <>
                  <MDTypography variant="button" color="white" component="span" fontWeight="medium" textAlign="center">
                    Invalid File!
                  </MDTypography>
                  <MDTypography variant="button" color="white" component="span" textAlign="center">
                    only .xls, .xslx or .csv files
                  </MDTypography>
                </>
              )

              }
              {isDragAccept && (
                <>
                  <MDTypography variant="button" color="white" component="span" fontWeight="medium" textAlign="center">
                    Valid File!
                  </MDTypography>
                  <MDTypography variant="button" color="white" component="span" textAlign="center">
                    proceed. drop it here...
                  </MDTypography>
                </>
              )
              }
            </MDBox>
            <MDBox sx={(theme) => uploadBoxStyles(theme, { isDragReject, isDragAccept })}></MDBox>

            {fileChecking && (
              <CircularProgress
                size={30}
                sx={() => ({
                  color: "#1A73E8",
                  backgroundColor: "transparent",
                  position: 'relative',
                  top: 0,
                  left: 0,
                  zIndex: 1,
                })}
              />
            )}

            {!fileChecking && (
              <MDButton
                // size="large"
                sx={{
                  fontSize: "60px",
                  color: "#d4d4d4",
                  "&:hover": {
                    color: "#7c7c7c",

                  }
                }}

                disableRipple
                variant="text"
                // onClick={() => handleOpenUpload(item["id"], item["name"]) }
                iconOnly
              >
                <Icon px={0} py={0} >note_add</Icon>

              </MDButton>)}
          </MDBox>
        </MDBox>
      </MDBox>

      <Modal open={open} onClose={handleUploadDialogClose}>
        <MDBox p={3} height="100%" width="100%" display="flex" alignItems="center" justifyContent="center">
          <Card
            sx={{
              overflow: 'hidden',
              width: (activeStep === "preview") ? "calc(100vw - 32px)" : undefined,
              height: (activeStep === "preview") ? "calc(100vh - 32px)" : undefined
            }}
          >
            <MDBox px={3} pt={2} display="flex" justifyContent="space-between" alignItems="center">
              <MDBox>
                <MDTypography variant="h6" component="span" color="text">
                  {`Upload for ${item["name"]}, FY ${yearFilterName}`}
                </MDTypography>
              </MDBox>
              <MDBox display="flex">
                <IconButton onClick={handleUploadDialogClose} title="Close">
                  <Icon>close</Icon>
                </IconButton>
              </MDBox>
            </MDBox>

            {
              activeStep === "preview" && (
                <PreviewStep uploadSubType={uploadType} ws={ws} />
              )
            }
            {
              activeStep === "mapping" && (
                <MappingStep uploadSubType={uploadType} sourceFields={sourceFields} onMappingBack={handleOnMappingBack} onMappingNext={handleOnMappingNext} />
              )
            }
            {
              activeStep === "finish" && (
                <FinalStep uploadSubType={uploadType} yearFilter={yearFilter} monthFilter={item["id"]} fileName={fileName} selectedFile={selectedFile} totalRecords={ws?.length} mappingFields={mappingFields} onFinish={handleOnFinish} />
              )
            }
            {
              activeStep !== "mapping" && (
                <MDBox px={2.5} pb={2} pt={1} display="flex" justifyContent="space-between" alignItems="center">
                  <MDBox>
                    {
                      enableBackBtn && (
                        <MDButton
                          size="medium"
                          color="info"
                          startIcon={<Icon>arrow_back_ios</Icon>}
                          onClick={handleBack}
                        >
                          Prev
                        </MDButton>
                      )
                    }
                  </MDBox>
                  {
                    activeStep === "preview" && <MDTypography color="text" variant="subtitle2" fontWeight="medium">Data Preview</MDTypography>
                  }
                  <MDBox>
                    {
                      enableNextBtn && (
                        <MDButton
                          size="medium"
                          color="info"
                          endIcon={<Icon>arrow_forward_ios</Icon>}
                          onClick={handleNext}
                        >
                          Next
                        </MDButton>
                      )
                    }
                  </MDBox>
                </MDBox>
              )
            }
          </Card>
        </MDBox>
      </Modal>
    </Card>
  )
}

const Month = (props) => {
  const { showAlert, showPrompt, showSnackbar } = useYADialog();
  const [openMenu, setOpenMenu] = useState(false);
  const { item, handleOpenUpload, handleOpenView, yearFilter, yearFilterName, reloadData, typeFilter,asset,openUploadedFiles ,setRefresh, handleOpenCopyFile} = props
  const handleOpenMenu = (event) => {
    setOpenMenu(event.currentTarget)
  };
  const handleCloseMenu = () => setOpenMenu(false);
  const handleCloseMenuItem = (a) => {
    setOpenMenu(false)
    if (a)
      a();
  };
let disaplayAmount= item.amount ? toInt(item.amount) : 0
disaplayAmount = disaplayAmount + (item.amount1 ? toInt(item?.amount1) : 0);
  const handleDelete = (item, yearFilter, yearFilterName, reloadData, typeFilter) => {
    !asset ?
    showPrompt("Delete", "Are you sure you want to delete " + typeFilter.toLowerCase() + " for - [ " + item["name"] + " " + yearFilterName + " ]", async () => {
      var [err, data] = await fetchRequest.delete(`/api/dataflow/${typeFilter.toLowerCase().replace(' ','')}/${yearFilter}/${item["id"]}`)
      if (err) {
        console.error(err)
        showAlert("Delete", "Something went wrong. Contact your administrator.");
      }
      else if (data) {
        showSnackbar(`[${item["name"]} ${yearFilterName}] ` + data, "success")
        setOpenMenu(false)
        reloadData()
        setRefresh(Math.random());
      }
    }) 
    
    :
    
    showPrompt("Delete", "Are you sure you want to delete " + typeFilter.toLowerCase() + " for - [ " + item["name"] + " " + yearFilterName + " ]", async () => {
      var [err, data] = await fetchRequest.delete(`/api/dataflow/asset/${yearFilter}/${item["id"]}/${asset}`)
      if (err) {
        console.error(err)
        showAlert("Delete", "Something went wrong. Contact your administrator.");
      }
      else if (data) {
        showSnackbar(`[${item["name"]} ${yearFilterName}] ` + data, "success")
        setOpenMenu(false)
        reloadData()
        setRefresh(Math.random());
      }
    }) 
  
  
  }

  return (
    <Card
      sx={{
        minHeight: "150px",
        minWidth: "200px",
        margin: "10px",
        display: "inline-block",
        boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
        border: "none",
        overflow: "hidden",
        position: "relative",
        "&:hover": {
          "& .helpIcon": {
            visibility: 'visible'
          }
        }
      }}>
      <MDBox px={3} pt={2} display="flex" justifyContent="space-between" alignItems="flex-start">
        <MDBox display="flex" width="100%" flexDirection="column" justifyContent="space-between" >
          <MDBox color="text" pt={0} mt={0} display="flex" justifyContent="space-between" flexDirection="row">
            <MDTypography data-testid = {item["name"]?.toLowerCase().replaceAll(' ', '')} variant="h6" component="span" color="#4c4c4c" display="flex">{item["name"]}</MDTypography>
            <Menu
              anchorEl={openMenu}
              anchorReference={null}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              open={Boolean(openMenu)}
              onClose={handleCloseMenu}
            >
              {<>
                <MenuItem data-testid={ typeFilter === "Application" ? "Asset Mapping" : typeFilter === "Solution" ? "App to Solution Mapping" : typeFilter === "Business Unit" ? "Solution to BU Mapping" :("Add"+typeFilter).toLowerCase().replaceAll(' ', '')} key={'add'} onClick={() => handleCloseMenuItem(() => { handleOpenUpload(item["id"], item["name"]) })}>Add {typeFilter=="Application" ? "Asset Mapping": typeFilter=="Solution" ? "Asset to Solution Mapping":typeFilter=="Business Unit" ? "Solution to BU Mapping":typeFilter}</MenuItem>
                {asset &&<MenuItem key={'copy'} onClick={() => handleCloseMenuItem(() => {handleOpenCopyFile(item["id"], item["name"], 'month')})}>Copy {typeFilter}</MenuItem>}
                {typeFilter!="Application" && typeFilter!="Business Unit" ?<MenuItem data-testid={typeFilter=="Application" ? "Asset Mapping": typeFilter=="Solution" ? "App to Solution Mapping":typeFilter=="Business Unit" ? "Solution to BU Mapping": ("View"+ typeFilter).toLowerCase().replaceAll(' ', '')} key={'view'} onClick={() => handleCloseMenuItem(() => { handleOpenView(item["id"], item["name"]) })}>View {typeFilter=="Application" ? "Asset Mapping": typeFilter=="Solution" ? "Asset to Solution Mapping":typeFilter=="Business Unit" ? "Solution to BU Mapping":typeFilter}</MenuItem>:""}
                {typeFilter!="Application" && typeFilter!="Solution" && typeFilter!="Business Unit" ?<MenuItem data-testid = {`Delete ${typeFilter}`.toLowerCase().replaceAll(' ', '')} key={'delete'} onClick={() => handleCloseMenuItem(() => { handleDelete(item, yearFilter, yearFilterName, reloadData, typeFilter) })}>Delete {typeFilter}</MenuItem>:""}
                <MenuItem data-testid = {"View Uploaded Files".toLowerCase().replaceAll(' ', '')} key={'view'} onClick={() => handleCloseMenuItem(() => { openUploadedFiles(item["name"]) })}>View Uploaded Files</MenuItem>
              </>
              }
            </Menu>

            <MDBox mt={-1} mr={-1} pt={0}>
              <MDButton
                // size="medium"
                disableRipple
                color="dark"
                variant="text"
                onClick={handleOpenMenu}
                sx={{ "& .MuiIcon-root": { fontSize: "20px!important" } }}
                iconOnly
              >
                <Icon px={0} py={0} alignItems="end">more_horiz</Icon>
              </MDButton>
            </MDBox>
          </MDBox>
          <MDBox pt={2} sx={{ height: '100%', fontSize: "18px", fontWeight: "bold" }}>
            { asset ? item["count"] : formatAmount(disaplayAmount,2) }&nbsp;
          </MDBox>
          <MDTypography
            sx={{ fontSize: "13.5px", pt: "28px" }}
          >Last Load: {item["lastLoad"] ? moment(item["lastLoad"]).format("MMM DD YYYY") : item["lastLoad_asset"] ? moment(item["lastLoad_asset"]).format("MMM DD YYYY"):""}</MDTypography>
        </MDBox>
      </MDBox>
    </Card>
  )
}
export default AnimatedRoute(Spend);