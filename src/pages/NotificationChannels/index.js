import MDBox from "components/MDBox";
import DataTable from "components/DataTable";
import MDTypography from "components/MDTypography";
import { Card, Icon, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeader from "components/PageHeader";
import AnimatedRoute from "components/AnimatedRoute";
import YASkeleton from "components/YASkeleton";
import fetchRequest from "utils/fetchRequest";
import useHandleError from "hooks/useHandleError";
import MDAvatar from "components/MDAvatar";
import moment from "moment";
import NotificationChannelForm from "./NotificationChannelForm";
import { useYADialog } from "components/YADialog";
import MDButton from "components/MDButton";
import RowMenu from "components/RowMenu";
import new_item_img from 'assets/svg/add_new.svg';
import EmptyState from "components/EmptyState";

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

const NotificationChannels = () => {
    const [step, setStep] = useState('LOADING');
    const handleError = useHandleError();
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [refresh, setRefresh] = useState(null);

    useEffect(() => {
        async function getList() {
            var [err, data] = await fetchRequest.get(`/api/notificationChannel/list`);
            if (err) {
                handleError(err);
            } else {
                if (data && Array.isArray(data) && data.length > 0) {
                    setRows(buildRows(data));
                    setStep('LOADED');
                } else {
                    setRows([]);
                    setStep('EMPTY');
                }
            }
            setLoading(false);
        }
        getList();
    }, [refresh])

    const { showAlert, showPrompt, showSnackbar, showCustomForm } = useYADialog();

    const handleClose = () => {
        setRefresh(Math.random());
    };

    const handleEdit = (pkId) => {
        showCustomForm("Edit Notification Channel", () => <NotificationChannelForm mode="edit" notificationChannelId={pkId} onClose={handleClose} />, null, null, null, 'md');
    };

    const handleDelete = (pkId) => {
        showPrompt('Delete', 'Are you sure you want to delete?', async () => {
            const [err, data] = await fetchRequest.delete(`/api/notificationChannel/${pkId}`);
            if (err) {
                showAlert('Delete', err?.data?.message || 'Something went wrong. Contact your administrator.');
            }
            else
                if (data && data.result === true) {
                    showSnackbar('Notification Channel deleted successfully', 'success');
                    handleClose();
                }
                else if (data && data.result === false) {
                    showAlert('Delete', data.message || 'Something went wrong. Contact your administrator.');
                }
        });
    };

    const handleAddButtonClick = useCallback(
        () => {
            showCustomForm("New Notification Channel", () => <NotificationChannelForm onClose={handleClose} />, null, null, null, 'md');
        },
        []
    );

    const columns = useMemo(() => ([
        {
            "Header": "Name",
            "accessor": "name",
            "Cell": ({ cell: { value } }) => {
                return <MDTypography variant="caption" color="dark">
                    {value}
                </MDTypography>
            }
        },
        {
            "Header": "Description",
            "accessor": "desc",
            "Cell": ({ cell: { value } }) => {
                return <MDTypography variant="caption" color="dark">
                    {value}
                </MDTypography>
            }
        },
        {
            "Header": "Type",
            "accessor": "type",
            "Cell": ({ cell: { value } }) => {
                return <MDTypography variant="caption" color="dark">
                    {value}
                </MDTypography>
            }
        },
        {
            "Header": "Enabled",
            "accessor": "enabled",
            "Cell": ({ cell: { value } }) => {
                return <MDTypography variant="caption" color="dark">
                    {value === true ? "Yes" : "No"}
                </MDTypography>
            }
        },
        {
            Header: "Created", accessor: "createdAt", Cell: ({ cell: { row: { original } } }) => {
                return <ListItem component="div" sx={theme => auditFieldStyles(theme)}>
                    <ListItemAvatar>
                        <MDAvatar name={original["createdByUser__name"]} size="xs" sx={{ mr: .75 }} />
                    </ListItemAvatar>
                    <ListItemText primary={original["createdByUser__name"]} secondary={original["createdAt"] ? moment(original["createdAt"]).format("MMM DD YYYY") : ""} />
                </ListItem>
            }
        },
        {
            Header: "", disableSorting: true, accessor: "id", width: 70, Cell: ({ cell: { value } }) => {
                console.log(value)
                let options = [];
                options.push(...[
                    {
                        label: "Edit", onClick: () => {
                            handleEdit(value)
                        }
                    }
                ]);
                options.push(...[
                    {
                        label: "Delete", onClick: () => {
                            handleDelete(value)
                        }
                    }
                ]);

                return <MDBox onClick={e => e.preventDefault()}>
                    <RowMenu options={options} />
                </MDBox>
            }
        },
    ]), [])

    if (loading) {
        return <YASkeleton variant="dashboard-loading" />;
    }

    if (loading === false && !rows) {
        return (
            <div>
                no data
            </div>
        );
    }

    const renderPrimaryActions = () => <MDButton
        variant="gradient"
        color="info"
        startIcon={<Icon>add</Icon>}
        onClick={handleAddButtonClick}
    >
        Add New
    </MDButton>

    const renderAddButton = () => <MDButton
        variant="gradient"
        color="info"
        startIcon={<Icon>add</Icon>}
        onClick={handleAddButtonClick}
    >
        Add New
    </MDButton>

    return (
        <>
            <PageHeader title="Notification Channels" subtitle="Manage notification Channels" primaryActionComponent={renderPrimaryActions} />
            <MDBox p={3} pt={1}>
                {step === 'EMPTY' && (
                    <MDBox
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        minHeight="calc(100vh - 300px)"
                    >
                        <EmptyState
                            size="large"
                            image={new_item_img}
                            title={`No Channels Yet`}
                            description={`Click on the '+ add new' button to add a new notification channel.`}
                            actions={renderAddButton}
                        />
                    </MDBox>
                )}
                {step === 'LOADED' &&
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
                }
            </MDBox>
        </>
    );
};

export default AnimatedRoute(NotificationChannels);