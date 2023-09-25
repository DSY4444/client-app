import { Icon, Stack } from "@mui/material";
import MDBox from "components/MDBox";
import { useCallback } from "react";
import MDTypography from "components/MDTypography";
import { useDataWorkspaceContext } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import { selectStep } from "pages/DataWorkspaces/components/DataWorkspaceContext";

const WizHomeStep = (props) => {
    const { onClick } = props;
    return <MDBox
        sx={{
            mt: 2,
            width: 50,
            height: 50,
            borderRadius: "50%",
            border: "5px solid #ccc",
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            "&:hover": {
                borderColor: "#bbb"
            }
        }}
        onClick={onClick}
    >
        <Icon>home</Icon>
    </MDBox>
};

const WizFinalStep = (props) => {
    const { onClick } = props;
    return <MDBox
        sx={{
            mt: 2,
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "5px solid #ccc",
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            "&:hover": {
                borderColor: "#bbb"
            }
        }}
        onClick={onClick}
    >
        <Icon>done</Icon>
    </MDBox>
};

const wizStepStyles = ({ palette: { success, grey, white } }, { progress, enabled }) => {
    return {
        zIndex: 3,
        width: 40,
        height: 40,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: enabled ? "pointer" : "inherit",
        ...(progress === 0 && {
            border: `4px solid ${grey[300]}`,
            backgroundColor: white.main,
            "& .MuiTypography-root": {
                color: "#ccc"
            },
        }),
        ...(progress > 0 && progress < 100 && {
            border: `4px solid ${success.main}`,
            backgroundColor: white.main,
            "& .MuiTypography-root": {
                color: grey[700]
            },
        }),
        ...(progress === 100 && {
            border: `4px solid ${success.main}`,
            backgroundColor: success.main,
            "& .MuiTypography-root": {
                color: white.main
            },
        })
    }
};

const WizStep = (props) => {
    const { stepNumber, progress, onClick } = props;
    return <MDBox sx={theme => wizStepStyles(theme, { progress, enabled: !!onClick })} onClick={onClick}>
        <MDTypography fontWeight="medium">{stepNumber}</MDTypography>
    </MDBox>
};

const Progressbar = () => {
    const [state, dispatch] = useDataWorkspaceContext();
    const { currentStep, stepProgress, status } = state;

    const handleOnStepClick = useCallback((stepKey) => {
        selectStep(dispatch, stepKey);
    }, []);

    const percentageComplete = Math.min(parseInt(((currentStep - 1) * 33) + (34 * stepProgress / 100)), 100)
    return (
        <MDBox
            sx={{
                width: 120,
                flexBasis: 120,
                flexGrow: 0,
                flexShrink: 0,
                // borderRight: "1px solid #ddd",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                pt: 3
            }}
        >
            <MDBox sx={{
                width: 70, height: 70, borderRadius: "50%", border: "1px solid #ddd", mb: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                <MDTypography variant="subtitle1" fontWeight="medium" component="span">
                    {`${percentageComplete}%`}
                </MDTypography>
            </MDBox>
            <WizHomeStep onClick={() => handleOnStepClick("home")} />
            <Stack
                spacing={3}
                sx={({ palette: { success, grey } }) => ({
                    my: 1,
                    position: "relative",
                    zIndex: 0,
                    "&::before": {
                        content: "''",
                        position: "absolute",
                        zIndex: 1,
                        top: 0,
                        bottom: 0,
                        left: "calc(50% - 2px)",
                        width: 4,
                        backgroundColor: grey[300]
                    },
                    "&::after": {
                        content: "''",
                        position: "absolute",
                        zIndex: 2,
                        top: 0,
                        bottom: 0,
                        left: "calc(50% - 2px)",
                        width: 4,
                        height: `${(currentStep - 1) * 50}%`,
                        backgroundColor: success.main
                    }
                })}
            >
                <WizStep onClick={currentStep >= 1 ? () => handleOnStepClick("upload") : undefined} stepNumber={1} currentStep={currentStep === 1} progress={currentStep > 1 ? 100 : currentStep === 1 ? stepProgress : 0} />
                <WizStep onClick={currentStep >= 2 ? () => handleOnStepClick("mapping") : undefined} stepNumber={2} currentStep={currentStep === 2} progress={currentStep > 2 ? 100 : currentStep === 2 ? stepProgress : 0} />
                <WizStep onClick={currentStep === 3 ? () => handleOnStepClick("review") : undefined} stepNumber={3} currentStep={currentStep === 3} progress={currentStep === 3 ? stepProgress : 0} />
            </Stack>
            {
                status === "DATA_PREPARED" &&
                <WizFinalStep onClick={() => handleOnStepClick("finalized")} />
            }
        </MDBox>
    )
};

export default Progressbar;