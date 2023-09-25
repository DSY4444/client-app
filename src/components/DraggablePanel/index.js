import { Icon } from "@mui/material";
import PerfectScrollbar from 'react-perfect-scrollbar';
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import { useState } from "react";
import { DraggablePanelStyles } from "./styles";

const DraggablePanel = (props) => {
    const {
        initialCollapse,
        togglePanel,
        width,
        children,
    } = props;
    const [collapse, setCollapse] = useState(initialCollapse);
    const handleTogglePanel = () => {
        setCollapse(!collapse);
        if (togglePanel)
            togglePanel(!collapse) 
    }

    return (
        <MDBox className="collapsiblePanel-root" sx={theme => DraggablePanelStyles(theme, { collapse, width })}>
            <MDBox className="iconContainer">
                <MDButton
                    size="medium"
                    variant="text"
                    disableRipple
                    color="dark"
                    onClick={handleTogglePanel}
                    iconOnly
                >
                    <Icon sx={{ fontSize: "18px!important", alignContent: "center" }}>drag_handle</Icon>
                </MDButton>
            </MDBox>
            {!collapse && (
                <MDBox overflow="auto">
                    <PerfectScrollbar>
                        {children}
                    </PerfectScrollbar>
                </MDBox>
            )}
        </MDBox>
    );
};

DraggablePanel.defaultProps = {
    initialCollapse: true,
};

export default DraggablePanel;