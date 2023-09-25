import { useEffect, useState } from "react";
import DataTable from "components/DataTable";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import no_data_img from 'assets/svg/no_data.svg';
import EmptyState from "components/EmptyState";
import moment from "moment";
import { useAppController } from "context";

function ExcelDateToJSDate(serial) {
    var utc_days = Math.floor(serial - 25569);
    var utc_value = utc_days * 86400;
    var date_info = new Date(utc_value * 1000);
    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
}
const buildColumns = (columns, defaultDateFormat,uploadSubType) => {
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
        if (c !== '__Split') {
            cols.push({
                Header: c,
                accessor: c,
                disableSorting: true,
                // width: 100,
                Cell: ({ cell: { value } }) => {
                    if (c.match(/date/i)) {
                        if (moment(value).isValid() && typeof value === "number") {
                            value = ExcelDateToJSDate(value)
                            value = moment(value).format(defaultDateFormat)
                        }
                    }
                    return <MDTypography variant="caption"  color={ (uploadSubType == 'BUConsumption' || uploadSubType == 'towerConsumption') ? c == "Status" ? value.includes("OK") ? "success" : "error" : "dark": "dark"}>{value?.toString()}</MDTypography>
                }
            })
        }
    });

    return cols;
}

const PreviewStep = (props) => {
    const { ws, uploadSubType } = props;
    const [columns, setColumns] = useState([]);
    const [rows, setRows] = useState([]);
    const [controller,] = useAppController();
    const { appDef: { settings } } = controller;
    const defaultDateFormat = (settings && settings.dateFormat) || "DD/MM/YYYY";

    useEffect(() => {
        if (ws) {
            setColumns(buildColumns(ws[0],defaultDateFormat,uploadSubType));
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
            newStyle1={true}
            bordered
            entriesPerPage={true}
            canSearch={true}
            containerMaxHeight="calc(100vh - 224px)"
        />
    );

};

export default PreviewStep;