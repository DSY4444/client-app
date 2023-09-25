import MDBox from "components/MDBox";
import DataTable from "components/DataTable";
import MDTypography from "components/MDTypography";
import { Icon, Card } from "@mui/material";
import colors from "assets/theme/base/colors";
import { useEffect, useState } from "react";
import PageHeader from "components/PageHeader";
import AnimatedRoute from "components/AnimatedRoute";
import YASkeleton from "components/YASkeleton";
import fetchRequest from "utils/fetchRequest";
import useHandleError from "hooks/useHandleError";
import { useYADialog } from "components/YADialog";
import EmptyState from "components/EmptyState";
import new_item_img from "assets/svg/add_new.svg";
import MDButton from "components/MDButton";
import moment from "moment";
import BudgetForm from "./components/BudgetForm";
import { Link, useNavigate } from "react-router-dom";
import MDAvatar from "components/MDAvatar";

const buildColumns = () => {
    const columns = [
        {
            Header: "Name", accessor: "name", Cell: ({ cell: { row: { original }, value } }) => {
                return <Link to={`/budget/${original["id"]}/budget-details`}>
                    <MDTypography display="flex" alignItems="center" variant="caption" color="info" fontWeight="medium">{value}</MDTypography>
                </Link>;
            }
        },
        { Header: "Year", accessor: "yearName__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        { Header: "Status", accessor: "statusName", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        { Header: "Created On", accessor: "createdAt", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value ? moment(value).format("MMM DD YYYY") : ""}</MDTypography> } },
        { Header: "Created By", accessor: "createdByUser__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark" display="flex" alignItems="center" justifyContent="flex-start" ><MDAvatar name={value} size="xs" sx={{ mr: .75 }} />{value}</MDTypography> } },
        { Header: "", accessor: "actions", "align": "left", "disableSorting": true }
    ];
    return columns;
}

const buildRows = (data, onEdit) => {
    const rows = [];
    if (Array.isArray(data) && data.length > 0) {
        data.forEach((r) => {
            let row = {};
            Object.keys(r).forEach((k) => {
                row[k.replace(/\./g, "__")] = r[k]
            });
            row["actions"] = (
                (r["status"] === "DRAFT") ?
                    (
                        <MDBox display="flex" alignItems="flex-start" justifyContent="flex-start" mt={{ xs: 2, sm: 0 }}>
                            <MDTypography display="flex" alignItems="center" component="a" href="#" onClick={() => onEdit(row["id"])} variant="caption" color="text" fontWeight="medium">
                                <Icon fontSize="small" >edit</Icon>&nbsp;Edit
                            </MDTypography>
                        </MDBox>
                    ) : undefined
            )
            rows.push(row);
        });
    }
    return rows;
}

const Budget = () => {

    const handleError = useHandleError();
    const { showCustomForm } = useYADialog();
    const [step, setStep] = useState("LOADING");
    const [rows, setRows] = useState([]);
    const columns = buildColumns();
    const [refresh, setRefresh] = useState(null);
    const navigate = useNavigate();

    const handleClose = () => {
        setRefresh(Math.random())
    }

    const handleAddNewClose = (budgetId) => {
        navigate(`/budget/${budgetId}/budget-details`);
    }

    const handleEdit = (pkId) => {
        showCustomForm(`Edit Budget`, () => <BudgetForm onClose={handleClose} mode="edit" pkId={pkId} />, handleClose, "edit", pkId,"sm");
    }

    useEffect(() => {
        async function getList() {
            var [err, data] = await fetchRequest.get(`/api/budgets/list`);
            if (err) {
                handleError(err);
            }
            else {
                if (data && Array.isArray(data) && data.length > 0) {
                    setRows(buildRows(data, handleEdit));
                    setStep("LOADED");
                }
                else {
                    setStep("EMPTY");
                }
            }
        }
        getList();
    }, [refresh])

    const handleAddButtonClick = () => {
        showCustomForm(`New Budget`, () => <BudgetForm onClose={handleAddNewClose} />, null, null, null,'sm',handleClose);
    }

    const renderAddButton = () => (
        <MDButton variant="gradient" color="info" startIcon={<Icon>add</Icon>} onClick={handleAddButtonClick}>
            New Budget
        </MDButton>
    )

    if (step === "LOADING") {
        return <YASkeleton variant="dashboard-loading" />;
    }

    return (
        <>
            <MDBox bgColor={colors.dashboardBackground} minHeight="calc(100vh - 56px)" paddingBottom={{ lg: 0, md: 6, sm: 6, xs: 6 }}>
                <PageHeader title="Budget Management" subtitle="Screen to manage budgets" primaryActionComponent={renderAddButton} />
                <MDBox p={3}>
                {
                    step === "LOADED" && (
                        <Card sx={{ height: "100%" }} px={0}>
                            <DataTable
                                table={{ columns, rows }}
                                showTotalEntries={true}
                                isSorted={true}
                                newStyle1={true}
                                noEndBorder
                                entriesPerPage={true}
                                canSearch={true}
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
                                title={"No Budgets Yet"}
                                description={"Click on the '+ new budget' button to create a new budget."}
                                actions={renderAddButton}
                            />
                        </MDBox>
                    )
                }
                </MDBox>
            </MDBox>
        </>
    );
};

export default AnimatedRoute(Budget);