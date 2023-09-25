import MDBox from "components/MDBox";
import DataTable from "components/DataTable";
import MDTypography from "components/MDTypography";
import { Card, Icon } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeader from "components/PageHeader";
import AnimatedRoute from "components/AnimatedRoute";
import YASkeleton from "components/YASkeleton";
import fetchRequest from "utils/fetchRequest";
import useHandleError from "hooks/useHandleError";
import { useYADialog } from "components/YADialog";
import MetricForm from "./MetricForm";
import MDButton from "components/MDButton";
import RowMenu from "components/RowMenu";
import EmptyState from "components/EmptyState";
import new_item_img from 'assets/svg/add_new.svg';

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

const Metrics = () => {
    const [step, setStep] = useState('LOADING');
    const handleError = useHandleError();
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [refresh, setRefresh] = useState(null);

    useEffect(() => {
        async function getList() {
            var [err, data] = await fetchRequest.get(`/api/metric/list`);
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
        showCustomForm("Edit Metric", () => <MetricForm mode="edit" metricId={pkId} onClose={handleClose} />, null, null, null, 'md');
    };

    const handleDelete = (pkId) => {
        showPrompt('Delete', 'Are you sure you want to delete?', async () => {
            const [err, data] = await fetchRequest.delete(`/api/metric/${pkId}`);
            if (err) {
                showAlert('Delete', err?.data?.message || 'Something went wrong. Contact your administrator.');
            }
            else
                if (data && data.result === true) {
                    showSnackbar('Metric deleted successfully', 'success');
                    handleClose();
                }
                else if (data && data.result === false) {
                    showAlert('Delete', data.message || 'Something went wrong. Contact your administrator.');
                }
        });
    };

    const handleAddButtonClick = useCallback(
        () => {
            showCustomForm("New Metric", () => <MetricForm onClose={handleClose} />, null, null, null, 'md');
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
            "Header": "Data Type",
            "accessor": "type",
            "Cell": ({ cell: { value } }) => {
                return <MDTypography variant="caption" color="dark">
                    {value}
                </MDTypography>
            }
        },
        {
            "Header": "Active",
            "accessor": "active",
            "Cell": ({ cell: { value } }) => {
                return <MDTypography variant="caption" color="dark">
                    {value === true ? "Yes" : "No"}
                </MDTypography>
            }
        },
        {
            Header: "", disableSorting: true, accessor: "id", width: 70, Cell: ({ cell: { value } }) => {
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
            <PageHeader title="Metrics" subtitle="List of prescribed metrics" primaryActionComponent={renderPrimaryActions} />
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
                            title={`No Metrics Yet`}
                            description={`Click on the '+ add new' button to add a new metric.`}
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

export default AnimatedRoute(Metrics);