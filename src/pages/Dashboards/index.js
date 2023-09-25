import MDBox from 'components/MDBox';
import DataTable from 'components/DataTable';
import MDTypography from 'components/MDTypography';
import { Icon, Card, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
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
import { useAppController } from 'context';
import MDAvatar from 'components/MDAvatar';
import RowMenu from 'components/RowMenu';
import DashboardForm from './components/DashboardForm';

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

const Dashboards = () => {
    const [step, setStep] = useState('LOADING');
    const handleError = useHandleError();
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [refresh, setRefresh] = useState(null);
    const navigate = useNavigate();
    const [isViewer, setIsViewer] = useState(false);

    const [controller,] = useAppController();
    const { userInfo } = controller;
    // const defaultDateFormat = (settings && settings.dateFormat) || "DD/MM/YYYY";

    const { showAlert, showPrompt, showSnackbar, showCustomForm } = useYADialog();

    const handleClose = () => {
        setRefresh(Math.random());
    };

    const handleCreateOrCopyClose = (returnObj) => {
        if (returnObj && !isNaN(returnObj.dashboardId))
            navigate(`/dashboard/custom/${returnObj.dashboardId}`)
    };

    const handleAddButtonClick = useCallback(
        () => {
            showCustomForm("New Dashboard", () => <DashboardForm onClose={handleCreateOrCopyClose} />, null, null, null, 'sm');
        },
        []
    );

    const handleEdit = (pkId) => {
        showCustomForm("Edit Dashboard", () => <DashboardForm mode="edit" dashboardId={pkId} onClose={handleClose} />, null, null, null, 'sm');
    };

    const handleCopy = (pkId, name) => {
        showCustomForm("Copy Dashboard", () => <DashboardForm mode="copy" dashboardId={pkId} copyText={name} onClose={handleCreateOrCopyClose} />, null, null, null, 'sm');
    };

    const deleteDashboard = async (pkId) => {
        const [err, data] = await fetchRequest.delete(`/api/dashboard/${pkId}`);
        if (err) {
            showAlert('Delete', err?.data?.message || 'Something went wrong. Contact your administrator.');
        }
        else
            if (data && data.result === true) {
                showSnackbar('Dashboard deleted successfully', 'success');
                handleClose();
            }
            else if (data && data.result === false) {
                showAlert('Delete', data.message || 'Something went wrong. Contact your administrator.');
            }
    };

    const handleDeleteSuccess = (pkId) => {
        deleteDashboard(pkId);
    };

    const handleDelete = (pkId) => {
        showPrompt('Delete', 'Are you sure you want to delete?', () => handleDeleteSuccess(pkId));
    };

    const columns = useMemo(() => {
        const cols = [
            {
                Header: "Name", accessor: "displayName", width: 250, Cell: ({ cell: { value, row: { original } } }) => {
                    return <Link to={`/dashboard/custom/${original["id"]}`}><MDTypography
                        display="flex" alignItems="center" variant="caption" color="info" fontWeight="medium"
                        sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                    >{value}</MDTypography></Link>
                }
            },
            {
                Header: "Viewers", accessor: "shared", "disableSorting": true, width: 80,
                Cell: ({ cell: { value } }) => {
                    return <MDTypography display="flex" alignItems="center" variant="caption" color="text">
                        <Icon sx={{ fontSize: "18px!important", marginRight: .5 }}>{value ? "public" : "lock"}</Icon>{value ? "Public" : "Private"}
                    </MDTypography>
                }
            },
            {
                Header: "Editors", accessor: "editable", "disableSorting": true, width: 80,
                Cell: ({ cell: { value } }) => {
                    return <MDTypography display="flex" alignItems="center" variant="caption" color="text">
                        <Icon sx={{ fontSize: "18px!important", marginRight: .5 }}>{value ? "public" : "lock"}</Icon>{value ? "Public" : "Private"}
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
                Header: "Last Modified", accessor: "updatedAt", Cell: ({ cell: { row: { original } } }) => {
                    return <ListItem component="div" sx={theme => auditFieldStyles(theme)}>
                        <ListItemAvatar>
                            <MDAvatar name={original["updatedByUser__name"]} size="xs" sx={{ mr: .75 }} />
                        </ListItemAvatar>
                        <ListItemText primary={original["updatedByUser__name"]} secondary={original["updatedAt"] ? moment(original["updatedAt"]).format("MMM DD YYYY") : ""} />
                    </ListItem>
                }
            },
        ];
        if (!isViewer)
            cols.push({
                Header: "", disableSorting: true, accessor: "id", width: 70, Cell: ({ cell: { row: { original } } }) => {
                    const selfCreated = userInfo?.sub.toLowerCase() === original?.createdBy.toLowerCase();
                    let options = [];
                    if (selfCreated)

                        options.push(...[
                            {
                                label: "Rename or share dashboard", onClick: () => {
                                    handleEdit(original?.id)
                                }
                            },
                            {
                                label: "Copy dashboard", onClick: () => {
                                    handleCopy(original?.id, original?.displayName)
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
                                label: "Copy dashboard", onClick: () => {
                                    handleCopy(original?.id, original?.displayName)
                                }
                            }
                        ]);
                    }

                    return <MDBox onClick={e => e.preventDefault()}>
                        <RowMenu key={original?.name} options={options} />
                    </MDBox>
                }
            });
        return cols;
    }, [isViewer]);

    useEffect(() => {
        async function getList() {
            setLoading(true);
            var [err, data] = await fetchRequest.get(`/api/dashboard/list`);
            if (err) {
                handleError(err);
            } else {
                if (data) {
                    setIsViewer(data.isViewer || false);
                    if (data.list && Array.isArray(data.list) && data.list.length > 0) {
                        setRows(buildRows(data.list));
                    }
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

    const renderPrimaryActions = () => !isViewer ? <MDButton
        variant="gradient"
        color="info"
        startIcon={<Icon>add</Icon>}
        onClick={handleAddButtonClick}
    >
        Add New
    </MDButton> : null;

    const renderAddButton = () => !isViewer ? <MDButton
        variant="gradient"
        color="info"
        startIcon={<Icon>add</Icon>}
        onClick={handleAddButtonClick}
    >
        Add New
    </MDButton> : null;

    if (step === 'LOADING') {
        return <YASkeleton variant="dashboard-loading" />;
    }

    return (
        <>
            <PageHeader
                title={"Dashboards"}
                subtitle={"Manage dashboards"}
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
                            title={`No Dashboard Yet`}
                            description={isViewer ? '' : `Click on the '+ add new' button to add a new dashdoard.`}
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
                                entriesPerPage={true}
                                canSearch={true}
                                newStyle1={true}
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

export default AnimatedRoute(Dashboards);
