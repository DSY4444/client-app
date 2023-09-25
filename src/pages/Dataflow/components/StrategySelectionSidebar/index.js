import { Icon, IconButton } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const strategyItemStyles = ({ palette: { white, info } }) => ({
    display: "flex",
    flexDirection: "column",
    px: 2,
    py: 1.5,
    m: 0.8,
    mb: 2,
    cursor: "pointer",
    borderRadius: "10px",
    border: "1px solid #ddd",
    "& .title": {
        marginBottom: 1
    },
    "&:hover": {
        backgroundColor: info.main
    },
    "&:hover .title, &:hover .subtitle": {
        color: white.main,
    }
});

const StrategySelectionSidebar = ({ options, onOptionSelection, onOptionsClose }) => {

    const handleOnOptionSelection = (value) => {
        if (onOptionSelection) {
            onOptionSelection(value)
        }
        if (onOptionsClose) {
            onOptionsClose();
        }
    }

    return (
        <MDBox display="flex" flexDirection="column" borderLeft="1px solid rgba(0, 0, 0, 0.1)" minWidth={300} maxWidth={400} width="30%" height="100%" position="absolute" top={0} right={0} zIndex={3}
            sx={{
                background: "white",
                boxShadow: "10px 0 8px 8px rgba(0, 0, 0, 0.4)"
            }}
        >
            <MDBox py={1.5} pl={2.5} pr={1} display="flex" justifyContent="space-between" alignItems="center">
                <MDBox>
                    <MDTypography variant="h6" component="span" color="text">Change Mapping Strategy</MDTypography>
                </MDBox>
                <MDBox display="flex">
                    <IconButton onClick={onOptionsClose} title="Close">
                        <Icon>close</Icon>
                    </IconButton>
                </MDBox>
            </MDBox>
            <MDBox px={1.5} height="100%" sx={{ overflowY: "auto" }}>
                {
                    options?.map((option) => {
                        return <MDBox key={`l_${option.value}`}
                            sx={(theme) => strategyItemStyles(theme)}
                            onClick={() => {
                                handleOnOptionSelection(option.value)
                            }}
                        >
                            <MDTypography className="title" variant="caption" color="text">Map by</MDTypography>
                            <MDTypography className="subtitle" variant="caption" fontWeight="medium" color="text">{option.displayName}</MDTypography>
                        </MDBox>
                    })
                }
            </MDBox>
        </MDBox>
    );
};

export default StrategySelectionSidebar;