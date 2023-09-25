import { styled } from "@mui/material/styles";
import MDButton from "components/MDButton";

export default styled(MDButton)(({ theme, ownerState }) => {
  const { borders, functions, typography, palette } = theme;
  const { variant, paginationSize,pointerAction, disabled, active, extraMargin } = ownerState;

  const { borderColor, borderColorDisabled } = borders;
  const { pxToRem } = functions;
  const { fontWeightRegular, size: fontSize } = typography;
  const { light, grey } = palette;

  let sizeValue = pxToRem(36);

  if (paginationSize === "small") {
    sizeValue = pxToRem(30);
  } else if (paginationSize === "large") {
    sizeValue = pxToRem(46);
  }

  return {
    borderColor: disabled ? borderColorDisabled : borderColor,
    marginTop: 0,
    marginBottom: 0,
    marginRight: `${pxToRem(2)}`,
    cursor: disabled ? "default" : "pointer",
    pointerEvents: active ? pointerAction : "auto",
    fontWeight: fontWeightRegular,
    fontSize: fontSize.sm,
    width: sizeValue,
    minWidth: sizeValue,
    height: sizeValue,
    minHeight: sizeValue,
    color: disabled && grey[200],
    marginLeft: extraMargin && `${pxToRem(8)}`,

    "&:hover, &:focus, &:active": {
      transform: "none",
      boxShadow: (variant !== "gradient" || variant !== "contained") && "none !important",
      opacity: "1 !important",
    },

    "&:hover": {
      backgroundColor: disabled ? "none" : light.main,
      borderColor: disabled ? borderColorDisabled : borderColor,
    },
  };
});
