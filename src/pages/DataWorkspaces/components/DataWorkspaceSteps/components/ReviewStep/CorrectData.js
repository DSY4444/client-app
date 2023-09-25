import { useEffect, useMemo, useRef, useState } from "react";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import no_data_img from 'assets/svg/no_data.svg';
import EmptyState from "components/EmptyState";
import YADataTable from "components/YADataTable";
import { Autocomplete, FormControlLabel, Icon, Pagination, Skeleton, Switch as MDSwitch, TextField } from "@mui/material";
import fetchRequest from "utils/fetchRequest";
import MDInput from "components/MDInput";
import { useYADialog } from "components/YADialog";
import { DatepickerCore } from "components/YAForm/components/DatePicker";
import moment from "moment";
import numeral from "numeral";
import { useDataWorkspaceContext } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import RowMenu from "components/RowMenu";
import StepContainer from "../StepContainer";

const buildSkeletonColumns = (config, mappingStepConfig) => {
    if (!config?.fields) return [];

    const mappedFieldNames = mappingStepConfig?.mappings?.map(m => m.destinationColumn) || [];

    const cols = [];

    config?.fields
        .filter(c => mappedFieldNames.includes(c.name))
        .forEach((colDef) => {
            cols.push({
                Header: colDef.displayName,
                accessor: `__${colDef.name}`,
                width: 150,
                Cell: () => {
                    return <Skeleton />
                }
            })
        });

    return cols;
}

const buildColumns = (config, mappingStepConfig) => {
    if (!config?.fields) return [];

    const mappedFieldNames = mappingStepConfig?.mappings?.map(m => m.destinationColumn) || [];

    const cols = [
        // {
        //     Header: "",
        //     accessor: "id",
        //     disableSorting: true,
        //     isHeader: true,
        //     align: "center",
        //     width: 70,
        //     Cell: ({ row }) => {
        //         return <MDTypography variant="caption" color="dark">{row.index + 1}</MDTypography>
        //     }
        // }
    ];

    config?.fields
        .filter(c => mappedFieldNames.includes(c.name))
        .forEach((c) => {
            cols.push({
                Header: c.displayName,
                accessor: `__${c.name}`,
                invalidColumnName: `__${c.name}__invalid`,
                colDef: c,
                width: 150,
                // Cell: ({ cell: { value } }) => {
                //     return <MDTypography variant="caption" color="dark">{value?.toString()}</MDTypography>
                // }
            })
        });

    return cols;
}

const getCellValue = (value) => {
    return Array.isArray(value) ? value[0] : value;
}

const EditableCell = ({
    value: initialValue,
    row: { index, original },
    column: { id, colDef },
    defaultDateFormat,
    onDataUpdate
}) => {
    // We need to keep and update the state of the cell normally
    const [state,] = useDataWorkspaceContext();
    const [editable, setEditable] = useState(false)
    const [value, setValue] = useState(initialValue)

    const onChange = e => {
        setValue(e.target.value)
    }

    // We'll only update the external data when the input is blurred
    const onBlur = () => {
        onDataUpdate(index, id, value)
        setEditable(false)
    }

    const onDateChange = (val) => {
        onDataUpdate(index, id, val)
        setEditable(false)
    }

    const onValueChange = (val) => {
        onDataUpdate(index, id, val)
        setEditable(false)
    }

    const onValueBlur = () => {
        setEditable(false)
    }

    // const onDateBlur = () => {
    //     setEditable(false)
    // }

    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    // console.log("state.lookups", state.lookups)


    if (!editable) {
        let val = null;
        if (colDef.type === "currency")
            val = value ? numeral(value).format('0,0') : ""
        else if (colDef.type === "boolean")
            val = value ? "Yes" : "No"
        else if (colDef.type === "date")
            val = value ? moment(value).format(defaultDateFormat) : ""
        else if (["lookup", "fixedLookup"].includes(colDef.type))
            val = original[`__${colDef.name}__label`]
        else
            val = getCellValue(value) || ""

        return <MDTypography
            onClick={() => { setEditable(true) }}
            variant="caption"
            color="dark"
            sx={{
                height: "100%",
                width: "100%",
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                cursor: "pointer",
                "& .MuiIcon-root": {
                    display: "none",
                    float: "right"
                },
                "&:hover": {
                    textDecoration: "underline",
                },
                "&:hover .MuiIcon-root": {
                    display: "inherit",
                },
            }}
        >
            <Icon>edit</Icon>{val || ""}
        </MDTypography>
    }

    if (colDef.type === "date")
        return <DatepickerCore
            //   label={displayName}
            name={"name"}
            //   required={required}
            //   errorMessage={errorMessage}
            inputFormat={defaultDateFormat}
            //   placeholder={placeholder}
            //   variant={variant}
            value={moment(value)}
            //   width={width}
            //   disabled={disabled}
            isFocused={true}
            // onDateBlur={onDateBlur}
            onDateChange={onDateChange}
        />

    else if (["fixedLookup", "lookup"].includes(colDef.type)) {
        const options = state.lookups ? state.lookups[colDef.lookupType] : [];
        return <Autocomplete
            disableClearable={true}
            onChange={(event, item) => {
                onValueChange(item?.value);
            }}
            options={options}
            value={value}
            getOptionLabel={option => {
                if (typeof option === "number")
                    return options.find(op => op.value === option)?.label || "";
                if (typeof option === "string")
                    return options.find(op => String(op.value)?.toLowerCase() === option?.toLowerCase())?.label || "";
                return option?.label || ""
            }}
            renderInput={params => <TextField {...params}
                name={"name"}
                // required={required}
                // disabled={disabled}
                // error={errorMessage && true}
                // helperText={errorMessage}
                // label={displayName}
                // placeholder={placeholder}
                variant={"standard"}
                // sx={width ? { width: width } : undefined}
                autoFocus={true}
                onBlur={onValueBlur}
                fullWidth={true}
            />}
        />
    }

    return <TextField
        name={"name"}
        variant={"standard"}
        value={value}
        autoFocus={true}
        onChange={onChange}
        onBlur={onBlur}
        fullWidth={true}
    />

    // return <input autoFocus style={{ width: "100%", height: "100%" }} value={value} onChange={onChange} onBlur={onBlur} />
}

