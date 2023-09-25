import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Icon } from "@mui/material";
import { chartTypeIcons } from "utils/charts";

const widgetListItemStyles = ({ palette: { white, info, success, error } }, { removeFromSelection }) => {
    return {
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        // mx: 1,
        my: 1.5,
        cursor: 'pointer',
        border: '1px solid #ddd',
        // backgroundColor: hightLight ? info.main : '#fff',
        borderRadius: "8px",
        boxShadow: "0rem 0.125rem 0.5625rem -0.3125rem rgb(0 0 0 / 15%)",
        // "& .MuiTypography-root, & .MuiIcon-root": {
        //   color: hightLight ? "#fff" : 'inehrit',
        // },
        // opacity: removeFromSelection ? 1 : .5,
        // "&:hover": {
        //     opacity: 1,
        // },
        "& .widgetListItem-addButton": {
            display: 'none',
            position: "absolute",
            inset: 0,
            zIndex: 1,
            backgroundColor: removeFromSelection ? error.main : info.main,
            p: 1.5,
            pl: 5,
            borderRadius: "8px",
        },
        "& .widgetListItem-addButton .MuiIcon-root": {
            color: "#fff",
        },
        "&:hover .widgetListItem-addButton": {
            display: 'flex',
            alignItems: 'center',
            // justifyContent: 'center',
        },
        "& .widgetListItem-addedIcon": {
            backgroundColor: success.main,
            color: white.main,
            position: "absolute",
            right: -6,
            top: -6,
            height: 16,
            width: 16,
            borderRadius: "50%",
            fontSize: "12px!important",
            pt: .25
        }
    };
};

const DependentWidgetListItem = ({ widget, removeFromSelection, onClick }) => {

    const displayName = widget.vizOptions?.config?.["card_title"] || widget.name;

    const iconType = chartTypeIcons[widget.vizState?.chartType] || { icon: "dashboard_customize" };

    const handleOnClick = () => {
        onClick(widget.id)
    };

    return <MDBox sx={theme => widgetListItemStyles(theme, { removeFromSelection })} onClick={handleOnClick}>
        <MDBox display="flex" alignItems="center" ml={1.5}>
            <Icon sx={{ color: '#979aac', transform: iconType.rotate ? "rotateZ(90deg)" : "none" }}>{iconType.icon}</Icon>
        </MDBox>
        <MDBox py={1.5} pl={1.2} pr={2} display="flex" flexDirection="column">
            <MDTypography variant="caption" color="dark" mt={.25}>
                {displayName}
            </MDTypography>
        </MDBox>
        <MDBox className="widgetListItem-addButton">
            <Icon>{removeFromSelection ? "delete" : "add"}</Icon>
            <MDTypography variant="caption" fontWeight="medium" color="white" ml={1.5}>
                {`Click to ${removeFromSelection ? "remove" : "add"}`}
            </MDTypography>
        </MDBox>
        {
            removeFromSelection && <Icon className="widgetListItem-addedIcon">done</Icon>
        }
    </MDBox>
};

export default DependentWidgetListItem;
