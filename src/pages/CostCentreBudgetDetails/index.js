import { useEffect, useRef, useState } from "react";
import MDBox from "components/MDBox";
import DataTable from "components/DataTable";
import MDTypography from "components/MDTypography";
import { Icon, Card, FormControlLabel, Switch as MDSwitch, Badge, Tooltip } from "@mui/material";
import * as XLSX from 'xlsx';
import { getDomain } from 'utils';
import colors from "assets/theme/base/colors";
import PageHeader from "components/PageHeader";
import YASkeleton from "components/YASkeleton";
import fetchRequest from "utils/fetchRequest";
import useHandleError from "hooks/useHandleError";
import { useYADialog } from "components/YADialog";
import EmptyState from "components/EmptyState";
import new_item_img from "assets/svg/add_new.svg";
import MDButton from "components/MDButton";
import numeral from "numeral";
import BudgetItemForm from "components/BudgetItemForm";
import Axios from "axios";
import { useImmer } from "use-immer";
import { useParams } from "react-router-dom";
import AnimatedRoute from "components/AnimatedRoute";
import BudgetHeader from "components/BudgetHeader";
import { applyVariables } from "utils/budget";
import CommentsDrawer from "components/CommentsDrawer";
import moment from "moment";
import { getFiscalMonthsArray } from "utils/budget";

const defaultColumns = [
    { Header: "Expense Type", accessor: "expenseType__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Cost Center", accessor: "costCentre__value", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Account", accessor: "account__value", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Vendor", accessor: "vendor__value", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Cost Pool", accessor: "costPool__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Sub Cost Pool", accessor: "subCostPool__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Tower", accessor: "tower__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Sub Tower", accessor: "subTower__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "CPI", accessor: "enableCpi", "disableSorting": true, width: 80, Cell: ({ cell: { value } }) => { return value ? <Icon color="info" sx={{ fontSize: "18px!important" }}>done</Icon> : <span></span> } },
    { Header: "LPI", accessor: "enableLpi", "disableSorting": true, width: 80, Cell: ({ cell: { value } }) => { return value ? <Icon color="info" sx={{ fontSize: "18px!important" }}>done</Icon> : <span></span> } },
    { Header: "Total", accessor: "total", align: "right", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{numeral(value).format('$0,0')}</MDTypography> } }
];

const defaultExportColumns = [
    { Header: "Expense Type", accessor: "expenseType__name" },
    { Header: "Cost Center Code", accessor: "costCentre__code" },
    { Header: "Cost Center Description", accessor: "costCentre__description" },
    { Header: "Account Code", accessor: "account__code" },
    { Header: "Account Description", accessor: "account__description" },
    { Header: "Vendor Code", accessor: "vendor__code" },
    { Header: "Vendor Name", accessor: "vendor__name" },
    { Header: "Cost Pool", accessor: "costPool__name" },
    { Header: "Sub Cost Pool", accessor: "" },
    { Header: "Tower", accessor: "tower__name" },
    { Header: "Sub Tower", accessor: "subTower__name" },
    { Header: "CPI", accessor: "enableCpi" },
    { Header: "LPI", accessor: "enableLpi" },
    { Header: "Total", accessor: "total" },
];

const buildRows = (headerDetails, data, onEdit, onDelete, onComment) => {
    const rows = [];
    if (Array.isArray(data) && data.length > 0) {
        data.forEach((r) => {
            const varPercentage = ((r["enableCpi"] ? (headerDetails?.cpi || 0) : 0)) + ((r["enableLpi"] ? (headerDetails?.lpi || 0) : 0))
            let row = {};
            Object.keys(r).forEach((k) => {
                if (["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].includes(k))
                    row[k.replace(/\./g, "__")] = applyVariables(Number(r[k]), Number(varPercentage));
                else
                    row[k.replace(/\./g, "__")] = r[k]
            });

            const total = (row?.jan || 0) +
                (row?.feb || 0) +
                (row?.mar || 0) +
                (row?.apr || 0) +
                (row?.may || 0) +
                (row?.jun || 0) +
                (row?.jul || 0) +
                (row?.aug || 0) +
                (row?.sep || 0) +
                (row?.oct || 0) +
                (row?.nov || 0) +
                (row?.dec || 0);

            row["total"] = total;
            row["actions"] = (
                <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }}>
                    <MDTypography display="flex" alignItems="center" component="a" href="#" onClick={() => onComment(row["id"])} variant="caption" color="text" fontWeight="medium">
                        {
                            row?.hasComments && (
                                <Badge variant="dot" badgeContent="" color="info">
                                    <Icon fontSize="small" >comment</Icon>&nbsp;
                                </Badge>
                            )
                        }
                        {
                            !row?.hasComments && headerDetails?.costCenterBudgetSubmitted === false && (
                                <Icon fontSize="small" >comment</Icon>
                            )
                        }
                    </MDTypography>
                    {headerDetails?.costCenterBudgetSubmitted === false && (<>
                        <MDTypography display="flex" alignItems="center" ml={1.5} component="a" href="#" onClick={() => onEdit(row["id"])} variant="caption" color="text" fontWeight="medium">
                            <Icon fontSize="small" >edit</Icon>&nbsp;
                        </MDTypography>
                        <MDTypography display="flex" alignItems="center" ml={1.5} component="a" href="#" onClick={() => onDelete(row["id"])} variant="caption" color="text" fontWeight="medium">
                            <Icon fontSize="small" color="error">delete</Icon>&nbsp;
                        </MDTypography>
                    </>)
                    }
                </MDBox>
            );
            rows.push(row);
        });
    }
    return rows;
}

