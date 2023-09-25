export const DraggablePanelStyles = (theme, ownerState) => {
    const { palette, borders, functions: { pxToRem, rgba } } = theme;
    const { black } = palette;
    const { borderWidth } = borders;
    const { collapse, width } = ownerState;
    

    const collapsedStyles = {
        // width: pxToRem(48),
        // minWidth: pxToRem(48),
        width: width || "100%",
        minWidth: width || "100%",
        // "& .iconContainer": {
        //     paddingTop: "8px",
        //     paddingLeft: "4px",
        // }
    }
    return {
        width: width || "100%",
        minWidth: width || "100%",
        display: "flex",
        flexDirection: "column",
        marginBottom: "10px",
          // maxHeight: collapse ? "calc(100vh-68px)" :  "calc(100vh-200px)" ,
          minHeight: collapse ? "68px" :  "200px",
          borderRight: `${borderWidth[1]} solid ${rgba(black.main, 0.125)}`,
          "& .iconContainer": {
              padding: `${pxToRem(8)} ${pxToRem(0)} ${pxToRem(8)} ${pxToRem(0)}`,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
          },
          ...(collapse && collapsedStyles),
      }
  };