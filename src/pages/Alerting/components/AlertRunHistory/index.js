import MDBox from "components/MDBox";
import { useMemo } from "react";
import DataTable from "components/DataTable";
import useFetchRequest from "hooks/useFetchRequest";
import YASkeleton from "components/YASkeleton";
import MDTypography from "components/MDTypography";
import moment from "moment";
import EmptyState from "components/EmptyState";
import MDBadge from "components/MDBadge";

const AlertRunHistory = (props) => {
    const { alertId } = props;
    const { response: alertHistory, loading } = useFetchRequest(`/api/alert/alertHistory/${alertId}`);

    const columns = useMemo(() => ([
        {
            Header: "Last Run Status", accessor: "status", width: 250, Cell: ({ cell: { value} }) => {
                if ((value || "") === "")
                    return <MDTypography variant="caption"></MDTypography>
                return <MDBadge container badgeContent={value} color={value.toLowerCase()} variant="gradient" size="xs" />
            }
        },
        {
            Header: "Last Run", accessor: "createdAt", width: 250, Cell: ({ cell: { value } }) => {
                return <MDTypography variant="caption" color="dark">{value ? moment(value).format("MMM DD YYYY hh:mm A") : ""}</MDTypography>
            }
        },
    ]), []);


    if (loading) {
        return <MDBox minWidth={700} minHeight={400} display="flex" alignItems="center" justifyContent="center">
            <YASkeleton variant="loading" />
        </MDBox>
    }

    if (!alertHistory || alertHistory?.length === 0) {
        return <MDBox minWidth={700} minHeight={400} display="flex" alignItems="center" justifyContent="center">
            <EmptyState
                size="medium"
                variant="secondary"
                iconName="description"
                description={"No Run History Found"}
            />
        </MDBox>
    }

    return (
        <MDBox minWidth={700}>
            <DataTable
                variant="tile"
                table={{ columns, rows: alertHistory || [] }}
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

export default AlertRunHistory;