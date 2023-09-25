import { Stack, Tooltip } from "@mui/material";
import MDBox from "components/MDBox";

const legendStyle = () => ({
    position: "absolute",
    top: 0,
    bottom: 100,
    zIndex: 6,
    display: "flex",
    alignItems: "center",
    "& .legend": {
        margin: "15px",
        width: 27,
        py: 2,
        boxShadow: "0 0 2px 1px rgba(0, 0, 0, 0.08)",
    },
    "& .legendItem": {
        display: "block",
        height: 16,
        width: 16,
        borderRadius: "50%",
    },
    "& .unallocatedType": {
        backgroundColor: "#1c204d"
    },
    "& .parAllocatedType": {
        position: "relative",
        border: "1px solid #1c204d",
        backgroundColor: "#f6f5f2",
    },
    "& .parAllocatedType::after": {
        content: '""',
        position: "absolute",
        left: -1,
        bottom: -1,
        height: 16,
        width: 16,
        border: "1px solid #1c204d",
        borderRadius: "50%",
        backgroundColor: "#1c204d",
        clipPath: "polygon(0px 50%, 100% 50%, 100% 100%, 0% 100%)"
    },
    "& .fullAllocatedType": {
        border: "1px solid #1c204d",
        backgroundColor: "#f6f5f2",
    },
    "& .overAllocatedType": {
        borderRadius: "50%",
        backgroundColor: "#ff0000"
    }
});

const Legend = () => {
    return (
        <MDBox sx={theme => legendStyle(theme)}>
            <MDBox bgColor="white" className="legend">
                <Stack sx={{ width: 27 }} direction={"column"} spacing={1.75} justifyContent={"center"} alignItems={"center"}>
                    <Tooltip placement="right" title="Unmapped spend">
                        <span className="legendItem unallocatedType"></span>
                    </Tooltip>
                    <Tooltip placement="right" title="Partially mapped spend">
                        <span className="legendItem parAllocatedType"></span>
                    </Tooltip>
                    <Tooltip placement="right" title="Fully mapped spend">
                        <span className="legendItem fullAllocatedType"></span>
                    </Tooltip>
                    <Tooltip placement="right" title="Over mapped spend">
                        <span className="legendItem overAllocatedType"></span>
                    </Tooltip>
                </Stack>
            </MDBox>
        </MDBox>
    );
};

export default Legend;