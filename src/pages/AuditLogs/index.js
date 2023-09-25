import MDBox from "components/MDBox";
import DataTable from "components/DataTable";
import MDTypography from "components/MDTypography";
import { Card, Icon } from "@mui/material";
import { useEffect, useState } from "react";
import PageHeader from "components/PageHeader";
import AnimatedRoute from "components/AnimatedRoute";
import YASkeleton from "components/YASkeleton";
import fetchRequest from "utils/fetchRequest";
import useHandleError from "hooks/useHandleError";
import EmptyState from "components/EmptyState";
import no_data_img from "assets/svg/no_data.svg";
import moment from "moment";
import MDAvatar from "components/MDAvatar";
import MDButton from "components/MDButton";

const buildColumns = () => {
    const columns = [
        { Header: "Timestamp", accessor: "timestamp", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value ? moment(value).format("MMM DD YYYY HH:mm:ss") : ""}</MDTypography> } },
        { Header: "Message", accessor: "message", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        // { Header: "Created By", accessor: "userId", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark" display="flex" alignItems="center" justifyContent="flex-start"><MDAvatar name={value} size="xs" sx={{mr: .75}} />{value}</MDTypography> } },
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

const AuditLogs = () => {

    const handleError = useHandleError();
    const [step, setStep] = useState("LOADING");
    const [rows, setRows] = useState([]);
    const [refresh, setRefresh] = useState(Math.random())
    const columns = buildColumns();

    useEffect(() => {
        async function getList() {
            var [err, data] = await fetchRequest.get(`/api/auditLogs/list`);
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
    }, [refresh])

    if (step === "LOADING") {
        return <YASkeleton variant="dashboard-loading" />;
    }

    const renderRefreshButton = () => (
        <MDButton variant="gradient" color="info" startIcon={<Icon>refresh</Icon>} onClick={() => setRefresh(Math.random())}>
            Refresh
        </MDButton>
    )

    return (
        <>
            <PageHeader title="Audit Logs" subtitle="Screen to view audit logs" primaryActionComponent={renderRefreshButton} />
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
                                canFilter={true}
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
                                title={"No Audit Logs"}
                                description={"No audit logs have been recorded."}
                            />
                        </MDBox>
                    )
                }
            </MDBox>
        </>
    );
};

export default AnimatedRoute(AuditLogs);