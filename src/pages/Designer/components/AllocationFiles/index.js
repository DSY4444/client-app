import { Card, Divider,Modal,Icon,IconButton } from "@mui/material";
import LoadRuleModal from "components/AddTowerRule/components/LoadRuleModal";
import LoadBURuleModal from "components/AddBURule/components/LoadBURuleModal";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import YASkeleton from "components/YASkeleton";
import useFetchRequest from "hooks/useFetchRequest";
import useHandleError from "hooks/useHandleError";
import moment from "moment";
import { useEffect, useState } from "react";
import { formatAmount } from "utils";
import fetchRequest from "utils/fetchRequest";
import { useYADialog } from "components/YADialog";
import * as XLSX from "xlsx";
import RowMenu from "components/RowMenu";
import _ from 'lodash'
import TowerMappingDialog from "pages/Dataflow/components/TowerMappingDialog";
import BUMappingView from "components/BUMappingView";

const AllocationFiles = (props) => {
  const { yearFilter, monthFilter, setRefresh, setAction, setOriginalFileName, categoryFilter } = props
  const { response, error, loading, reloadData } = categoryFilter == "Tower" ? useFetchRequest(`/api/dataflow/towerRuleNames/${yearFilter}/${monthFilter}`) : useFetchRequest(`/api/dataflow/businessunitRuleNames/${yearFilter}/${monthFilter}`);
  const handleError = useHandleError();
  const [data, setData] = useState(null)
  const { showSnackbar } = useYADialog();
  const [showLoadRuleModal, setShowLoadRuleModal] = useState(false)
  const [subTowers, setSubTowers] = useState({});
  const [businessUnits, setBbusinessUnits] = useState({});
  const [openTRMapping, setOpenTRMapping] = useState(false);
  const [ruleName, setRuleName] = useState(null)
  const enableAssetDistribution = true
  const selectedTowers = {}
  const selectedBusinessUnits={}

  const onLoadRuleSave = (loadedRules, uploadedFileName, mappingFields, ws, givenRuleName) => {
    submitRules(loadedRules, uploadedFileName, ws, mappingFields, givenRuleName)
  }
  const getPresignedUrl = async (fId) => {
    return await fetchRequest.get(`/api/blob/presignedPost/${fId}`);
  }
  const submitRules = async (loadedRules, fileName, fileData, mappedFields, givenRuleName) => {
    // setIsSubmitting(true);
    let [ruleErr, rulesFetched] = categoryFilter == "Tower" ?  await fetchRequest.get(`/api/dataflow/towerMapping/${yearFilter}/${monthFilter}?ruleName=${givenRuleName}`) : await fetchRequest.get(`/api/dataflow/businessunitMapping/${yearFilter}/${monthFilter}?ruleName=${givenRuleName}`)
    if (ruleErr) {
      console.error("An error occured while fetching rules");
      console.error(ruleErr);
      showSnackbar("An error occured while fetching rules.", "error");
      return false;
    }
    let [err, data] = categoryFilter == "Tower" ?  await fetchRequest.delete(`/api/dataflow/towerMapping/${rulesFetched[0]["id"]}`) : await fetchRequest.delete(`/api/dataflow/businessunitRules/${yearFilter}/${monthFilter}/${rulesFetched[0]["solutionOfferingsCode"]}?ruleName=${givenRuleName}`)
    if (err) {
      console.error(err)
      showSnackbar("An error occured while processing your request.", "error");
    }
    else if (data) {
      if (fileName && fileName !== "") {
        let uf = {}
        uf.originalFileName = fileName
        uf.mappingFields = JSON.stringify(mappedFields)
        uf.yearNameId = yearFilter
        uf.monthNameId = monthFilter
        uf.totalRecords = fileData.length
        uf.loadedRecords = fileData.length
        uf.destinationTable = categoryFilter == "Tower" ?  "towerConsumption" : "BUConsumption"
        uf.fileStatus = "Loaded"

        const [resError, response] = await fetchRequest.post(`/api/dataflow/createupload`, uf);
        if (resError) {
          console.error("An error occured while creating upload");
          console.error(resError);
          showSnackbar("An error occured while processing your request.", "error");
          return false;
        }

        const wb = XLSX.utils.book_new();
        const ws1 = XLSX.utils.json_to_sheet(fileData);
        XLSX.utils.book_append_sheet(wb, ws1);

        const data = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const newFile = new File([data], fileName);

        const [presignedUrlError, presignedUrlResponse] = await getPresignedUrl(response.id);
        if (presignedUrlError) {
          console.error("An error occured while getting presigned url");
          console.error(presignedUrlError);
          showSnackbar("An error occured while processing your request.", "error");
          return false;
        }

        const [putError,] = await fetchRequest.put(presignedUrlResponse, newFile, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        if (putError) {
          console.error("An error occured while uploading to blob store");
          console.error(putError);
          showSnackbar("An error occured while processing your request.", "error");
          return false;
        }
        rulesFetched.map((a) => a["allocationFileId"] = response.id)
      }

      let newRules = null;
      if(categoryFilter == "Tower"){
      let uniqueRulesFetched = _.uniqBy(rulesFetched, a => a["accountId"] + a["costCentreId"] + a["costPoolId"] + a["expenseTypeId"] + a["subCostPoolId"] + a["vendorId"])
       newRules = uniqueRulesFetched.map(rule => {
        rule["id"] = null;
        let srlNo = 1;
        return loadedRules.map(l => ({
          ...rule,
          "towerId": l.name.split("|")[0],
          "subTowerId": l.name.split("|")[1],
          "portion": l.portion / 100,
          "srlNo":srlNo++,
          "destinationTable": l.destinationTable
        }))
      }).flat();
    }
    else{
      let uniqueRulesFetched = _.uniqBy(rulesFetched, a => a["solutionOfferingsCode"])
      newRules = uniqueRulesFetched.map(rule => {
       rule["id"] = null;
       return loadedRules.map(l => ({
         ...rule,
         "businessUnitCode": l.name.split("|")[0],
         "usage": l.usage,
         "destinationTable": l.destinationTable,
         "solutionOfferingCode": rule.solutionOfferingsCode,
         "yearNameId": yearFilter,
         "monthNameId": monthFilter
       }))
     }).flat();

    }

      let [err1, data1] = categoryFilter == "Tower" ? await fetchRequest.post(`/api/dataflow/towerRules/${yearFilter}/${monthFilter}`, JSON.stringify(newRules)) :  await fetchRequest.post(`/api/dataflow/businessunitMapping/${yearFilter}/${monthFilter}`, JSON.stringify(newRules))
      if (err1) {
        console.error(err1);
        showSnackbar("An error occured while processing your request.", "error");
      }
      else if (data1) {
        showSnackbar(data1, "success");
        reloadData();
      }
    }

    // setIsSubmitting(false);
  }
  const onLoadRuleClose = () => {
    setShowLoadRuleModal(false)
  }
  const handleUpload = (rule) => {
    setRuleName(rule)
    setShowLoadRuleModal(true)

  }
  const handleView = (rule) => {
    setRuleName(rule)
    setOpenTRMapping(true)
  }
  const handleTRMappingDialogClose = () => {
    setOpenTRMapping(false);
  };
  useEffect(() => {
    if (!loading) {
      if (error !== null) {
        handleError(error);
      }
      else if (response !== null) {
        setSubTowers(response?.subTowers)
        setBbusinessUnits(response?.businessUnits)
        setData(response?.rules);
      }
    }
  }, [loading, data, yearFilter, monthFilter]);
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
    <MDBox p={3} pt={1} sx={{ backgroundColor: "#F7F8FD", }}>
      {showLoadRuleModal && categoryFilter == "Tower" && <LoadRuleModal enableAssetDistribution={enableAssetDistribution} yearFilter={yearFilter} monthFilter={monthFilter} selectedTowers={selectedTowers} ruleName={ruleName} subTowers={subTowers} onLoadRuleSave={onLoadRuleSave} onClose={onLoadRuleClose} uploadType={"towerConsumption"} />}
      {showLoadRuleModal && categoryFilter == "Business Unit" && <LoadBURuleModal enableAssetDistribution={enableAssetDistribution} yearFilter={yearFilter} monthFilter={monthFilter} selectedBusinessUnits={selectedBusinessUnits} ruleName={ruleName} businessUnits={businessUnits} onLoadRuleSave={onLoadRuleSave} onClose={onLoadRuleClose} uploadType={"BUConsumption"} />}
      {openTRMapping && categoryFilter == "Tower" && <TowerMappingDialog yearFilter={yearFilter} monthFilter={monthFilter} ruleName={ruleName} onClose={handleTRMappingDialogClose} setRefresh={setRefresh} reloadAllocationData={reloadData} />}
      {openTRMapping && categoryFilter == "Business Unit" && 
      <Modal open={true} onClose={handleTRMappingDialogClose}>
            <MDBox p={3} height="100%" width="100%" display="flex" alignItems="center" justifyContent="center">
                <Card sx={{ height: "100%", width: "100%", overflow: 'hidden' }}>
                    <MDBox px={3} pt={2} display="flex" justifyContent="space-between" alignItems="center">
                        <MDBox>
                            <MDTypography variant="h6" component="span" color="text">
                                Business Unit Rules
                            </MDTypography>
                        </MDBox>
                        <MDBox display="flex">
                            <IconButton onClick={handleTRMappingDialogClose} title="Close">
                                <Icon>close</Icon>
                            </IconButton>
                        </MDBox>
                    </MDBox>
                    <BUMappingView yearFilter={yearFilter} monthFilter={monthFilter} ruleName={ruleName} setRefresh={setRefresh} reloadAllocationData={reloadData} containerHeight={"calc(100vh - 226px)"} typeFilter={"Spend"}/>
                </Card>
            </MDBox>
        </Modal>}
      {data.map((item) => {
        let options = []
        options.push(...[
          { label: "Upload new allocation", onClick: () => { handleUpload(item["ruleName"]) } },
          { label: "View allocation rules", onClick: () => { handleView(item["ruleName"]) } },
          { label: "View Uploaded files", onClick: () => { setAction("consumption"); setOriginalFileName(categoryFilter == "Tower" ? item["allocationFileTowerMapping.originalFileName"] : item["originalFileName"]) } }
        ]);
        return (
          <Card key={item["ruleName"]}
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
                  <MDTypography variant="h6" component="span" color="#4c4c4c" display="flex">{item["ruleName"]}</MDTypography>
                  <RowMenu key={item["ruleName"]} options={options} />
                </MDBox>
                <MDBox display="flex" width="100%" flexDirection="row" justifyContent="space-between" alignItems="center" >
                  <MDBox pt={2} pb={2} sx={{ height: '100%', fontSize: "18px", fontWeight: "bold" }}>
                    {"Allocated"}<br />
                    {item["amount"] ? formatAmount(item["amount"]) : formatAmount(0)}&nbsp;
                  </MDBox>
                </MDBox>
                <Divider style={{ background: '#adadad', margin: '2px' }} variant="middle" omponent="li" />
                <MDBox display="flex" width="100%" flexDirection="column" justifyContent="space-between" >
                  <MDTypography sx={{ fontSize: "14px", pt: "8px" }}>File: {categoryFilter == "Tower" ? item["allocationFileTowerMapping.originalFileName"] : item["originalFileName"]}</MDTypography>
                  <MDTypography sx={{ fontSize: "14px", pt: "8px" }}>Last Load: { categoryFilter == "Tower" ? ( item["allocationFileTowerMapping.createdAt"] ? moment(item["allocationFileTowerMapping.createdAt"]).format("MMM DD YYYY") : " ") : ( item["createdAt"] ? moment(item["createdAt"]).format("MMM DD YYYY") : " ") }</MDTypography>
                  <MDTypography sx={{ fontSize: "14px", pt: "8px" }}>Loaded By: {categoryFilter == "Tower" ? item["createdByUser.name"] : item["name"]}</MDTypography>
                </MDBox>
              </MDBox>
            </MDBox>
          </Card>
        )
      })
      }
    </MDBox>
  )
}

export default AllocationFiles;