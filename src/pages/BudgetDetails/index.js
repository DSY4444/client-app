import MDBox from "components/MDBox";
import DataTable from "components/DataTable";
import MDTypography from "components/MDTypography";
import { Icon, Card, FormControlLabel, Switch as MDSwitch, CircularProgress, Tooltip, Badge } from "@mui/material";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { getDomain } from 'utils';
import PageHeader from "components/PageHeader";
import YASkeleton from "components/YASkeleton";
import fetchRequest from "utils/fetchRequest";
import useHandleError from "hooks/useHandleError";
import { useYADialog } from "components/YADialog";
import EmptyState from "components/EmptyState";
import new_item_img from "assets/svg/add_new.svg";
import no_data_img from "assets/svg/no_data.svg";
import MDButton from "components/MDButton";
import numeral from "numeral";
import BudgetItemForm from "components/BudgetItemForm";
import * as XLSX from 'xlsx';
import Axios from "axios";
import { useImmer } from "use-immer";
import { useParams } from "react-router-dom";
import AnimatedRoute from "components/AnimatedRoute";
import moment from "moment";
import BudgetHeader from "components/BudgetHeader";
import MDBadge from "components/MDBadge";
import { applyVariables } from "utils/budget";
import MDAvatar from "components/MDAvatar";
import CommentsDrawer from "components/CommentsDrawer";
import { getFiscalMonthsArray } from "utils/budget";
import colors from "assets/theme/base/colors";

const BudgetContext = createContext();

const defaultColumns = [
    { Header: "Expense Type", accessor: "expenseType__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Cost Center", accessor: "costCentre__value", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Account", accessor: "account__value", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Vendor", accessor: "vendor__value", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Cost Pool", accessor: "costPool__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Sub Cost Pool", accessor: "subCostPool__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Tower", accessor: "tower__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Sub Tower", accessor: "subTower__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "CPI", accessor: "enableCpi", "disableSorting": true, Cell: ({ cell: { value } }) => { return value ? <Icon color="info" sx={{ fontSize: "18px!important" }}>done</Icon> : <span></span> } },
    { Header: "LPI", accessor: "enableLpi", "disableSorting": true, Cell: ({ cell: { value } }) => { return value ? <Icon color="info" sx={{ fontSize: "18px!important" }}>done</Icon> : <span></span> } },
    { Header: "Total", accessor: "total", align: "right", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{numeral(value).format('$0,0')}</MDTypography> } },
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
    { Header: "Sub Cost Pool", accessor: "subCostPool__name" },
    { Header: "Tower", accessor: "tower__name" },
    { Header: "Sub Tower", accessor: "subTower__name" },
    { Header: "Total", accessor: "total" },
];

const defaultBudgetCostCentreListColumns = [
    {
        Header: () => null, // No header
        id: 'expander', // It needs an ID
        Cell: ({ row }) => (
            <span {...row.getToggleRowExpandedProps()}>
                <Icon fontSize="medium">{row.isExpanded ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}</Icon>
            </span>
        ),
        width: 50,
        disableSorting: true
    },
    { Header: "Cost Center", accessor: "costCentre__description", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Allocated Amount", accessor: "amount", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{numeral(value).format('$0,0')}</MDTypography> } },
    {
        Header: "Requested Amount", accessor: "actualAmount", Cell: ({ cell: { row: { original }, value } }) => {
            if (original["status"] !== "WIP") {
                // const val = applyVariables(Number(value), Number(original?.varPercentage));
                const val = Number(value);
                if (Number(original?.actualAmount || 0) > Number(original?.amount || 0))
                    return <MDBadge container circular badgeContent={numeral(val).format('$0,0')} color="error" variant="gradient" size="sm" />
                else if (Number(original?.actualAmount || 0) < Number(original?.amount || 0))
                    return <MDBadge container circular badgeContent={numeral(val).format('$0,0')} color="success" variant="gradient" size="sm" />
                return <MDTypography ml={1} variant="caption" color="dark">{numeral(val).format('$0,0')}</MDTypography>
            }
            return <span></span>
        }
    },
    { Header: "Status", accessor: "statusName", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    { Header: "Submitted On", accessor: "createdAt", Cell: ({ cell: { row: { original }, value } }) => { return <MDTypography variant="caption" color="dark">{original["status"] !== "WIP" ? (value ? moment(value).format("MMM DD YYYY") : "") : ""}</MDTypography> } },
    { Header: "Submitted By", accessor: "createdByUser__name", Cell: ({ cell: { row: { original }, value } }) => { return <MDTypography variant="caption" color="dark" display="flex" alignItems="center" justifyContent="flex-start">{original["status"] !== "WIP" ? <><MDAvatar name={value} size="xs" sx={{ mr: .75 }} />{value}</> : ""}</MDTypography> } },
    { Header: "", accessor: "actions", "align": "left", "disableSorting": true }
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
                            Boolean(row?.hasComments) && (
                                <Badge variant="dot" badgeContent="" color="info">
                                    <Icon fontSize="small" >comment</Icon>&nbsp;
                                </Badge>
                            )
                        }
                        {
                            !row?.hasComments && !["APPROVED", "CANCELED"].includes(headerDetails?.status) && (
                                <Icon fontSize="small" >comment</Icon>
                            )
                        }
                    </MDTypography>
                    {
                        headerDetails?.status === "DRAFT" && (
                            <>
                                <MDTypography display="flex" alignItems="center" ml={1.5} component="a" href="#" onClick={() => onEdit(row["id"])} variant="caption" color="text" fontWeight="medium">
                                    <Icon fontSize="small" >edit</Icon>
                                </MDTypography>
                                <MDTypography display="flex" alignItems="center" ml={1.5} component="a" href="#" onClick={() => onDelete(row["id"])} variant="caption" color="text" fontWeight="medium">
                                    <Icon fontSize="small" color="error">delete</Icon>
                                </MDTypography>
                            </>
                        )
                    }
                </MDBox>
            );
            rows.push(row);
        });
    }
    return rows;
}

