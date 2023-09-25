import { useRef, useState } from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Card, Icon, Modal, Stack, Tooltip } from "@mui/material";
import { borderRadiusSizes } from "components/VisualizationRenderer/components/ChartRenderer/constants";
import RowMenu from "components/RowMenu";
import { WidgetItemContext } from "context/WidgetItemContext";

const widgetTextStyles = (textColorVal) => ({
    display: "flex",
    flexDirection: "column",
    height: "100%",
    "& .MuiTypography-root": {
        color: textColorVal
    }
});

const WidgetItem = ({ id, widgetType, widgetConfig = {}, children }) => {

    const [fullscreen, setFullscreen] = useState(false);
    const vizRef = useRef(null);

    const cardTitle = widgetConfig["card_title"];
    const cardSubtitle = widgetConfig["card_subtitle"];
    const hideHeader = Boolean(widgetConfig["hide_card_header"]);
    const removeCardBorder = Boolean(widgetConfig["card_remove_border"]);
    const cardBorderRadius = widgetConfig["card_border_radius"];
    const cardBorderColor = widgetConfig["card_border_color"] || "#333333";
    const cardBackgroundColor = widgetConfig["card_background_color"] || "#fff";
    const textColor = widgetConfig["text_color"] || "#333333";
    const tableWidgetType = widgetType.indexOf("table") > -1;

    const borderRadius = borderRadiusSizes[cardBorderRadius] || borderRadiusSizes["small"];

    if (["stats", "text"].includes(widgetType))
        return <Card key={id}
            sx={{
                height: "100%",
                overflow: "hidden",
                position: "relative",
                borderWidth: removeCardBorder ? 0 : 1,
                backgroundColor: cardBackgroundColor,
                boxShadow: "rgba(48, 53, 109, 0.1) 0px 2px 8px",
                borderRadius,
                "& *": {
                    color: textColor
                }
            }}
        >
            {children}
        </Card>

    if (widgetType === "header")
        return <MDBox key={id}
            sx={{
                height: "100%",
                overflow: "hidden",
                position: "relative",
                borderBottom: removeCardBorder ? "none" : `2px solid ${cardBorderColor}`,
            }}
        >
            {children}
        </MDBox>

    const options = [
        {
            label: tableWidgetType ? "Download data" : "Download image",
            onClick: () => {
                vizRef.current?.export();
            }
        },
        {
            label: "View in fullscreen", onClick: () => {
                setFullscreen(true);
            }
        }
    ];


    const render = () => {

        return <Card key={id}
            sx={{
                height: "100%",
                overflow: "hidden",
                position: "relative",
                borderWidth: removeCardBorder ? 0 : 1,
                backgroundColor: cardBackgroundColor,
                boxShadow: "rgba(48, 53, 109, 0.1) 0px 2px 8px",
                borderRadius
            }}
        >
            {
                !hideHeader &&
                <MDBox p={2} display="flex" justifyContent="space-between" alignItems="flex-start">
                    <MDBox sx={() => widgetTextStyles(textColor)}>
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
                    {fullscreen && <Stack direction={"row"} spacing={2} sx={{ mr: 1 }}>
                        <Tooltip title={tableWidgetType ? "Download data" : "Download image"}>
                            <Icon sx={{ cursor: "pointer", fontWeight: "normal" }} fontSize="medium" onClick={() => { vizRef.current?.export() }}>
                                download
                            </Icon>
                        </Tooltip>
                        <Tooltip title="Exit fullscreen">
                            <Icon sx={{ cursor: "pointer", fontWeight: "normal" }} fontSize="small" onClick={() => { setFullscreen(false) }}>
                                close_fullscreen
                            </Icon>
                        </Tooltip>
                    </Stack>
                    }
                    {!fullscreen && <RowMenu options={options} />}
                </MDBox>
            }
            {
                tableWidgetType &&
                <MDBox sx={{ height: '100%', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                    {children}
                </MDBox>
            }
            {
                !tableWidgetType &&
                <MDBox sx={{ height: '100%' }} p={1}>
                    {children}
                </MDBox>
            }
        </Card>
    }

    const contextValue = { vizRef, fullscreen };

    return <WidgetItemContext.Provider value={contextValue}>
        {fullscreen ? (
            <Modal open={fullscreen} onClose={() => { setFullscreen(false) }}>
                <MDBox p={3} height="100%">
                    {render()}
                </MDBox>
            </Modal>
        ) : render()}
    </WidgetItemContext.Provider>
}

export default WidgetItem;

