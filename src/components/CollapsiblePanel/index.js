import { Icon } from "@mui/material";
import PerfectScrollbar from 'react-perfect-scrollbar';
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { useState } from "react";
import { collapsiblePanelStyles } from "./styles";

const CollapsiblePanel = (props) => {
    const {
        title,
        initialCollapse,
        togglePanel,
        direction,
        width,
        directionBottom,
        children,
        onClickTitle,
    } = props;
    const [collapse, setCollapse] = useState(initialCollapse);
    const collapseIcon = directionBottom ? directionBottom == 'down' ? "keyboard_double_arrow_down" : "keyboard_double_arrow_up" : direction == "right" ? "keyboard_double_arrow_left" : "keyboard_double_arrow_right";
    const expandIcon = directionBottom ? directionBottom == 'up' ? "keyboard_double_arrow_down" : "keyboard_double_arrow_up" : direction == "right" ? "keyboard_double_arrow_right" : "keyboard_double_arrow_left";
    const handleTogglePanel = () => {
        setCollapse(!collapse);
        if (togglePanel)
            togglePanel(!collapse)
    }

    return (
        <MDBox className="collapsiblePanel-root" sx={theme => collapsiblePanelStyles(theme, { collapse, width })}>
            <MDBox className="iconContainer">
                {!collapse &&
                    <MDTypography variant="link"
                     data-testid = {title?.toLowerCase().replaceAll(' ', '')}
                        sx={{
                            color: "black",
                            fontSize: "14px",
                            padding: "5px",
                            borderRadius: "5px",
                            ...(onClickTitle ? {
                                "&:hover": {
                                    cursor: "pointer",
                                    color: "#435EC3",
                                    backgroundColor: "#eceff8"

                                }
                            } : {})
                        }} fontWeight="medium" onClick={onClickTitle && onClickTitle}

                    >{title}</MDTypography>
                }
                <MDButton
                    size="medium"
                    variant="text"
                    disableRipple
                    color="dark"
                    onClick={handleTogglePanel}
                    iconOnly
                >
                    <Icon sx={{ fontSize: "18px!important" }}>{collapse ? expandIcon : collapseIcon}</Icon>
                </MDButton>
            </MDBox>
            {collapse && (
                <MDBox className={!directionBottom ? "collapseLabel" : "collapseLabelBottom"} onClick={handleTogglePanel}>
                    <MDTypography variant="button" fontWeight="medium">{!onClickTitle && title}</MDTypography>
                </MDBox>
            )}
            {!collapse && (
                <MDBox height="100%" overflow="auto">
                    <PerfectScrollbar>
                        {children}
                    </PerfectScrollbar>
                </MDBox>
            )}
        </MDBox>
    );
};

CollapsiblePanel.defaultProps = {
    direction: "right",
    initialCollapse: false,
};

export default CollapsiblePanel;