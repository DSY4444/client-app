import { Table, TableHead, TableBody, TableCell, TableRow, TableFooter, Checkbox } from "@mui/material";
import * as XLSX from 'xlsx';
import MDBox from "components/MDBox"
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react"
import { useTable, useFlexLayout, useResizeColumns, useRowSelect } from "react-table"
import moment from "moment";
import MDTypography from "components/MDTypography";
import { tableStyles } from "./styles";
import YAScrollbar from "components/YAScrollbar";
import { useAppController } from "context";

const IndeterminateCheckbox = forwardRef(
    ({ indeterminate, ...rest }, ref) => {
        const defaultRef = useRef()
        const resolvedRef = ref || defaultRef

        useEffect(() => {
            resolvedRef.current.indeterminate = indeterminate
        }, [resolvedRef, indeterminate])

        return (
            <>
                <Checkbox
                    ref={resolvedRef}
                    color="primary"
                    sx={{
                        p: 0,
                        "& .MuiSvgIcon-root": {
                            height: 18,
                            width: 18,
                            border: "1px solid #c5c9cc"
                        }
                    }}
                    {...rest}
                />
            </>
        )
    }
)

export const YADataTable = forwardRef(({
    columns,
    data,
    selectable,
    editableCell,
    onDataUpdate,
    totalType,
    fluidLayout,
    paddingSize,
    horizBorders,
    vertBorders,
    altRowBorders,
    idColumnName,
    onConfigUpdate,
    exportFileName
}, ref
) => {

    const [controller,] = useAppController();
    const { appDef: { settings } } = controller;
    const defaultDateFormat = (settings && settings.dateFormat) || "DD/MM/YYYY";

    const defaultColumn = useMemo(
        () => ({
            minWidth: 70,
            width: 120,
            maxWidth: 400,
            ...(onDataUpdate && { Cell: editableCell })
        }),
        []
    )

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        footerGroups,
        rows,
        prepareRow,
        selectedFlatRows,
        toggleAllRowsSelected,
        state: { selectedRowIds },
    } = useTable(
        {
            columns,
            data,
            defaultColumn,
            onDataUpdate,
            defaultDateFormat
        },
        useRowSelect,
        useFlexLayout,
        useResizeColumns,
        hooks => {
            hooks.allColumns.push(columns => {
                 
                let newColumns = [];

                if (selectable) {
                    newColumns.push(
                        // Let's make a column for selection
                        {
                            id: 'selection',
                            // The header can use the table's getToggleAllRowsSelectedProps method
                            // to render a checkbox
                            Header: ({ getToggleAllRowsSelectedProps }) => (
                                <div>
                                    <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                                </div>
                            ),
                            // The cell can use the individual row's getToggleRowSelectedProps method
                            // to the render a checkbox
                            minWidth: 50,
                            width: 50,
                            align: "center",
                            Cell: ({ row }) => (
                                <div>
                                    <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                                </div>
                            ),
                            disableSorting: true
                        }
                    );
                }

                return [
                    ...newColumns,
                    ...columns,
                ]
            })
        }
    )

    useEffect(() => {
        if (selectable && onConfigUpdate)
            onConfigUpdate({ selected: selectedFlatRows.map(r => r?.original[idColumnName || "id"]) });
    }, [onConfigUpdate, selectedRowIds]);

    const handleExport = useCallback(() => {
        if (columns && rows) {
            let dataArr = [];
            headerGroups?.forEach(headerGroup => {
                let headerGroupArr = [];
                headerGroup.headers?.forEach(header => {
                    const colSpan = header.getHeaderProps()?.colSpan;
                    const title = (typeof header.Header !== "function") ? (header.Header || "") : "";
                    headerGroupArr.push(...Array(colSpan || 1).fill(title));
                });
                dataArr.push(headerGroupArr);
            });
            rows?.forEach(row => {
                let rowArr = [];
                row.cells?.forEach(cell => {
                    // if(cell.column?.dataType === "percent")  cell.value = Math.round(cell.value *100);
                    if(cell.column?.dataType === "currency") rowArr.push(parseInt(cell.value));
                    else rowArr.push(cell.value);
                })
                dataArr.push(rowArr);
            });
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(dataArr);
            XLSX.utils.book_append_sheet(wb, ws, '');
            XLSX.writeFile(wb, `${exportFileName || "Data"} ${moment(Date()).format("YYYYMMDDHHmmss")}.xlsx`, { type: "array", bookType: "xlsx" });
        }
    }, [columns, data, rows])

    const handleClearSelection = useCallback(() => {
        toggleAllRowsSelected(false);
    }, [columns, data, rows])

    useImperativeHandle(ref, () => ({
        export() {
            handleExport();
        },
        clearSelection() {
            handleClearSelection();
        }
    }));

    const columnHeaderWidths = [];
    headerGroups?.map((headerGroup) => {
        headerGroup.headers?.map((column) => {
            columnHeaderWidths.push(column.getHeaderProps().style?.width);
        });
    });

    const tableContent = useMemo(
        () => (
            <MDBox height="100%" display="flex" flexDirection="column">
                <MDBox sx={theme => tableStyles(theme, { fluidLayout, paddingSize, horizBorders, vertBorders, altRowBorders, editable: !!onDataUpdate })}>
                    <YAScrollbar disableShadows>
                        <Table component="div" {...getTableProps()}>
                            <TableHead component="div">
                                {headerGroups?.map((headerGroup, ri) => (
                                    <TableRow key={`r_${ri}`} component="div" {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers?.map((column, ci) => (
                                            <TableCell key={`c_${ci}`} component="div" align={column.align ? column.align : "left"} {...column.getHeaderProps()}>
                                                {column.render('Header')}
                                                <div {...column.getResizerProps()} className="resizer" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHead>
                            <TableBody component="div" {...getTableBodyProps()}>
                                {rows?.map((row, ri) => {
                                    prepareRow(row)
                                    return (
                                        <TableRow key={`r_${ri}`} component="div" {...row.getRowProps()}>
                                            {row.cells?.map((cell, ci) => {
                                                if (cell.column.invalidColumnName) {
                                                    const invalidColumn = Boolean(row.original[cell.column.invalidColumnName]);
                                                    return (
                                                        <TableCell key={`c_${ci}`} className={`${cell.column.grandTotal ? "grandTotal " : ""}${invalidColumn ? "invalid" : ""}`} component="div" align={cell.column.align ? cell.column.align : "left"} {...cell.getCellProps()}>
                                                            {cell.render('Cell')}
                                                        </TableCell>
                                                    )
                                                }
                                                return (
                                                    <TableCell key={`c_${ci}`} className={`${cell.column.grandTotal ? "grandTotal" : ""}`} component="div" align={cell.column.align ? cell.column.align : "left"} {...cell.getCellProps()}>
                                                        {cell.render('Cell')}
                                                    </TableCell>
                                                )
                                            })}
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                            {
                                (totalType === "showGrandTotals" || totalType === "showColGrandTotals") &&
                                <TableFooter component="div">
                                    {footerGroups.map((group, ri) => ri === 0 ? (
                                        <TableRow key={`r_${ri}`} component="div" {...group.getFooterGroupProps()}>
                                            {group.headers.map((column, ci) => (
                                                <TableCell key={`c_${ci}`}
                                                    className="grandTotal"
                                                    component="div"
                                                    align={column.align ? column.align : "left"}
                                                    {...column.getFooterProps()}
                                                >
                                                    {
                                                        ci === 0 && <MDTypography variant="caption" fontWeight="medium" mr={2} whiteSpace="nowrap">Grand Total</MDTypography>
                                                    }
                                                 {column?.hideTotal === true ? null: column.render('Footer')}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ) : null)}
                                </TableFooter>
                            }
                        </Table>
                    </YAScrollbar>
                </MDBox>
                {/* <MDBox backgroundColor="#fff!important" sx={{ height: 30, flex: "50px 0 0" }}></MDBox> */}
            </MDBox>
        ),
        [fluidLayout, columnHeaderWidths, columns, data, totalType, exportFileName]
    );

    return tableContent
});

YADataTable.defaultProps = {
    selectable: false,
    fluidLayout: false,
    paddingSize: "medium",
    horizBorders: true,
    vertBorders: true,
    altRowBorders: false
};

export default YADataTable;