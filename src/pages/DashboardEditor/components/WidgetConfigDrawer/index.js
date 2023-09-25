import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Icon } from "@mui/material";
import MDButton from "components/MDButton";
import YAScrollbar from "components/YAScrollbar";
import WidgetConfigPanel from "../WidgetConfigPanel";

const WidgetConfigDrawer = ({ selectedWidgetId, selectedWidget, onConfigChange, onFilterChange, onClose }) => {
    return <MDBox
        minWidth={350}
        maxWidth={350}
        borderLeft="1px solid #ddd"
        backgroundColor="#fff!important"
        boxShadow="0 8px 16px #1a488e1f!important"
        position="fixed"
        right={0}
        bottom={0}
        top={0}
        zIndex={10}
    >
        <YAScrollbar>
            <MDBox
                position="sticky"
                top={0}
                zIndex={11}
                backgroundColor="#fff!important"
                display="flex"
                px={2.5}
                height={56}
                alignItems="center"
                justifyContent="space-between"
                borderBottom="1px solid #efeaea"
            >
                <MDTypography variant="h5" component="span" fontWeight="medium">
                    Customize Widget
                </MDTypography>
                <MDButton iconOnly onClick={onClose}>
                    <Icon sx={{ fontSize: "20px!important" }}>close</Icon>
                </MDButton>
            </MDBox>
            <MDBox mx={.5} minHeight="90vh">
                <WidgetConfigPanel
                    selectedWidget={selectedWidget}
                    onConfigChange={(configName, value) => onConfigChange(selectedWidgetId, configName, value)}
                    onFilterChange={(filterName, operator, values) => onFilterChange(selectedWidgetId, filterName, operator, values)}
                />
            </MDBox>
        </YAScrollbar>
    </MDBox>
}

export default WidgetConfigDrawer;