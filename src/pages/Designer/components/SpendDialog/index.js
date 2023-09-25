import { Card, Modal, Icon, IconButton } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "components/DataTable";
import useFetchRequest from "hooks/useFetchRequest";
import numeral from "numeral";
import YASkeleton from "components/YASkeleton";
import moment from "moment";
import MDAvatar from "components/MDAvatar";
import { normalizeCurrency } from "utils/table";

const SpendDialog = (props) => {
    const { onClose, yearFilterName, monthFilterName, typeFilter } = props;

    const handleDialogClose = () => {
        if (onClose) onClose();
    }

    return (
        <Modal open={true} onClose={handleDialogClose}>
            <MDBox p={3} height="100%" width="100%" display="flex" alignItems="center" justifyContent="center">
                <Card sx={{ height: "100%", width: "100%", overflow: 'hidden' }}>
                    <MDBox px={3} pt={2} display="flex" justifyContent="space-between" alignItems="center">
                        <MDBox>
                            <MDTypography variant="h6" component="span" color="text">
                                {typeFilter == "Capabilities" ? "Asset Mapping" : typeFilter=="Solution" ? "Asset to Solution Mapping" : typeFilter == "Business Unit" ? "Solution to BU Mapping" : typeFilter} For {monthFilterName} {yearFilterName}
                            </MDTypography>
                        </MDBox>
                        <MDBox display="flex">
                            <IconButton onClick={handleDialogClose} title="Close">
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
    const { yearFilter, monthFilter, typeFilter } = props;
    const { response: data, error: _err, loading: loading } = useFetchRequest(`/api/dataflow/${typeFilter.toLowerCase().replace(' ','')}/${yearFilter}/${monthFilter}`)


    let columns = []
    if (typeFilter === "Spend") 
        columns = [
            { Header: "Transaction Date", accessor: "transactionDate", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value ? moment(value).format("DD/MM/YYYY") : ""}</MDTypography> } },
            { Header: "Journal ID", accessor: "journalID", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Account Code", accessor: "account__code", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Account Description", accessor: "account__description", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Expense Type", accessor: "expenseType__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Cost Center Code", accessor: "costCentre__code", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Cost Center Name", accessor: "costCentre__description", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Vendor Code", accessor: "vendor__code", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Vendor Name", accessor: "vendor__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Amount", accessor: "amount", align: "right", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{numeral(normalizeCurrency(value)).format('$0,0')}</MDTypography> } },
            { Header: "Journal Line", accessor: "journalLine", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Project ID", accessor: "projectID", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Application ID", accessor: "applicationID", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Invoice", accessor: "invoice", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "File", accessor: "uploadedFile__originalFileName", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Created On", accessor: "createdAt", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value ? moment(value).format("MMM DD YYYY") : ""}</MDTypography> } },
            { Header: "Created By", accessor: "createdByUser__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark" display="flex" alignItems="center" justifyContent="flex-start" ><MDAvatar name={value} size="xs" sx={{ mr: .75 }} />{value}</MDTypography> } },
        ]
    else if(typeFilter=="Budget")
        columns = [
            { Header: "Account Code", accessor: "account__code", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Account Description", accessor: "account__description", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Expense Type", accessor: "expenseType__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Cost Center Code", accessor: "costCentre__code", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Cost Center Name", accessor: "costCentre__description", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Vendor Code", accessor: "vendor__code", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Vendor Name", accessor: "vendor__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Amount", accessor: "amount", align: "right", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{numeral(normalizeCurrency(value)).format('$0,0')}</MDTypography> } },
            { Header: "Project ID", accessor: "projectID", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Application ID", accessor: "applicationID", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "File", accessor: "uploadedFile__originalFileName", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Created On", accessor: "createdAt", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value ? moment(value).format("MMM DD YYYY") : ""}</MDTypography> } },
            { Header: "Created By", accessor: "createdByUser__name", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark" display="flex" alignItems="center" justifyContent="flex-start" ><MDAvatar name={value} size="xs" sx={{ mr: .75 }} />{value}</MDTypography> } },
        ]

    else if(typeFilter=="Solution")
        columns = [
            { Header: "Capability Code", accessor: "capabilityCode", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Capability Name", accessor: "applicationName", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Offering Code", accessor: "offeringCode", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Offering Name", accessor: "offeringName", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Portion", accessor: "portion", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Amount", accessor: "spend", align: "right", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{numeral(normalizeCurrency(value)).format('$0,0')}</MDTypography> } },
        ]
    else if(typeFilter=="Capabilities")
        columns = [
            { Header: "File", accessor: "originalFileName",dataType: "textbox", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "From Asset", accessor: "fromAsset",dataType: "textbox", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Code", accessor: "fromCode",dataType: "textbox", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "To Asset", accessor: "toAsset",dataType: "textbox", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Code", accessor: "toCode",dataType: "textbox", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Portion", accessor: "portion",dataType: "textbox", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "From Amount", accessor: "amount",dataType: "currency",align:"right", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{numeral(normalizeCurrency(value)).format('$0,0.00')}</MDTypography> } },
            { Header: "To Amount", accessor: "spend",dataType: "currency",align:"right", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{numeral(normalizeCurrency(value)).format('$0,0.00')}</MDTypography> } },
        ]
    else if(typeFilter=="Business Unit")
        columns = [
            { Header: "Business Unit Code", accessor: "businessUnitCode",dataType: "textbox", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Solution Offering Code", accessor: "solutionOfferingCode",dataType: "textbox", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
            { Header: "Usage", accessor: "usage",dataType: "textbox", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
        ]
    if (loading) return <YASkeleton variant="loading" />

    if (loading === false && data === null) {
        return (
            <div>
                {_err}
                no data
            </div>
        );
    }
    const rows = data.map((row) => {
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
            canFilter = {typeFilter == true}
        >
        </DataTable>
    )
}

export default SpendDialog;