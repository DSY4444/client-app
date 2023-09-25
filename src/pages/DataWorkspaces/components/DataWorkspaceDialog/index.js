import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { CircularProgress, Icon, IconButton } from "@mui/material";
import { useCallback, useEffect } from "react";
import fetchRequest from "utils/fetchRequest";
import { loadWorkspace, markAsComplete, useDataWorkspaceContext } from "../DataWorkspaceContext";
import DataWorkspaceSteps from "../DataWorkspaceSteps";
import MDButton from "components/MDButton";

export const WorkspaceType = {
    "expenditure": "Actual Spend",
    "expenditureYearly": "Actual Spend (Yearly)"
}

export const WorkspaceStatus = {
    "DRAFT": "Draft"
}

const WorkspaceHeader = ({ loading, workspaceId, onEditorClose }) => {
    const [state, dispatch] = useDataWorkspaceContext();
    const { name, type, status, showMarkAsCompleteBtn } = state;

    const markWorkspaceAsComplete = async () => {
        var [err, ] = await fetchRequest.post(`/api/dataWorkspaces/markAsComplete/${workspaceId}`)
        if (err) {
            // handleError(err);
        }
        else {
            markAsComplete(dispatch);
        }
    };

    const handleOnMarkAsComplete = useCallback(async () => {
        await markWorkspaceAsComplete();
    }, []);

    return <MDBox className="dataprep-editor-toolbar" height={56} px={3} display="flex" alignItems="center">
        {
            !loading && <>
                <MDBox display="flex" alignItems="center" justifyContent="flex-start" mr={6}>
                    <MDTypography component="span" fontWeight={"medium"} color="white">{name}</MDTypography>
                </MDBox>
                <MDBox display="flex" height={38}>
                    <MDBox display="flex" flexDirection="column" ml={4} pl={2} borderLeft="1px solid #555252">
                        <MDTypography color="light" component="span" variant="button" fontWeight={"medium"} lineHeight={1.2}>{WorkspaceType[type]}</MDTypography>
                        <MDTypography color="light" component="span" variant="button">Type</MDTypography>
                    </MDBox>
                    <MDBox display="flex" flexDirection="column" ml={4} pl={2} borderLeft="1px solid #555252">
                        <MDTypography color="white" component="span" variant="button" fontWeight={"medium"} lineHeight={1.2}>In Progress</MDTypography>
                        <MDTypography color="light" component="span" variant="button">Status</MDTypography>
                    </MDBox>
                </MDBox>
            </>
        }
        <MDBox flex={1} display="flex" alignItems="center" justifyContent="flex-end">
            {
                status !== "DATA_PREPARED" && showMarkAsCompleteBtn &&
                <MDButton size="small"
                    sx={{ mr: 3 }}
                    color="success"
                    startIcon={<Icon>done</Icon>}
                    onClick={handleOnMarkAsComplete}
                >
                    Mark as complete
                </MDButton>
            }
            <IconButton color="white" onClick={onEditorClose}>
                <Icon>close</Icon>
            </IconButton>
        </MDBox>
    </MDBox>
}

const containerStyles = ({ palette: { primary } }) => {
    return {
        "& .dataprep-editor-toolbar": {
            backgroundColor: primary.main
        }
    }
}

const DataWorkspaceDialog = (props) => {
    const { workspaceId, onEditorClose } = props;
    const [state, dispatch] = useDataWorkspaceContext();
    const { loading } = state;

    useEffect(() => {
        async function getDashboardDef() {
            var [err, data] = await fetchRequest.get(`/api/dataWorkspaces/custom/${workspaceId}`)
            if (err) {
                // handleError(err);
            }
            else {
                const parsedConfig = JSON.parse(data?.config);
                const parsedUplodConfig = JSON.parse(data?.uploadConfig);
                const parsedMappingConfig = JSON.parse(data?.mappingConfig);
                const parsedReviewConfig = JSON.parse(data?.reviewConfig);
                loadWorkspace(dispatch, {
                    workspaceId,
                    name: data.name,
                    description: data.description,
                    type: data.type,
                    status: data.status,
                    config: parsedConfig,
                    uploadConfig: parsedUplodConfig,
                    mappingConfig: parsedMappingConfig,
                    reviewConfig: parsedReviewConfig
                });
            }
        }

        getDashboardDef();
    }, [workspaceId]);


    return <MDBox sx={theme => containerStyles(theme)}>
        <WorkspaceHeader loading={loading} workspaceId={workspaceId} onEditorClose={onEditorClose} />
        <MDBox height="calc(100vh - 56px)" display="flex" flexDirection="column">
            {
                loading && <MDBox
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                    width="100%"
                >
                    <CircularProgress />
                </MDBox>
            }
            {
                !loading && <DataWorkspaceSteps workspaceId={workspaceId} />
            }
        </MDBox>
    </MDBox>
};

export default DataWorkspaceDialog;