const CorrectData = (props) => {
    const { workspaceId, config, mappingStepConfig, setLookups, onMarkAsComplete, onShowNewItems } = props;
    const [loading, setLoading] = useState(true);
    const [columns,] = useState(buildColumns(config, mappingStepConfig));
    const [rows, setRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [summary, setSummary] = useState([]);
    const [rowType, setRowType] = useState({ valid: true, invalid: true });
    const tableRef = useRef(null);
    const selectedIds = useRef();
    const [selectedRowIds, setSelectedRowIds] = useState([]);
    const [refresh, setRefresh] = useState(true);
    const { showAlert, showPrompt, showSnackbar } = useYADialog();

    const skeletonColumns = buildSkeletonColumns(config, mappingStepConfig);
    const skeletonRows = Array(30).fill({});

    useEffect(() => {
        async function getDataLookups() {
            var [err, data] = await fetchRequest.get(`/api/dataWorkspaces/dataLookups/${workspaceId}`)
            if (err) {
                // handleError(err);
                setLoading(false);
            }
            else {
                setLookups(data)
            }
        }

        getDataLookups();
    }, [workspaceId]);

    useEffect(() => {
        async function getData() {
            let filterType = null;
            if (rowType.valid && rowType.invalid) filterType = "all";
            else if (rowType.valid) filterType = "valid";
            else if (rowType.invalid) filterType = "invalid";

            var [err, data] = await fetchRequest.get(`/api/dataWorkspaces/correctdata/${workspaceId}?page=${currentPage}&size=${pageSize}${filterType ? `&filterType=${filterType}` : ''}`)
            if (err) {
                // handleError(err);
                setLoading(false);
            }
            else {
                // console.log(data)
                setRows(data.data);
                setTotalItems(data.paging.totalItems);
                setTotalPages(data.paging.totalPages);
                setSummary(data.summary);
                // setWorkspaceDetails(Object.assign({}, data));
                setLoading(false);
            }
        }

        getData();
    }, [workspaceId, rowType, currentPage, pageSize, refresh]);

    useEffect(() => {
        const dataSummary = summary?.length > 0 ? summary[0] : null;
        const dataCorrected = dataSummary && dataSummary.inValidRows === 0;
        if (dataCorrected)
            onMarkAsComplete();

    }, [workspaceId, summary]);

    // const updateRows = (rowIndexes, columnName, value) => {
    //     console.log(rows?.length, rowIndexes, columnName, value)
    //     setRows(old =>
    //         old.map((row, index) => {
    //             if (rowIndexes.includes(row.id)) {
    //                 return {
    //                     ...old[index],
    //                     [columnName]: value,
    //                     [`${columnName}__invalid`]: false,
    //                 }
    //             }
    //             return row
    //         })
    //     )
    // };

    const saveData = async (id, columnName, columnValue, selectedIds) => {
        const [err, data] = await fetchRequest.post(`/api/dataWorkspaces/updateData/${workspaceId}/${id}`, { columnName, columnValue, selectedIds })
        if (err) {
            showAlert('Update data', 'Something went wrong. Contact your administrator.');
        }
        else
            if (data && data.result === true) {
                showSnackbar('Data updated successfully', 'success');
                setRefresh(Math.random());
            }
            else if (data && data.result === false) {
                showAlert('Update data', data.message || 'Something went wrong. Contact your administrator.');
            }
    };

    const updateMyData = async (rowIndex, columnId, value) => {
        const selectedRow = rows[rowIndex];
        if (selectedRow && selectedRow[columnId] !== value) {
            const columnName = columnId.replace("__", "");
            const columnValue = value;
            if (Array.isArray(selectedIds.current) && selectedIds.current.length > 0 && selectedIds.current.includes(selectedRow.id)) {
                showPrompt('Apply changes', `Would you like to apply the changes to ${selectedIds.current.length} selected items?`,
                    async () => {
                        await saveData(selectedRow.id, columnName, columnValue, selectedIds.current);
                    },
                    async () => {
                        await saveData(selectedRow.id, columnName, columnValue);
                    },
                    "No, Only this row",
                    "Yes"
                );
            }
            else {
                await saveData(selectedRow.id, columnName, columnValue);
            }

            // We also turn on the flag to not reset the page
            // setSkipPageReset(true)
            // setRows(old =>
            //   old.map((row, index) => {
            //     if (index === rowIndex) {
            //       return {
            //         ...old[rowIndex],
            //         [columnId]: value,
            //       }
            //     }
            //     return row
            //   })
            // )
        }
    }

    // const handleOnMarkAsComplete = async () => {
    //     var [err, data] = await fetchRequest.post(`/api/dataWorkspaces/markAsComplete/${workspaceId}`)
    //     if (err) {
    //         // handleError(err);
    //         setLoading(false);
    //     }
    //     else {
    //         onSuccess();
    //         // console.log(data)
    //         setLoading(false);
    //     }
    // };

    const handleOnDeleteSelection = () => {
        showPrompt('Delete rows', `Are you sure you want to delete ${selectedIds.current?.length} row(s)?`,
            async () => {
                const [err, data] = await fetchRequest.post(`/api/dataWorkspaces/deleteData/${workspaceId}`, { rowIds: selectedIds.current || [] })
                if (err) {
                    showAlert('Delete', 'Something went wrong. Contact your administrator.');
                }
                else
                    if (data && data.result === true) {
                        showSnackbar('Data deleted successfully', 'success');
                        setRefresh(Math.random());
                    }
                    else if (data && data.result === false) {
                        showAlert('Delete', data.message || 'Something went wrong. Contact your administrator.');
                    }
            }
        );
    };

    const handleOnClearSelection = () => {
        tableRef.current?.clearSelection();
    };

    const handleOnTableConfigUpdate = (updateObj) => {
        selectedIds.current = updateObj.selected;
        setSelectedRowIds(updateObj.selected);
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value - 1);
    };

    const tableMemo = useMemo(() => <YADataTable ref={tableRef} columns={columns} data={rows} selectable editableCell={EditableCell} onDataUpdate={updateMyData} onConfigUpdate={handleOnTableConfigUpdate} />, [workspaceId, tableRef, columns, rows]);

    if (loading)
        return (
            <StepContainer title="Review">
                <MDBox sx={{ flex: 1, width: "calc(100vw - 152px)", mb: 2, overflow: "hidden", border: '1px solid #ddd', borderRadius: "8px" }}>
                    <YADataTable key="dataTable" columns={skeletonColumns} data={skeletonRows} />
                </MDBox>
            </StepContainer>
        );

    const entries = [25, 50, 75, 100];

    // Setting the entries starting point
    const entriesStart = currentPage === 0 ? currentPage + 1 : currentPage * pageSize + 1;

    // Setting the entries ending point
    let entriesEnd;

    if (currentPage === 0) {
        entriesEnd = pageSize;
    } else if (currentPage === totalPages) {
        entriesEnd = totalItems;
    } else {
        entriesEnd = pageSize * (currentPage + 1);
    }

    if (entriesEnd >= totalItems) {
        entriesEnd = totalItems;
    }

    const dataSummary = summary?.length > 0 ? summary[0] : null;

    let options = [
        {
            label: "Show New Lookup Items", onClick: () => {
                onShowNewItems()
            }
        },
    ];

    const titleComponent = (<>
        <MDBox display="flex" alignItems="center">
            <MDTypography variant="subtitle1" fontWeight="medium" component="span" textAlign="center">
                Review
            </MDTypography>
            {
                selectedRowIds?.length > 0 && <>
                    <MDTypography ml={10} variant="button" fontWeight="medium" color="info">{`Selected(${selectedRowIds?.length})`}</MDTypography>
                    <MDTypography ml={2} display="inline-flex" component="a" href="#" mr="auto" color="error" variant="button" fontWeight="medium" onClick={handleOnClearSelection}><Icon fontSize="small" color="error">close</Icon>&nbsp;Clear</MDTypography>
                    <MDTypography ml={8} display="inline-flex" component="a" href="#" mr="auto" color="error" variant="button" fontWeight="medium" onClick={handleOnDeleteSelection}><Icon fontSize="small" color="error">delete</Icon>&nbsp;Delete</MDTypography>
                </>
            }
        </MDBox>
        <MDBox mr={3}>
            <FormControlLabel
                control={
                    <MDSwitch name={"showValidRows"} checked={rowType.valid}
                        variant="standard"
                        size="small"
                        sx={{
                            mt: -0.5,
                            mr: 0.5,
                            "& .MuiSwitch-switchBase": {
                                marginTop: "2px"
                            }
                        }}
                        onChange={
                            (_, checked) => {
                                setCurrentPage(0)
                                setRowType(prev => ({ valid: checked, invalid: prev.invalid }))
                            }
                        }
                    />
                }
                label={<MDTypography variant="variant" fontWeight="medium">{dataSummary?.validRows || 0} Valid Rows</MDTypography>}
                labelPlacement="end"
                sx={{ mr: 3 }}
            />
            <FormControlLabel
                control={
                    <MDSwitch name={"showInvalidRows"} checked={rowType.invalid}
                        variant="standard"
                        size="small"
                        sx={{
                            mt: -0.5,
                            mr: 0.5,
                            "& .MuiSwitch-switchBase": {
                                marginTop: "2px"
                            },
                            "& .Mui-checked + .MuiSwitch-track": {
                                backgroundColor: "red!important",
                                borderColor: "red!important",
                            }
                        }}
                        onChange={
                            (_, checked) => {
                                setCurrentPage(0)
                                setRowType(prev => ({ valid: prev.valid, invalid: checked }))
                            }
                        }
                    />
                }
                label={<MDTypography variant="variant" fontWeight="medium">{dataSummary?.inValidRows || 0} Invalid Rows</MDTypography>}
                labelPlacement="end"
                sx={{ mr: 6 }}
            />
            <RowMenu options={options} />
        </MDBox>
    </>)

    return (
        <StepContainer titleComponent={titleComponent}>
            <>
                <MDBox sx={{ flex: 1, width: "calc(100vw - 152px)", overflow: "hidden", border: '1px solid #ddd', borderRadius: "8px" }}>
                    {!loading && rows?.length > 0 && tableMemo}
                    {!loading && rows?.length === 0 &&
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
                                description="Please select a filter to display data"
                            />
                        </MDBox>
                    }
                </MDBox>
                <MDBox
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    pt={1}
                    px={1}
                >
                    <MDBox display="flex" alignItems="center">
                        <MDTypography variant="button" color="secondary" fontWeight="regular">
                            Rows per page&nbsp;&nbsp;
                        </MDTypography>
                        <Autocomplete
                            disableClearable
                            value={pageSize}
                            options={entries}
                            onChange={(event, newValue) => {
                                setCurrentPage(0);
                                setPageSize(parseInt(newValue));
                            }}
                            getOptionLabel={option => option?.toString()}
                            size="small"
                            sx={{
                                width: "5rem",
                                "& fieldset": { border: "none" },
                                "& .MuiOutlinedInput-input": { fontSize: "14px" }
                            }}
                            renderInput={(params) => <MDInput {...params} />}
                        />
                    </MDBox>
                    <MDBox mb={{ xs: 3, sm: 0 }}>
                        <MDTypography variant="button" color="secondary" fontWeight="regular">
                            {entriesStart} - {entriesEnd} of {totalItems}
                        </MDTypography>
                    </MDBox>
                    <MDBox>
                        <Pagination size="small" count={totalPages} defaultPage={currentPage + 1} onChange={handlePageChange} />
                    </MDBox>
                </MDBox>
            </>
        </StepContainer>
    );
};

export default CorrectData;