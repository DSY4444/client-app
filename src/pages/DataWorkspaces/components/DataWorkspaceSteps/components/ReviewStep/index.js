import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { processData } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import { dataProcessed } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import { markAsComplete } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import { setLookups } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import { showNewItems } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import { showMarkAsComplete } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import { useDataWorkspaceContext } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import { useCallback } from "react";
import AnalyzeData from "./AnalyzeData";
import CorrectData from "./CorrectData";
import CorrectedData from "./CorrectedData";
import ProcessData from "./ProcessData";

const ReviewStep = () => {
    const [state, dispatch] = useDataWorkspaceContext();
    const { workspaceId, config, mappingStepConfig, reviewStepConfig: { reviewState } } = state;

    const handleOnAnalyzeDataSuccess = useCallback(() => {
        processData(dispatch);
    }, []);

    const handleOnProcessDataSuccess = useCallback(() => {
        dataProcessed(dispatch);
    }, []);

    const handleOnProceedToCorrectData = useCallback(() => {
        dataProcessed(dispatch);
    }, []);

    const handleOnShowNewItems = useCallback(() => {
        showNewItems(dispatch);
    }, []);

    const handleOnMarkAsComplete = useCallback(() => {
        showMarkAsComplete(dispatch);
    }, []);

    const handleOnCorrectDataSuccess = useCallback(() => {
        markAsComplete(dispatch);
    }, []);

    const handleSetLookups = useCallback((lookups) => {
        setLookups(dispatch, lookups);
    }, []);

    if (reviewState === "correctData")
        return <CorrectData workspaceId={workspaceId} config={config} mappingStepConfig={mappingStepConfig} setLookups={handleSetLookups} onSuccess={handleOnCorrectDataSuccess} onShowNewItems={handleOnShowNewItems} onMarkAsComplete={handleOnMarkAsComplete} />

    if (reviewState === "dataCorrected")
        return <CorrectedData workspaceId={workspaceId} config={config} mappingStepConfig={mappingStepConfig} />

    return (
        <MDBox flex={1} display="flex" height="calc(100vh - 56px)" flexDirection="column" py={3}>
            <MDBox display="flex" flexDirection="row" alignItems="flex-start" justifyContent="space-between" px={2}>
                <MDTypography variant="subtitle1" fontWeight="medium" component="span" textAlign="center">
                    Review
                </MDTypography>
            </MDBox>
            <MDBox flex={1} mt={1} display="flex" sx={{ overflow: "hidden" }}>
                {
                    (reviewState === "analyzeData" || reviewState === "showNewItems") &&
                    <AnalyzeData workspaceId={workspaceId} onSuccess={handleOnAnalyzeDataSuccess} proceedToCorrectData={handleOnProceedToCorrectData} showNewItems={reviewState === "showNewItems"} />
                }
                {
                    reviewState === "processData" &&
                    <ProcessData workspaceId={workspaceId} onSuccess={handleOnProcessDataSuccess} />
                }
            </MDBox>
        </MDBox>
    )
};

export default ReviewStep;