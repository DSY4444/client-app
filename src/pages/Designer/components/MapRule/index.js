import AnimatedRoute from 'components/AnimatedRoute';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import PageHeader from 'components/PageHeader';
import { useImmer } from "use-immer";
import YASkeleton from 'components/YASkeleton';
// import DraggablePanel from "components/DraggablePanel";
import { useEffect, useState } from 'react';
import useFetchRequest from "hooks/useFetchRequest";
import useHandleError from 'hooks/useHandleError';
import _ from "lodash";
import { Card, CircularProgress, circularProgressClasses, Divider, Icon, Menu, MenuItem } from '@mui/material';
import PropTypes from 'prop-types';
import MDTypography from 'components/MDTypography';
import fetchRequest from "utils/fetchRequest";
import { useYADialog } from "components/YADialog";
import { formatAmount } from 'utils';
import Add_Map from "assets/images/Add_Map.png";
import CostPoolMappingView from 'components/CostPoolMappingView';
import AddCostPoolRule from 'components/AddCostPoolRule';
import AddTowerRule from 'components/AddTowerRule';
import FilteredUploadedFiles from 'components/FilteredUploadedFiles';
import TowerMappingView from 'components/TowerMappingView';
import DataUploadDialog from 'pages/Dataflow/components/DataUploadDialog';
import CopyFilesDialog from 'pages/Dataflow/components/CopyFilesDialog';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import colors from 'assets/theme/base/colors';
import { downloadCPRules, downloadTRRules, downloadBURules } from "utils"
import AllocationFiles from '../AllocationFiles';
import numeral from "numeral";
import Split from 'react-split'
import { normalizeCurrency } from 'utils/table';
import{backgroundProcessCheck} from '../../../../utils'
import BUMappingView from 'components/BUMappingView';
import AddBURule from 'components/AddBURule';
import SpendDialog from '../SpendDialog';

