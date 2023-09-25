import { Card, Modal, Icon, IconButton, Tooltip } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "components/DataTable";
import useFetchRequest from "hooks/useFetchRequest";
import numeral from "numeral";
import YASkeleton from "components/YASkeleton";
import fetchRequest from "utils/fetchRequest";
import { useYADialog } from "components/YADialog";
import moment from "moment";
import MDAvatar from "components/MDAvatar";
import { useAppController } from "context";

const CostPoolDistributionDialog = (props) => {
    const { onClose } = props;

    const handleUploadDialogClose = () => {
        if (onClose) onClose();
    }
    return (
        <Modal open={true} onClose={handleUploadDialogClose}>
            <MDBox p={3} height="100%" width="100%" display="flex" alignItems="center" justifyContent="center">
                <Card sx={{ height: "100%", width: "100%", overflow: 'hidden' }}>
                    <MDBox px={3} pt={2} display="flex" justifyContent="space-between" alignItems="center">
                        <MDBox>
                            <MDTypography variant="h6" component="span" color="text">
                                Tower Rules
                            </MDTypography>
                        </MDBox>
                        <MDBox display="flex">
                            <IconButton onClick={handleUploadDialogClose} title="Close">
                                <Icon>close</Icon>
                            </IconButton>
                        </MDBox>
                    </MDBox>
                    <ShowData {...props} />
                </Card>
            </MDBox>
        </Modal>
    )
}

const ShowData = (props) => {
    const { showAlert, showPrompt, showSnackbar } = useYADialog();
    const { yearFilter, monthFilter, id } = props;
    const { response: uploadedFiles, error: _err, loading: loading, reloadData } = useFetchRequest(`/api/dataflow/towerMapping/${yearFilter}/${monthFilter}?costPoolId=${id}`);
    
    const [controller,] = useAppController();
    const { appDef: { featureSet } } = controller;
    const enableAssetDistribution = featureSet && featureSet.dataManagement?.assetDistribution === true;
    
    const handleDelete = (item) => {
        showPrompt("Delete", "Are you sure you want to delete - [" + item["costPool__name"] + "]", async () => {
            var [err, data] = await fetchRequest.delete(`/api/dataflow/towerMapping/${item["id"]}`)
            if (err) {
                console.error(err)
                showAlert("Delete", "Something went wrong. Contact your administrator.");
            }
            else if (data) {
                showSnackbar(data, "success")
                reloadData()
            }
        })
    }

    const columns = [
        { Header: "Cost Center Code", accessor: "costCentre__code", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        { Header: "Cost Center Name", accessor: "costCentre__description", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        { Header: "Expense Type", accessor: "expenseType__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        { Header: "Cost Pool", accessor: "costPool__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        { Header: "Sub Cost Pool", accessor: "subCostPool__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark" >{value}</MDTypography> } },
        { Header: "Account Code", accessor: "account__code", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        { Header: "Account Description", accessor: "account__description", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        { Header: "Vendor Code", accessor: "vendor__code", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        { Header: "Vendor Name", accessor: "vendor__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        { Header: "Tower", accessor: "tower__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark" fontWeight="medium" >{value}</MDTypography> } },
        { Header: "Sub Tower", accessor: "subTower__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark" fontWeight="medium">{value}</MDTypography> } },
        { Header: "Amount", accessor: "exAmount", align: "right", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{numeral(value).format('$0,0')}</MDTypography> } },
        { Header: "Portion", accessor: "portion", align: "right", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{numeral((value) * 100.0).format('0.0')}%</MDTypography> } },
        { Header: "GL Amount", accessor: "glAmount", align: "right", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{numeral(value).format('$0,0')}</MDTypography> } },
        { Header: "Rule Name", accessor: "ruleName",dataType: "textbox", disableFilters: false, hidden: !enableAssetDistribution, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark" fontWeight="medium">{value}</MDTypography> } },
        { Header: "Tier", accessor: "tier", hidden: !enableAssetDistribution, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark" fontWeight="medium">{value}</MDTypography> } },
        { Header: "Condition", accessor: "condition", hidden: !enableAssetDistribution, Cell: ({ cell: { value } }) => { return (value || "") !== "" ? <Tooltip placement="top" title={value}><Icon fontSize="medium" color="text">info</Icon></Tooltip> : null } },
        { Header: "Destination", accessor: "destinationTable", hidden: !enableAssetDistribution, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        { Header: "Weight", accessor: "weight", hidden: !enableAssetDistribution, Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        { Header: "File", accessor: "uploadedFileTowerMapping__originalFileName", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        { Header: "Created On", accessor: "createdAt", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value ? moment(value).format("MMM DD YYYY") : ""}</MDTypography> } },
        { Header: "Created By", accessor: "createdByUser__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark" display="flex" alignItems="center" justifyContent="flex-start" ><MDAvatar name={value} size="xs" sx={{ mr: .75 }} />{value}</MDTypography> } },
        { Header: "Delete", disableSorting: true, accessor: "id", Cell: ({ row }) => { return <IconButton sx={{padding: 0}} onClick={() => handleDelete(row.values)}><Icon color="error">delete</Icon></IconButton> } },
    ];

    if (loading) return <YASkeleton variant="loading" />

    if (loading === false && uploadedFiles === null) {
        return (
            <div>
                no data
            </div>
        );
    }
    if (_err)
        console.error(_err)
    const rows = uploadedFiles.map((row) => {
        let r = {};
        Object.keys(row).forEach((k) => {
            r[k.replace(/\./g, "__")] = row[k];
        });
        return r;
    });
    return (
        <DataTable
            variant="tile"
            table={{ columns, rows }}
            containerMaxHeight={"calc(100vh - 226px)"}
            showTotalEntries={true}
            isSorted={true}
            newStyle1={true}
            noEndBorder
            entriesPerPage={true}
            canSearch={true}
        >
        </DataTable>
    )
}

export default CostPoolDistributionDialog;