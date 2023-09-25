import { useCallback, useEffect, useState } from "react";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import YADataTable from "components/YADataTable";
import { Alert, Autocomplete, CircularProgress, Icon, IconButton, Stack, TextField } from "@mui/material";
import MDButton from "components/MDButton";
import fetchRequest from "utils/fetchRequest";

const lookupTypes = {
    "account": "Account(s)",
    "costCentre": "Cost Center(s)",
    "vendor": "Vendor(s)",
};

const colors = { "account": "#FFE6CC", "costCentre": "#E1D5E7", "vendor": "#D5E8D4" };

const columns = [
    {
        Header: "Code",
        accessor: "code",
        disableSorting: true,
        // width: 70,
        Cell: ({ cell: { value } }) => {
            return <MDTypography variant="caption" color="dark">{value}</MDTypography>
        }
    },
    {
        Header: "Description",
        accessor: "description",
        disableSorting: true,
        // width: 70,
        Cell: ({ cell: { value } }) => {
            return <MDTypography variant="caption" color="dark">{value}</MDTypography>
        }
    }
];



const AnalyzeData = (props) => {
    const { workspaceId, showNewItems, onSuccess, proceedToCorrectData } = props;
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState();
    const [inputFileColumnNames, setInputFileColumnNames] = useState();
    const [descColumnName, setDescColumnName] = useState();
    const [selectedLookupType, setSelectedLookupType] = useState();
    const [refreshLookupCheck, setRefreshLookupCheck] = useState();
    const [newItemAdded, setNewItemAdded] = useState(false);
    const [lookupData, setLookupData] = useState([]);

    useEffect(() => {
        async function processData() {
            var [err, data] = await fetchRequest.post(`/api/dataWorkspaces/analyzeData/${workspaceId}`)
            if (err) {
                // handleError(err);
                setLoading(false);
            }
            else {
                const newItems = data.data?.filter(i => (i.count || 0) > 0) || []
                if (newItems?.length > 0) {
                    setData(data.data);
                    setInputFileColumnNames(data.inputFileColumnNames);
                    setLoading(false);
                }
                else {
                    if (!showNewItems || newItemAdded)
                        onSuccess();
                    else
                        setLoading(false);
                }
            }
        }

        processData();
    }, [workspaceId, refreshLookupCheck, newItemAdded]);

    useEffect(() => {
        async function getLookups() {
            var [err, data] = await fetchRequest.post(`/api/dataWorkspaces/newLookupItems/${workspaceId}/${selectedLookupType}`, { labelColumn: descColumnName })
            if (err) {
                // handleError(err);
            }
            else {
                setLookupData(data)
            }
        }
        if (selectedLookupType)
            getLookups();
    }, [selectedLookupType, descColumnName]);

    const handleSkipContinue = useCallback(() => {
        if (showNewItems)
            proceedToCorrectData()
        else
            onSuccess()
    }, [workspaceId]);


    const handleOnLookupTypeSelection = useCallback((lookupType) => {
        setSelectedLookupType(lookupType)
        setDescColumnName(null)
    }, [workspaceId, setSelectedLookupType, setDescColumnName]);

    const handleClearLookupTypeSelection = useCallback(() => {
        setSelectedLookupType(null)
        setDescColumnName(null)
        setLookupData([])
    }, [workspaceId, setSelectedLookupType, setDescColumnName]);

    const handleOnLookupTypesSave = useCallback(async () => {
        var [err,] = await fetchRequest.post(`/api/dataWorkspaces/createNewLookupItems/${workspaceId}/${selectedLookupType}`, { labelColumn: descColumnName })
        if (err) {
            // handleError(err);
        }
        else {
            setSelectedLookupType(null)
            setLookupData([])
            setRefreshLookupCheck(Math.random())
            setNewItemAdded(true);
        }
    }, [workspaceId, setSelectedLookupType, selectedLookupType, descColumnName]);

    // console.log(data, inputFileColumnNames)
    // console.log(lookupData)

    const selectedLookup = data?.find(item => item.type === selectedLookupType);

    if (loading)
        return (
            <MDBox
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100%"
                width="100%"
            >
                <CircularProgress />
            </MDBox>
        );

    const options = inputFileColumnNames || [];
    const newItemsIdentified = data?.filter(item => (item.count || 0) > 0)?.length > 0;

    return (
        <MDBox flex={1} display="flex" flexDirection="row">
            <MDBox sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <MDBox minHeight="400px" width="620px" p={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                    <MDBox sx={() => ({
                        height: 60,
                        width: 60,
                        borderRadius: "50%",
                        backgroundColor: "#ddd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    })
                    }>
                        <Icon
                            fontSize="50"
                            sx={{
                                fontSize: 35,
                                // color: "#fff"
                            }}>question_mark</Icon>
                    </MDBox>
                    <MDTypography mt={2} color="text" variant="subtitle1" fontWeight="light">{newItemsIdentified ? "New look up items have been identified." : "No new lookup items have been identified"}</MDTypography>
                    <MDTypography my={2} color="text" variant="button" fontWeight="medium">{newItemsIdentified ? "Would you like to save them to database?": "Proceed to data correction step."}</MDTypography>
                    {/* <Stack spacing={1}>
                        <Stack spacing={1.5} direction="row" justifyContent="center" alignItems="center">
                            <MDBox sx={{ border: "1px solid #ddd", position: "relative", height: 48, width: 48, borderRadius: "50%", backgroundColor: "#FFE6CC!important", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <MDTypography textAlign="center" variant={"h4"} component="span" fontWeight="medium" color="primary">8</MDTypography>
                            </MDBox>
                            <MDTypography textAlign="left" width="120px" variant={"button"} component="span" fontWeight="medium" color="primary">Cost Centers</MDTypography>
                        </Stack>
                        <Stack spacing={1.5} direction="row" justifyContent="center" alignItems="center">
                            <MDBox sx={{ border: "1px solid #ddd", position: "relative", height: 48, width: 48, borderRadius: "50%", backgroundColor: "#E1D5E7!important", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <MDTypography textAlign="center" variant={"h4"} component="span" fontWeight="medium" color="primary">4</MDTypography>
                            </MDBox>
                            <MDTypography textAlign="left" width="120px" variant={"button"} component="span" fontWeight="medium" color="primary">Accounts</MDTypography>
                        </Stack>
                        <Stack spacing={1.5} direction="row" justifyContent="center" alignItems="center">
                            <MDBox sx={{ border: "1px solid #ddd", position: "relative", height: 48, width: 48, borderRadius: "50%", backgroundColor: "#D5E8D4!important", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <MDTypography textAlign="center" variant={"h4"} component="span" fontWeight="medium" color="primary">10</MDTypography>
                            </MDBox>
                            <MDTypography textAlign="left" width="120px" variant={"button"} component="span" fontWeight="medium" color="primary">Vendors</MDTypography>
                        </Stack>
                    </Stack> */}
                    <MDButton sx={{ mt: 4 }} variant="outlined" color="info"
                        // startIcon={<Icon>edit</Icon>} 
                        onClick={handleSkipContinue}>
                        {newItemsIdentified ? "Skip & Continue" : "Proceed"}
                    </MDButton>
                </MDBox>
            </MDBox>
            {
                newItemsIdentified &&
                <MDBox sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center" }}>
                    {
                        !selectedLookupType &&
                        <Stack spacing={2}>
                            {
                                data?.filter(item => (item.count || 0) > 0).map((item) => {
                                    return <Stack key={item.type} spacing={2} direction="row" justifyContent="flex-start" alignItems="center" sx={{ cursor: "pointer" }} onClick={() => handleOnLookupTypeSelection(item.type)}>
                                        <MDBox sx={{ border: "1px solid #ddd", position: "relative", height: 80, width: 80, borderRadius: "50%", backgroundColor: `${colors[item.type]}!important`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <MDTypography textAlign="center" variant={"h3"} component="span" fontWeight="medium" color="primary">{item.count}</MDTypography>
                                        </MDBox>
                                        <MDTypography textAlign="left" variant={"button"} component="span" fontWeight="medium" color="primary">New {lookupTypes[item.type]}</MDTypography>
                                    </Stack>
                                })
                            }

                            <MDBox>
                                <Alert
                                    severity={"info"}
                                    sx={{ mt: 3, fontSize: "14px", textAlign: "left", border: "1px solid #ddd" }}
                                >
                                    Click on an item to view details
                                </Alert>
                            </MDBox>
                        </Stack>
                    }
                    {
                        selectedLookupType &&
                        <MDBox sx={{ p: 4, position: "relative", border: "1px solid #ddd", flex: 1, minWidth: "400px", maxHeight: "600px", borderRadius: "12px", display: "flex", justifyContent: "flex-start" }}>
                            <IconButton
                                onClick={handleClearLookupTypeSelection}
                                sx={{ position: "absolute", top: 8, right: 10 }}
                            >
                                <Icon>close</Icon>
                            </IconButton>
                            <MDBox display="flex" flexDirection="column" sx={{ height: "100%", width: "100%" }}>
                                <Stack spacing={1.5} direction="row" justifyContent="flex-start" alignItems="center">
                                    <MDBox sx={{ border: "1px solid #ddd", position: "relative", height: 48, width: 48, borderRadius: "50%", backgroundColor: `${colors[selectedLookup.type]}!important`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <MDTypography textAlign="center" variant={"h5"} component="span" fontWeight="medium" color="primary">{selectedLookup?.count}</MDTypography>
                                    </MDBox>
                                    <MDTypography textAlign="left" variant={"button"} component="span" fontWeight="medium" color="primary">New {lookupTypes[selectedLookup?.type]}</MDTypography>
                                </Stack>
                                <Stack sx={{ marginTop: 2 }} spacing={1.5} direction="row" justifyContent="flex-start" alignItems="center">
                                    <MDTypography sx={{ minWidth: 150 }} textAlign="left" variant={"caption"} component="span" fontWeight="medium" color="primary">Description Column</MDTypography>
                                    <Autocomplete
                                        disableClearable={true}
                                        onChange={(event, item) => {
                                            setDescColumnName(item);
                                        }}
                                        options={options}
                                        value={descColumnName}
                                        // getOptionLabel={option => {
                                        //     if (typeof option === "number")
                                        //         return options.find(op => op.value === option)?.label || "";
                                        //     if (typeof option === "string")
                                        //         return options.find(op => String(op.value)?.toLowerCase() === option?.toLowerCase())?.label || "";
                                        //     return option?.label || ""
                                        // }}
                                        sx={{ flex: 1 }}
                                        renderInput={params => <TextField {...params}
                                            name={"name"}
                                            // required={required}
                                            // disabled={disabled}
                                            // error={errorMessage && true}
                                            // helperText={errorMessage}
                                            // label={displayName}
                                            placeholder={"Select a column"}
                                            variant={"standard"}
                                            // sx={{ width: "100%" }}
                                            autoFocus={true}
                                            // onBlur={onValueBlur}
                                            fullWidth={true}
                                        />}
                                    />
                                </Stack>
                                <Alert
                                    severity={"info"}
                                    sx={{ mt: 1, maxWidth: "380px", py: 0, px: 1, fontSize: "12px", textAlign: "left", border: "1px solid #ddd" }}
                                >
                                    If no column is selected, then the code column will be considered for description too.
                                </Alert>
                                <MDBox flex={1} mt={2}>
                                    <YADataTable columns={columns} data={lookupData} />
                                </MDBox>
                                <MDButton sx={{ mt: 1 }}
                                    fullWidth
                                    size="medium"
                                    color="info"
                                    startIcon={<Icon>save</Icon>}
                                    onClick={handleOnLookupTypesSave}>
                                    {"Save New Items"}
                                </MDButton>
                            </MDBox>
                        </MDBox>
                    }
                </MDBox>
            }
        </MDBox>
    );

};

export default AnalyzeData;