function navbarMenuButton(theme, { selected, hasSubMenu }) {
  const { palette, functions } = theme;
  const { transparent, white } = palette;
  const { pxToRem } = functions;

  return {
    textTransform: "none",
    fontSize: pxToRem(13),
    color: selected ? white.main : "#e2e3ec",
    height: pxToRem(36),
    "& .MuiButton-root:hover": {
      color: white,
      backgroundColor: transparent
    },
    "& .MuiButton-endIcon": {
      marginLeft: 0
    },
    "&:hover::after": {
      content: '""',
      position: "absolute",
      bottom: -10,
      height: 6,
      width: "50%",
      marginRight: hasSubMenu ? pxToRem(8) : 0,
      borderRadius: "12px 12px 0 0",
      backgroundColor: "#facd35"
    },
    "&::after": selected ? {
      content: '""',
      position: "absolute",
      bottom: -10,
      height: 6,
      width: "50%",
      marginRight: hasSubMenu ? pxToRem(8) : 0,
      borderRadius: "12px 12px 0 0",
      backgroundColor: "#facd35"
    } : {}

  };

}

function navbar(theme, ownerState) {
  const { palette, functions, transitions } = theme;
  const { transparentNavbar, absolute, light } = ownerState;
  const { dark, white, text, primary } = palette;
  const { pxToRem } = functions;

  return {
    height: 56,
    backdropFilter: transparentNavbar || absolute ? "none" : `saturate(200%) blur(${pxToRem(30)})`,
    backgroundColor: primary.main,
    color: () => {
      let color;

      if (light) {
        color = white.main;
      } else if (transparentNavbar) {
        color = text.main;
      } else {
        color = dark.main;
      }

      return color;
    },
    top: 0,
    display: "grid",
    alignItems: "center",
    paddingRight: absolute ? pxToRem(8) : 0,
    paddingLeft: absolute ? pxToRem(16) : 0,
    "& > *": {
      transition: transitions.create("all", {
        easing: transitions.easing.easeInOut,
        duration: transitions.duration.standard,
      }),
    },
    "& .MuiToolbar-root": {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: "auto",
      padding: `0 ${pxToRem(16)}`,
      // [breakpoints.up("sm")]: {
      //   minHeight: "auto",
      //   padding: `0 ${pxToRem(16)}`,
      // },
    },
  };
}

const navbarContainer = () => ({
  // flexDirection: "column",
  // alignItems: "flex-start",
  // justifyContent: "space-between",
  // [breakpoints.up("md")]: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: "0",
    paddingBottom: "0",
  // },
});

const navbarRow = () => ({
  display: "flex",
  alignItems: "center",
  // justifyContent: "space-between",
  // width: "100%",

  // [breakpoints.up("md")]: {
  //   justifyContent: isMini ? "space-between" : "stretch",
  //   width: isMini ? "100%" : "max-content",
  // },

  // [breakpoints.up("xl")]: {
    justifyContent: "stretch !important",
    width: "max-content !important",
  // },
});

const navbarTabs = () => ({
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    maxWidth: 40,
    width: '100%',
    backgroundColor: '#635ee7',
  }
});

const navbarTab = ({ typography, spacing }) => ({
  textTransform: 'none',
  fontWeight: typography.fontWeightRegular,
  fontSize: typography.pxToRem(15),
  marginRight: spacing(1),
  color: 'rgba(255, 255, 255, 0.7)',
  '&.Mui-selected': {
    color: '#fff',
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.32)',
  },
});

const navbarIconButton = ({ palette: { white }, typography: { size }, breakpoints }) => ({
  px: 1,
  "& .MuiIcon-root": {
    color: "#e2e3ec",
    fontSize: `${size["2xl"]} !important`,
  },
  "& .MuiIcon-root:hover": {
    color: white.main
  },
  "& .MuiTypography-root": {
    display: "none",
    [breakpoints.up("sm")]: {
      display: "inline-block",
      lineHeight: 1.2,
      ml: 0.5,
    },
  },
});

const navbarMobileMenu = ({ breakpoints }) => ({
  display: "inline-block",
  lineHeight: 0,

  [breakpoints.up("xl")]: {
    display: "none",
  },
});

export { navbarMenuButton, navbar, navbarContainer, navbarRow, navbarTabs, navbarTab, navbarIconButton, navbarMobileMenu };  