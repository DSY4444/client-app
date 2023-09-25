import { useEffect, useState } from "react";
import { Alert, Autocomplete, CircularProgress, Icon, List, ListItem } from "@mui/material";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import _ from "lodash";
import MDButton from "components/MDButton";
import useFetchRequest from "hooks/useFetchRequest";
import YAScrollbar from "components/YAScrollbar";
import fetchRequest from "utils/fetchRequest";

const FieldDataPreview = ({ workspaceId, selectedField, mappingFields }) => {
    const [sampleValues, setSampleValues] = useState([]);
    const destField = selectedField?.name;
    const selectedColumn = mappingFields?.length > 0 ? _.find(mappingFields, { 'destinationColumn': destField }) ? _.find(mappingFields, { 'destinationColumn': destField }).sourceColumn : undefined : undefined;

    useEffect(() => {
        async function getDashboardDef(selectedColumn) {
            var [err, data] = await fetchRequest.get(`/api/dataWorkspaces/sampleValues/${workspaceId}/${selectedColumn}?type=${selectedField.type}`)
            if (err) {
                // handleError(err);
            }
            else {
                setSampleValues(data)
            }
        }
        if (selectedColumn)
            getDashboardDef(selectedColumn);
    }, [workspaceId, selectedField, mappingFields]);

    // const destField = selectedField?.name;
    // const selectedColumn = mappingFields.length > 0 ? _.find(mappingFields, { 'destinationColumn': destField }) ? _.find(mappingFields, { 'destinationColumn': destField }).sourceColumn : undefined : undefined;
    // const uniqueValues = selectedColumn ? _.uniqBy(ws, selectedColumn)?.map(v => v[selectedColumn]) || [] : [];
    return <>
        <MDBox display="flex" flexDirection="column" px={3}>
            <MDTypography variant="button" fontWeight="medium" color="text">{selectedField?.displayName}</MDTypography>
            <MDTypography variant="caption" color="text">{(selectedField?.type || "").toUpperCase()}</MDTypography>
        </MDBox>
        <MDBox sx={{
            mt: 4,
            mb: 2,
            px: 3,
            py: 1,
            height: 36,
            backgroundColor: "#fbfbfb",
            borderTop: "1px solid #ddd",
            borderBottom: "1px solid #ddd",
            display: "flex",
            alignItems: "center",
        }}
        >
            <MDTypography variant="caption" fontWeight="medium" color="text">Data Preview</MDTypography>
        </MDBox>
        <YAScrollbar>
            {
                !selectedColumn &&
                <Alert
                    severity={"info"}
                    sx={{ mx: 3, mt: 2, fontSize: "14px", textAlign: "left", border: "1px solid #ddd" }}
                >
                    Select a column to preview the data in the uploaded file.
                </Alert>
            }
            {
                selectedColumn &&
                <List sx={{ px: 3 }}>
                    {
                        sampleValues?.map((v, vi) => <ListItem key={vi}><MDTypography my={.5} key={v} variant="caption" color="text">{v[selectedColumn]}</MDTypography></ListItem>)
                    }
                </List>
            }
        </YAScrollbar>
    </>
};

const fieldStyles = (_, { selected }) => {
    return {
        display: "flex",
        gap: 4,
        pl: 2,
        py: .25,
        mb: 1,
        borderRadius: 5,
        cursor: "pointer",
        "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "transparent!important",
        },
        border: "1px solid transparent",
        ...(selected && {
            backgroundColor: "#fff8f8",
            border: "1px solid #ddd",
        })
    };
};

