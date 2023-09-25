import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { ClickAwayListener, Icon } from "@mui/material";
import MDButton from "components/MDButton";
import YAScrollbar from "components/YAScrollbar";
import EmptyState from "components/EmptyState";
import WidgetListItem from "../WidgetListItem";

const textWidget = {
    config: "{\"vizState\":{\"chartType\":\"text\"},\"vizOptions\":{\"config\":{\"card_title\":\"Title\", \"card_subtitle\":\"Sub Title\", \"card_body_text\":\"Body Text\"}}}",
    name: "Text",
    report: "Text Block"
}

const headerWidget = {
    config: "{\"vizState\":{\"chartType\":\"header\"},\"vizOptions\":{\"config\":{\"card_title\":\"Header\", \"card_subtitle\":\"Sub Header\"}}}",
    name: "Header",
    report: "Section Header"
}

const WidgetListDrawer = ({ widgetList, onAddWidget, onClose }) => {
    return (
        <MDBox
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
                    <MDTypography variant="button" component="span" fontWeight="medium">
                        Add Widget
                    </MDTypography>
                    <MDButton iconOnly onClick={onClose}>
                        <Icon sx={{ fontSize: "20px!important" }}>close</Icon>
                    </MDButton>
                </MDBox>
                <ClickAwayListener onClickAway={onClose}>
                    <MDBox>
                        {
                            widgetList?.length > 0 &&
                            <MDBox mx={.5} minHeight="90vh">
                                <MDBox mx={2} mb={-.5} mt={1}>
                                    <MDTypography variant="button" fontWeight="medium">Default</MDTypography>
                                </MDBox>
                                <WidgetListItem widget={headerWidget} onClick={onAddWidget} />
                                <WidgetListItem widget={textWidget} onClick={onAddWidget} />
                                <MDBox mx={2} mb={-.5} mt={1}>
                                    <MDTypography variant="button" fontWeight="medium">Saved Reports</MDTypography>
                                </MDBox>
                                {
                                    widgetList?.map(a => (
                                        <WidgetListItem key={a.id} widget={a} onClick={onAddWidget} />
                                    ))
                                }
                            </MDBox>
                        }
                        {
                            widgetList?.length === 0 &&
                            <MDBox
                                px={2}
                                height="80vh"
                                flex={1}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <EmptyState
                                    size="medium"
                                    iconName="dashboard_customize"
                                    title={"No Widgets Found"}
                                    description={"Go to analytics screen, save some reports and come back."}
                                    variant="text"
                                />
                            </MDBox>
                        }
                    </MDBox>
                </ClickAwayListener>
            </YAScrollbar>
        </MDBox>
    );
}

export default WidgetListDrawer;