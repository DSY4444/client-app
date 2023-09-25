import { Autocomplete, Divider, Icon, IconButton, Modal, Tooltip, Card } from "@mui/material";
import { useEffect, useState } from "react";
import _ from "lodash";
import { useImmer } from "use-immer";
import PageHeader from "components/PageHeader";
import AnimatedRoute from "components/AnimatedRoute";
import MDBox from "components/MDBox";
import useFetchRequest from "hooks/useFetchRequest";
import MDTypography from "components/MDTypography";
import fetchRequest from "utils/fetchRequest";
import MDButton from "components/MDButton";
import DataUploadDialog from "./components/DataUploadDialog";
import UploadedFilesDialog from './components/UploadedFilesDialog'
import CopyFilesDialog from "./components/CopyFilesDialog";
import AddCPRulesDialog from "./components/AddCPRulesDialog";
import AddTRRulesDialog from "./components/AddTRRulesDialog";
import AddSRRulesDialog from "./components/AddSRRulesDialog";
import numeral from "numeral";
import CostPoolMappingDialog from "./components/CostPoolMappingDialog";
import CostPoolDistributionDialog from "./components/CostPoolDistributionDialog";
import TowerMappingDialog from "./components/TowerMappingDialog";
import TowerDistributionDialog from "./components/TowerDistributionDialog";
import SolutionMappingDialog from "./components/SolutionMappingDialog";
import MDInput from "components/MDInput";
import YASkeleton from "components/YASkeleton";
import MDBadge from "components/MDBadge";
import useHandleError from "hooks/useHandleError";
import { useYADialog } from "components/YADialog";
import AnnualSummary from "./components/AnnualSummary";
import { useAppController } from "context";
import { downloadCPRules, downloadTRRules, downloadSRRules } from "utils"