const MapRule = (props) => {
  const { yearFilter, yearFilterName, categoryFilter, tabStyles, menuItem, setMenuItem, monthFilter, setMonthFilter, monthFilterName, setMonthFilterName, action, setAction, setRefresh} = props
  const [typeFilter, setTypeFilter] = useState("Spend");

  const { response: levelsRes, error: levelsErr, loading: levelsLoading } = useFetchRequest(`/api/dataflow/categories`);
  const [data, setData] = useImmer(null);
  const [levels, setLevels] = useImmer([]);
  const { costPools, towers} = levels;
  const handleError = useHandleError();
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (!levelsLoading) {
      if (levelsErr !== null) {
        handleError(levelsErr);
      }
      else if (levelsRes !== null) {
        setLevels(levelsRes);
       }
     }
   }, [levelsLoading, levelsRes]);


  const renderExpItem = ( id, expName, distributed) => {
  const itemStyles = () => ({
      position: "relative",
      minWidth: 140,
      px: 2,
      pt: 0.5,
      pb: 1,
      m: 0.5,
      boxShadow: "0 8px 16px #1a488e1f",
      border: "1px solid #f0eded",
      borderRadius: "8px",
      "& .item-options": {
        display: "none"
      },
      "&:hover .item-options": {
      },
    });
    return <MDBox key={`l_${expName}`} sx={(theme) => itemStyles(theme)}>
      <MDBox>
        <MDTypography variant="caption" fontWeight="medium" color={"text"}>
          {expName}
          <br/>
          {numeral(normalizeCurrency(distributed)).format('$0,0')}
        </MDTypography>
       
      </MDBox>
    </MDBox>
  }
  let displayName = categoryFilter + 's';
  if (action != null) {
    if (menuItem) {
      displayName = <>
      <MDBox display="flex">
         <MDTypography
        component="span"
        variant="h3"
        fontWeight="medium"
        lineHeight="1"
        sx={() => ({
          
          "&:hover": {
            color: colors.linkColour,
            cursor: 'pointer'
          }
        })} onClick={() => { setMenuItem(menuItem); setMonthFilter(null); setAction(null) }}>{categoryFilter}s</MDTypography>
        <ChevronRightIcon fontSize="medium" sx={{ marginTop: 0.3 }} />
        <MDTypography
          component="span"
          variant="h3"
          fontWeight="medium"

          // sx={{ lineHeight: 1.25,}}
          sx={{ lineHeight: 1, "&:hover": { "& .helpIcon": { visibility: 'visible' } } }}
        >{monthFilterName}</MDTypography>
        <MDTypography
          component="span"
          variant="h5"
          fontWeight="medium" 
          pl="3px"
          pt="5px"
          
          // sx={{ lineHeight: 1.25,}}
          sx={{ lineHeight: 1.2, "&:hover": { "& .helpIcon": { visibility: 'visible' } } }}
        >{' (' + typeFilter + ')'}</MDTypography>
      </MDBox></>
    }
  }


  const handleAction = (month, monthName, action) => {
    setMonthFilter(month)
    setMonthFilterName(monthName)
    // setTitle(displayName + ">" + monthName)
    setAction(action)
  }

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  }

  const { response: dataRes, error: dataErr, loading: dataLoading } = useFetchRequest(`/api/dataflow/data/${yearFilter}/${monthFilter}`);
    useEffect(() => {
    if (!dataLoading) {
      if (dataErr !== null) {
        handleError(dataErr);
      }
      else if (dataRes !== null) {
        setData(dataRes);
      }
    }
  }, [dataLoading, dataRes]);

  const renderLevel = (levelDef,expName,expType)=> {
    let arr = levelDef?.map((item) => {
      return Object.assign({}, {
        "id": item.id, "name": item.name,
        "amount": _.find(data?.[expType], { [expName]: item.name }) ? _.find(data[expType], { [expName]: item.name }) ? (_.find(data[expType], { [expName]: item.name }).amount) : 0 : 0,
        // "distributed": _.find(data[distExpType], { [expName]: item.name }) ? _.find(data[distExpType], { [expName]: item.name }).amount : 0,
      })
    })
   return <MDBox display="flex" mt={2} mb={2} flexDirection="row" flexWrap="wrap" alignItems="center" justifyContent="center">
        {
          arr?.map((l)=> {
            return renderExpItem(l["id"],l["name"], l["amount"])
          })
        }
  </MDBox>
 }
  return (
    <>
      <Split
        style={{ height: 'calc(100vh - 70px)'}}
        sizes={[90, 10]}
        minSize={5}
        expandToMin={false}
        gutterAlign="center"
        snapOffset={0}
        dragInterval={1}
        cursor="row-resize"
        className="split"
        direction="vertical"
        gutterSize={20}        
      >
        <div>         
          <PageHeader
            title={displayName}
            subtitle={`Add your monthly ${categoryFilter.toLowerCase()} rules for allocation and mapping`}
            hideBreadcrumbs={true}
            anchor={categoryFilter + 's'}
          />
          {!monthFilter && <ShowAllMonths yearFilter={yearFilter} yearFilterName={yearFilterName} tabStyles={tabStyles} categoryFilter={categoryFilter} setTypeFilter={setTypeFilter} typeFilter={typeFilter} handleAction={handleAction} setRefresh={setRefresh} />} 
          {action && action !== "" && <ShowRules action={action} yearFilter={yearFilter} yearFilterName={yearFilterName} tabStyles={tabStyles} monthFilter={monthFilter} setTypeFilter={setTypeFilter} handleAction={handleAction} monthFilterName={monthFilterName} setAction={setAction} typeFilter={typeFilter} categoryFilter={categoryFilter} setRefresh={setRefresh}/>}
        </div>
        <div>
          {
          ((action === "view" || action === "add" )) && categoryFilter !== "Business Unit" &&
            <>
            <MDBox 
              className="iconContainer"  
              width= "100%"
              display= "flex"
              alignItems= "center"
              justifyContent= "space-around"
            >
              <MDButton
                size="medium"
                variant="text"
                disableRipple
                color="dark"
                onClick={handleToggleCollapse}
              >
                <Icon sx={{ fontSize: "24px!important", alignContent: "center" }}>{collapsed ? 'expand_more' : 'expand_less'}</Icon> 
                {/* drag_handle */}
              </MDButton>
            </MDBox>
            {/* <DraggablePanel>  */}
            { !collapsed && ( categoryFilter === "Cost Pool" ? renderLevel(costPools,"costPool.name","costPoolExpenditure") : renderLevel(towers,"tower.name","towerExpenditure")) }
            {/* </DraggablePanel> */}
            </>
          }
        </div>
      </Split>
    </>
  );
}

