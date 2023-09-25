import { useEffect, useState } from "react";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import no_data_img from 'assets/svg/no_data.svg';
import EmptyState from "components/EmptyState";
import YADataTable from "components/YADataTable";
import { Autocomplete, Pagination, Skeleton } from "@mui/material";
import fetchRequest from "utils/fetchRequest";
import MDInput from "components/MDInput";
import StepContainer from "../StepContainer";

const buildColumns = (inputFileColumnNames) => {
    if (!inputFileColumnNames) return [];

    const cols = [
        {
            Header: "",
            accessor: "id",
            disableSorting: true,
            grandTotal: true,
            align: "center",
            minWidth: 50,
            width: 50,
            Cell: ({ cell: { value } }) => {
                return <MDTypography variant="caption" fontWeight="medium" color="dark">{value}</MDTypography>
            }
        }
    ];

    inputFileColumnNames
        .forEach((c) => {
            cols.push({
                Header: c,
                accessor: c,
                disableSorting: true,
                // invalid: true,
                // width: 100,
                Cell: ({ cell: { value } }) => {
                    return <MDTypography variant="caption" color="dark">{value}</MDTypography>
                }
            })
        });

    return cols;
}

const UploadedData = (props) => {
    const { workspaceId, inputFileColumnNames } = props;
    const [loading, setLoading] = useState(true);
    const [columns,] = useState(buildColumns(inputFileColumnNames));
    const [rows, setRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(25);

    const skeletonColumns = inputFileColumnNames.map((c) => ({
        Header: c,
        accessor: c,
        disableSorting: true,
        Cell: () => {
            return <Skeleton />
        }
    }));

    const skeletonRows = Array(30).fill({});

    useEffect(() => {
        async function getData() {
            var [err, data] = await fetchRequest.get(`/api/dataWorkspaces/data/${workspaceId}?page=${currentPage}&size=${pageSize}`)
            if (err) {
                // handleError(err);
                setLoading(false);
            }
            else {
                setRows(data.data);
                // setPaging(prev => ({
                //     ...prev,
                //     totalItems: data.paging.totalItems,
                //     totalPages: data.paging.totalPages,
                //     currentPage: data.paging.currentPage
                // }));
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

    if (loading)
        return (
            <StepContainer title="Uploaded Data">
                <MDBox sx={{ flex: 1, width: "calc(100vw - 152px)", mb: 2, overflow: "hidden", border: '1px solid #ddd', borderRadius: "8px" }}>
                    <YADataTable columns={skeletonColumns} data={skeletonRows} />
                </MDBox>
            </StepContainer>
        );

    if (!loading && rows?.length === 0)
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
        <StepContainer title="Uploaded Data">
            <>
                <MDBox sx={{ flex: 1, width: "calc(100vw - 152px)", overflow: "hidden", border: '1px solid #ddd', borderRadius: "8px" }}>
                    <YADataTable columns={columns} data={rows} />
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

export default UploadedData;