const Dataflow = () => {
  const { response: levelsRes, error: levelsErr, loading: levelsLoading } = useFetchRequest(`/api/dataflow/categories`);
  const handleError = useHandleError();
  const [levels, setLevels] = useImmer([]);
  const [yearFilter, setYearFilter] = useState(null);
  const [yearFilterName, setYearFilterName] = useState(null);
  const [monthFilter, setMonthFilter] = useState(null);
  const [monthFilterName, setMonthFilterName] = useState(null);
  const [openSummaryView, setOpenSummaryView] = useState(false);
  const [summaryData, setSummaryData] = useState({})

  const getSummaryData = async () => {
    let [err, data] = await fetchRequest.get(`/api/annualSummary/masterdata/${yearFilter}`);
    if (err) {
      console.error(err)
    }
    else {
      setSummaryData(data);
    }
  }

  useEffect(() => {
    if (!levelsLoading) {
      if (levelsErr !== null) {
        handleError(levelsErr);
      }
      else if (levelsRes !== null) {
        let currentYearIndex = levelsRes.years?.length - 1;
        const currentMonthNumber = (new Date().getMonth()) + 1;
        const currentMonth = levelsRes.months.find(m => m.id === currentMonthNumber);
        const currentFinancialYear = levelsRes.currentFinancialYear;
        if (currentFinancialYear) {
          const index = levelsRes.years?.map(y => y.name).indexOf(currentFinancialYear.value);
          if (index > -1)
            currentYearIndex = index;
        }
        setLevels(levelsRes);
        setYearFilter(levelsRes.years[currentYearIndex]?.id);
        setYearFilterName(levelsRes.years[currentYearIndex]?.name);
        setMonthFilter(currentMonth?.id);
        setMonthFilterName(currentMonth?.name);
      }
    }
  }, [levelsLoading, levelsRes]);

  const handleSummaryViewOpen = () => {
    setOpenSummaryView(false)
  }

  if (levelsLoading) {
    return <YASkeleton variant="dashboard-loading" />;
  }

  if (levelsLoading === false && levels === null) {
    return (
      <div>
        no data
      </div>
    );
  }

  const renderFilters = () => (
    <MDBox display="flex">
      <Modal open={openSummaryView} onClose={handleSummaryViewOpen}>
        <MDBox p={1} height="100%" width="100%" display="flex" alignItems="center" justifyContent="center">
          <Card sx={{ height: "100%", width: "100%", overflow: 'scroll' }}>
            <MDBox px={1.25} pb={0.5} pt={0} display="flex" justifyContent="flex-end" alignItems="center">
              <MDBox display="flex">
                <IconButton onClick={handleSummaryViewOpen} title="Close">
                  <Icon>close</Icon>
                </IconButton>
              </MDBox>
            </MDBox>
            <AnnualSummary data={summaryData} yearFilterName={yearFilterName} setMonthFilter={setMonthFilter} setMonthFilterName={setMonthFilterName} setOpenSummaryView={setOpenSummaryView} />
          </Card>
        </MDBox>
      </Modal>

      <Autocomplete
        disableClearable={true}
        value={yearFilter}
        options={levels.years}
        onChange={(event, newValue) => {
          setYearFilter(newValue.id)
          setYearFilterName(newValue.name)
          getSummaryData()
        }}
        color="text"
        fontWeight="medium"
        sx={{
          ml: 1.5,
          "& .MuiOutlinedInput-root": {
            height: 42,
            minWidth: 130,
            boxShadow: "0 8px 16px #1a488e1f"
          },
          "& .MuiOutlinedInput-input": {
            fontSize: 14
          },
          "& .MuiOutlinedInput-input.MuiAutocomplete-input": {
            padding: .5
          }
        }}
        isOptionEqualToValue={(option, value) => {
          return option.id === value
        }}
        getOptionLabel={option => {
          if (typeof option === "number")
            return levels.years.find(op => op.id === option)?.name;
          return option.name
        }}
        renderInput={(params) => <MDInput label="Year" {...params} />}
      />
      <Autocomplete
        disableClearable={true}
        value={monthFilter}
        options={levels.months}
        onChange={(event, newValue) => {
          setMonthFilter(newValue.id)
          setMonthFilterName(newValue.name)
        }}
        color="text"
        fontWeight="medium"
        sx={{
          ml: 1.5,
          "& .MuiOutlinedInput-root": {
            height: 42,
            width: 100,
            boxShadow: "0 8px 16px #1a488e1f"
          },
          "& .MuiOutlinedInput-input": {
            fontSize: 14
          },
          "& .MuiOutlinedInput-input.MuiAutocomplete-input": {
            padding: .5
          }
        }}
        isOptionEqualToValue={(option, value) => {
          return option.id === value
        }}
        getOptionLabel={option => {
          if (typeof option === "number")
            return levels.months.find(op => op.id === option)?.name;
          return option.name
        }}
        renderInput={(params) => <MDInput label="Month"{...params} />}
      />
    </MDBox>
  )


  return (
    <>
      <PageHeader
        title={"Data Management"}
        subtitle={"Manage Data Upload and Mapping"}
        primaryActionComponent={renderFilters}
      />
      {
        yearFilter && monthFilter && (
          <DataflowLevels levels={levels} yearFilter={yearFilter} yearFilterName={yearFilterName} monthFilter={monthFilter} monthFilterName={monthFilterName} />
        )
      }
    </>
  );
};

