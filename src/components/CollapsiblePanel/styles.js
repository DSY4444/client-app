export const collapsiblePanelStyles = (theme, ownerState) => {
    const { palette, borders, functions: { pxToRem, rgba } } = theme;
    const { black } = palette;
    const { borderWidth } = borders;
    const { collapse, width } = ownerState;
    

    const collapsedStyles = {
        width: pxToRem(48),
        minWidth: pxToRem(48),
        "& .iconContainer": {
            paddingTop: "8px",
            paddingLeft: "4px"
        }
    }
    return {
        width: width || "100%",
        minWidth: width || "100%",
        display: "flex",
        flexDirection: "column",
        maxHeight: "calc(100vh - 68px)",
        overflow: "auto",
        borderRight: `${borderWidth[1]} solid ${rgba(black.main, 0.125)}`,
        "& .iconContainer": {
            padding: `${pxToRem(8)} ${pxToRem(8)} ${pxToRem(8)} ${pxToRem(16)}`,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
        },
        "& .collapseLabel": {
            cursor: "pointer",
            transform: "rotate(90deg)",
            marginTop: pxToRem(16),
            whiteSpace: "nowrap",
        },
        "& .collapseLabelBottom":{
            cursor:"progress",
            marginTop: pxToRem(12),
            whiteSpace: "nowrap",
            },
        
        
        ...(collapse && collapsedStyles),
    }
};