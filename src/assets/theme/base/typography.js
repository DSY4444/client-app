// import colors from "assets/theme/base/colors";
// import pxToRem from "assets/theme/functions/pxToRem";

import colors from "./colors";
import pxToRem from "../functions/pxToRem";

const { dark } = colors;

const baseProperties = {
  // fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
  fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif",
  fontWeightLighter: 100,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 600,
  fontWeightBold: 700,
  fontSizeXXS: pxToRem(10.4),
  fontSizeXS: pxToRem(12),
  fontSizeSM: pxToRem(14),
  fontSizeMD: pxToRem(16),
  fontSizeLG: pxToRem(18),
  fontSizeXL: pxToRem(20),
  fontSize2XL: pxToRem(24),
  fontSize3XL: pxToRem(30),
};

const baseHeadingProperties = {
  fontFamily: baseProperties.fontFamily,
  color: dark.main,
  fontWeight: baseProperties.fontWeightBold,
};

const baseDisplayProperties = {
  fontFamily: baseProperties.fontFamily,
  color: dark.main,
  fontWeight: baseProperties.fontWeightLight,
  lineHeight: 1.2,
};

const typography = {
  fontFamily: baseProperties.fontFamily,
  fontWeightLighter: baseProperties.fontWeightLighter,
  fontWeightLight: baseProperties.fontWeightLight,
  fontWeightRegular: baseProperties.fontWeightRegular,
  fontWeightMedium: baseProperties.fontWeightMedium,
  fontWeightBold: baseProperties.fontWeightBold,

  h1: {
    fontSize: pxToRem(38),
    lineHeight: 2.875,
    ...baseHeadingProperties,
  },

  h2: {
    fontSize: pxToRem(30),
    lineHeight: 1.5,
    ...baseHeadingProperties,
  },

  h3: {
    fontSize: pxToRem(24),
    lineHeight: 2,
    ...baseHeadingProperties,
  },

  h4: {
    fontSize: pxToRem(20),
    lineHeight: 1.75,
    ...baseHeadingProperties,
  },

  h5: {
    fontSize: pxToRem(16),
    lineHeight: 1.5,
    ...baseHeadingProperties,
  },

  h6: {
    fontSize: pxToRem(12),
    lineHeight: 1.25,
    ...baseHeadingProperties,
  },

  subtitle1: {
    fontFamily: baseProperties.fontFamily,
    fontSize: baseProperties.fontSizeSM,
    fontWeight: baseProperties.fontWeightLight,
    lineHeight: 1.5,
  },

  subtitle2: {
    fontFamily: baseProperties.fontFamily,
    fontSize: baseProperties.fontSizeMD,
    fontWeight: baseProperties.fontWeightLight,
    lineHeight: 1.6,
  },

  body1: {
    fontFamily: baseProperties.fontFamily,
    fontSize: baseProperties.fontSizeXL,
    fontWeight: baseProperties.fontWeightRegular,
    lineHeight: 1.625,
  },

  body2: {
    fontFamily: baseProperties.fontFamily,
    fontSize: baseProperties.fontSizeMD,
    fontWeight: baseProperties.fontWeightLight,
    lineHeight: 1.6,
  },

  button: {
    fontFamily: baseProperties.fontFamily,
    fontSize: baseProperties.fontSizeSM,
    fontWeight: baseProperties.fontWeightLight,
    lineHeight: 1.5,
    textTransform: "uppercase",
  },

  caption: {
    fontFamily: baseProperties.fontFamily,
    fontSize: baseProperties.fontSizeXS,
    fontWeight: baseProperties.fontWeightLight,
    lineHeight: 1.25,
  },

  overline: {
    fontFamily: baseProperties.fontFamily,
  },

  d1: {
    fontSize: pxToRem(80),
    ...baseDisplayProperties,
  },

  d2: {
    fontSize: pxToRem(72),
    ...baseDisplayProperties,
  },

  d3: {
    fontSize: pxToRem(64),
    ...baseDisplayProperties,
  },

  d4: {
    fontSize: pxToRem(56),
    ...baseDisplayProperties,
  },

  d5: {
    fontSize: pxToRem(48),
    ...baseDisplayProperties,
  },

  d6: {
    fontSize: pxToRem(40),
    ...baseDisplayProperties,
  },

  size: {
    xxs: baseProperties.fontSizeXXS,
    xs: baseProperties.fontSizeXS,
    sm: baseProperties.fontSizeSM,
    md: baseProperties.fontSizeMD,
    lg: baseProperties.fontSizeLG,
    xl: baseProperties.fontSizeXL,
    "2xl": baseProperties.fontSize2XL,
    "3xl": baseProperties.fontSize3XL,
  },

  lineHeight: {
    sm: 1.25,
    md: 1.5,
    lg: 2,
  },
};

export default typography;
