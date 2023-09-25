import MDBox from "components/MDBox";
import DataTable from "components/DataTable";
import MDTypography from "components/MDTypography";
import { Card } from "@mui/material";
import { useEffect, useState } from "react";
import PageHeader from "components/PageHeader";
import AnimatedRoute from "components/AnimatedRoute";
import YASkeleton from "components/YASkeleton";
import fetchRequest from "utils/fetchRequest";
import useHandleError from "hooks/useHandleError";
import EmptyState from "components/EmptyState";
import no_data_img from "assets/svg/no_data.svg";
import moment from "moment";
import { Link } from "react-router-dom";
import MDAvatar from "components/MDAvatar";
import colors from "assets/theme/base/colors";

const buildColumns = () => {
    const columns = [
        {
            Header: "Name", accessor: "name", Cell: ({ cell: { row: { original }, value } }) => {
                return original["status"] !== "CANCELED" ?
                    <Link to={`/cost-center-budget/${original["id"]}/budget-details`}>
                        <MDTypography display="flex" alignItems="center" variant="caption" color="info" fontWeight="medium">{value}</MDTypography>
                    </Link> : <MDTypography variant="caption" color="dark">{value}</MDTypography>;
            }
        },
        { Header: "Year", accessor: "yearName__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        { Header: "Status", accessor: "statusName", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        { Header: "Created On", accessor: "createdAt", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value ? moment(value).format("MMM DD YYYY") : ""}</MDTypography> } },
        { Header: "Created By", accessor: "createdByUser__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark" display="flex" alignItems="center" justifyContent="flex-start"><MDAvatar name={value} size="xs" sx={{mr: .75}} />{value}</MDTypography> } },
    ];
    return columns;
}

const buildRows = (data) => {
    const rows = [];
    if (Array.isArray(data) && data.length > 0) {
        data.forEach((r) => {
            let row = {};
            Object.keys(r).forEach((k) => {
                row[k.replace(/\./g, "__")] = r[k]
            });
            rows.push(row);
        });
    }
    return rows;
}

const BudgetList = () => {

    const handleError = useHandleError();
    const [step, setStep] = useState("LOADING");
    const [rows, setRows] = useState([]);
    const columns = buildColumns();

    useEffect(() => {
        async function getList() {
            var [err, data] = await fetchRequest.get(`/api/budgets/budgetList`);
            if (err) {
                handleError(err);
            }
            else {
                if (data && Array.isArray(data) && data.length > 0) {
                    setRows(buildRows(data));
                    setStep("LOADED");
                }
                else {
                    setStep("EMPTY");
                }
            }
        }
        getList();
    }, [])

    if (step === "LOADING") {
        return <YASkeleton variant="dashboard-loading" />;
    }

    return (
        <>
        <MDBox bgColor={colors.dashboardBackground} minHeight="calc(100vh - 56px)" paddingBottom={{ lg: 0, md: 6, sm: 6, xs: 6 }}>
            <PageHeader title="Budget Management" subtitle="Screen to manage budgets" />
            <MDBox p={3} pt={1}>
                {
                    step === "LOADED" && (
                        <Card sx={{ height: "100%" }} px={0}>
                            <DataTable
                                table={{ columns, rows }}
                                showTotalEntries={true}
                                isSorted={true}
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
                                image={no_data_img}
                                title={"No Budgets Assigned"}
                                description={"No budgets have been assigned to you."}
                            />
                        </MDBox>
                    )
                }
            </MDBox>
            </MDBox>
        </>
    );
};

export default AnimatedRoute(BudgetList);