const buildCcBudgetRows = (data, onReject) => {
    const rows = [];
    if (Array.isArray(data) && data.length > 0) {
        data.forEach((r) => {
            let row = {};
            Object.keys(r).forEach((k) => {
                row[k.replace(/\./g, "__")] = r[k]
            });
            row["actions"] = row["status"] === "SUBMITTED" ? (
                <MDTypography color="error" display="flex" alignItems="center" component="a" href="#" onClick={() => onReject(row["costCentreId"])} variant="caption" fontWeight="medium">
                    <Icon fontSize="small" color="error">close</Icon>&nbsp;Reject
                </MDTypography>
            ) : undefined;
            rows.push(row);
        });
    }
    return rows;
}

const SubRowAsync = ({ budgetId, headerDetails, columnsList, row: { original } }) => {
    const { showCustomDrawer, hideDrawer } = useYADialog();
    const handleError = useHandleError();
    const [step, setStep] = useState("LOADING");
    const [rows, setRows] = useImmer([]);
    const { monthlyView } = useContext(BudgetContext);
    const [refresh, setRefresh] = useState(null);
    const commentsDrawerRef = useRef();

    const handleClose = () => {
        setRefresh(Math.random())
    }

    const handleCloseCommentsDrawer = () => {
        hideDrawer(commentsDrawerRef.current);
        handleClose();
    };

    const handleComment = (commentTypePkId) => {
        // const mode = headerDetails?.status === "DRAFT" ? "edit" : "";
        commentsDrawerRef.current = showCustomDrawer(() => <CommentsDrawer mode="edit" commentType="budget-item" commentTypePkId={commentTypePkId} onClose={handleCloseCommentsDrawer} />, 500, "temporary");
    };

    useEffect(() => {
        async function getList() {
            var [err, data] = await fetchRequest.get(`/api/budgets/${budgetId}/detailsListByCostCentre/${original?.costCentreId}`);
            if (err) {
                handleError(err);
            }
            else {
                if (data && Array.isArray(data) && data.length > 0) {
                    setRows(buildRows(headerDetails, data, null, null, handleComment));
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

    const columns = columnsList.filter(c => {
        if (original?.status === "SUBMITTED") {
            if (c.Header === "CPI") return headerDetails?.enableCpi;
            if (c.Header === "LPI") return headerDetails?.enableLpi;
        }
        if (!monthlyView && (["costPool__name", "subCostPool__name", "tower__name", "subTower__name", "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].includes(c.accessor)))
            return false;
        return c.Header !== "Cost Center" && c.Header !== "CPI" && c.Header !== "LPI";
    });

    if (step === "EMPTY") {
        return (<MDBox mt={1} textAlign="center" size="20">
            <MDTypography variant="button" fontWeight="bold" color="text">No Data</MDTypography>
        </MDBox>);
    }

    return step === "LOADED" ? (
        <Card sx={{ height: "100%", mt: 1 }} px={0}>
            <DataTable
                variant="subtable"
                table={{ columns, rows }}
                showTotalEntries={true}
                isSorted={true}
                entriesPerPage={true}
                canSearch={false}
                hideFooterForMinRecords={true}
            />
        </Card>
    ) : (<MDBox mt={1} textAlign="center" size="20">
        <CircularProgress color="info" />
    </MDBox>);
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
const BudgetDetails = () => {

    const { budgetId } = useParams();
    const domain = getDomain();
    const handleError = useHandleError();
    const { showCustomDrawer, hideDrawer, showUploadDialog, showCustomForm, showAlert, showPrompt, showSnackbar } = useYADialog();
    const [headerDetails, setHeaderDetails] = useState(null);
    const [step, setStep] = useState("LOADING");
    const [bStep, setBStep] = useState("LOADING");
    const [rows, setRows] = useImmer([]);
    const [budgetCostCentreListRows, setBudgetCostCentreListRows] = useImmer([]);
    const [refresh, setRefresh] = useState(null);
    const [monthlyView, setMonthlyView] = useState(false);

    const commentsDrawerRef = useRef();

    const handleClose = () => {
        setRefresh(Math.random())
    }

    const handleCloseCommentsDrawer = () => {
        hideDrawer(commentsDrawerRef.current);
        if (headerDetails?.status === "DRAFT")
            handleClose();
    };

    const handleComment = (commentTypePkId) => {
        const mode = headerDetails?.status === "DRAFT" ? "edit" : "";
        commentsDrawerRef.current = showCustomDrawer(() => <CommentsDrawer mode={mode} commentType="budget-item" commentTypePkId={commentTypePkId} onClose={handleCloseCommentsDrawer} />, 500, "temporary");
    };

    const handleEdit = (pkId) => {
        showCustomForm(`Edit Budget Item`, () => <BudgetItemForm onClose={handleClose} mode="edit" budgetId={budgetId} headerDetails={headerDetails} pkId={pkId} />, handleClose, "edit", pkId,"md");
        // setRows(draft => {
        //     let selectedRow = draft.find(r => r.id === pkId);
        //     if (selectedRow)
        //         selectedRow.isEditMode = true;
        // });
    }

    const deleteBudgetItem = async (pkId) => {
        const response = await Axios.delete(`${domain}/api/budgets/budgetItem/${pkId}`);
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

    const rejectCCBudget = async (pkId) => {
        const response = await Axios.post(`${domain}/api/budgets/${budgetId}/costcentrereject/${pkId}`);
        if (response.data && response.data.result === true) {
            showSnackbar(response.data?.message, "success");
            handleClose();
        }
        else {
            showAlert("Delete", "Something went wrong. Contact your administrator.");
        }
    }

    const handleReject = (pkId) => {
        showPrompt("Reject Budget", "Are you sure you want to reject the budget?", () => rejectCCBudget(pkId));
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
                }
            }
        }
        getDetails();
    }, [refresh])

    useEffect(() => {
        async function getList() {
            setStep("LOADING");
            var [err, data] = await fetchRequest.get(`/api/budgets/${budgetId}/detailsList`);
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
        if (headerDetails && (headerDetails?.status === "DRAFT" || headerDetails?.status === "CANCELED" || headerDetails?.status === "APPROVED"))
            getList();
        else
            setStep("EMPTY");
    }, [headerDetails, refresh])

    useEffect(() => {
        async function getBudgetCostCentreList() {
            setBStep("LOADING");
            var [err, data] = await fetchRequest.get(`/api/budgets/${budgetId}/budgetCostCentreList`);
            if (err) {
                handleError(err);
            }
            else {
                if (data && Array.isArray(data) && data.length > 0) {
                    setBudgetCostCentreListRows(buildCcBudgetRows(data, handleReject));
                    setBStep("LOADED");
                }
                else {
                    setBStep("EMPTY");
                }
            }
        }
        if (headerDetails && (headerDetails?.status !== "DRAFT" || headerDetails?.status !== "CANCELED" || headerDetails?.status !== "APPROVED"))
            getBudgetCostCentreList();
        else
            setStep("EMPTY");
    }, [headerDetails, refresh])

    const handleAddButtonClick = () => {
        showCustomForm(`New Budget Item`, () => <BudgetItemForm budgetId={budgetId} headerDetails={headerDetails} onClose={handleClose} />, null, null, null,'md', handleClose);
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

    const addButton = headerDetails?.status === "DRAFT" ? (
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
                labelPlacement="end"
                sx={{ mr: 3 }}
            />
            <Tooltip title="Download csv">
                <Icon sx={{ cursor: "pointer", fontWeight: "normal" }} fontSize="medium" onClick={handleCsvExport}>
                    download
                </Icon>
            </Tooltip>
        </MDBox>
    );

    const addButton1 = (<FormControlLabel
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
        sx={{ mr: 3 }}
    />);

    const columnsList = getColumnsList(headerDetails?.financialYearStartMonth);

    let columns = columnsList.filter(c => {
        if (!monthlyView && (["costPool__name", "subCostPool__name", "tower__name", "subTower__name", "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].includes(c.accessor)))
            return false;
        return (c.Header !== "CPI" && c.Header !== "LPI");
    });
    const budgetCostCentreListColumns = defaultBudgetCostCentreListColumns;


    const renderRowSubComponent = React.useCallback(
        ({ row }) => (
            <SubRowAsync
                budgetId={budgetId}
                headerDetails={headerDetails}
                columnsList={columnsList}
                row={row}
            />
        ),
        [budgetId, headerDetails]
    );

    if (step === "LOADING" || bStep === "LOADING") {
        return <YASkeleton variant="dashboard-loading" />;
    }

    const sendBudget = async () => {
        var [err, data] = await fetchRequest.post(`/api/budgets/${budgetId}/submit`);
        if (err) {
            console.error(err)
            // handleError(err);
            showAlert("Error", err.data?.message || "Something went wrong. Contact your administrator.");
        }
        else {
            if (data && data.result === true) {
                showSnackbar(data.message, "success");
                handleClose();
            }
            else {
                showAlert("Error", data.message || "Something went wrong. Contact your administrator.");
            }
        }
    }

    const resetBudget = async () => {
        var [err, data] = await fetchRequest.delete(`/api/budgets/${budgetId}/reset`);
        if (err) {
            console.error(err)
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

    const handleApproveButtonClick = () => {
        showPrompt("Approve Budget", "Are you sure you want to approve the budget?", () => sendBudget());
    }

    const handleResetButtonClick = () => {
        showPrompt("Reset Budget", "Are you sure you want to reset the budget? Resetting a budget will permanently delete all the budget line items.", () => resetBudget());
    }

    const cancelBudget = async (pkId) => {
        const response = await Axios.delete(`${domain}/api/budgets/${pkId}`);
        if (response.data && response.data.result === true) {
            showSnackbar("Budget canceled successfully", "success");
            handleClose();
        }
        else {
            showAlert("Cancel Budget", "Something went wrong. Contact your administrator.");
        }
    }

    const handleCancelButtonClick = () => {
        showPrompt("Cancel Budget", "Are you sure you want to cancel the budget?", () => cancelBudget(budgetId));
    }

    const loadBudget = async () => {
        var [err, data] = await fetchRequest.post(`/api/budgets/${budgetId}/loadintoct`);
        if (err) {
            showAlert("Load Budget", "Something went wrong. Contact your administrator.");
        }
        else {
            if (data && data.result === true)
                showSnackbar(data.message, "success");
            else
                showAlert("Load Budget", "Something went wrong. Contact your administrator.");
        }
    }

    const handleLoadBudgetButtonClick = () => {
        showPrompt("Load Budget", "Are you sure you want to load the budget into CT?", () => loadBudget(budgetId));
    }

    const renderAddButton = () => (
        <MDBox>
            {
                (headerDetails["status"] === "DRAFT" && step !== "EMPTY") && (
                    <MDButton variant="gradient" color="info" onClick={handleSendButtonClick}>Send</MDButton>
                )
            }
            {
                (headerDetails["status"] === "WIP" && bStep !== "EMPTY") && (
                    <MDButton variant="gradient" color="info" onClick={handleApproveButtonClick}>Approve</MDButton>
                )
            }
        </MDBox>
    )

    const getSecondaryActions = () => {
        let actions = [];
        if (headerDetails["status"] === "DRAFT" && step !== "EMPTY")
            actions.push({ label: "Reset Budget", onClick: handleResetButtonClick });
        if (headerDetails["status"] === "DRAFT" || headerDetails["status"] === "WIP")
            actions.push({ label: "Cancel Budget", onClick: handleCancelButtonClick });
        if (headerDetails["status"] === "APPROVED")
            actions.push({ label: "Load Budget into CT", onClick: handleLoadBudgetButtonClick });
        return actions;
    }

    const handleUploadDialogClose = (uploadSuccess) => {
        if (uploadSuccess)
            handleClose();
    };

    const handleImportButtonClick = () => {
        const uploadConfig = {
            uploadType: "budgetDetail",
            yearFilter: headerDetails?.yearNameId,
            pkId: budgetId
        };

        showUploadDialog("Import Budget File", uploadConfig, handleUploadDialogClose);
    }

    const renderOptions = () => (
        <MDBox>
            <MDButton sx={{ mr: 2 }} variant="outlined" color="info" startIcon={<Icon>cloud_upload</Icon>} onClick={handleImportButtonClick}>
                Import File
            </MDButton>
            <MDButton variant="gradient" color="info" startIcon={<Icon>add</Icon>} onClick={handleAddButtonClick}>
                New Budget Item
            </MDButton>
        </MDBox>
    )

    const renderHeader = () => (<BudgetHeader headerDetails={headerDetails} />)

    return (
        <BudgetContext.Provider value={{ monthlyView }}>
            <MDBox bgColor={colors.dashboardBackground} minHeight="calc(100vh - 56px)" paddingBottom={{ lg: 0, md: 6, sm: 6, xs: 6 }}>
            <PageHeader title="Budget Details" subtitle="" />
            <PageHeader headerComponent={renderHeader} primaryActionComponent={renderAddButton} secondaryActions={getSecondaryActions} hideBreadcrumbs={true} noTopPadding={true}/>
            <MDBox p={3} pt={1}>
                {
                    (headerDetails?.status === "DRAFT" || headerDetails?.status === "CANCELED" || headerDetails?.status === "APPROVED") && (
                        <>
                            {
                                step === "LOADED" && (
                                    <MDBox>
                                        <Card sx={{ height: "100%", mt: 1 }} px={0}>
                                            <DataTable
                                                table={{ columns, rows }}
                                                showTotalEntries={true}
                                                isSorted={true}
                                                entriesPerPage={true}
                                                canSearch={true}
                                                primaryActions={addButton}
                                            />
                                        </Card>
                                    </MDBox>
                                )
                            }
                            {
                                step === "EMPTY" && (
                                    <MDBox display="flex" alignItems="center" justifyContent="center" minHeight="calc(100vh - 300px)">
                                        <EmptyState
                                            size="large"
                                            image={new_item_img}
                                            title={headerDetails?.status === "CANCELED" ? "Budget Canceled" : "Start Creating Your Budget Now"}
                                            description={headerDetails?.status === "CANCELED" ? "" : "Click on the 'import file' button to import all the budget data at once or click on the '+ new budget item' button to add individual line items."}
                                            actions={headerDetails?.status === "CANCELED" ? undefined : renderOptions}
                                        />
                                    </MDBox>
                                )
                            }
                        </>
                    )
                }
                {
                    (headerDetails?.status !== "DRAFT" && headerDetails?.status !== "CANCELED" && headerDetails?.status !== "APPROVED") && (
                        <>
                            {
                                bStep === "LOADED" && (
                                    <MDBox>
                                        <Card sx={{ height: "100%", mt: 1 }} px={0}>
                                            <DataTable
                                                table={{ columns: budgetCostCentreListColumns, rows: budgetCostCentreListRows }}
                                                showTotalEntries={true}
                                                isSorted={true}
                                                entriesPerPage={true}
                                                canSearch={true}
                                                primaryActions={addButton1}
                                                renderRowSubComponent={renderRowSubComponent}
                                            />
                                        </Card>
                                    </MDBox>
                                )
                            }
                            {
                                bStep === "EMPTY" && (
                                    <MDBox display="flex" alignItems="center" justifyContent="center" minHeight="calc(100vh - 300px)">
                                        <EmptyState
                                            size="large"
                                            image={no_data_img}
                                            title={"No Data"}
                                        // description={""}
                                        />
                                    </MDBox>
                                )
                            }
                        </>
                    )
                }
            </MDBox>
            </MDBox>
        </BudgetContext.Provider>
    );
};

export default AnimatedRoute(BudgetDetails);