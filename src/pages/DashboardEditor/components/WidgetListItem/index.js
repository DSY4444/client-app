import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Icon } from "@mui/material";
import { parseJsonString } from "utils";
import { chartTypeIcons } from "utils/charts";

const widgetListItemStyles = ({ palette: { info } }) => {
    return {
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        mx: 1,
        my: 1.5,
        cursor: 'pointer',
        border: '1px solid #ddd',
        // backgroundColor: hightLight ? info.main : '#fff',
        borderRadius: "8px",
        boxShadow: "0rem 0.125rem 0.5625rem -0.3125rem rgb(0 0 0 / 15%)",
        // "& .MuiTypography-root, & .MuiIcon-root": {
        //   color: hightLight ? "#fff" : 'inehrit',
        // },
        "& .widgetListItem-addButton": {
            display: 'none',
            position: "absolute",
            inset: 0,
            zIndex: 1,
            backgroundColor: info.main,
            p: 1.5,
            pl: 4,
        },
        "& .widgetListItem-addButton .MuiIcon-root": {
            color: "#fff",
        },
        "&:hover .widgetListItem-addButton": {
            display: 'flex',
            alignItems: 'center',
            // justifyContent: 'center',
        }
    };
};

const WidgetListItem = ({ widget, onClick }) => {

    const { name, report, config } = widget;

    const parsedWidgetConfig = parseJsonString(config);

    const iconType = chartTypeIcons[parsedWidgetConfig?.vizState?.chartType] || { icon: "dashboard_customize" };

    const handleOnClick = () => {
        onClick(name, parsedWidgetConfig)
    };

    return <MDBox
        sx={theme => widgetListItemStyles(theme)} onClick={handleOnClick}
        // className="droppable-element"
        // draggable={true}
        // unselectable="on"
        // // this is a hack for firefox
        // // Firefox requires some kind of initialization
        // // which we can do by adding this attribute
        // // @see https://bugzilla.mozilla.org/show_bug.cgi?id=568313
        // onDragStart={e => e.dataTransfer.setData("text/plain", "")}
    >
        <MDBox display="flex" alignItems="center" ml={1.5}>
            <Icon fontSize="large" sx={{ color: '#979aac', transform: iconType.rotate ? "rotateZ(90deg)" : "none" }}>{iconType.icon}</Icon>
        </MDBox>
        <MDBox py={1.5} pl={1.2} pr={2} display="flex" flexDirection="column">
            <MDTypography variant="caption" fontWeight="medium" mt={.25}>
                {name}
            </MDTypography>
            {
                report && <MDTypography variant="caption" color="text" mt={.35}>
                    {report}
                </MDTypography>
            }
        </MDBox>
        <MDBox className="widgetListItem-addButton">
            <Icon fontSize="large">dashboard_customize</Icon>
            <MDTypography variant="button" fontWeight="medium" color="white" ml={1.5}>
                Click to add
            </MDTypography>
        </MDBox>
    </MDBox>
};

export default WidgetListItem;
