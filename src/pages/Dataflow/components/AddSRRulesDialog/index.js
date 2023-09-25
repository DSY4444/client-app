import { Card, Modal, Tab, Tabs, Icon, IconButton } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "components/DataTable";
import useFetchRequest from "hooks/useFetchRequest";
import { useCallback, useMemo, useState } from "react";
import numeral from "numeral";
import fetchRequest from "utils/fetchRequest";
import YASkeleton from "components/YASkeleton";
import { useYADialog } from "components/YADialog";
import SinglesolutionRule from "./components/SingleSolutionRule";
import MultisolutionRule from "./components/MultiSolutionRule";
import StrategySelectionSidebar from "../StrategySelectionSidebar";
import moment from 'moment';
import { useAppController } from "context";
import { useImmer } from "use-immer";
import { normalizeCurrency } from "utils/table";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      style={{ height: "100%", width: "100%" }}
    >
      {value === index && (
        <MDBox p={3} height="100%" width="100%" {...other}>
          {children}
        </MDBox>
      )}
    </div>
  );
}

const AddSRRulesDialog = (props) => {
  const { onClose } = props;
  const [mappingType, setMappingType] = useState()
  const mappingTypes = [
    { value: 1, displayName: "Cost Center, Expense Type & Tower" },
    { value: 2, displayName: "Cost Center, Expense Type, Tower, Account & Vendor" },
  ]

  const selectedMappingTypeOption = mappingTypes.find(o => o.value === mappingType);
  const handleChangeMappingType = (value) => {
    setMappingType(value);
  }

  const strategyItemStyles = ({ palette: { white, info } }) => ({
    display: "flex",
    flexDirection: "column",
    px: 2,
    py: 1.5,
    m: 0.8,
    zIndex: 2,
    cursor: "pointer",
    borderRadius: "10px",
    border: "1px solid #ddd",
    "& .title": {
      marginBottom: 1
    },
    "&:hover": {
      backgroundColor: info.main
    },
    "&:hover .title, &:hover .subtitle": {
      color: white.main,
    }
  });

  const handleSRRulesDialogClose = () => {
    if (onClose) onClose();
  }
  return (
    <Modal open={true} onClose={handleSRRulesDialogClose}>
      <MDBox p={3} height="100%" width="100%" display="flex" alignItems="center" justifyContent="center">
        <Card sx={{ height: "100%", width: "100%", overflow: 'hidden' }}>
          <MDBox px={3} pt={2} display="flex" justifyContent="space-between" alignItems="center">
            <MDBox>
              <MDTypography variant="h6" component="span" color="text">Solution Rules</MDTypography>
            </MDBox>
            <MDBox display="flex">
              <IconButton onClick={handleSRRulesDialogClose} title="Close">
                <Icon>close</Icon>
              </IconButton>
            </MDBox>
          </MDBox>
          {
            !mappingType && (
              <MDBox height="100%" px={3} pt={2} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <MDTypography variant="subtitle1" fontWeight="light" color="text" component="span" mb={3} mt={-8}>
                  Choose a mapping strategy
                </MDTypography>
                <MDBox display="flex" alignItems="center" justifyContent="center" flexWrap="wrap" px={3}>
                  {
                    mappingTypes?.map((option) => {
                      return <MDBox key={`l_${option.value}`}
                        sx={(theme) => strategyItemStyles(theme)}
                        onClick={() => {
                          setMappingType(option.value)
                        }}
                      >
                        <MDTypography className="title" variant="caption" color="text">Map by</MDTypography>
                        <MDTypography className="subtitle" variant="caption" fontWeight="medium" color="text">{option.displayName}</MDTypography>
                      </MDBox>
                    })
                  }
                </MDBox>


              </MDBox>
            )
          }
          {
            mappingType && <FetchData {...props} mappingTypes={mappingTypes} mappingType={mappingType} onChangeMappingType={handleChangeMappingType} selectedMappingTypeOption={selectedMappingTypeOption} />
          }
        </Card>
      </MDBox>
    </Modal>
  )
}

