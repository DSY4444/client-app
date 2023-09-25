import MDBox from "components/MDBox";
import DataTable from "components/DataTable";
import MDTypography from "components/MDTypography";
import { Card, Icon, IconButton, Modal } from "@mui/material";
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

const ProcessLogs = () => {

    const buildColumns = () => {
        const columns = [
            { Header: "Type", accessor: "type", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Name", accessor: "name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Status", accessor: "status", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Year", accessor: "yearName__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Month", accessor: "monthName__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Start", accessor: "startDate", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value ? moment(value).format("MMM DD YYYY HH:mm:ss") : ""}</MDTypography> } },
            { Header: "End", accessor: "endDate", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value ? moment(value).format("MMM DD YYYY HH:mm:ss") : ""}</MDTypography> } },
            { Header: "Duration", accessor: "duration", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value ? moment.utc(value).format("mm:ss") : ""}</MDTypography> } },
            { Header: "User", accessor: "createdByUser__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark" display="flex" alignItems="center" justifyContent="flex-start"><MDAvatar name={value} size="xs" sx={{mr: .75}} />{value}</MDTypography> } },
            { Header: "Activities", accessor: "message", Cell: ({ row }) => { return row.values.message !== '[]' && row.values.message !== '' && row.values.message !== '{}' && row.values.message !== null ? <IconButton sx={{ padding: 0, paddingLeft: '8px' }} onClick={() => viewSteps(row.values)}><Icon color="info">fact_check</Icon></IconButton> : '' }, "type": "showonvalue" },
        ];
        return columns;
    }    

    const handleError = useHandleError();
    const [step, setStep] = useState("LOADING");
    const [rows, setRows] = useState([]);
    const [refresh, setRefresh] = useState(Math.random())
    const columns = buildColumns();
    const [openSteps, setOpenSteps] = useState(false);
    const [steps, setSteps] = useState([]);
    const [selectedTab, setSelectedTab] = useState("running")

    const tabStyles = (_theme, { selected }) => ({
        color: selected ? "#435EC3" : "#adadad",
        textTransform: "none",
        backgroundColor: "#F7F8FD",
        "& .MuiButtonBase-root": {
            fontSize: "18px!important",
            transform: "none",
            backgroundColor: "#435EC3",
            
        },
        "&::after": selected ? {
            content: '""',
            position: "absolute",
            bottom: 0,
            height: 4,
            width: "60%",
            borderRadius: "0px",
            backgroundColor: "#435EC3"
        } : {}
    });
    
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
    
    const viewSteps = async (item) => {
        if (item.message) {
            setSteps(JSON.parse(item.message.replace(/'/g, "")))
            setOpenSteps(true)
        }
    }
    
    const handleStepsDialogClose = () => {
        setOpenSteps(false);
    }

    useEffect(() => {
        async function getList() {
            var [err, data] = await fetchRequest.get(`/api/processLogs/${selectedTab}`);
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
    }, [refresh, selectedTab])

    if (step === "LOADING") {
        return <YASkeleton variant="dashboard-loading" />;
    }

    const renderRefreshButton = () => (
        <MDButton data-testid = {"Refresh".toLowerCase().replaceAll(' ', '')} variant="gradient" color="info" startIcon={<Icon>refresh</Icon>} onClick={() => setRefresh(Math.random())}>
            Refresh
        </MDButton>
    )

    return (
        <>
            <PageHeader title="Background Processes" subtitle="Screen to view running background processes or completed today" primaryActionComponent={renderRefreshButton} />
            <MDBox display="flex" width="100%" sx={{ backgroundColor: "#F7F8FD", borderBottom: "1px solid #edeef3", borderTop: "1px solid #e3e3e3", display: "inline-flex" , marginBottom: "10px" }} justifyContent="space-between">
                <MDBox display="flex" position="sticky">
                    <MDButton data-testid = {"RUNNING".toLowerCase().replaceAll(' ', '')} sx={(theme) => tabStyles(theme, { selected: selectedTab === "running" })} onClick={() => {setSelectedTab("running"); }} >
                    <Icon color="dark" fontSize="small" sx={{ transform: "rotate(360deg)", marginRight:"6px" }}>account_balance_wallet</Icon>
                      RUNNING</MDButton>
                    <MDButton data-testid = {"COMPLETED".toLowerCase().replaceAll(' ', '')} sx={(theme) => tabStyles(theme, { selected: selectedTab === "completed" })} onClick={() => {setSelectedTab("completed"); }}>
                    <Icon color="dark" fontSize="small" sx={{ transform: "rotate(360deg)", marginRight:"6px" }}>pie_chart</Icon>
                       COMPLETED</MDButton>
                </MDBox>
            </MDBox>
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
                            {
                openSteps && <StepsDialog rows={steps} onDialogClose={handleStepsDialogClose} />
                            }
                        </Card>
                    )
                }
                {
                    step === "EMPTY" && (
                        <MDBox display="flex" alignItems="center" justifyContent="center" minHeight="calc(100vh - 300px)">
                            <EmptyState
                                size="large"
                                image={no_data_img}
                                title={"No Processes running"}
                                description={"No background process have been recorded."}
                            />
                        </MDBox>
                    )
                }
            </MDBox>
        </>
    );
};

const cols = [
    { Header: "Timestamp", accessor: "timestamp", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value ? moment(value).format("HH:mm:ss") : ""}</MDTypography> } },
    { Header: "Activity", accessor: "message", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
];

const StepsDialog = (props) => {
    const { rows, onDialogClose } = props;
    return (
        <Modal open={true} onClose={onDialogClose}>
            <MDBox p={3} height="100%" width="100%" display="flex" alignItems="center" justifyContent="center">
                <Card sx={{ height: "600px", width: "900px", overflow: 'hidden' }}>
                    <MDBox px={3} pt={2} display="flex" justifyContent="space-between" alignItems="center">
                        <MDBox>
                            <MDTypography variant="h6" component="span" color="text">
                                Completed Activities
                            </MDTypography>
                        </MDBox>
                        <MDBox display="flex">
                            <IconButton onClick={onDialogClose} title="Close">
                                <Icon>close</Icon>
                            </IconButton>
                        </MDBox>
                    </MDBox>
                    <DataTable
                        variant="tile"
                        table={{ columns: cols, rows }}
                        containerMaxHeight={392}
                        showTotalEntries={true}
                        isSorted={true}
                        noEndBorder
                        entriesPerPage={true}
                        canSearch={false}
                    >
                    </DataTable>
                </Card>
            </MDBox>
        </Modal>
    );
};

export default AnimatedRoute(ProcessLogs);