const ShowRules = (props) => {
  const { yearFilter, yearFilterName, monthFilter, monthFilterName, action, setAction, categoryFilter, tabStyles, typeFilter, setRefresh , handleAction ,setTypeFilter } = props
  const [originalFileName, setOriginalFileName] = useState(null)

  const handleUploadDialogClose = () => {
    action == "addAssetMapping" || action === "viewAssetMapping" ? setAction(categoryFilter) : setAction("view");
    setRefresh(Math.random());  
  };
  let txt = "UNALLOCATED "+typeFilter.toUpperCase()
  // console.log(action);
  return (
    <>
      {action !== "choose" && action !== categoryFilter && <MDBox display="flex" width="100%" sx={{ backgroundColor: "#F7F8FD", borderBottom: "1px solid #edeef3", borderTop: "1px solid #e3e3e3", display: "inline-flex" }} justifyContent="space-between">
        <MDBox display="flex">
          <MDButton data-testid = {txt?.toLowerCase().replaceAll(' ', '')} sx={(theme) => tabStyles(theme, { selected: action === "add" })} onClick={() => setAction("add")} >
            <Icon color="dark" fontSize="small" sx={{ transform: "rotate(360deg)", marginRight: "6px" }}>account_balance_wallet</Icon>
            {txt}</MDButton>
          <MDButton data-testid = {"RULES".toLowerCase().replaceAll(' ', '')} sx={(theme) => tabStyles(theme, { selected: action === "view" })} onClick={() => setAction("view")}>
            <Icon color="dark" fontSize="small" sx={{ transform: "rotate(360deg)", marginRight: "6px" }}>pie_chart</Icon>
            RULES</MDButton>
          <MDButton data-testid = {"UPLOADED FILES".toLowerCase().replaceAll(' ', '')} sx={(theme) => tabStyles(theme, { selected: action === "uploaded" })} onClick={() => setAction("uploaded")}>
            <Icon color="dark" fontSize="small" sx={{ transform: "rotate(360deg)", marginRight: "6px" }}>file_present</Icon>
            UPLOADED FILES</MDButton>
          {categoryFilter !== "Cost Pool" && <MDButton data-testid = {"ALLOCATION FILES".toLowerCase().replaceAll(' ', '')} sx={(theme) => tabStyles(theme, { selected: action === "allocation" })} onClick={() => setAction("allocation")}>
            <Icon color="dark" fontSize="small" sx={{ transform: "rotate(360deg)", marginRight: "6px" }}>pie_chart</Icon>
            ALLOCATION FILES</MDButton>}
        </MDBox>
      </MDBox>}
      {action === "choose" && <ShowChoice setAction={setAction} categoryFilter={categoryFilter} yearFilter={yearFilter} monthFilter={monthFilter} />}
      {action === "upload" && categoryFilter === "Cost Pool" && <DataUploadDialog uploadType={"costPoolMapping"} yearFilter={yearFilter} yearFilterName={yearFilterName} monthFilter={monthFilter} monthFilterName={monthFilterName} onClose={handleUploadDialogClose} />}
      {action === "copy" && categoryFilter === "Cost Pool" && <CopyFilesDialog typeFilter= {typeFilter} categoryFilter={categoryFilter} yearFilter={yearFilter} yearFilterName={yearFilterName} monthFilter={monthFilter} monthFilterName={monthFilterName} variant={"copyCPRules"} onClose={handleUploadDialogClose} />}
      {action === "add" && categoryFilter === "Cost Pool" && <AddCostPoolRule yearFilter={yearFilter} monthFilter={monthFilter} mt={2} containerHeight={"calc(100vh - 400px)"} typeFilter={typeFilter} setRefresh={setRefresh}  />}
      {action === "view" && categoryFilter === "Cost Pool" && <CostPoolMappingView yearFilter={yearFilter} monthFilter={monthFilter} containerHeight={"calc(100vh - 370px)"} typeFilter={typeFilter} setRefresh={setRefresh}/>}
     
      {action === "upload" && categoryFilter === "Tower" && <DataUploadDialog uploadType={"towerMapping"} yearFilter={yearFilter} yearFilterName={yearFilterName} monthFilter={monthFilter} monthFilterName={monthFilterName} onClose={handleUploadDialogClose} />}
      {action === "copy" && categoryFilter === "Tower" && <CopyFilesDialog typeFilter= {typeFilter} categoryFilter={categoryFilter} yearFilter={yearFilter} yearFilterName={yearFilterName} monthFilter={monthFilter} monthFilterName={monthFilterName} variant={"copyTRRules"} onClose={handleUploadDialogClose} />}
      {action === "add" && categoryFilter === "Tower" && <AddTowerRule yearFilter={yearFilter} monthFilter={monthFilter} mt={2} containerHeight={"calc(100vh - 400px)"} typeFilter={typeFilter}  setRefresh={setRefresh}/>}
      {action === "view" && categoryFilter === "Tower" && <TowerMappingView yearFilter={yearFilter} monthFilter={monthFilter} containerHeight={"calc(100vh - 370px)"} typeFilter={typeFilter} setRefresh={setRefresh}/>}
      {action === "allocation" && categoryFilter === "Tower" && <AllocationFiles yearFilter={yearFilter} monthFilter={monthFilter} setRefresh={setRefresh} setAction={setAction} categoryFilter={categoryFilter} setOriginalFileName={setOriginalFileName}/>}
      {action === "addAssetMapping" && <DataUploadDialog uploadType={"assetRelationship"} yearFilter={yearFilter} yearFilterName={yearFilterName} monthFilter={monthFilter} monthFilterName={monthFilterName} onClose={handleUploadDialogClose} />}
      {action === "viewAssetMapping" && <SpendDialog typeFilter={"Capabilities"} yearFilter={yearFilter} yearFilterName={yearFilterName} monthFilter={monthFilter} monthFilterName={monthFilterName} reloadData={setRefresh} onClose={handleUploadDialogClose} />}
      {action === "Tower" && <ShowAllMonths yearFilter={yearFilter} yearFilterName={yearFilterName} tabStyles={tabStyles} categoryFilter={categoryFilter} setTypeFilter={setTypeFilter} typeFilter={typeFilter} handleAction={handleAction} setRefresh={setRefresh} />} 


      
      {action === "upload" && categoryFilter === "Business Unit" && <DataUploadDialog uploadType={"businessUnitOffering"} yearFilter={yearFilter} yearFilterName={yearFilterName} monthFilter={monthFilter} monthFilterName={monthFilterName} onClose={handleUploadDialogClose} />}
      {action === "copy" && categoryFilter === "Business Unit" && <CopyFilesDialog typeFilter= {typeFilter} categoryFilter={categoryFilter} yearFilter={yearFilter} yearFilterName={yearFilterName} monthFilter={monthFilter} monthFilterName={monthFilterName} variant={"copyBURules"} onClose={handleUploadDialogClose} />}
      {action === "add" && categoryFilter === "Business Unit" && <AddBURule yearFilter={yearFilter} monthFilter={monthFilter} mt={2} containerHeight={"calc(100vh - 400px)"} typeFilter={typeFilter}  setRefresh={setRefresh}/>}
      {action === "view" && categoryFilter === "Business Unit" && <BUMappingView yearFilter={yearFilter} monthFilter={monthFilter} containerHeight={"calc(100vh - 370px)"} typeFilter={typeFilter} setRefresh={setRefresh}/>}
      {action === "allocation" && categoryFilter === "Business Unit" && <AllocationFiles yearFilter={yearFilter} monthFilter={monthFilter} setRefresh={setRefresh} setAction={setAction} categoryFilter={categoryFilter} setOriginalFileName={setOriginalFileName}/>}
      
      {action === "uploaded" && <FilteredUploadedFiles containerHeight="calc(100vh - 370px)" canFilter={true} yearFilter={yearFilter} yearFilterName={yearFilterName} monthFilter={monthFilter} monthFilterName={monthFilterName} setRefresh={setRefresh} fileName={categoryFilter === "Cost Pool" ? "Cost Pool Mapping" : categoryFilter === "Business Unit" ? "Business Unit Offering Mapping": ['Tower Mapping','Asset Mapping']}/>}
      {action === "consumption" && <FilteredUploadedFiles containerHeight="calc(100vh - 370px)" canFilter={true} yearFilter={yearFilter} yearFilterName={yearFilterName} monthFilter={monthFilter} monthFilterName={monthFilterName} setRefresh={setRefresh} fileType={"Consumption"} originalFileName={originalFileName}/>}
    </>
  )
}
const CostPoolStyles = () => ({
  width: "500px",
  marginBottom: "10px",
  padding: "10px",
  height: "150px",
  borderRadius: "12px",
  border: "1px solid #edeef3",
  display: "inline-flex",
  "&:hover": {
    backgroundColor: "#e9edf8",
    border: "1px solid #5472c7",
    cursor: "pointer"
  }

});

