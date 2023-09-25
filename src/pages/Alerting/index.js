import MDBox from 'components/MDBox';
import DataTable from 'components/DataTable';
import MDTypography from 'components/MDTypography';
import { Icon, Card, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import fetchRequest from 'utils/fetchRequest';
import MDButton from 'components/MDButton';
import { useYADialog } from 'components/YADialog';
import PageHeader from 'components/PageHeader';
import AnimatedRoute from 'components/AnimatedRoute';
import YASkeleton from 'components/YASkeleton';
import EmptyState from 'components/EmptyState';
import new_item_img from 'assets/svg/add_new.svg';
import useHandleError from 'hooks/useHandleError';
import moment from 'moment';
import MDAvatar from 'components/MDAvatar';
import RowMenu from 'components/RowMenu';
import MDBadge from "components/MDBadge";
import AlertForm from './components/AlertForm';

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
                row[k.replace(/\./g, '__')] = r[k];
            });
            rows.push(row);
        });
    }
    return rows;
};

const Alerting = () => {
    const [step, setStep] = useState('LOADING');
    const handleError = useHandleError();
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    // const [dialogConfig, setDialogConfig] = useImmer({ mode: 'ADD', alertId: null });
    const [refresh, setRefresh] = useState(null);

    // const defaultDateFormat = (settings && settings.dateFormat) || "DD/MM/YYYY";

    const { showAlert, showPrompt, showSnackbar, showCustomForm } = useYADialog();

    const handleClose = () => {
        setRefresh(Math.random());
    };

    // const handleOnDialogClose = useCallback((alertId) => {
    //     setDialogConfig(draft => {
    //         draft.open = false;
    //         draft.alertId = null;
    //     });
    //     if (alertId)
    //         setRefresh(Math.random());
    // }, []);

    // const handleAddButtonClick = useCallback(
    //     () => {
    //         setDialogConfig({ mode: 'ADD', open: true, alertId: null });
    //     },
    //     []
    // );

    const handleAddButtonClick = useCallback(
        () => {
            showCustomForm("New Alert", () => <AlertForm onClose={handleClose} />, null, null, null, 'sm');
        },
        []
    );

    const handleEdit = (pkId) => {
        showCustomForm("Edit Alert", () => <AlertForm mode="edit" alertId={pkId} onClose={handleClose} />, null, null, null, 'sm');
    };

    const handleDelete = (pkId) => {
        showPrompt('Delete', 'Are you sure you want to delete?', async () => {
            const [err, data] = await fetchRequest.delete(`/api/alert/${pkId}`);
            if (err) {
                showAlert('Delete', err?.data?.message || 'Something went wrong. Contact your administrator.');
            }
            else
                if (data && data.result === true) {
                    showSnackbar('Alert deleted successfully', 'success');
                    handleClose();
                }
                else if (data && data.result === false) {
                    showAlert('Delete', data.message || 'Something went wrong. Contact your administrator.');
                }
        });
    };

    const handleActivate = (pkId) => {
        showPrompt('Activate', 'Are you sure you want to activate the alert?', async () => {
            const [err, data] = await fetchRequest.post(`/api/alert/${pkId}/activate`);
            if (err) {
                showAlert('Activate', err?.data?.message || 'Something went wrong. Contact your administrator.');
            }
            else
                if (data && data.result === true) {
                    showSnackbar('Alert activated successfully', 'success');
                    handleClose();
                }
                else if (data && data.result === false) {
                    showAlert('Activate', data.message || 'Something went wrong. Contact your administrator.');
                }
        });
    };

    const handleDeactivate = (pkId) => {
        showPrompt('Deactivate', 'Are you sure you want to deactivate the alert?', async () => {
            const [err, data] = await fetchRequest.post(`/api/alert/${pkId}/deactivate`);
            if (err) {
                showAlert('Deactivate', err?.data?.message || 'Something went wrong. Contact your administrator.');
            }
            else
                if (data && data.result === true) {
                    showSnackbar('Alert deactivated successfully', 'success');
                    handleClose();
                }
                else if (data && data.result === false) {
                    showAlert('Deactivate', data.message || 'Something went wrong. Contact your administrator.');
                }
        });
    };

    const columns = useMemo(() => ([
        {
            Header: "Name", accessor: "name", width: 500, Cell: ({ cell: { value, row: { original } } }) => {
                return <Link to={`/alerting/${original["id"]}/alert-details`}><MDTypography
                    display="flex" alignItems="center" variant="caption" color="info" fontWeight="medium"
                    sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                >{value}</MDTypography>
                    <MDTypography mt={.25} display="flex" alignItems="center" variant="caption" whiteSpace="pre-wrap">{original?.desc}</MDTypography>
                </Link>
            }
        },
        // {
        //     Header: "Description", accessor: "desc", width: 250, Cell: ({ cell: { value } }) => {
        //         return <MDTypography display="flex" alignItems="center" variant="caption">{value}</MDTypography>
        //     }
        // },
        {
            Header: "Metric Name", accessor: "metric__name", width: 250, Cell: ({ cell: { value } }) => {
                return <MDTypography display="flex" alignItems="center" variant="caption">{value}</MDTypography>
            }
        },
        {
            Header: "Type", accessor: "type", Cell: ({ cell: { value } }) => {
                return <MDTypography display="flex" alignItems="center" variant="caption">{value}</MDTypography>
            }
        },
        // {
        //     Header: "Triggers On", accessor: "type", Cell: ({ cell: { value, row: { original } } }) => {
        //         let description = ''
        //         if (value === "SCHEDULE") {
        //             if (original["triggerCronExpression"])
        //                 description = parseCronExpression(original["triggerCronExpression"])
        //         }
        //         else {
        //             description = `On ${original["triggerEvent"]} event`;
        //         }
        //         return <>
        //             {/* <MDTypography display="flex" alignItems="center" variant="caption">{value}</MDTypography> */}
        //             <MDTypography mt={.5} display="flex" alignItems="center" variant="caption">{description}</MDTypography>
        //         </>
        //     }
        // },
        // {
        //     Header: "Trigger Condition", accessor: "triggerConditionType", Cell: ({ cell: { value, row: { original } } }) => {
        //         let description = ''
        //         if (value === "THRESHOLD") {
        //             if (original["thresholdPosition"] === "ABOVE_THRESHOLD")
        //                 description = `Metric value is above ${formatAlertMetricValue(original["thresholdValue"], original["metric__type"])}`
        //             else
        //                 description = `Metric value is below ${formatAlertMetricValue(original["thresholdValue"], original["metric__type"])}`
        //         }
        //         else {
        //             description = `Metric value is null or empty`;
        //         }
        //         return <>
        //             {/* <MDTypography display="flex" alignItems="center" variant="caption">{value}</MDTypography> */}
        //             <MDTypography mt={.5} display="flex" alignItems="center" variant="caption">{description}</MDTypography>
        //         </>
        //     }
        // },
        {
            Header: "Last Run", accessor: "lastRunAt", Cell: ({ cell: { value } }) => {
                return <MDTypography variant="caption" color="dark">{value ? moment(value).fromNow() : ""}</MDTypography>
            }
        },
        {
            Header: "Last Run Status", accessor: "lastRunStatus", Cell: ({ cell: { value } }) => {
                if ((value || "") === "")
                    return <MDTypography variant="caption"></MDTypography>
                return <MDBadge container badgeContent={value} color={value.toLowerCase()} variant="gradient" size="xs" />
            }
        },
        {
            Header: "Active", accessor: "active", Cell: ({ cell: { value } }) => {
                return <MDTypography variant="caption" color="dark">{value === true ? "Yes" : "No"}</MDTypography>
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
            Header: "", disableSorting: true, accessor: "id", width: 70, Cell: ({ cell: { row: { original } } }) => {
                let options = [];
                if (original?.active)

                    options.push(...[
                        {
                            label: "Deactivate", onClick: () => {
                                handleDeactivate(original?.id)
                            }
                        },
                        {
                            label: "Delete", onClick: () => {
                                handleDelete(original?.id)
                            }
                        }
                    ]);
                else {
                    options.push(...[
                        {
                            label: "Edit", onClick: () => {
                                handleEdit(original?.id)
                            }
                        },
                        {
                            label: "Activate", onClick: () => {
                                handleActivate(original?.id)
                            }
                        },
                        {
                            label: "Delete", onClick: () => {
                                handleDelete(original?.id)
                            }
                        }
                    ]);
                }

                return <MDBox onClick={e => e.preventDefault()}>
                    <RowMenu key={original?.name} options={options} />
                </MDBox>
            }
        },
    ]), []);

    useEffect(() => {
        async function getList() {
            setLoading(true);
            var [err, data] = await fetchRequest.get(`/api/alert/list`);
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
    }, [refresh]);

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

    if (step === 'LOADING') {
        return <YASkeleton variant="dashboard-loading" />;
    }

    return (
        <>
            <PageHeader
                title={"Alerting"}
                subtitle={"Manage alerts"}
                primaryActionComponent={renderPrimaryActions}
            />
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
                            title={`No Alerts Yet`}
                            description={`Click on the '+ add new' button to add a new alert.`}
                            actions={renderAddButton}
                        />
                    </MDBox>
                )}
                {step === 'LOADED' &&
                    <>
                        <Card sx={{ height: '100%' }} px={0}>
                            <DataTable
                                table={{ columns, rows }}
                                showTotalEntries={true}
                                isSorted={true}
                                noEndBorder
                                newStyle1={true}
                                entriesPerPage={true}
                                canSearch={true}
                                // canFilter={true}
                                loading={loading}
                            />
                        </Card>
                    </>
                }

            </MDBox>
        </>
    );
};

export default AnimatedRoute(Alerting);