const DataflowLevels = (props) => {
  const handleError = useHandleError();
  const [openUpload, setOpenUpload] = useState(false);
  const [openUploaded, setOpenUploaded] = useState(false);
  const [openCopyFiles, setOpenCopyFiles] = useState(false);
  const [openCPAdd, setOpenCPAdd] = useState(false);
  const [openCPView,setOpenCPView]=useState(false);
  const [openCopyCPRules, setOpenCopyCPRules] = useState(false);
  const [openTRAdd, setOpenTRAdd] = useState(false);
  const [openTRView,setOpenTRView]=useState(false);
  const [openCopyTRRules, setOpenCopyTRRules] = useState(false);
  const [openSRAdd, setOpenSRAdd] = useState(false);
  const [openSRView,setOpenSRView]=useState(false);
  const [openCopySRRules, setOpenCopySRRules] = useState(false);
  const [openCPMapping, setOpenCPMapping] = useState(false);
  const [openCPDistribution, setOpenCPDistribution] = useState(false);
  const [costPoolId, setCostPoolId] = useState();
  const [openTRMapping, setOpenTRMapping] = useState(false);
  const [openTRDistribution, setOpenTRDistribution] = useState(false);
  const [towerId, stowerId] = useState();
  const [openSRMapping, setOpenSRMapping] = useState(false);
  const [solutionId, setSolutionId] = useState();

  const [data, setData] = useImmer(null);
  const { levels, yearFilter, yearFilterName, monthFilter, monthFilterName } = props;
  const { costPools, towers, solutionTypes } = levels;
  const { response: dataRes, error: dataErr, loading: dataLoading, reloadData } = useFetchRequest(`/api/dataflow/data/${yearFilter}/${monthFilter}`);
  const { showAlert, showPrompt, showSnackbar } = useYADialog();

  const [controller,] = useAppController();
  const { appDef: { featureSet } } = controller;
  const enableAssetDistribution = featureSet && featureSet.dataManagement?.assetDistribution === true;

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

  if (dataLoading) {
    return <YASkeleton variant="dataflow-loading" />;
  }

  if (dataLoading === false && data === null) {
    return (
      <div>
        no data
      </div>
    );
  }

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

  const itemOptionsStyles = ({ palette: { info, white } }) => ({
    position: "absolute",
    left: 0,
    bottom: -40,
    zIndex: 99,
    width: "100%",
    height: 50,
    boxShadow: "0 8px 16px #1a488e1f",
    background: white.main,
    borderRadius: "0px 0px 8px 8px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: info.main,
    "& .item-options-overflow-box": {
      height: 10,
      background: info.main,
      borderRadius: "0px 0px 8px 8px",
    },
  });

  const distButtonStyles = () => ({
    padding: "3px 3px",
    marginLeft: "-5px",
  });

  const textButtonStyles = () => ({
    width: "100%",
    cursor: "pointer"
  });

  const buttonStyles = ({ palette: { grey } }) => ({
    paddingLeft: "3px",
    paddingRight: "3px",
    "&:hover": {
      background: grey[300],
      borderRadius: "5px",
    },
    "&:hover .MuiTypography-root": {
      background: grey[300],
      borderRadius: "5px",
    }
  })

  const totalExpenditure = (data.totalExpenditure[0].amount).toFixed(2);
  const costPoolExpenditure = (_.sumBy(data.costPoolExpenditure, 'amount')).toFixed(2) ;
  const towerExpenditure = (_.sumBy(data.towerExpenditure, 'amount')).toFixed(2);
  const solutionExpenditure = (_.sumBy(data.solutionTypeExpenditure, 'amount')).toFixed(2) ?? 0
  
  const unallocatedCostPoolExpenditure = totalExpenditure - costPoolExpenditure;
  const unallocatedTowerExpenditure = costPoolExpenditure - towerExpenditure;
  const unallocatedSolutionExpenditure = towerExpenditure - solutionExpenditure;

  const renderExpItem = (levelName, id, expName, distributed, unallocated, total, hidedist = false, setOpenMapping, setOpenDistribution) => {

    let mappingTooltip = "Cost Pool Rules";
    let distributionTooltip = "Tower Rules";

    if (levelName === "Towers") {
      mappingTooltip = "Tower Rules";
      distributionTooltip = "Solution Rules";
    }
    if (levelName === "Solutions") {
      mappingTooltip = "Solution Rules";
      distributionTooltip = "Solution Rules";
    }

    return <MDBox key={`l_${expName}`} sx={(theme) => itemStyles(theme)}>
      <MDBox>
        <MDTypography variant="caption" fontWeight="medium" color={"text"}>
          {expName}
        </MDTypography>
        <MDBox display="flex" flexDirection="column" >
        <Tooltip placement="top" title={mappingTooltip}>
          <MDBox display="flex" flexDirection="row" alignItems="center" onClick={() => { setOpenMapping(id) }} sx={(theme) => buttonStyles(theme)}>
            {setOpenMapping && <IconButton size="small" sx={() => distButtonStyles()}>
              <Icon color="dark" fontSize="small" sx={{ transform: "rotate(180deg)" }}>call_merge</Icon>
            </IconButton>}
            {setOpenMapping && <MDTypography variant="button" component="span" fontWeight="medium" color="dark" pl={0.3} sx={() => textButtonStyles()}>{numeral(unallocated).format('$0,0')} ({numeral((unallocated / total) * 100.0).format('0.0')}%)</MDTypography>}
          </MDBox>
          </Tooltip>
          {!hidedist &&
            <Tooltip title={distributionTooltip}>
            <MDBox display="flex" flexDirection="row" alignItems="center" onClick={() => { setOpenDistribution(id) }} sx={(theme) => buttonStyles(theme)}>
              {setOpenDistribution && <IconButton size="small" sx={() => distButtonStyles()}>
                <Icon color="dark" fontSize="small" sx={{ transform: "rotate(180deg)" }}>call_split</Icon>
              </IconButton>}
              {setOpenDistribution && <MDTypography variant="button" component="span" fontWeight="medium" color="dark" pl={0.3} sx={() => textButtonStyles()}>{numeral(distributed).format('$0,0')}</MDTypography>}
            </MDBox>
            </Tooltip>
          }
        </MDBox>
      </MDBox>
      <MDBox className="item-options" sx={(theme) => itemOptionsStyles(theme)}>
        <MDBox className="item-options-overflow-box">
        </MDBox>
        <MDBox display="flex" alignItems="center" justifyContent="center" height={40}>
          <MDButton variant="text" color="text" startIcon={<Icon fontSize="small" >add</Icon>}>Add Rule</MDButton>
        </MDBox>
      </MDBox>
    </MDBox>
  }

  const renderLevel = (levelName, levelDef, expName, expType, distExpType, unallocated, total, hidedist, setOpenAdd,setOpenView, setOpenCopy, download, setOpenMapping, setOpenDistribution, deleterules) => {

    let arr = levelDef.map((item) => {
      return Object.assign({}, {
        "id": item.id, "name": item.name,
        "amount": _.find(data[expType], { [expName]: item.name }) ? _.find(data[expType], { [expName]: item.name }).amount : 0,
        "distributed": _.find(data[distExpType], { [expName]: item.name }) ? _.find(data[distExpType], { [expName]: item.name }).amount : 0,
      })
    })

    return <MDBox>
      <Divider sx={{ mt: 6, opacity: 1 }} />
      <MDBox display="flex" alignItems="center" justifyContent="space-between" px={3} mb={3} mt={-4.5}>
        <MDTypography variant="h6" component="span" fontWeight="medium" color={"text"} sx={{ pr: .5, background: "white" }}>
          {`${levelName}`}
        </MDTypography>
        <MDBox display="flex" alignItems="center" justifyContent="center" flexDirection="row" py={1} px={2} sx={{ border: "1px solid #d5cfcf", borderRadius: "5px", background: "white" }}>
          <MDTypography variant="button" fontWeight="medium" color="text">
            Unallocated
          </MDTypography>
          {
            unallocated && Number(numeral(Math.trunc(unallocated)).format('0.0')) < 0 ?
              (
                <MDBadge badgeContent={`${numeral(Math.trunc(unallocated)).format('$0,0')} (${numeral(((unallocated / total) * 100.0).toFixed(2)).format('0.0')}%)`} color="error" size="md" />
              ) : (
                <MDTypography ml={2} variant="button" component="span" fontWeight="medium" color="text">
                  {numeral(Math.trunc(unallocated)).format('$0,0')} ({numeral(((unallocated / total) * 100.0).toFixed(2)).format('0.0')}%)
                </MDTypography>
              )
          }
        </MDBox>
        {levelName !== "Solutions" && 
        <MDBox display="flex" flexDirection="row" py={0.5} px={1} sx={{ border: "1px solid #d5cfcf", borderRadius: "5px", background: "white" }}>
          <Tooltip title="Add Rule">
            <IconButton onClick={() => { setOpenAdd(true) }} size="small">
              <Icon color="text" fontSize="small">add</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy Rules">
            <IconButton onClick={() => { setOpenCopy(true) }} size="small">
              <Icon color="text" fontSize="small">copy_files</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="View Rules">
            <IconButton onClick={() => { setOpenView(true) }} size="small">
              <Icon color="text" fontSize="small">view_comfy</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Download Rules">
            <IconButton onClick={() => { download() }} size="small">
              <Icon color="text" fontSize="small">download</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Rules">
            <IconButton onClick={() => { deleterules() }} size="small">
              <Icon color="text" fontSize="small">delete</Icon>
            </IconButton>
          </Tooltip>
        </MDBox>
        }
        {levelName === "Solutions" && 
          <MDBox display="flex" flexDirection="row" py={0.5} px={1}>
            </MDBox>
  }
        </MDBox>
      <MDBox display="flex" flexDirection="row" flexWrap="wrap" alignItems="center" justifyContent="center">
        {
          arr.map((l) => {
            return renderExpItem(levelName, l["id"], l["name"], l["distributed"], l["amount"], total, hidedist, setOpenMapping, setOpenDistribution);
          })
        }
      </MDBox></MDBox>
  }

  const handleUploadDialogClose = () => {
    setOpenUpload(false);
  };
  const handleUploadedDialogClose = () => {
    reloadData();
    setOpenUploaded(false);
  };
  const handleCopyFilesDialogClose = () => {
    setOpenCopyFiles(false);
  };
  const handleCPAddDialogClose = () => {
    reloadData();
    setOpenCPAdd(false);
  };
  const handleCPViewDialogClose = () => {
    reloadData();
    setOpenCPView(false);
  };
  const handleTRViewDialogClose = () => {
    reloadData();
    setOpenTRView(false);
  };
  const handleSRViewDialogClose = () => {
    reloadData();
    setOpenSRView(false);
  };
  const handleCopyCPRulesDialogClose = () => {
    reloadData();
    setOpenCopyCPRules(false);
  };
  const handleTRAddDialogClose = () => {
    reloadData();
    setOpenTRAdd(false);
  };
  const handleCopyTRRulesDialogClose = () => {
    reloadData();
    setOpenCopyTRRules(false);
  };
  const handleSRAddDialogClose = () => {
    reloadData();
    setOpenSRAdd(false);
  };
  const handleCopySRRulesDialogClose = () => {
    reloadData();
    setOpenCopySRRules(false);
  };
  const handleCPMappingDialogClose = () => {
    reloadData();
    setOpenCPMapping(false);
  };
  const handleCPDistributionDialogClose = () => {
    reloadData();
    setOpenCPDistribution(false);
  };
  const handleTRMappingDialogClose = () => {
    reloadData();
    setOpenTRMapping(false);
  };
  const handleTRDistributionDialogClose = () => {
    reloadData();
    setOpenTRDistribution(false);
  };
  const handleSRMappingDialogClose = () => {
    reloadData();
    setOpenSRMapping(false);
  };
  const setCPMapping = (id) => {
    setCostPoolId(id)
    setOpenCPMapping(true)
  };
  const setCPDistribution = (id) => {
    setCostPoolId(id)
    setOpenCPDistribution(true)
  };
  const setTRMapping = (id) => {
    stowerId(id)
    setOpenTRMapping(true)
  };
  const setTRDistribution = (id) => {
    stowerId(id)
    setOpenTRDistribution(true)
  };
  const setSRMapping = (id) => {
    setSolutionId(id)
    setOpenSRMapping(true)
  };


  const deleteCPRules = async () => {
    showPrompt("Delete", "Are you sure you want to delete all the Cost Pool Mapping rules for " + monthFilterName + " " + yearFilterName + " ?", async () => {
      let [err, data] = await fetchRequest.delete(`/api/dataflow/costpoolRules/${yearFilter}/${monthFilter}`)
      if (err) {
        console.error(err)
        showAlert("Delete", "Something went wrong. Contact your administrator.");
      }
      else if (data) {
        showSnackbar(data, "success")
        reloadData()
      }
    })
  }

  const deleteTRRules = async () => {
    showPrompt("Delete", "Are you sure you want to delete all the Tower Mapping rules for " + monthFilterName + " " + yearFilterName + " ?", async () => {
      let [err, data] = await fetchRequest.delete(`/api/dataflow/towerRules/${yearFilter}/${monthFilter}`)
      if (err) {
        console.error(err)
        showAlert("Delete", "Something went wrong. Contact your administrator.");
      }
      else if (data) {
        showSnackbar(data, "success")
        reloadData()
      }
    })
  }

  const deleteSRRules = async () => {
    showPrompt("Delete", "Are you sure you want to delete all the Solution Mapping rules for " + monthFilterName + " " + yearFilterName + " ?", async () => {
      let [err, data] = await fetchRequest.delete(`/api/dataflow/solutionRules/${yearFilter}/${monthFilter}`)
      if (err) {
          console.error(err)
          showAlert("Delete", "Something went wrong. Contact your administrator.");
      }
      else if (data) {
          showSnackbar(data, "success")
          reloadData()
      }
    })
  }

  return (
    <MDBox p={3} pt={1}>
      <MDBox>
        <MDBox display="flex" flexDirection="row" flexWrap="wrap" alignItems="center" justifyContent="center">
          <MDBox sx={(theme) => itemStyles(theme)}>
            <MDTypography variant="button" fontWeight="medium" color={"text"}>
              Spend
            </MDTypography>
            <MDBox display="flex" flexDirection="row" minWidth={200} pb={.3}>
              <MDBox display="flex" flexDirection="column" flex={1}>
                <MDTypography variant="h4" component="span" fontWeight="medium" color="dark">{numeral(totalExpenditure).format('$0,0')}</MDTypography>
                <MDTypography variant="caption" component="span" fontWeight="medium" color="text">Total</MDTypography>
              </MDBox>
              <MDBox display="flex" flexDirection="column" flex={1} ml={2}>
                <MDTypography variant="h4" component="span" fontWeight="medium" color="dark">{numeral(costPoolExpenditure).format('$0,0')}</MDTypography>
                <MDTypography variant="caption" component="span" fontWeight="medium" color="text">Allocated</MDTypography>
              </MDBox>
            </MDBox>
          </MDBox>
          <MDBox mr={-19} pl={2}>
            <Tooltip title="Upload Data">
              <IconButton onClick={() => { setOpenUpload(true) }} size="small">
                <Icon color="dark" fontSize="large">add</Icon>
              </IconButton>
            </Tooltip>
            <Tooltip title="View Uploaded Files">
              <IconButton onClick={() => { setOpenUploaded(true) }} size="small">
                <Icon color="dark" fontSize="large">grid_on</Icon>
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy Files">
              <IconButton onClick={() => { setOpenCopyFiles(true) }} size="small">
                <Icon color="dark" fontSize="large">copy_files</Icon>
              </IconButton>
            </Tooltip>
          </MDBox>
        </MDBox>
        {renderLevel("Cost Pools", costPools, "costPool.name", "costPoolExpenditure", "costPoolTowerExpenditure", unallocatedCostPoolExpenditure, totalExpenditure, false, setOpenCPAdd,setOpenCPView, setOpenCopyCPRules, () => downloadCPRules(yearFilter, monthFilter), setCPMapping, setCPDistribution, deleteCPRules)}
        {renderLevel("Towers", towers, "tower.name", "towerExpenditure", "towerSolutionTypeExpenditure", unallocatedTowerExpenditure, costPoolExpenditure, !enableAssetDistribution, setOpenTRAdd,setOpenTRView, setOpenCopyTRRules, () => downloadTRRules(yearFilter, monthFilter), setTRMapping, setTRDistribution, deleteTRRules)}
        {enableAssetDistribution && renderLevel("Solutions", solutionTypes, "solutionType.name", "solutionTypeExpenditure", "solutionTypeExpenditure", unallocatedSolutionExpenditure, towerExpenditure, true, setOpenSRAdd,setOpenSRView, setOpenCopySRRules, () => downloadSRRules(yearFilter, monthFilter), setSRMapping, null, deleteSRRules)}
      </MDBox>
      {openUpload && <DataUploadDialog yearFilter={yearFilter} yearFilterName={yearFilterName} monthFilter={monthFilter} monthFilterName={monthFilterName} reloadData={reloadData} onClose={handleUploadDialogClose} />}
      {openUploaded && <UploadedFilesDialog yearFilter={yearFilter} monthFilter={monthFilter} onClose={handleUploadedDialogClose} />}
      {openCopyFiles && <CopyFilesDialog variant={"copyFiles"} yearFilter={yearFilter} yearFilterName={yearFilterName} monthFilter={monthFilter} monthFilterName={monthFilterName} onClose={handleCopyFilesDialogClose} />}
      {openCopyCPRules && <CopyFilesDialog variant={"copyCPRules"} yearFilter={yearFilter} yearFilterName={yearFilterName} monthFilter={monthFilter} monthFilterName={monthFilterName} onClose={handleCopyCPRulesDialogClose} />}
      {openCopyTRRules && <CopyFilesDialog variant={"copyTRRules"} yearFilter={yearFilter} yearFilterName={yearFilterName} monthFilter={monthFilter} monthFilterName={monthFilterName} onClose={handleCopyTRRulesDialogClose} />}
      {openCopySRRules && <CopyFilesDialog variant={"copySRRules"} yearFilter={yearFilter} yearFilterName={yearFilterName} monthFilter={monthFilter} monthFilterName={monthFilterName} onClose={handleCopySRRulesDialogClose} />}
      {openCPAdd && <AddCPRulesDialog yearFilter={yearFilter} monthFilter={monthFilter} onClose={handleCPAddDialogClose} />}
      {openCPView && <CostPoolMappingDialog yearFilter={yearFilter} monthFilter={monthFilter} onClose={handleCPViewDialogClose}/>}
      {openTRAdd && <AddTRRulesDialog yearFilter={yearFilter} monthFilter={monthFilter} onClose={handleTRAddDialogClose} />}
      {openTRView && <TowerMappingDialog yearFilter={yearFilter} monthFilter={monthFilter} onClose={handleTRViewDialogClose}/>}
      {openSRAdd && <AddSRRulesDialog yearFilter={yearFilter} monthFilter={monthFilter} onClose={handleSRAddDialogClose} />}
      {openSRView && <SolutionMappingDialog yearFilter={yearFilter} monthFilter={monthFilter} onClose={handleSRViewDialogClose}/>}
      {openCPMapping && <CostPoolMappingDialog yearFilter={yearFilter} monthFilter={monthFilter} id={costPoolId} onClose={handleCPMappingDialogClose} />}
      {openCPDistribution && <CostPoolDistributionDialog yearFilter={yearFilter} monthFilter={monthFilter} id={costPoolId} onClose={handleCPDistributionDialogClose}/>}
      {openTRMapping && <TowerMappingDialog yearFilter={yearFilter} monthFilter={monthFilter} id={towerId} onClose={handleTRMappingDialogClose} />}
      {openTRDistribution && <TowerDistributionDialog yearFilter={yearFilter} monthFilter={monthFilter} id={towerId} onClose={handleTRDistributionDialogClose} />}
      {openSRMapping && <SolutionMappingDialog yearFilter={yearFilter} monthFilter={monthFilter} id={solutionId} onClose={handleSRMappingDialogClose} />}
    </MDBox>
  );
}

export default AnimatedRoute(Dataflow);