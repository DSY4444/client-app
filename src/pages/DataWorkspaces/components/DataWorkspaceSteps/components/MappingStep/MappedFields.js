import { useEffect, useState } from "react";
import { Icon, List, ListItem } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import _ from "lodash";
import MDButton from "components/MDButton";
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
            <List sx={{ px: 3 }}>
                {
                    sampleValues?.map((v, vi) => <ListItem key={vi}><MDTypography my={.5} key={v} variant="caption" color="text">{v[selectedColumn]}</MDTypography></ListItem>)
                }
            </List>
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

const MappedFields = (props) => {
    const { workspaceId, status, configFields, mappings } = props;
    const [selectedFieldName, setSelectedFieldName] = useState(configFields[0].name);

    const handleOnFieldClick = (fieldName) => {
        setSelectedFieldName(fieldName);
    }

    const handleNext = async () => {

    }

    const selectedField = configFields?.find(f => f.name === selectedFieldName);
    const mappedFieldNames = mappings?.map(m => m.destinationColumn) || [];
    const mappedMandatoryFields = configFields?.filter(f => f.required && mappedFieldNames.includes(f.name))
    const mappedOptionalFields = configFields?.filter(f => !f.required && mappedFieldNames.includes(f.name))

    return (
        <MDBox flex={1} display="flex" flexDirection="row">
            <MDBox sx={{ width: "calc(100vw - 620px)", flexBasis: "calc(100vw - 620px)", flexGrow: 1, flexShrink: 1, display: "flex", flexDirection: "column" }}>
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
                                    mappedMandatoryFields.map((f, i) => {
                                        var sourceColumnName = mappings.find(m => m.destinationColumn === f.name)?.sourceColumn || "";
                                        const selected = selectedFieldName === f.name;
                                        return (
                                            <MDBox key={`key${i}`}
                                                onClick={() => handleOnFieldClick(f.name)}
                                                sx={theme => fieldStyles(theme, { selected })}
                                            >
                                                <MDBox flex={1} display="flex" alignItems="center" justifyContent="space-between">
                                                    <MDTypography variant="caption" fontWeight="medium" color="text">{f.displayName}</MDTypography>
                                                    <Icon fontSize="large" sx={{ color: "#ddd" }}>arrow_right_alt</Icon>
                                                </MDBox>
                                                <MDBox flex={1} pl={2} display="flex" alignItems="center">
                                                    <MDTypography variant="caption" fontWeight="medium" color="text">{sourceColumnName}</MDTypography>
                                                </MDBox>
                                            </MDBox>)
                                    })
                                }
                            </MDBox>

                            <MDBox mt={3}>
                                {
                                    mappedOptionalFields?.length > 0 &&
                                    <MDTypography pl={2} pt={2} variant="button" fontWeight="light" color="text" component="span" display="block" textAlign="left" pb={1}>
                                        Optional fields
                                    </MDTypography>
                                }
                                {
                                    mappedOptionalFields.map((f, i) => {
                                        var sourceColumnName = mappings.find(m => m.destinationColumn === f.name)?.sourceColumn || "";
                                        const selected = selectedFieldName === f.name;
                                        return (
                                            <MDBox key={`key${i}`}
                                                onClick={() => handleOnFieldClick(f.name)}
                                                sx={theme => fieldStyles(theme, { selected })}
                                            >
                                                <MDBox flex={1} display="flex" alignItems="center" justifyContent="space-between">
                                                    <MDTypography variant="caption" fontWeight="medium" color="text">{f.displayName}</MDTypography>
                                                    <Icon fontSize="large" sx={{ color: "#ddd" }}>arrow_right_alt</Icon>
                                                </MDBox>
                                                <MDBox flex={1} pl={2} display="flex" alignItems="center">
                                                    <MDTypography variant="caption" fontWeight="medium" color="text">{sourceColumnName}</MDTypography>
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
                    <FieldDataPreview workspaceId={workspaceId} selectedField={selectedField} mappingFields={mappings} />
                    <MDBox flex={1} p={3} pb={0} display="flex" alignItems="flex-end" justifyContent="center">
                        {
                            status !== "DATA_PREPARED" &&
                            <MDButton
                                fullWidth
                                size="medium"
                                color="info"
                                startIcon={<Icon>edit</Icon>}
                                onClick={handleNext}
                            >
                                {"Edit Mapping"}
                            </MDButton>
                        }
                    </MDBox>
                </MDBox>
            </MDBox>
        </MDBox>
    );

};

export default MappedFields;