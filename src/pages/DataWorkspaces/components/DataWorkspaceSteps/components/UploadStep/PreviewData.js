import { useCallback, useEffect, useState } from "react";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import no_data_img from 'assets/svg/no_data.svg';
import EmptyState from "components/EmptyState";
import YADataTable from "components/YADataTable";
import { Autocomplete, Icon, Skeleton } from "@mui/material";
import MDInput from "components/MDInput";
import { useDataWorkspaceContext } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import { toExcelHeader } from "utils/table";
import MDButton from "components/MDButton";
import { debounce } from "lodash";
import { startUpload } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import StepContainer from "../StepContainer";

const buildColumns = (columns) => {
    if (!columns) return [];

    const cols = [
        {
            Header: "",
            accessor: "id",
            disableSorting: true,
            grandTotal: true,
            align: "center",
            minWidth: 50,
            width: 50,
            Cell: ({ row }) => {
                return <MDTypography variant="caption" fontWeight="medium" color="dark">{row.index + 1}</MDTypography>
            }
        }
    ];

    columns?.forEach((c, ci) => {
        cols.push({
            Header: toExcelHeader(ci + 2),
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

const dataTableStyles = (_, { headerRowNumber }) => ({
    width: "calc(100vw - 580px)",
    flexBasis: "calc(100vw - 620px)",
    flexGrow: 1,
    flexShrink: 1,
    overflow: "hidden",
    border: '1px solid #ddd',
    borderRadius: "8px",
    ...(headerRowNumber && {
        [`& .MuiTableRow-root:nth-of-type(${headerRowNumber})`]: {
            backgroundColor: '#f5f2f2'
        },
        [`& .MuiTableRow-root:nth-of-type(${headerRowNumber}) .MuiTypography-root`]: {
            fontWeight: 600
        }
    })
});

const PreviewData = (props) => {
    const { sheetNames, headerRowNumber, inputFileColumnNames, data, onSheetSelection, onHeaderRowSelection } = props;
    const [loading, setLoading] = useState(true);
    const [columns, setColumns] = useState([]);
    const [rows, setRows] = useState([]);
    const [state, dispatch] = useDataWorkspaceContext();
    const { uploadStepConfig } = state;

    const skeletonColumns = Array(10).fill(null).map((c, ci) => ({
        Header: () => {
            return <Skeleton />
        },
        accessor: `c${ci}`,
        Cell: () => {
            return <Skeleton />
        }
    }));

    const skeletonRows = Array(30).fill({});

    useEffect(() => {
        if (data) {
            setColumns(buildColumns(data.columns));
            setRows(data.rows);
            setLoading(false);
        }
    }, [data]);

    useEffect(() => {
        if (uploadStepConfig.isCsv) {
            let columns = rows?.length > 0 ? rows[0] : [];
            columns = columns.map(c => c.trim());
            onHeaderRowSelection(1, columns);
        }
    }, [uploadStepConfig]);

    const onChangeComplete = debounce(({ target: { value } }) => {
        let columns = rows?.length > 0 ? rows[parseInt(value) - 1] : [];
        onHeaderRowSelection(isNaN(parseInt(value)) ? 0 : parseInt(value), columns);
    }, 200);

    const handleStartUpload = useCallback(() => {
        startUpload(dispatch);
    }, []);

    if (loading)
        return (
            <StepContainer title="Data Preview (Top 50 rows)">
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

    return (
        <StepContainer title="Data Preview (Top 50 rows)">
            <MDBox flex={1} display="flex" sx={{ overflow: "hidden", height: "100%", width: "100%" }}>
                <MDBox flex={1} display="flex" flexDirection="row" pb={1.5}>
                    <MDBox sx={theme => dataTableStyles(theme, { headerRowNumber })}>
                        <YADataTable columns={columns} data={rows} />
                    </MDBox>
                    <MDBox sx={{ flexBasis: 360, pl: 3 }}>
                        <MDBox height="100%" display="flex" flexDirection="column" border="1px solid #ddd" borderRadius={8} py={3}>
                            <MDBox display="flex" flexDirection="column" px={3}>
                                <MDTypography variant="caption" fontWeight="medium" color="text" mb={1}>File name</MDTypography>
                                <MDTypography variant="button" color="text">{uploadStepConfig?.fileName}</MDTypography>
                                <MDTypography variant="caption" fontWeight="medium" color="text" mt={3} mb={1}>No. of rows</MDTypography>
                                <MDTypography variant="button" color="text">{uploadStepConfig?.totalRowCount}</MDTypography>
                                {sheetNames?.length > 1 &&
                                    <>
                                        <MDTypography variant="caption" fontWeight="medium" color="text" mt={3}>Sheet name</MDTypography>
                                        <Autocomplete
                                            disableClearable={true}
                                            value={uploadStepConfig.sheetName}
                                            options={sheetNames}
                                            onChange={(event, newValue) => {
                                                setLoading(true);
                                                onSheetSelection(newValue)
                                            }}
                                            color="text"
                                            fontWeight="medium"
                                            sx={{
                                                mt: 1,
                                                "& .MuiOutlinedInput-root": {
                                                    // height: 36,
                                                    // width: 120,
                                                    // padding: "4px 39px 4px 8px"
                                                    // boxShadow: "0 8px 16px #1a488e1f"
                                                },
                                                "& .MuiOutlinedInput-input": {
                                                    fontSize: 12
                                                },
                                                "& .MuiOutlinedInput-input.MuiAutocomplete-input": {
                                                    padding: .5
                                                }
                                            }}
                                            // isOptionEqualToValue={(option, value) => {
                                            //     return option === value
                                            // }}
                                            // getOptionLabel={option => {
                                            //     if (typeof option === "number")
                                            //         return [{ id: 0, name: "Sheet1" }, { id: 1, name: "Sheet2" }].find(op => op.id === option)?.name;
                                            //     return option.name
                                            // }}
                                            renderInput={(params) => <MDInput {...params} />}
                                        />
                                    </>
                                }
                                {
                                    !uploadStepConfig.isCsv && <>
                                        <MDTypography variant="caption" fontWeight="medium" color="text" mt={3} mb={1}>Header row number</MDTypography>
                                        <MDInput name="headerRow" value={headerRowNumber} onChange={onChangeComplete} />
                                    </>
                                }
                            </MDBox>
                            <MDBox flex={1} p={3} pb={0} display="flex" alignItems="flex-end" justifyContent="center">
                                <MDButton
                                    fullWidth
                                    size="medium"
                                    color="info"
                                    endIcon={<Icon>arrow_forward_ios</Icon>}
                                    onClick={handleStartUpload}
                                    disabled={(inputFileColumnNames || []).length === 0}
                                >
                                    {"Upload"}
                                </MDButton>
                            </MDBox>
                        </MDBox>
                    </MDBox>
                </MDBox>
            </MDBox>
        </StepContainer>
    );

};

export default PreviewData;