const MapFields = (props) => {
    const { workspaceId, type, configFields, sourceFields, onSuccess } = props;
    const [autoMappedFieldsCount, setAutoMappedFieldsCount] = useState(0);
    const [resourceFields, setResourceFields] = useState([]);
    const [mappingFields, setMappingFields] = useState([]);
    const [mappingErrors, setMappingErrors] = useState([]);
    const [selectedFieldName, setSelectedFieldName] = useState(null);
    const [requiredFieldsMapped, setRequiredFieldsMapped] = useState(false);

    const { response: dataRes, error: dataErr, loading: dataLoading } = useFetchRequest(`/api/dataWorkspaces/resource/${type}`);

    // const sourceFields = mappingStepConfig.inputFileColumnNames || [];
    // const configFields = config.fields;

    const areRequiredFieldsMapped = () => {
        let requiredFieldsMapped = true;
        resourceFields.filter(fld => fld.required).forEach((fld) => {
            const mappedField = _.find(mappingFields, { 'destinationColumn': fld.name });
            if (!mappedField) {
                if (requiredFieldsMapped)
                    requiredFieldsMapped = false;
            }
        });

        return requiredFieldsMapped;
    }

    useEffect(() => {
        if (dataRes !== null) {
            setResourceFields(configFields);
            if (configFields?.length > 0)
                setSelectedFieldName(configFields[0].name);

            var mp = {}
            if (dataRes.mappings)
                mp = JSON.parse(dataRes.mappings)
            let mappingFieldsArr = [];
            configFields.forEach((fld) => {
                const mappedField = _.find(mp, { 'destinationColumn': fld.name });
                if (mappedField && mappedField.sourceColumn && sourceFields.includes(mappedField.sourceColumn))
                    mappingFieldsArr.push({ 'destinationColumn': fld.name, 'sourceColumn': mappedField.sourceColumn })
                if (sourceFields.find(field => fld.displayName === field)) {
                    mappingFieldsArr.push({ 'destinationColumn': fld.name, 'sourceColumn': sourceFields.find(field => fld.displayName === field) })
                }
            })
            setMappingFields(mappingFieldsArr);

            // let requiredFieldsAutomapped = true;
            // dataRes.fields.filter(fld => fld.required).forEach((fld) => {
            //     const mappedField = _.find(mappingFieldsArr, { 'destinationColumn': fld.name });
            //     if (!mappedField) {
            //         requiredFieldsAutomapped = false;
            //     }
            // })
            // setFieldsAutoMapped(requiredFieldsAutomapped);
            let autoMappedFieldCount = 0;
            configFields.forEach((fld) => {
                const mappedField = _.find(mappingFieldsArr, { 'destinationColumn': fld.name });
                if (mappedField) {
                    autoMappedFieldCount += 1;
                }
            })
            setAutoMappedFieldsCount(autoMappedFieldCount);
            setRequiredFieldsMapped(areRequiredFieldsMapped());
        }
    }, [dataRes]);

    if (dataLoading) {
        return <MDBox
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
            width="100%"
        >
            <CircularProgress />
        </MDBox>
    }
    if (dataErr) {
        console.error(dataErr)
    }

    const validateMapping = () => {
        let requiredFieldsMapped = true;
        let mappingErrorsArr = [];
        resourceFields.filter(fld => fld.required).forEach((fld) => {
            const mappedField = _.find(mappingFields, { 'destinationColumn': fld.name });
            if (!mappedField) {
                if (requiredFieldsMapped)
                    requiredFieldsMapped = false;
                mappingErrorsArr.push(fld.name);
            }
        });

        if (mappingErrorsArr?.length > 0)
            setMappingErrors(mappingErrorsArr);

        return requiredFieldsMapped;
    }

    const sourceFieldsOptions = sourceFields
        ? sourceFields.filter((el) => !mappingFields.includes(el.toString())).map((el) => el.toString())
        : [];

    const setSourceField = (destField, sourceField) => {
        var arr = [...mappingFields]
        if (_.find(arr, { 'destinationColumn': destField })) {
            if (sourceField)
                _.find(arr, { 'destinationColumn': destField }).sourceColumn = sourceField
            else
                arr = _.filter(arr, (f) => f.destinationColumn !== destField)
        }
        else {
            if (sourceField)
                arr.push({ 'destinationColumn': destField, 'sourceColumn': sourceField })
        }
        setMappingFields(arr)
    }

    const handleOnFieldClick = (fieldName) => {
        setSelectedFieldName(fieldName);
    }

    const handleNext = async () => {
        if (validateMapping()) {
            // if (onMappingNext)
            //     onMappingNext(mappingFields);
            onSuccess(mappingFields)
        }
    }

    const selectedField = resourceFields?.find(f => f.name === selectedFieldName);

    return (
        <MDBox flex={1} display="flex" flexDirection="row">
            <MDBox sx={{ width: "calc(100vw - 620px)", flexBasis: "calc(100vw - 620px)", flexGrow: 1, flexShrink: 1, display: "flex", flexDirection: "column" }}>
                {/* <MDTypography pl={2} mb={2} color="text" variant="button" fontWeight="medium">{`${autoMappedFieldsCount} fields have been automapped successfully.`}</MDTypography> */}
                {
                    autoMappedFieldsCount > 0 &&
                    <Alert
                        severity={"info"}
                        sx={{ marginBottom: 1, fontSize: "14px", textAlign: "left", border: "1px solid #ddd" }}
                    >
                        {`${autoMappedFieldsCount} field(s) have been automatically mapped.`}
                    </Alert>
                }
                <MDBox sx={{
                    height: 40,
                    display: "flex",
                    flexDirection: "row",
                    borderBottom: "2px solid #ddd",
                }}
                >
                    <MDBox flex={1}>
                        <MDTypography pl={2} variant="button" fontWeight="medium">Our fields</MDTypography>
                    </MDBox>
                    <MDBox flex={1}>
                        <MDTypography pl={4} variant="button" fontWeight="medium">Columns in your file</MDTypography>
                    </MDBox>
                </MDBox>
                <MDBox overflow="auto" flex={1}>
                    <YAScrollbar>
                        <MDBox flex={1} pr={1}>
                            <MDBox>
                                <MDTypography pl={2} pt={2} variant="button" fontWeight="light" color="text" component="span" display="block" textAlign="left" pb={1}>
                                    Mandatory fields
                                </MDTypography>
                                {
                                    resourceFields?.filter(f => f.required === true).map((f, i) => {
                                        var destField = f.name;
                                        var selectedColumn;
                                        if (mappingFields.length > 0) {
                                            selectedColumn = _.find(mappingFields, { 'destinationColumn': destField }) ? _.find(mappingFields, { 'destinationColumn': destField }).sourceColumn : undefined;
                                            if (!sourceFields.includes(selectedColumn))
                                                selectedColumn = undefined;
                                        }
                                        const hasError = mappingErrors?.includes(destField);
                                        const selected = selectedFieldName === destField;
                                        return (
                                            <MDBox key={`key${i}`}
                                                onClick={() => handleOnFieldClick(destField)}
                                                sx={theme => fieldStyles(theme, { selected })}
                                            >
                                                <MDBox flex={1} display="flex" alignItems="center" justifyContent="space-between">
                                                    <MDTypography variant="caption" fontWeight="medium" color="text">{f.displayName}</MDTypography>
                                                    <Icon fontSize="large" sx={{ color: "#ddd" }}>arrow_right_alt</Icon>
                                                </MDBox>
                                                <MDBox flex={1} display="flex" alignItems="center">
                                                    <Autocomplete
                                                        // disableClearable
                                                        value={selectedColumn}
                                                        options={sourceFieldsOptions}
                                                        onChange={(event, newValue) => {
                                                            setSourceField(destField, newValue);
                                                            setRequiredFieldsMapped(areRequiredFieldsMapped());
                                                        }}
                                                        size="small"
                                                        // fullWidth
                                                        sx={{
                                                            width: "85%",
                                                            mr: 1,
                                                            "& .MuiOutlinedInput-root": {
                                                                height: 36
                                                            },
                                                            "& .MuiOutlinedInput-input": {
                                                                fontSize: 13
                                                            }
                                                        }}
                                                        renderInput={(params) => <MDInput error={hasError} helperText={hasError ? "Required" : undefined} placeholder="please choose" {...params} />}
                                                    />
                                                    {
                                                        selectedColumn && <Icon color="success">check_circle</Icon>
                                                    }
                                                    {/* {errors[destField] && <MDTypography variant="caption" color="error">Please select a Source Field or 'Ignored'</MDTypography>} */}
                                                </MDBox>
                                            </MDBox>)
                                    })
                                }
                            </MDBox>

                            <MDBox mt={3}>
                                <MDTypography pl={2} pt={2} variant="button" fontWeight="light" color="text" component="span" display="block" textAlign="left" pb={1}>
                                    Optional fields
                                </MDTypography>
                                {
                                    resourceFields?.filter(f => !f.required).map((f, i) => {
                                        var destField = f.name;
                                        var selectedColumn;
                                        if (mappingFields.length > 0) {
                                            selectedColumn = _.find(mappingFields, { 'destinationColumn': destField }) ? _.find(mappingFields, { 'destinationColumn': destField }).sourceColumn : undefined;
                                            if (!sourceFields.includes(selectedColumn))
                                                selectedColumn = undefined;
                                        }
                                        const selected = selectedFieldName === destField;
                                        return (
                                            <MDBox key={`key${i}`}
                                                onClick={() => handleOnFieldClick(destField)}
                                                sx={theme => fieldStyles(theme, { selected })}
                                            >
                                                <MDBox flex={1} display="flex" alignItems="center" justifyContent="space-between">
                                                    <MDTypography variant="caption" fontWeight="medium" color="text">{f.displayName}</MDTypography>
                                                    <Icon fontSize="large" sx={{ color: "#ddd" }}>arrow_right_alt</Icon>
                                                </MDBox>
                                                <MDBox flex={1} display="flex" alignItems="center">
                                                    <Autocomplete
                                                        // disableClearable
                                                        value={selectedColumn}
                                                        options={sourceFieldsOptions}
                                                        onChange={(event, newValue) => {
                                                            setSourceField(destField, newValue);
                                                            setRequiredFieldsMapped(areRequiredFieldsMapped());
                                                        }}
                                                        size="small"
                                                        // fullWidth
                                                        sx={{
                                                            width: "85%",
                                                            mr: 1,
                                                            "& .MuiOutlinedInput-root": {
                                                                height: 36
                                                            },
                                                            "& .MuiOutlinedInput-input": {
                                                                fontSize: 13
                                                            }
                                                        }}
                                                        renderInput={(params) => <MDInput placeholder="please choose" {...params} />}
                                                    />
                                                    {
                                                        selectedColumn && <Icon color="success">check_circle</Icon>
                                                    }
                                                    {/* {errors[destField] && <MDTypography variant="caption" color="error">Please select a Source Field or 'Ignored'</MDTypography>} */}
                                                </MDBox>
                                            </MDBox>)
                                    })
                                }
                            </MDBox>
                        </MDBox>
                    </YAScrollbar>
                </MDBox>
            </MDBox>
            <MDBox sx={{ flexBasis: 400, flexGrow: 0, flexShrink: 0, px: 4 }}>
                <MDBox height="100%" border="1px solid #ddd" borderRadius={8} py={2} display="flex" flexDirection="column">
                    <FieldDataPreview workspaceId={workspaceId} selectedField={selectedField} mappingFields={mappingFields} />
                    <MDBox flex={1} p={3} pb={0} display="flex" alignItems="flex-end" justifyContent="center">
                        <MDButton
                            fullWidth
                            size="medium"
                            color="info"
                            endIcon={<Icon>arrow_forward_ios</Icon>}
                            onClick={handleNext}
                            disabled={!requiredFieldsMapped}
                        >
                            {"Continue"}
                        </MDButton>
                    </MDBox>
                </MDBox>
            </MDBox>
        </MDBox>
    );

};

export default MapFields;