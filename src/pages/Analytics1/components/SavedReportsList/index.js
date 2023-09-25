import { Icon, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import MDBox from "components/MDBox";
import { useCallback, useContext, useEffect, useMemo } from "react";
import DataTable from "components/DataTable";
import useFetchRequest from "hooks/useFetchRequest";
import YASkeleton from "components/YASkeleton";
import MDTypography from "components/MDTypography";
import fetchRequest from "utils/fetchRequest";
import { useYADialog } from "components/YADialog";
import { YADialogCustomFormContext } from "components/YADialogCustomForm";
import SavedReportForm from "../SavedReportForm";
import MDAvatar from "components/MDAvatar";
import moment from "moment";
import RowMenu from "components/RowMenu";
import EmptyState from "components/EmptyState";
import { useAppController } from "context";
import { chartTypeIcons } from "utils/charts";
import { parseJsonString } from "utils";

const auditFieldStyles = ({ typography: { size } }) => ({
    "& .MuiListItemText-primary, & .MuiListItemText-secondary": {
        fontSize: size.xs,
        lineHeight: size.sm
    },
    "& .MuiListItemAvatar-root": {
        minWidth: "inherit",
        mr: .5
    }
})

const SavedReportsList = (props) => {
    const { cubeId, onOpenReport } = props;
    const [controller] = useAppController();
    const { userInfo } = controller;
    const { showSnackbar, showCustomForm, showAlert, showPrompt } = useYADialog();
    const { onDialogClose } = useContext(YADialogCustomFormContext);
    const { response: savedReports, error: cubeFetchErr, loading, reloadData } = useFetchRequest(`/api/cube/${cubeId}/report/list`);

    useEffect(() => {
        if (cubeFetchErr) {
            console.error(cubeFetchErr)
            // handleError(cubeFetchErr);
        }
    }, [savedReports, cubeFetchErr]);

    const handleDelete = useCallback((pkId, reportName) => {
        showPrompt("Delete", `Are you sure you want to delete [${reportName}]?`, async () => {
            const [error, data] = await fetchRequest.delete(`/api/cube/report/${pkId}`);
            if (data && data.result === true) {
                showSnackbar(data.message, "success");
                reloadData();
            }
            else {
                console.error(error);
                showAlert("Delete", "Something went wrong. Contact your administrator.");
            }
        });
    },
        [cubeId]
    );


    const handleEdit = useCallback(
        (reportId) => {
            showCustomForm("Edit Report", () => <SavedReportForm mode="edit" cubeId={cubeId} reportId={reportId} onClose={reloadData} />, null, null, null, 'sm');
        },
        [cubeId, reloadData]
    );

    const columns = useMemo(() => ([
        {
            Header: "Name", accessor: "name", width: 250, Cell: ({ cell: { value, row: { original } } }) => {
                const parsedWidgetConfig = parseJsonString(original?.query);
                const iconType = chartTypeIcons[parsedWidgetConfig?.chartType] || { icon: "dashboard_customize" };
                return <MDBox display="flex" alignItems="center">
                    <Icon fontSize="medium" color="info" sx={{ transform: iconType.rotate ? "rotateZ(90deg)" : "none" }}>{iconType.icon}</Icon>
                    <MDTypography
                        display="flex" alignItems="center" variant="caption" color="info" fontWeight="medium" whiteSpace="normal"
                        sx={{ ml: .75, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                        onClick={() => {
                            onOpenReport({ reportId: original?.id, reportName: original?.name, query: original?.query });
                            onDialogClose();
                        }}
                    >{value}</MDTypography>
                </MDBox>
            }
        },
        { Header: "Shared", accessor: "shared", "disableSorting": true, width: 80, Cell: ({ cell: { value } }) => { return value ? <Icon color="success" sx={{ fontSize: "18px!important" }}>check_circle</Icon> : <span></span> } },
        {
            Header: "Created", accessor: "createdAt", Cell: ({ cell: { row: { original } } }) => {
                return <ListItem component="div" sx={theme => auditFieldStyles(theme)}>
                    <ListItemAvatar>
                        <MDAvatar name={original["createdByUser.name"]} size="xs" sx={{ mr: .75 }} />
                    </ListItemAvatar>
                    <ListItemText primary={original["createdByUser.name"]} secondary={original["createdAt"] ? moment(original["createdAt"]).format("MMM DD YYYY") : ""} />
                </ListItem>
            }
        },
        {
            Header: "Modified", accessor: "updatedAt", Cell: ({ cell: { row: { original } } }) => {
                return <ListItem component="div" sx={theme => auditFieldStyles(theme)}>
                    <ListItemAvatar>
                        <MDAvatar name={original["updatedByUser.name"]} size="xs" sx={{ mr: .75 }} />
                    </ListItemAvatar>
                    <ListItemText primary={original["updatedByUser.name"]} secondary={original["updatedAt"] ? moment(original["updatedAt"]).format("MMM DD YYYY") : ""} />
                </ListItem>
            }
        },
        {
            Header: "", disableSorting: true, accessor: "query", width: 70, Cell: ({ cell: { row: { original } } }) => {
                const selfCreated = userInfo?.sub.toLowerCase() === original?.createdBy.toLowerCase();
                let options = [{
                    label: "Open Report", onClick: () => {
                        onOpenReport({ reportId: original?.id, reportName: original?.name, query: original?.query });
                        onDialogClose();
                    }
                }];
                if (selfCreated)

                    options.push(...[
                        {
                            label: "Rename or Share", onClick: () => {
                                handleEdit(original?.id)
                            }
                        },
                        {
                            label: "Delete", onClick: () => {
                                handleDelete(original?.id, original?.name)
                            }
                        }
                    ]);

                return <MDBox onClick={e => e.preventDefault()}>
                    <RowMenu key={original?.name} options={options} />
                </MDBox>
            }
        },
    ]), []);


    if (loading) {
        return <MDBox minWidth={700} minHeight={400} display="flex" alignItems="center" justifyContent="center">
            <YASkeleton variant="loading" />
        </MDBox>
    }

    if (!savedReports || savedReports?.length === 0) {
        return <MDBox minWidth={700} minHeight={400} display="flex" alignItems="center" justifyContent="center">
            <EmptyState
                size="medium"
                variant="secondary"
                iconName="description"
                description={"No Saved Reports Found"}
            />
        </MDBox>
    }

    return (
        <MDBox minWidth={700}>
            <DataTable
                variant="tile"
                table={{ columns, rows: savedReports || [] }}
                containerMaxHeight={400}
                showTotalEntries={true}
                isSorted={true}
                entriesPerPage={true}
                canSearch={false}
            >
            </DataTable>
        </MDBox>
    );
};

export default SavedReportsList;