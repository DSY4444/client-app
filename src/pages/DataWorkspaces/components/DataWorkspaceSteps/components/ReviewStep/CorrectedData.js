import { useEffect, useMemo, useRef, useState } from "react";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import no_data_img from 'assets/svg/no_data.svg';
import EmptyState from "components/EmptyState";
import YADataTable from "components/YADataTable";
import { Autocomplete, Pagination, Skeleton } from "@mui/material";
import fetchRequest from "utils/fetchRequest";
import MDInput from "components/MDInput";
import moment from "moment";
import numeral from "numeral";
import StepContainer from "../StepContainer";

const getCellValue = (value) => {
    return Array.isArray(value) ? value[0] : value;
}

const buildColumns = (config, mappingStepConfig) => {
    if (!config?.fields) return [];

    const mappedFieldNames = mappingStepConfig?.mappings?.map(m => m.destinationColumn) || [];

    const cols = [];

    config?.fields
        .filter(c => mappedFieldNames.includes(c.name))
        .forEach((colDef) => {
            cols.push({
                Header: colDef.displayName,
                accessor: `__${colDef.name}`,
                invalidColumnName: `__${colDef.name}__invalid`,
                colDef: colDef,
                width: 150,
                Cell: ({ cell: { value, row: { original } }, defaultDateFormat }) => {
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

                    return <MDTypography variant="caption" color="dark">{val || ""}</MDTypography>
                }
            })
        });

    return cols;
}

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

const CorrectedData = (props) => {
    const { workspaceId, config, mappingStepConfig } = props;
    const [loading, setLoading] = useState(true);
    const [columns,] = useState(buildColumns(config, mappingStepConfig));
    const [rows, setRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const tableRef = useRef(null);

    const skeletonColumns = buildSkeletonColumns(config, mappingStepConfig);
    const skeletonRows = Array(30).fill({});

    useEffect(() => {
        async function getData() {
            var [err, data] = await fetchRequest.get(`/api/dataWorkspaces/correctdata/${workspaceId}?page=${currentPage}&size=${pageSize}&filterType=valid`)
            if (err) {
                // handleError(err);
                setLoading(false);
            }
            else {
                setRows(data.data);
                setTotalItems(data.paging.totalItems);
                setTotalPages(data.paging.totalPages);
                setLoading(false);
            }
        }

        getData();
    }, [workspaceId, currentPage, pageSize]);

    const handlePageChange = (event, value) => {
        setCurrentPage(value - 1);
    };

    const tableMemo = useMemo(() => <YADataTable ref={tableRef} columns={columns} data={rows} />, [workspaceId, tableRef, columns, rows]);

    if (loading)
        return (
            <StepContainer title="Finalized Data">
                <MDBox sx={{ flex: 1, width: "calc(100vw - 152px)", mb: 2, overflow: "hidden", border: '1px solid #ddd', borderRadius: "8px" }}>
                    <YADataTable columns={skeletonColumns} data={skeletonRows} />
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

    return (
        <StepContainer title="Finalized Data">
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

export default CorrectedData;