const ShowChoice = (props) => {
  
  const { setAction,yearFilter,monthFilter,categoryFilter } = props
  const { showPrompt ,showAlert } = useYADialog();

  var existingRules;
  
  if(categoryFilter == "Cost Pool"){
      const { response } = useFetchRequest(`/api/dataflow/costPoolMapping/${yearFilter}/${monthFilter}`)
      existingRules = response?.length
  }

  if(categoryFilter == "Tower"){
    const { response } = useFetchRequest(`/api/dataflow/towerMapping/${yearFilter}/${monthFilter}`)
    existingRules = response?.length
  }

  if(categoryFilter == "Business Unit"){
    const { response } = useFetchRequest(`/api/dataflow/businessunitMapping/${yearFilter}/${monthFilter}`)
    existingRules = response?.length
  }

  const handleUpload = async () => {
    let bgData = await backgroundProcessCheck(monthFilter, yearFilter);
    if(bgData.length>0)
    {
      showAlert(bgData[0],bgData[1],bgData[2],bgData[3]);
    }
    else
    {
      existingRules && categoryFilter !== "Business Unit" ? showPrompt("Alert","You have " +existingRules+" existing rules. These rules will be deleted during the load of new rules. Are you sure you want to continue?",()=> setAction("upload"),()=>{},"NO","YES")
      : setAction("upload")
    }
  }
  const handleMapaction = async (action) => {
    let bgData = await backgroundProcessCheck(monthFilter, yearFilter);
    if (bgData.length > 0) {
      showAlert(bgData[0], bgData[1], bgData[2], bgData[3]);
    }
    else {
      if (action === "copy") {
        existingRules && categoryFilter !== "Business Unit" ? showPrompt("Alert", "You have " + existingRules + " existing rules. These rules will be deleted during the load of new rules. Are you sure you want to continue?", () => setAction("copy"), () => { }, "NO", "YES")
          : setAction(action)
      }
      else {
        setAction(action)
      }
    }
  }
  return (
    <MDBox display="grid" sx={{ padding: "16px", backgroundColor: "#F7F8FD" }} >
      <MDTypography  data-testid = {`How would you like your ${props.categoryFilter} mapping to start?`.toLowerCase().replaceAll(' ', '')}variant="h3" gutterBottom>How would you like your {props.categoryFilter} mapping to start?</MDTypography>
      <MDBox
        sx={() => CostPoolStyles()}
        onClick={handleUpload}>
        <MDBox display="flex" justifyContent="space-between">
          <MDBox sx={{ padding: "25px" }}>
            <img src={Add_Map} style={{ width: 125, }} />
          </MDBox>
          <MDBox sx={{ padding: "25px" }}>
            <MDTypography data-testid = {"Add mapping file".toLowerCase().replaceAll(' ', '')} variant="h6" >Add mapping file</MDTypography>
            <MDTypography data-testid = {"Upload a mapping file to create rules".toLowerCase().replaceAll(' ', '')} sx={{ fontSize: "12px;" }} gutterBottom>Upload a mapping file to create rules </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
      <MDBox sx={() => CostPoolStyles()} onClick={() =>  handleMapaction("copy")}>
        <MDBox display="flex" justifyContent="space-between" component="">
          <MDBox sx={{ padding: "25px" }}>
            <img src={Add_Map} style={{ width: 125, }} />
          </MDBox>
          <MDBox sx={{ padding: "25px" }}>
            <MDTypography data-testid = {"Copy rules from another month".toLowerCase().replaceAll(' ', '')} variant="h6" >Copy rules from another month</MDTypography>
            <MDTypography data-testid = {"Select a month you have already mapped to use the same rules".toLowerCase().replaceAll(' ', '')} sx={{ fontSize: "12px;" }} gutterBottom>Select a month you have already mapped to use the same rules </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
      <MDBox sx={() => CostPoolStyles()} onClick={() => handleMapaction("add")}>
        <MDBox display="flex" justifyContent="space-between">
          <MDBox sx={{ padding: "25px" }}>
            <img src={Add_Map} style={{ width: 125, }} />
          </MDBox>
          <MDBox sx={{ padding: "25px" }}>
            <MDTypography data-testid = {"Map manually".toLowerCase().replaceAll(' ', '')} variant="h6" >Map manually</MDTypography>
            <MDTypography data-testid = {"Use mapping screen to create rules".toLowerCase().replaceAll(' ', '')} sx={{ fontSize: "12px;" }} gutterBottom>Use mapping screen to create rules </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
    </MDBox>
  )
}

