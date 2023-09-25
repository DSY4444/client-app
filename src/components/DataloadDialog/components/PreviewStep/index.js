import { useEffect, useState } from "react";
import DataTable from "components/DataTable";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import no_data_img from 'assets/svg/no_data.svg';
import EmptyState from "components/EmptyState";

const buildColumns = (columns) => {
    if (!columns) return [];

    const cols = [
        {
            Header: "",
            accessor: "id",
            disableSorting: true,
            isHeader: true,
            align: "center",
            width: 70,
            Cell: ({ row }) => {
                return <MDTypography variant="caption" color="dark">{row.index + 1}</MDTypography>
            }
        }
    ];

    Object.keys(columns)?.forEach((c) => {
        cols.push({
            Header: c,
            accessor: c,
            disableSorting: true,
            // width: 100,
            Cell: ({ cell: { value } }) => {
                return <MDTypography variant="caption" color="dark">{value?.toString()}</MDTypography>
            }
        })
    });

    return cols;
}

const PreviewStep = (props) => {
    const { ws } = props;
    const [columns, setColumns] = useState([]);
    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (ws) {
            setColumns(buildColumns(ws[0]));
            setRows(ws);
        }
    }, [ws]);

    if (ws?.length === 0)
        return (
            <MDBox
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100%"
            >
                <EmptyState
                    size="medium"
                    image={no_data_img}
                    title={`No records found`}
                    description="The selected file does not have any data."
                />
            </MDBox>
        );

    return (
        <DataTable
            variant="tile"
            table={{ columns, rows }}
            showTotalEntries={true}
            isSorted={true}
            bordered
            entriesPerPage={true}
            canSearch={true}
            containerMaxHeight="calc(100vh - 224px)"
        />
    );

};

export default PreviewStep;