const FetchData = (props) => {
  const { yearFilter, monthFilter, mappingType } = props;
  const [filtersState, setFiltersState] = useImmer({ globalFilter: undefined, filters: [] });

  const handleOnFiltersStateUpdate = (latestGlobalFilter, latestFilters) => {
    setFiltersState(draft => {
      draft.globalFilter = latestGlobalFilter;
      draft.filters = latestFilters;
    });
  }

  let url = "/api/dataflow/solutionRules"
  if (mappingType === 1)
    url = "/api/dataflow/solutionRules1"
  if (mappingType === 2)
    url = "/api/dataflow/solutionRules2"
  const { response: data, error: _err, loading: loading, reloadData } = useFetchRequest(`${url}/${yearFilter}/${monthFilter}`);

  if (loading === false && data === null) {
    return (
      <div>
        no data
      </div>
    );
  }
  if (_err)
    console.error(_err)
  return (
    <MDBox>
      {
        loading && <YASkeleton variant="loading" />
      }
      {
        !loading && <ShowData {...props} data={data} reloadData={reloadData} filtersState={filtersState} handleOnFiltersStateUpdate={handleOnFiltersStateUpdate} />
      }
    </MDBox>
  )
}

const ShowData = (props) => {
  const { data, yearFilter, monthFilter, reloadData, mappingType, onChangeMappingType, mappingTypes, selectedMappingTypeOption, filtersState, handleOnFiltersStateUpdate } = props;
  const [showOptions, setShowOptions] = useState(false);
  const { showSnackbar } = useYADialog();
  const [selectedRows, setSelectedRows] = useState([]);
  const [refresh, setRefresh] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [glRows, setGLRows] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [controller,] = useAppController();
  const { appDef: { featureSet, settings } } = controller;
  const enableAssetDistribution = featureSet && featureSet.dataManagement?.assetDistribution === true;
  const defaultDateFormat = (settings && settings.dateFormat) || "DD/MM/YYYY";

  let costElementsRemaining = []
  const handleOnOptionsClick = () => {
    setShowOptions(true);
  }

  const handleOnOptionsClose = () => {
    setShowOptions(false);
  }

  const handleOnOptionSelection = (value) => {
    if (onChangeMappingType)
      onChangeMappingType(value);
  }

  const handleOnUpdate = useCallback(({ selected }) => {
    setSelectedRows(selected)
  }, [yearFilter, monthFilter])

  const handleOnSelectionClearClick = () => {
    setSelectedRows([])
    setRefresh(Math.random())
  }

  const handleChange = (e, newValue) => {
    setTabValue(newValue);
  }

  const handleDialogOpen = () => {
    setDialogOpen(false)
  }

  const getDetails = async (e, row) => {
    if (costElementsRemaining.length > 0 && e.target.innerHTML !== "") {
      row.original.mappingType = mappingType;
      row.original.year = yearFilter;
      row.original.month = monthFilter;
      row.original.mapping = 'solution';
  
      let [err, data] = await fetchRequest.post(`/api/dataflow/getGLData/`, JSON.stringify(row.original));
      if (err) {
        console.error('err', err)
      }
      else {
        let newData = data.map(item => {
          return {
            "accountCode": item["account.code"],
            "accountDescription": item["account.description"],
            "expenseType": item["expenseType.name"],
            "costCentreCode": item["costCentre.code"],
            "costCentreDescription": item["costCentre.description"],
            "vendorCode": item["vendor.code"],
            "vendorName": item["vendor.name"],
            "amount": item["amount"],
            "applicationID": item["applicationID"],
            "invoice": item["invoice"],
            "journalID": item["journalID"],
            "journalLine": item["journalLine"],
            "projectID": item["projectID"],
            "transactionDate": item["transactionDate"]
          }
        });
        setGLRows(newData)
        setDialogOpen(true)
      }
    }
  };

  const submitRules = async (ceSelected) => {
    setIsSubmitting(true);
    let [err, data1] = await fetchRequest.post(`/api/dataflow/solutionRules/${yearFilter}/${monthFilter}`, JSON.stringify(ceSelected))
    if (err) {
      console.error(err);
      showSnackbar("An error occured while processing your request.", "error");
    }
    else if (data1) {
      showSnackbar(data1, "success");
      reloadData();
    }
    setIsSubmitting(false);
  }

  if (mappingType === 1) {
    costElementsRemaining = data.costElements.map((a, i) => { return ({ id: i, costCentreId: a["costCentre.id"], CostCentreCode: a["costCentre.code"], CostCentreDescription: a["costCentre.description"], expenseTypeId: a["expenseType.id"], ExpenseType: a["expenseType.name"], amount: a.amount, towerId: a["towerMappings.tower.id"], subTowerId: a["towerMappings.subTower.id"], towerName: a["towerMappings.tower.name"], subTowerName: a["towerMappings.subTower.name"] }) })
  }
  if (mappingType === 2) {
    costElementsRemaining = data.costElements.map((a, i) => { return ({ id: i, costCentreId: a["costCentre.id"], CostCentreCode: a["costCentre.code"], CostCentreDescription: a["costCentre.description"], expenseTypeId: a["expenseType.id"], ExpenseType: a["expenseType.name"], accountId: a["account.id"], AccountCode: a["account.code"], AccountDescription: a["account.description"], vendorId: a["vendor.id"], VendorCode: a["vendor.code"], VendorName: a["vendor.name"], amount: a.amount, towerId: a["towerMappings.tower.id"], subTowerId: a["towerMappings.subTower.id"], towerName: a["towerMappings.tower.name"], subTowerName: a["towerMappings.subTower.name"] }) })
  }

  const amountAllocated = selectedRows?.reduce((total, idx) => total + costElementsRemaining[idx]?.amount, 0);

  let columns = []
  if (mappingType === 1) {
    columns = [
      { Header: "Cost Center Code", accessor: "CostCentreCode",dataType:"textbox",disableFilters: false, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
      { Header: "Cost Center Name", accessor: "CostCentreDescription",dataType:"textbox",disableFilters: false, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
      { Header: "Expense Type", accessor: "ExpenseType",dataType:"textbox",disableFilters: false, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
      { Header: "Tower", accessor: "towerName",dataType:"textbox",disableFilters: false, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
      { Header: "Sub Tower", accessor: "subTowerName",dataType:"textbox",disableFilters: false, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
      { Header: "Amount", accessor: "amount", align: "right",dataType:"currecny",disableFilters: false, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{numeral(normalizeCurrency(value)).format("$0,0")}</MDTypography> } },
    ]
  }
  if (mappingType === 2) {
    columns = [
      { Header: "Cost Center Code", accessor: "CostCentreCode",dataType:"textbox",disableFilters: false, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
      { Header: "Cost Center Name", accessor: "CostCentreDescription",dataType:"textbox",disableFilters: false, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
      { Header: "Expense Type", accessor: "ExpenseType",dataType:"textbox",disableFilters: false, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
      { Header: "Tower", accessor: "towerName",dataType:"textbox",disableFilters: false, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
      { Header: "Sub Tower", accessor: "subTowerName",dataType:"textbox",disableFilters: false, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
      { Header: "Account Code", accessor: "AccountCode",dataType:"textbox",disableFilters: false, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
      { Header: "Account Description", accessor: "AccountDescription",dataType:"string",disableFilters: false, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
      { Header: "Vendor Code", accessor: "VendorCode",dataType:"textbox",disableFilters: false, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
      { Header: "Vendor Name", accessor: "VendorName",dataType:"textbox",disableFilters: false, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
      { Header: "Amount", accessor: "amount",dataType:"currency",disableFilters: false, align: "right", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{numeral(normalizeCurrency(value)).format("$0,0")}</MDTypography> } },
    ]
  }

  const columnsMemo = useMemo(() => columns, [yearFilter, monthFilter]);
  const rowsMemo = useMemo(() => costElementsRemaining, [yearFilter, monthFilter, refresh]);

  const filteredMappingTypes = mappingTypes.filter(m => m.value !== mappingType);

  const strategyItemStyles = () => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    pl: 2,
    pr: 1,
    py: 1.5,
    zIndex: 2,
    marginBottom: "0px",
    marginRight: "-10px",
    cursor: "pointer",
    borderRadius: "10px",
    border: "1px solid #ddd",
    "& .selectionBox": {
      display: "flex",
      flexDirection: "column",
    },
    "& .title": {
      marginBottom: 1
    }
  });

  let glColumns = [
    { Header: "Account Code", accessor: "accountCode", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Account Description", accessor: "accountDescription", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Expense Type", accessor: "expenseType", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Cost Center Code", accessor: "costCentreCode", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Cost Center Name", accessor: "costCentreDescription", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Vendor Code", accessor: "vendorCode", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Vendor Name", accessor: "vendorName", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Amount", accessor: "amount", align: "right", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{numeral(normalizeCurrency(value)).format("$0,0")}</MDTypography> } },
    { Header: "Application ID", accessor: "applicationID", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Journal ID", accessor: "journalID", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Journal Line", accessor: "journalLine", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Project ID", accessor: "projectID", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Transaction Date", accessor: "transactionDate", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value ? moment(value).format(defaultDateFormat || "DD/MM/YYYY") : ""}</MDTypography> } },
    { Header: "Invoice Number", accessor: "invoice", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
  ]

  if (costElementsRemaining.length > 0) {
    return (
      <>
        <Modal open={dialogOpen} onClose={handleDialogOpen}>
          <MDBox p={3} height="100%" width="100%" display="flex" alignItems="center" justifyContent="center">
            <Card sx={{ height: "75%", width: "95%", overflow: 'hidden' }}>
              <MDBox px={3} pt={2} display="flex" justifyContent="space-between" alignItems="center">
                <MDBox>
                  <MDTypography variant="h6" component="span" color="text">
                    General Ledger Transactions
                  </MDTypography>
                </MDBox>
                <MDBox display="flex">
                  <IconButton onClick={handleDialogOpen} title="Close">
                    <Icon>close</Icon>
                  </IconButton>
                </MDBox>
              </MDBox>
              <DataTable
                variant="tile"
                table={{ columns: glColumns, rows: glRows }}
                containerMaxHeight={424}
                showTotalEntries={true}
                isSorted={true}
                newStyle1={true}
                noEndBorder
                entriesPerPage={true}
                canSearch={true}
              >
              </DataTable>
            </Card>
          </MDBox>
        </Modal>
        <MDBox display="flex" flexDirection="row">
          <MDBox width={selectedRows?.length > 0 ? "50%" : "100%"} borderRight="1px solid rgba(0, 0, 0, 0.05)">
            <MDBox pl={3} pr={4} pt={1} display="flex" alignItems="center" justifyContent="space-between">
              <MDTypography variant="subtitle1" fontWeight="medium" color="dark" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">Select one or more cost centers to create a rule.</MDTypography>
              {
                selectedRows?.length === 0 &&
                <MDBox
                  sx={(theme) => strategyItemStyles(theme)}
                  onClick={handleOnOptionsClick}
                >
                  <MDBox className="selectionBox">
                    <MDTypography className="title" variant="caption" color="text">Map by</MDTypography>
                    <MDTypography className="subtitle" variant="caption" fontWeight="medium" color="text">{selectedMappingTypeOption?.displayName}</MDTypography>
                  </MDBox>
                  <Icon sx={{ ml: 1.5, mt: .5, fontSize: "32px!important", color: "rgba(0, 0, 0, 0.54)" }}>keyboard_arrow_down</Icon>
                </MDBox>
              }
            </MDBox>
            <DataTable
              variant="tile"
              table={{ columns: columnsMemo, rows: rowsMemo }}
              showTotalEntries={true}
              containerMaxHeight={"calc(91vh - 268px)"}
              isSorted={true}
              newStyle1={true}
              noEndBorder
              entriesPerPage={true}
              canSearch={true}
              isSelectable={true}
              onUpdate={handleOnUpdate}
              onRowClick={getDetails}
              onSelectionClearClick={handleOnSelectionClearClick}
              filtersState={filtersState}
              onFiltersStateUpdate={handleOnFiltersStateUpdate}
              canFilter={true}
            >
            </DataTable>
          </MDBox>
          {
            selectedRows?.length > 0 && (
              <MDBox width="50%" pb={2} display="flex" flexDirection="column" alignItems="center" justifyContent="flex-start">
                <MDBox display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                  <MDBox flex={1} textAlign="center" display="flex">
                    <MDBox display="flex" flexDirection="column" flex={1} mt="auto">
                      <MDTypography variant="button" component="span" fontWeight="medium" color="text">Allocating</MDTypography>
                      <MDTypography variant="h3" component="span" fontWeight="medium" color="dark">{numeral(amountAllocated).format('$0,0')}</MDTypography>
                    </MDBox>
                  </MDBox>
                  <MDBox>
                    <Icon sx={{ mt: 1, mb: 1, color: "#7b809a", fontSize: "28px!important" }}>south</Icon>
                  </MDBox>
                </MDBox>
                <MDBox
                  height="100%" width="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="flex-start">
                  <Tabs width="100%" value={tabValue} onChange={handleChange} textColor="inherit">
                    <Tab disableRipple label="Solution" />
                    <Tab disableRipple label="Multiple Solutions" />
                  </Tabs>
                  <TabPanel value={tabValue} index={0}>
                    <SinglesolutionRule enableAssetDistribution={enableAssetDistribution} yearFilter={yearFilter} monthFilter={monthFilter} costElementsRemaining={costElementsRemaining} selectedRows={selectedRows} isSubmitting={isSubmitting} submitRules={submitRules} solutionNames={data.solutionNames} />
                  </TabPanel>
                  <TabPanel value={tabValue} index={1} display="flex" flexDirection="column" alignItems="center" px={0} py={0}>
                    <MultisolutionRule enableAssetDistribution={enableAssetDistribution} yearFilter={yearFilter} monthFilter={monthFilter} costElementsRemaining={costElementsRemaining} selectedRows={selectedRows} isSubmitting={isSubmitting} submitRules={submitRules} solutionNames={data.solutionNames} />
                  </TabPanel>
                </MDBox>
              </MDBox>
            )
          }
          {showOptions && (
            <StrategySelectionSidebar
              options={filteredMappingTypes}
              onOptionSelection={handleOnOptionSelection}
              onOptionsClose={handleOnOptionsClose}
            />
          )}
        </MDBox>
      </>
    )
  } else if (costElementsRemaining.length === 0 && data.noOfItems > 0){
    return (<MDBox height="100%" display="flex" alignItems="center" justifyContent="center">
      <MDTypography variant="subtitle1" fontWeight="medium" color="text">All cost centers have been mapped successfully.</MDTypography>
    </MDBox>
    );
  } else if (data.noOfItems === 0) {
    return (<MDBox height="100%" display="flex" alignItems="center" justifyContent="center">
      <MDTypography variant="subtitle1" fontWeight="medium" color="text">No Towers to Map.</MDTypography>
    </MDBox>
    );
  }
}

export default AddSRRulesDialog;