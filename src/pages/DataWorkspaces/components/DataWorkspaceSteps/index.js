import MDBox from "components/MDBox";
import Progressbar from "./components/Progressbar";
import HomeStep from "./components/HomeStep";
import { useDataWorkspaceContext } from "../DataWorkspaceContext";
import UploadStep from "./components/UploadStep";
import MappingStep from "./components/MappingStep";
import ReviewStep from "./components/ReviewStep";
import FinalizedStep from "./components/FinalizedStep";

const DataWorkspaceSteps = (props) => {
    const { workspaceId } = props;
    const [state,] = useDataWorkspaceContext();
    const { selectedStepKey } = state;

    return (
        <MDBox height="100%" display="flex">
            <Progressbar />
            <MDBox width="calc(100vw - 120px)" display="flex">
                {
                    selectedStepKey === "home" && <HomeStep />
                }
                {
                    selectedStepKey === "upload" && <UploadStep workspaceId={workspaceId} />
                }
                {
                    selectedStepKey === "mapping" && <MappingStep workspaceId={workspaceId} />
                }
                {
                    selectedStepKey === "review" && <ReviewStep workspaceId={workspaceId} />
                }
                {
                    selectedStepKey === "finalized" && <FinalizedStep workspaceId={workspaceId} />
                }
            </MDBox>
        </MDBox>
    );
};

export default DataWorkspaceSteps;