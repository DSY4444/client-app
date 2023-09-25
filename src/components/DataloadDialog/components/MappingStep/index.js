import { useEffect, useState } from "react";
import { Autocomplete, Icon, IconButton, Tooltip } from "@mui/material";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import _ from "lodash";
import MDButton from "components/MDButton";
import useFetchRequest from "hooks/useFetchRequest";
import YASkeleton from "components/YASkeleton";

const MappingStep = (props) => {

    const { uploadSubType, sourceFields, onMappingBack, onMappingNext } = props;

    const [fieldsAutoMapped, setFieldsAutoMapped] = useState(false);
    const [resourceFields, setResourceFields] = useState([]);
    const [mappingFields, setMappingFields] = useState([]);
    const [mappingErrors, setMappingErrors] = useState([]);
    const [destinationTable, setDestinationTable] = useState(null);

    const { response: dataRes, error: dataErr, loading: dataLoading } = useFetchRequest(`/api/dataload/def/${uploadSubType}`);

    useEffect(() => {
        if (dataRes !== null) {
            setDestinationTable(dataRes.name || uploadSubType);
            setResourceFields(dataRes.fields);

            var mp = {}
            if (dataRes.mappings)
                mp = JSON.parse(dataRes.mappings)
            let mappingFieldsArr = [];
            dataRes.fields.forEach((fld) => {
                const mappedField = _.find(mp, { 'destinationColumn': fld.name });
                if (mappedField && mappedField.sourceColumn && sourceFields.includes(mappedField.sourceColumn))
                    mappingFieldsArr.push({ 'destinationColumn': fld.name, 'sourceColumn': mappedField.sourceColumn })
                else if (sourceFields.find(field => fld.displayName === field)){
                    mappingFieldsArr.push({ 'destinationColumn': fld.name, 'sourceColumn': sourceFields.find(field => fld.displayName === field) })
                }
            })
            setMappingFields(mappingFieldsArr);

            let requiredFieldsAutomapped = true;
            dataRes.fields.filter(fld => fld.required).forEach((fld) => {
                const mappedField = _.find(mappingFieldsArr, { 'destinationColumn': fld.name });
                if (!mappedField) {
                    requiredFieldsAutomapped = false;
                }
            })
            setFieldsAutoMapped(requiredFieldsAutomapped);
        }
    }, [dataRes]);

    if (dataLoading) {
        return <MDBox height="400px" width="600px"><YASkeleton variant="loading" /></MDBox>;
    }
    if (dataErr)
        console.error(dataErr)

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

    const handleBack = () => {
        if (onMappingBack)
            onMappingBack();
    }

    const handleNext = () => {
        if (validateMapping()) {
            if (onMappingNext)
                onMappingNext(mappingFields, destinationTable);
        }
    }

    return (
        <>
            {
                !fieldsAutoMapped && (
                    <MDBox height="400px" width="600px" overflow="scroll" p={3}>
                        <MDBox>
                            <MDTypography variant="h5" fontWeight="light" color="text" component="span" display="block" textAlign="left" pb={1}>
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
                                    return (
                                        <MDBox key={`key${i}`} display="flex" pb={1.5}>
                                            <MDBox sx={ {"&:hover": { "& .helpIcon" : { visibility: 'visible' } }} } flex={1}>
                                                <MDTypography variant="caption" fontWeight="medium" color="text">{f.displayName}</MDTypography>
                                                {f.toolTip?.length >= 0 && 
                                                    <IconButton className="helpIcon"
                                                        sx={({ palette: { text } }) => ({
                                                        // marginLeft: .15,
                                                        // marginBottom: 1,
                                                        paddingTop: 1,
                                                        marginRight: -2,
                                                        color: "#979191",
                                                        visibility: 'hidden',
                                                        "&:hover": {
                                                            color: text.main
                                                        }
                                                        })}
                                                        size="small"
                                                    //   onClick={() => {
                                                    //     // showinapphelp ? showinapphelp === 'true' ? openContextHelp(dispatch, pageName) :  window.open(helpCenterUrl+'/'+pageName,'yarkenhelp') :  window.open(helpCenterUrl+'/'+pageName,'yarkenhelp');
                                                    //     window.open(helpCenterUrl+'/'+pageName,'yarkenhelp');
                                                    //   }}
                                                    >
                                                        <Tooltip placement="right" title={f.toolTip ? f.toolTip : f.displayName}>
                                                            <Icon>help</Icon>
                                                        </Tooltip>
                                                    </IconButton>
                                                }
                                            </MDBox>
                                            <MDBox flex={1}>
                                                <Autocomplete
                                                    // disableClearable
                                                    value={selectedColumn}
                                                    options={sourceFieldsOptions}
                                                    onChange={(event, newValue) => {
                                                        setSourceField(destField, newValue)
                                                    }}
                                                    size="small"
                                                    fullWidth
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": {
                                                            height: 42
                                                        },
                                                        "& .MuiOutlinedInput-input": {
                                                            fontSize: 13
                                                        }
                                                    }}
                                                    renderInput={(params) => <MDInput error={hasError} helperText={hasError ? "Required" : undefined} placeholder="please choose" {...params} />}
                                                />
                                                {/* {errors[destField] && <MDTypography variant="caption" color="error">Please select a Source Field or 'Ignored'</MDTypography>} */}
                                            </MDBox>
                                        </MDBox>)
                                })
                            }
                        </MDBox>

                        <MDBox mt={3}>
                            <MDTypography variant="h5" fontWeight="light" color="text" component="span" display="block" textAlign="left" pb={1}>
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
                                    return (
                                        <MDBox key={`key${i}`} display="flex" pb={1.5}>
                                            <MDBox sx={ {"&:hover": { "& .helpIcon" : { visibility: 'visible' } }} } flex={1}>
                                                <MDTypography variant="caption" fontWeight="medium" color="text">{f.displayName}</MDTypography>
                                                {f.toolTip?.length >= 0 && 
                                                    <IconButton className="helpIcon"
                                                        sx={({ palette: { text } }) => ({
                                                        // marginLeft: .15,
                                                        // marginBottom: 1,
                                                        paddingTop: 1,
                                                        marginRight: -2,
                                                        color: "#979191",
                                                        visibility: 'hidden',
                                                        "&:hover": {
                                                            color: text.main
                                                        }
                                                        })}
                                                        size="small"
                                                    //   onClick={() => {
                                                    //     // showinapphelp ? showinapphelp === 'true' ? openContextHelp(dispatch, pageName) :  window.open(helpCenterUrl+'/'+pageName,'yarkenhelp') :  window.open(helpCenterUrl+'/'+pageName,'yarkenhelp');
                                                    //     window.open(helpCenterUrl+'/'+pageName,'yarkenhelp');
                                                    //   }}
                                                    >
                                                        <Tooltip placement="right" title={f.toolTip ? f.toolTip : f.displayName }>
                                                            <Icon>help</Icon>
                                                        </Tooltip>
                                                    </IconButton>
                                                }
                                            </MDBox>
                                            <MDBox flex={1}>
                                                <Autocomplete
                                                    // disableClearable
                                                    value={selectedColumn}
                                                    options={sourceFieldsOptions}
                                                    onChange={(event, newValue) => {
                                                        setSourceField(destField, newValue)
                                                    }}
                                                    size="small"
                                                    fullWidth
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": {
                                                            height: 42
                                                        },
                                                        "& .MuiOutlinedInput-input": {
                                                            fontSize: 13
                                                        }
                                                    }}
                                                    renderInput={(params) => <MDInput placeholder="please choose" {...params} />}
                                                />
                                                {/* {errors[destField] && <MDTypography variant="caption" color="error">Please select a Source Field or 'Ignored'</MDTypography>} */}
                                            </MDBox>
                                        </MDBox>)
                                })
                            }
                        </MDBox>
                    </MDBox>
                )
            }
            {
                fieldsAutoMapped && (
                    <MDBox height="400px" width="600px" p={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                        <MDBox sx={() => ({
                            height: 60,
                            width: 60,
                            borderRadius: "50%",
                            backgroundColor: "#4CAF50",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        })
                        }>
                            <Icon
                                fontSize="50"
                                sx={{
                                    fontSize: 35,
                                    color: "#fff"
                                }}>checklist_rtl</Icon>
                        </MDBox>
                        <MDTypography mt={2} color="text" variant="subtitle1" fontWeight="light">All required fields have been automapped successfully.</MDTypography>
                        <MDTypography my={2} color="text" variant="button" fontWeight="medium">Want to edit field mapping?</MDTypography>
                        <MDButton variant="outlined" color="info" startIcon={<Icon>edit</Icon>} onClick={() => { setFieldsAutoMapped(false) }}>
                            edit mapping
                        </MDButton>
                    </MDBox>
                )
            }
            <MDBox px={2.5} pb={2} pt={1} display="flex" justifyContent="space-between" alignItems="center">
                <MDBox>
                    <MDButton
                        size="medium"
                        color="info"
                        startIcon={<Icon>arrow_back_ios</Icon>}
                        onClick={handleBack}
                    >
                        Prev
                    </MDButton>
                </MDBox>
                <MDTypography color="text" variant="subtitle2" fontWeight="medium">Field Mapping</MDTypography>
                <MDBox>
                    <MDButton
                        size="medium"
                        color="info"
                        endIcon={<Icon>arrow_forward_ios</Icon>}
                        onClick={handleNext}
                    >
                        Finish
                    </MDButton>
                </MDBox>
            </MDBox>
        </>
    );

};

export default MappingStep;