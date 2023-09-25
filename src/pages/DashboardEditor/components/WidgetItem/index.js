import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Card, Icon, IconButton } from "@mui/material";
import { borderRadiusSizes } from "components/VisualizationRenderer/components/ChartRenderer/constants";

const widgetItemStyles = ({ removeCardBorder, cardBackgroundColor, borderRadius, textColor }) => {
    return ({
        height: "100%",
        overflow: "visible",
        position: "relative",
        borderWidth: removeCardBorder ? 0 : 1,
        backgroundColor: cardBackgroundColor,
        boxShadow: "rgba(48, 53, 109, 0.1) 0px 2px 8px",
        borderRadius,
        "& .widgetHeader .MuiTypography-root": {
            color: textColor
        },
        "& .widgetBody *": {
            color: textColor
        }
    });
}

const headerWidgetItemStyles = ({ removeCardBorder, cardBorderColor }) => {
    return ({
        height: "100%",
        overflow: "visible",
        position: "relative",
        borderBottom: removeCardBorder ? "none" : `2px solid ${cardBorderColor}`,
    });
}

const WidgetSetttings = ({ onConfigClick, onDelete, onDuplicate }) => {
    return (
        <MDBox className="widget-settings" onClick={e => e.stopPropagation()}>
            <MDBox display="inherit" position="relative">
                <IconButton color="white" disableRipple size="small">
                    <Icon>drag_indicator</Icon>
                </IconButton>
                <MDBox className="drag-handle" sx={{ position: "absolute", inset: 0, zIndex: 1 }}></MDBox>
            </MDBox>
            <IconButton color="white" disableRipple size="small" onClick={onConfigClick}>
                <Icon>settings</Icon>
            </IconButton>
            <IconButton color="white" disableRipple size="small" className="addl-settings-icon">
                <Icon>chevron_right</Icon>
                <MDBox className="addl-settings">
                    <MDTypography display="flex" alignItems="center" variant="caption" fontWeight="medium" color="light" mb={.75} onClick={onDuplicate}>
                        <Icon fontSize="small">copy</Icon>&nbsp;Duplicate
                    </MDTypography>
                    <MDTypography display="flex" alignItems="center" variant="caption" fontWeight="medium" color="light" onClick={onDelete}>
                        <Icon fontSize="small">delete</Icon>&nbsp;Delete
                    </MDTypography>
                </MDBox>
            </IconButton>
        </MDBox>
    )
};

const WidgetItem = ({ id, widgetType, widgetConfig = {}, onDelete, onDuplicate, onConfigClick, children }) => {

    const cardTitle = widgetConfig["card_title"];
    const cardSubtitle = widgetConfig["card_subtitle"];
    const hideHeader = Boolean(widgetConfig["hide_card_header"]);
    const removeCardBorder = Boolean(widgetConfig["card_remove_border"]);
    const cardBorderRadius = widgetConfig["card_border_radius"];
    const cardBorderColor = widgetConfig["card_border_color"] || "#333333";
    const cardBackgroundColor = widgetConfig["card_background_color"] || "#ffffff";
    const textColor = widgetConfig["text_color"] || "#333333";
    const tableWidgetType = widgetType.indexOf("table") > -1;

    const borderRadius = borderRadiusSizes[cardBorderRadius] || borderRadiusSizes["small"];

    if (["stats", "text"].includes(widgetType))
        return <Card
            key={id}
            onClick={() => onConfigClick(id)}
            sx={() => widgetItemStyles({ removeCardBorder, cardBackgroundColor, borderRadius, textColor })}
        >
            <WidgetSetttings onConfigClick={() => onConfigClick(id)} onDelete={onDelete} onDuplicate={() => onDuplicate(id)} />
            <MDBox className="widgetBody" overflow='hidden' display="flex" flex={1} flexDirection="column">
                {children}
            </MDBox>
        </Card>

    if (widgetType === "header")
        return <MDBox
            key={id}
            onClick={() => onConfigClick(id)}
            sx={() => headerWidgetItemStyles({ removeCardBorder, cardBorderColor })}
        >
            <WidgetSetttings onConfigClick={() => onConfigClick(id)} onDelete={onDelete} onDuplicate={() => onDuplicate(id)} />
            <MDBox overflow='hidden' display="flex" flex={1} height="100%">
                {children}
            </MDBox>
        </MDBox>

    return <Card
        key={id}
        onClick={() => onConfigClick(id)}
        sx={() => widgetItemStyles({ removeCardBorder, cardBackgroundColor, borderRadius, textColor })}
    >
        <WidgetSetttings onConfigClick={() => onConfigClick(id)} onDelete={onDelete} onDuplicate={() => onDuplicate(id)} />
        {
            !hideHeader &&
            <MDBox className="widgetHeader" p={2} display="flex" justifyContent="space-between" alignItems="flex-start">
                <MDBox display="flex" flexDirection="column" flex={1} overflow="hidden">
                    <MDTypography variant="button" component="span" color="text" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis" fontWeight="medium">
                        {cardTitle}
                    </MDTypography>
                    {
                        cardSubtitle && (
                            <MDTypography variant="caption" color="text" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis" mt={0.1}>
                                {cardSubtitle}
                            </MDTypography>
                        )
                    }
                </MDBox>
            </MDBox>
        }
        <MDBox sx={{ height: '100%', border: tableWidgetType ? '1px solid rgba(0, 0, 0, 0.05)' : 'none', overflow: 'hidden', p: tableWidgetType ? 0 : 1, borderRadius: hideHeader ? borderRadius : "unset" }}>
            {children}
        </MDBox>
    </Card>
};

export default WidgetItem;