const ShowAllMonths = (props) => {
  const { yearFilter, yearFilterName, categoryFilter, setTypeFilter, typeFilter, tabStyles, handleAction, setRefresh } = props
  const { response, error, loading, reloadData } = useFetchRequest(`/api/dataflow/${categoryFilter.toLowerCase().replace(' ', '')}${typeFilter}Monthly/${yearFilter}`);
  const handleError = useHandleError();
  const [data, setData] = useState(null)

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
  return (
    <>
      <MDBox display="flex" width="100%" sx={{ backgroundColor: "#F7F8FD", borderBottom: "1px solid #edeef3", borderTop: "1px solid #e3e3e3", display: "inline-flex" }} justifyContent="space-between">
        <MDBox display="flex">
          <MDButton data-testid = {"SPEND".toLowerCase().replaceAll(' ', '')} sx={(theme) => tabStyles(theme, { selected: typeFilter === "Spend" })} onClick={() => setTypeFilter("Spend")} >
            <Icon color="dark" fontSize="small" sx={{ transform: "rotate(360deg)", marginRight: "6px" }}>account_balance_wallet</Icon>
            SPEND</MDButton>
            {categoryFilter !== "Business Unit" && <MDButton data-testid = {"BUDGET".toLowerCase().replaceAll(' ', '')} sx={(theme) => tabStyles(theme, { selected: typeFilter === "Budget" })} onClick={() => setTypeFilter("Budget")}>
            <Icon color="dark" fontSize="small" sx={{ transform: "rotate(360deg)", marginRight: "6px" }}>pie_chart</Icon>
            BUDGET</MDButton>}
        </MDBox>
      </MDBox>
      <MDBox p={3} pt={1} sx={{ backgroundColor: "#F7F8FD", }}>
        {data.map(item => {
          if (item["spendAmount"])
            return (<Month key={item["id"]} handleAction={handleAction} yearFilter={yearFilter} yearFilterName={yearFilterName} item={item} reloadData={reloadData} categoryFilter={categoryFilter} typeFilter={typeFilter} setRefresh={setRefresh}/>)
          else
            return (<MonthEmpty key={item["id"]} handleAction={handleAction} yearFilter={yearFilter} yearFilterName={yearFilterName} item={item} reloadData={reloadData} categoryFilter={categoryFilter} typeFilter={typeFilter} setRefresh={setRefresh} />)
        })
        }
      </MDBox>
    </>
  )
}
const MonthEmpty = (props) => {
  const { showAlert, showPrompt, showSnackbar } = useYADialog();
  const { item, handleAction, yearFilter, yearFilterName, reloadData, categoryFilter, typeFilter ,setRefresh } = props
  const [openMenu, setOpenMenu] = useState(false);
  const handleOpenMenu = (event) => {
    setOpenMenu(event.currentTarget)
  };
  const handleCloseMenu = () => setOpenMenu(false);
  const handleCloseMenuItem = (a) => {
    setOpenMenu(false)
    if (a)
      a();
  };
  const handleDownload = () => {
    if (categoryFilter === "Cost Pool")
      downloadCPRules(yearFilter, item["id"])
    if (categoryFilter === "Tower")
      downloadTRRules(yearFilter, item["id"])
    if (categoryFilter === "Business Unit")
      downloadBURules(yearFilter, item["id"])
  }

  const handleDelete = (item, yearFilter, yearFilterName, reloadData, categoryFilter) => {
    showPrompt("Delete", "Are you sure you want to delete " + categoryFilter.toLowerCase() + " rules for - [ " + item["name"] + " " + yearFilterName + " ]", async () => {
      let [err, data] = await fetchRequest.delete(`/api/dataflow/${categoryFilter.toLowerCase().replace(' ', '')}Rules/${yearFilter}/${item["id"]}`)
      if (err) {
        console.error(err)
        showAlert("Delete", "Something went wrong. Contact your administrator.");
      }
      else if (data) {
        showSnackbar(data, "success")
        setOpenMenu(false)
        setRefresh(Math.random());   
        reloadData()
      }
    });
  }

  return (
    <Card
      sx={{
        minHeight: "150px",
        minWidth: "250px",
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
      <MDBox px={3} pb={1} pt={2} display="flex" justifyContent="space-between" alignItems="flex-start">
        <MDBox display="flex" width="100%" flexDirection="column" justifyContent="space-between" >
          <MDBox color="text" pt={0} mt={0} display="flex" justifyContent="space-between" flexDirection="row">
            <MDTypography data-testid = {item["name"].toLowerCase().replaceAll(' ', '')} variant="h6" component="span" color="#4c4c4c" display="flex">{item["name"]}</MDTypography>
            <Menu
              anchorEl={openMenu}
              anchorReference={null}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              open={Boolean(openMenu)}
              onClose={handleCloseMenu}
            >
              {<>
                {typeFilter === "Spend" && <MenuItem data-testid = {"Add rules".toLowerCase().replaceAll(' ', '')} key={'add'} onClick={() => handleCloseMenuItem(() => { handleAction(item["id"], item["name"], "choose") })}>Add rules</MenuItem>}
                <MenuItem data-testid = {"View rules".toLowerCase().replaceAll(' ', '')} key={'view'} onClick={() => handleCloseMenuItem(() => { handleAction(item["id"], item["name"], "view") })}>View rules</MenuItem>
                <MenuItem data-testid = {"Download rules".toLowerCase().replaceAll(' ', '')} key={'download'} onClick={() => handleCloseMenuItem(() => { handleDownload() })}>Download rules</MenuItem>
                <MenuItem data-testid = {"Delete all rules".toLowerCase().replaceAll(' ', '')} key={'delete'} onClick={() => handleCloseMenuItem(() => { handleDelete(item, yearFilter, yearFilterName, reloadData, categoryFilter) })}>Delete all rules</MenuItem>
                {categoryFilter === "Tower" && <MenuItem key={'view'} onClick={() => handleCloseMenuItem(() => {  handleAction(item["id"], item["name"], "uploaded") })}>View Uploaded Files</MenuItem>}
                {categoryFilter === "Tower" && <Divider style={{ background: '#adadad', margin: '2px' }} variant="middle" omponent="li" />}
                {categoryFilter === "Tower" && <MenuItem key={'addAssetMapping'} onClick={() => handleCloseMenuItem(() => { handleAction(item["id"], item["name"],"addAssetMapping") })}>Add Asset Mapping</MenuItem>}
                {categoryFilter === "Tower" && <MenuItem key={'viewAssetMapping'} onClick={() => handleCloseMenuItem(() => { handleAction(item["id"], item["name"],"viewAssetMapping") })}>View Asset Mapping</MenuItem>}
              </>
              }
            </Menu>
            <MDBox mt={-1} mr={-1} pt={0}>
              <MDButton
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
          <MDBox display="flex" width="100%" flexDirection="row" justifyContent="space-between" alignItems="center" >
            <MDBox data-testid = {"Allocated".toLowerCase().replaceAll(' ', '')} pt={2} pb={2} sx={{ height: '100%', fontSize: "18px", fontWeight: "bold" }}>
              Allocated<br />
              {item["amount"] ? formatAmount(item["amount"]) : formatAmount(0)}&nbsp;
            </MDBox>
            <CircularProgressWithLabel value={100 * item["amount"] / (item["spendAmount"] ?? 1)} />
          </MDBox>
          <Divider style={{ background: '#adadad', margin: '2px' }} variant="middle" omponent="li" />
          <MDBox display="flex" width="100%" flexDirection="row" justifyContent="space-between" >
            <MDTypography sx={{ fontSize: "14px", pt: "8px" }}>{(categoryFilter === "Tower" ? "Cost Pool " : ' ') + typeFilter}:</MDTypography>
            <MDTypography sx={{ fontSize: "14px", pt: "8px" }}>{item["spendAmount"] ? formatAmount(item["spendAmount"]) : 'No ' + typeFilter }</MDTypography>
          </MDBox>
          {typeFilter === "Spend" && 
            <>
              <MDBox display="flex" width="100%" flexDirection="row" justifyContent="space-between" >
                <MDTypography data-testid = {"Mapping Rules".toLowerCase().replaceAll(' ', '')} sx={{ fontSize: "14px", pt: "8px", pb: "8px" }}>Mapping Rules</MDTypography>
                <MDTypography 
                  data-testid = {(item["rules"] > 0 ? "View rules >" : "+ Add rules").toLowerCase().replaceAll(' ', '')}
                  variant="link"
                  sx={{
                    fontSize: "14px",
                    padding: "8px",
                    color: "#4A5AED",
                    borderRadius: "5px",
                    "&:hover": {
                      cursor: "pointer",
                      color: "#435EC3",
                      backgroundColor: "#eceff8"
                    }
              }} fontWeight="medium" onClick={item["rules"] > 0 ? () => handleAction(item["id"], item["name"], "view") : () => handleAction(item["id"], item["name"], "choose")}
            >{item["rules"] > 0 ? "View rules >" : "+ Add rules"}</MDTypography>
              </MDBox>
            </>
          } 
        </MDBox>
      </MDBox>
    </Card>
  )
}
const Month = (props) => {
  const { showAlert, showPrompt, showSnackbar } = useYADialog();
  const [openMenu, setOpenMenu] = useState(false);
  const { item, handleAction, yearFilter, yearFilterName, reloadData, categoryFilter, typeFilter,setRefresh  } = props

  const handleOpenMenu = (event) => {
    setOpenMenu(event.currentTarget)
  };
  const handleCloseMenu = () => setOpenMenu(false);
  const handleCloseMenuItem = (a) => {
    setOpenMenu(false)
    if (a)
      a();
  };
  const handleDownload = () => {
    if (categoryFilter === "Cost Pool")
      downloadCPRules(yearFilter, item["id"])
    if (categoryFilter === "Tower")
      downloadTRRules(yearFilter, item["id"])
    if (categoryFilter === "Business Unit")
      downloadBURules(yearFilter, item["id"])
  }

  const handleDelete = (item, yearFilter, yearFilterName, reloadData, categoryFilter) => {
    showPrompt("Delete", "Are you sure you want to delete " + categoryFilter.toLowerCase() + " rules for - [ " + item["name"] + " " + yearFilterName + " ]", async () => {
      let [err, data] = await fetchRequest.delete(`/api/dataflow/${categoryFilter.toLowerCase().replace(' ', '')}Rules/${yearFilter}/${item["id"]}`)
      if (err) {
        console.error(err)
        showAlert("Delete", "Something went wrong. Contact your administrator.");
      }
      else if (data) {
        showSnackbar(data, "success")
        setOpenMenu(false)
        setRefresh(Math.random());   
        reloadData()
      }
    });
  }

  return (
    <Card
      sx={{
        minHeight: "150px",
        minWidth: "250px",
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
      <MDBox px={3} pb={1} pt={2} display="flex" justifyContent="space-between" alignItems="flex-start">
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
                {typeFilter === "Spend" && <MenuItem data-testid = {"Add rules".toLowerCase().replaceAll(' ', '')} key={'add'} onClick={() => handleCloseMenuItem(() => { handleAction(item["id"], item["name"], "choose") })}>Add rules</MenuItem>}
                <MenuItem data-testid = {"View rules".toLowerCase().replaceAll(' ', '')} key={'view'} onClick={() => handleCloseMenuItem(() => { handleAction(item["id"], item["name"], "view") })}>View rules</MenuItem>
                <MenuItem data-testid = {"Download rules".toLowerCase().replaceAll(' ', '')} key={'download'} onClick={() => handleCloseMenuItem(() => { handleDownload() })}>Download rules</MenuItem>
                <MenuItem data-testid = {"Delete all rules".toLowerCase().replaceAll(' ', '')} key={'delete'} onClick={() => handleCloseMenuItem(() => { handleDelete(item, yearFilter, yearFilterName, reloadData, categoryFilter) })}>Delete all rules</MenuItem>
                <MenuItem data-testid = {"View Uploaded Files".toLowerCase().replaceAll(' ', '')} key={'view'} onClick={() => handleCloseMenuItem(() => {  handleAction(item["id"], item["name"], "uploaded") })}>View Uploaded Files</MenuItem>
                {categoryFilter==="Cost Pool" ? " ":<MenuItem data-testid = {"View Allocation Files".toLowerCase().replaceAll(' ', '')} key={'view'} onClick={() => handleCloseMenuItem(() => {  handleAction(item["id"], item["name"], "allocation") })}>View Allocation Files</MenuItem>}
                {categoryFilter === "Tower" && <Divider style={{ background: '#adadad', margin: '2px' }} variant="middle" omponent="li" />}
                {categoryFilter === "Tower" && <MenuItem key={'addAssetMapping'} onClick={() => handleCloseMenuItem(() => { handleAction(item["id"], item["name"],"addAssetMapping") })}>Add Asset Mapping</MenuItem>}
                {categoryFilter === "Tower" && <MenuItem key={'viewAssetMapping'} onClick={() => handleCloseMenuItem(() => { handleAction(item["id"], item["name"],"viewAssetMapping") })}>View Asset Mapping</MenuItem>}
                {/* <MenuItem key={'view'} onClick={() => handleCloseMenuItem(() => {  handleAction(item["id"], item["name"], "allocation") })}>View Allocation Files</MenuItem> */}
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
          <MDBox display="flex" width="100%" flexDirection="row" justifyContent="space-between" alignItems="center" >
            <MDBox data-testid = {((Math.round(item["amount"], 0) === Math.round(item["spendAmount"], 0) ? "Fully Allocated" : item["amount"] < item["spendAmount"] ? "Allocated" : "Allocated")).toLowerCase().replaceAll(' ', '')} pt={2} pb={2} sx={{ height: '100%', fontSize: "18px", fontWeight: "bold" }}>
              {Math.round(item["amount"], 0) === Math.round(item["spendAmount"], 0) ? "Fully Allocated" : item["amount"] < item["spendAmount"] ? "Allocated" : "Allocated"}<br />
              {item["amount"] ? formatAmount(item["amount"],2) : formatAmount(0)}&nbsp;
            </MDBox>
            {Math.round(item["amount"], 0) === Math.round(item["spendAmount"], 0) ? <Icon fontSize="large" color='success'>done</Icon> : <CircularProgressWithLabel value={100 * item["amount"] / (item["spendAmount"] ?? 1)} />}
          </MDBox>
          <Divider style={{ background: '#adadad', margin: '2px' }} variant="middle" omponent="li" />
          <MDBox display="flex" width="100%" flexDirection="row" justifyContent="space-between" >
            <MDTypography data-testid = {((categoryFilter === "Tower" ? "Cost Pool " : (categoryFilter === "Business Unit" ? "Solution " : ' '))+ typeFilter).toLowerCase().replaceAll(' ', '')} sx={{ fontSize: "14px", pt: "8px" }}>{(categoryFilter === "Tower" ? "Cost Pool " : (categoryFilter === "Business Unit" ? "Solution " : ' ')) + typeFilter}:</MDTypography>
            <MDTypography data-testid = {(item["spendAmount"] ? formatAmount(item["spendAmount"],2) : 'No ' + typeFilter ).toLowerCase().replaceAll(' ', '')} sx={{ fontSize: "14px", pt: "8px" }}>{item["spendAmount"] ? formatAmount(item["spendAmount"],2) : 'No ' + typeFilter}</MDTypography>
            {/* <MDTypography sx={{ fontSize: "14px", pt: "8px" }}>{categoryFilter === "Tower" ? "Cost Pool Spend" : typeFilter}</MDTypography>
            <MDTypography sx={{ fontSize: "14px", pt: "8px" }}>{item["spendAmount"] ? formatAmount(item["spendAmount"],2) : 'No '+typeFilter}</MDTypography> */}
          </MDBox>
          {typeFilter === "Spend" && 
            <>
              <MDBox display="flex" width="100%" flexDirection="row" justifyContent="space-between" >
                <MDTypography data-testid = {"Mapping Rules".toLowerCase().replaceAll(' ', '')} sx={{ fontSize: "14px", pt: "8px", pb: "8px" }}>Mapping Rules</MDTypography>
                <MDTypography 
                 data-testid = {(~~item["spendAmount"] > ~~item["amount"] ? "+ Add rules" : "View rules >").toLowerCase().replaceAll(' ', '')}
                 variant="link"
                  sx={{
                    fontSize: "14px",
                    padding: "8px",
                    borderRadius: "5px",
                    color: "#4A5AED",
                    "&:hover": {
                      cursor: "pointer",
                      color: "#435EC3",
                      backgroundColor: "#eceff8"
                    }
              }} fontWeight="medium" onClick={~~item["amount"] >= ~~item["spendAmount"] ? () => handleAction(item["id"], item["name"], "view") : () => handleAction(item["id"], item["name"], "choose")}
            >{~~item["spendAmount"] > ~~item["amount"] ? "+ Add rules" : "View rules >"}</MDTypography>
              </MDBox>
            </>
          }
        </MDBox>
      </MDBox>
    </Card>
  )
}
function CircularProgressWithLabel(props) {
  const { value, others } = { ...props }
  return (
    <MDBox sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress size={80} thickness={2} sx={{
        color: (theme) =>
          theme.palette.grey[theme.palette.mode === 'light' ? 400 : 800],
      }} variant="determinate" value={100} {...others} />
      <CircularProgress size={80} thickness={2} sx={{
        color: (theme) => (theme.palette.mode === 'light' ? '' : '#308fe8'),
        animationDuration: '550ms',
        position: 'absolute',
        left: 0,
        [`& .${circularProgressClasses.circle}`]: {
          strokeLinecap: 'round',
        },
      }} disableShrink color={value > 100 ? "error" : "dprogress"} variant="determinate" value={value > 100 ? 100 : value} {...others} />
      <MDBox
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MDTypography variant="caption" component="div" color="text.secondary">
          {props.value <= 100 ? `${Math.floor(props.value)}%` : `${Math.ceil(props.value)}%`}
        </MDTypography>
      </MDBox>
    </MDBox>
  );
}

CircularProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate variant.
   * Value between 0 and 100.
   * @default 0
   */
  value: PropTypes.number.isRequired,
};

export default AnimatedRoute(MapRule);