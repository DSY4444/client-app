import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import fetchRequest from "utils/fetchRequest";
import { useDataWorkspaceContext } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import { setFieldsMapping } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import MapFields from "./MapFields";
import { useCallback } from "react";
import MappedFields from "./MappedFields";

const MappingStep = () => {
    const [state, dispatch] = useDataWorkspaceContext();
    const { workspaceId, type, status, config: { fields }, mappingStepConfig: { mappingState, inputFileColumnNames, mappings } } = state;

    const handleOnMappingSuccess = useCallback(async (mappingFields) => {
        const [error, data] = await fetchRequest.post(`/api/dataWorkspaces/savemapping/${workspaceId}`, JSON.stringify({ mappingFields }));
        if (error) {
            // showAlert('Save Dashboard', error?.data?.message || 'Something went wrong. Contact your administrator.');
            console.error(error);
        }
        else
            if (data && data.result === true) {
                // showSnackbar(data.message, "success");
                // if (onSuccess) onSuccess();
                setFieldsMapping(dispatch, mappingFields);
            }
            else if (data && data.result === false) {
                // showAlert('Save Dashboard', data.message || 'Something went wrong. Contact your administrator.');
            }
    }, [dispatch, workspaceId]);

    return (
        <MDBox flex={1} display="flex" height="calc(100vh - 56px)" flexDirection="column" pt={3} pb={4}>
            <MDBox display="flex" flexDirection="row" alignItems="flex-start" justifyContent="space-between" px={2}>
                <MDTypography variant="subtitle1" fontWeight="medium" component="span" textAlign="center">
                    {mappingState === "mapFields" ? "Map fields" : "Mapped fields"}
                </MDTypography>
            </MDBox>
            <MDBox flex={1} mt={2} display="flex" sx={{ overflow: "hidden" }}>
                {
                    mappingState === "mapFields" &&
                    <MapFields workspaceId={workspaceId} type={type} configFields={fields} sourceFields={inputFileColumnNames} onSuccess={handleOnMappingSuccess} />
                }
                {
                    mappingState === "fieldsMapped" &&
                    <MappedFields workspaceId={workspaceId} status={status} type={type} configFields={fields} sourceFields={inputFileColumnNames} mappings={mappings} />
                }
            </MDBox>
        </MDBox>
    );

};

export default MappingStep;