const getExportColumnsList = (financialYearStartMonth) => {
    const columnsListVal = [...defaultExportColumns];
    const fiscalMonthsArray = getFiscalMonthsArray(financialYearStartMonth);
    fiscalMonthsArray.forEach(fiscalMonth => {
        columnsListVal.push({ Header: fiscalMonth, accessor: fiscalMonth.toLowerCase() });
    });
    return columnsListVal;
};

const getColumnsList = (financialYearStartMonth) => {
    const columnsListVal = [...defaultColumns];
    const fiscalMonthsArray = getFiscalMonthsArray(financialYearStartMonth);
    fiscalMonthsArray.forEach(fiscalMonth => {
        columnsListVal.push({ Header: fiscalMonth, accessor: fiscalMonth.toLowerCase(), align: "right", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{numeral(value).format('$0,0')}</MDTypography> } });
    });
    columnsListVal.push({ Header: "", accessor: "actions", "align": "left", "disableSorting": true });
    return columnsListVal;
};

const CostCentreBudgetDetails = () => {

    const { budgetId } = useParams();
    const domain = getDomain();
    const handleError = useHandleError();
    const { showUploadDialog, showCustomDrawer, hideDrawer, showCustomForm, showAlert, showPrompt, showSnackbar } = useYADialog();
    const [headerDetails, setHeaderDetails] = useState(null);
    const [step, setStep] = useState("LOADING");
    const [rows, setRows] = useImmer([]);
    const [refresh, setRefresh] = useState(null);
    const [monthlyView, setMonthlyView] = useState(false);
    const commentsDrawerRef = useRef();

    const handleClose = () => {
        setRefresh(Math.random())
    }

    const handleCloseCommentsDrawer = () => {
        hideDrawer(commentsDrawerRef.current);
        handleClose();
    };

    const handleComment = (commentTypePkId) => {
        const mode = headerDetails?.costCenterBudgetSubmitted === false ? "edit" : "";
        commentsDrawerRef.current = showCustomDrawer(() => <CommentsDrawer mode={mode} commentType="budget-item" commentTypePkId={commentTypePkId} onClose={handleCloseCommentsDrawer} />, 500, "temporary");
    };

    const handleEdit = (pkId) => {
        showCustomForm(`Edit Budget Item`, () => <BudgetItemForm onClose={handleClose} mode="edit" budgetId={budgetId} costCenterView={true} headerDetails={headerDetails} pkId={pkId} />, handleClose, "edit", pkId,"md");
        // setRows(draft => {
        //     let selectedRow = draft.find(r => r.id === pkId);
        //     if (selectedRow)
        //         selectedRow.isEditMode = true;
        // });
    }

    const deleteBudgetItem = async (pkId) => {
        const response = await Axios.delete(`${domain}/api/budgets/ccbudgetItem/${pkId}`);
        if (response.data && response.data.result === true) {
            showSnackbar(response.data?.message, "success");
            handleClose();
        }
        else {
            showAlert("Delete", "Something went wrong. Contact your administrator.");
        }
    }

    const handleDeleteSuccess = (pkId) => {
        deleteBudgetItem(pkId);
    }

    const handleDelete = (pkId) => {
        showPrompt("Delete", "Are you sure you want to delete?", () => handleDeleteSuccess(pkId));
    }

    useEffect(() => {
        async function getDetails() {
            var [err, data] = await fetchRequest.get(`/api/budgets/${budgetId}`);
            if (err) {
                handleError(err);
            }
            else {
                if (data) {
                    setHeaderDetails(data);
                    // setStep("LOADED");
                }
                else {
                    // setStep("EMPTY");
                }
            }
        }
        getDetails();
    }, [refresh])

    useEffect(() => {
        async function getList() {
            var [err, data] = await fetchRequest.get(`/api/budgets/${budgetId}/costCentreDetailsList`);
            if (err) {
                handleError(err);
            }
            else {
                if (data && Array.isArray(data) && data.length > 0) {
                    setRows(buildRows(headerDetails, data, handleEdit, handleDelete, handleComment));
                    setStep("LOADED");
                }
                else {
                    setStep("EMPTY");
                }
            }
        }
        if (headerDetails)
            getList();
    }, [headerDetails, refresh])

    const handleAddButtonClick = () => {
        showCustomForm(`New Budget Item`, () => <BudgetItemForm budgetId={budgetId} costCenterView={true} headerDetails={headerDetails} onClose={handleClose} />,null, null, null,'md',handleClose);
    }

    const handleShowMonthlyView = (checked) => {
        setMonthlyView(checked)
    }

    const handleCsvExport = () => {
        const exportColumns = getExportColumnsList(headerDetails?.financialYearStartMonth);

        var data = [];
        rows?.forEach(element => {
            let obj = {}
            exportColumns?.forEach((e) => {
                if (typeof element[e.accessor] == "number")
                    obj[e.Header] = Math.round(element[e.accessor])
                else if (["CPI", "LPI"].includes(e.Header))
                    obj[e.Header] = String(element[e.accessor])?.toUpperCase() === "TRUE" ? "Yes" : "No"
                else
                    obj[e.Header] = element[e.accessor]
            })
            data.push(obj)
        });
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(data)
        XLSX.utils.book_append_sheet(wb, ws, '')
        XLSX.writeFile(wb, `Budget ${moment(Date()).format("YYYYMMDDHHmmss")}.csv`)
    }

    const addButton = headerDetails?.status === "WIP" && headerDetails?.costCenterBudgetSubmitted === false ? (
        <MDBox color="text" display="flex" alignItems="center">
            <FormControlLabel
                control={
                    <MDSwitch name={"showMonthlyView"} checked={monthlyView}
                        variant="standard"
                        color="success"
                        onChange={
                            (_, checked) => {
                                handleShowMonthlyView(checked)
                            }
                        }
                    />
                }
                label={"Show Detailed View"}
                labelPlacement="end"
            />
            <MDButton sx={{ ml: 4, mr: 3 }} variant="outlined" color="info" startIcon={<Icon>add</Icon>} onClick={handleAddButtonClick}>
                New Item
            </MDButton>
            <Tooltip title="Download csv">
                <Icon sx={{ cursor: "pointer", fontWeight: "normal" }} fontSize="medium" onClick={handleCsvExport}>
                    download
                </Icon>
            </Tooltip>
        </MDBox>
    ) : (
        <MDBox color="text" display="flex" alignItems="center">
            <FormControlLabel
                control={
                    <MDSwitch name={"showMonthlyView"} checked={monthlyView}
                        variant="standard"
                        color="success"
                        onChange={
                            (_, checked) => {
                                handleShowMonthlyView(checked)
                            }
                        }
                    />
                }
                label={"Show Detailed View"}
                labelPlacement="start"
                sx={{ mr: 3 }}
            />
            <Tooltip title="Download csv">
                <Icon sx={{ cursor: "pointer", fontWeight: "normal" }} fontSize="medium" onClick={handleCsvExport}>
                    download
                </Icon>
            </Tooltip>
        </MDBox>
    );

    if (step === "LOADING") {
        return <YASkeleton variant="dashboard-loading" />;
    }

    const sendBudget = async () => {
        var [err, data] = await fetchRequest.post(`/api/budgets/${budgetId}/costcentresubmit`);
        if (err) {
            // handleError(err);
            showAlert("Submit", "Something went wrong. Contact your administrator.");
        }
        else {
            if (data && data.result === true) {
                showSnackbar(data.message, "success");
                handleClose();
            }
            else {
                showAlert("Submit", "Something went wrong. Contact your administrator.");
            }
        }
    }

    const handleSendButtonClick = () => {
        showPrompt("Submit Budget", "Are you sure you want to submit the budget?", () => sendBudget());
    }

    const handleUploadDialogClose = (uploadSuccess) => {
        if (uploadSuccess)
            handleClose();
    };

    const handleImportButtonClick = () => {
        const uploadConfig = {
            uploadType: "costCentreBudgetDetail",
            yearFilter: headerDetails?.yearNameId,
            pkId: budgetId
        };

        showUploadDialog("Import Budget File", uploadConfig, handleUploadDialogClose);
    }

    const renderAddButton = () => ((headerDetails["status"] === "WIP") && headerDetails["costCenterBudgetSubmitted"] === false && step !== "EMPTY") ? (
        <MDBox>
            <MDButton variant="gradient" color="info" onClick={handleSendButtonClick}>
                Submit
            </MDButton>
        </MDBox>
    )
        : undefined;

    const renderOptions = () => headerDetails?.status === "WIP" && headerDetails?.costCenterBudgetSubmitted === false ? (
        <MDBox>
            <MDButton sx={{ mr: 2 }} variant="outlined" color="info" startIcon={<Icon>cloud_upload</Icon>} onClick={handleImportButtonClick}>
                Import File
            </MDButton>
            <MDButton variant="gradient" color="info" startIcon={<Icon>add</Icon>} onClick={handleAddButtonClick}>
                New Budget Item
            </MDButton>
        </MDBox>
    ) : undefined;

    const renderHeader = () => (<BudgetHeader headerDetails={headerDetails} />)

    const columnsList = getColumnsList(headerDetails?.financialYearStartMonth);

    let columns = headerDetails["status"] === "WIP" && headerDetails["costCenterBudgetSubmitted"] === false ? columnsList : columnsList.filter(c => c.accessor !== "Actions");
    columns = columns.filter(c => {
        if (c.Header === "CPI") return headerDetails?.enableCpi;
        else if (c.Header === "LPI") return headerDetails?.enableLpi;
        else if (!monthlyView && (["costPool__name", "subCostPool__name", "tower__name", "subTower__name", "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].includes(c.accessor))) return false;
        return true;
    });

    const resetBudget = async () => {
        var [err, data] = await fetchRequest.delete(`/api/budgets/${budgetId}/resetCostCentre`);
        if (err) {
            // handleError(err);
            showAlert("Submit", "Something went wrong. Contact your administrator.");
        }
        else {
            if (data && data.result === true) {
                showSnackbar(data.message, "success");
                handleClose();
            }
            else {
                showAlert("Submit", "Something went wrong. Contact your administrator.");
            }
        }
    }

    const handleResetButtonClick = () => {
        showPrompt("Reset Budget", "Are you sure you want to reset the budget? Resetting a budget will permanently delete all the budget line items.", () => resetBudget());
    }

    const getSecondaryActions = () => {
        let actions = [];
        if ((headerDetails["status"] === "WIP") && headerDetails["costCenterBudgetSubmitted"] === false) {
            if (step !== "EMPTY")
                actions.push({ label: "Reset Budget", onClick: handleResetButtonClick });
            actions.push({ label: "Import Budget", onClick: handleImportButtonClick });
        }
        return actions;
    }

    return (
        <>
        <MDBox bgColor={colors.dashboardBackground} minHeight="calc(100vh - 56px)" paddingBottom={{ lg: 0, md: 6, sm: 6, xs: 6 }}>
            <PageHeader title="Budget Details" subtitle="" />
            <PageHeader headerComponent={renderHeader} primaryActionComponent={renderAddButton} secondaryActions={getSecondaryActions} hideBreadcrumbs={true} noTopPadding={true}/>
            {/* <PageHeader headerComponent={renderHeader} primaryActionComponent={renderAddButton} secondaryActions={getSecondaryActions} /> */}
            <MDBox p={3} pt={1}>
                {
                    step === "LOADED" && (
                        <Card sx={{ height: "100%", mt: 2 }} px={0}>
                            <DataTable
                                table={{ columns, rows }}
                                showTotalEntries={true}
                                isSorted={true}
                                noEndBorder
                                entriesPerPage={true}
                                canSearch={true}
                                primaryActions={addButton}
                            />
                        </Card>
                    )
                }
                {
                    step === "EMPTY" && (
                        <MDBox display="flex" alignItems="center" justifyContent="center" minHeight="calc(100vh - 300px)">
                            <EmptyState
                                size="large"
                                image={new_item_img}
                                title={"Start Creating Your Budget Now"}
                                description={"Click on the 'import file' button to import all the budget data or click on the '+ new budget item' button to add individual line item."}
                                actions={renderOptions}
                            />
                        </MDBox>
                    )
                }
            </MDBox>
            </MDBox>
        </>
    );
};

export default AnimatedRoute(CostCentreBudgetDetails);