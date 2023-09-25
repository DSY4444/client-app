import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { memo } from "react";
import numeral from 'numeral';

const valueChipStyles = ({ palette: { white, primary } }, { pinned, percentage, overAllocated, relatedNode }) => {
    let percent = percentage || 0;
    return ({
        "@keyframes hotspot-expand": {
            "0%": {
                transform: "scale(.5)",
                opacity: 1
            },
            to: {
                transform: "scale(1.5)",
                opacity: 0
            }
        },
        cursor: "pointer",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 300ms",
        "& .chipContainer": {
            opacity: pinned || relatedNode ? '1!important' : 'inherit',
            height: 48,
            width: 96,
            borderRadius: 28,
            position: "relative",
            overflow: "hidden",
        },
        "&::before": pinned ? {
            content: "''",
            position: "absolute",
            height: 48,
            width: 96,
            borderRadius: 28,
            opacity: 0,
            background: "#1c204d",
            animation: "hotspot-expand 1.25s infinite",
        } : {},
        "& .background": {
            borderRadius: 28,
            borderStyle: "solid",
            borderWidth: pinned ? 3 : 2,
            borderColor: overAllocated ? "red" : "#1c204d",
            background: overAllocated ? "red" : "#f6f5f2",
            // border: "2px solid #1c204d",
            // background: "#f6f5f2",
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
        },
        "& .foreground": {
            borderRadius: 28,
            background: "#1c204d",
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            clipPath: `polygon(0 ${percent}%, 100% ${percent}%, 100% 100%, 0% 100%);`
        },
        "& .foreground .MuiTypography-root": {
            color: white.main,
        },
        "& .title": {
            opacity: pinned || relatedNode ? '1!important' : 'inherit',
            width: 156,
            height: 36,
            position: "absolute",
            bottom: -38,
            whiteSpace: "pre-wrap",
        },
        "& .pinnedIcon": {
            position: "absolute",
            bottom: -72,
            padding: .5
        },
        "&:hover .background": {
            borderWidth: 3,
        },
        "&:hover .title": {
            color: primary.main,
        },
        // ".blurUnselected &:not(:hover)": {
        //     opacity: 0.1,
        // },
    })
}

const ValueChip = (props) => {
    const { id, title, amount, pinned, pinnedNodeId, relatedNode, allocatedPercentage, overAllocated, onHover, onPin } = props;
    const percentage = allocatedPercentage > 90 && allocatedPercentage < 100 ? 90 : allocatedPercentage;

    return (
        <MDBox sx={theme => valueChipStyles(theme, { pinned, percentage, overAllocated, relatedNode })}
            onMouseEnter={() => {
                if (!pinnedNodeId || pinned)
                    onHover({ id })
            }}
            onMouseLeave={() => {
                if (!pinnedNodeId || pinned)
                    onHover(undefined)
            }}
            onClick={(e) => {
                const moveViewport = e.clientX > (window.innerWidth - 750);
                const moveViewportBy = moveViewport ? 750 - (window.innerWidth - e.clientX) : null;
                onPin(moveViewportBy, { id, title, amount, allocatedPercentage })
            }}
        >
            <MDBox className="chipContainer">
                <MDBox className="background">
                    <MDTypography textAlign="center" variant="h5" component="span" fontWeight="medium" color={overAllocated ? "white" : "primary"}>{numeral(amount).format('($0.00a)')}</MDTypography>
                </MDBox>
                <MDBox className="foreground">
                    <MDTypography textAlign="center" variant="h5" component="span" fontWeight="medium">{numeral(amount).format('($0.00a)')}</MDTypography>
                </MDBox>
            </MDBox>
            <MDTypography className="title" variant="caption" fontWeight="medium" color="text" py={.35}>{title}</MDTypography>
        </MDBox>
    );
}

export default memo(ValueChip);