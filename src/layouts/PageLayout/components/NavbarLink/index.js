// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// react-router-dom components
import { Link } from "react-router-dom";

// @mui material components
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function NavbarLink({ icon, name, route, light }) {
  return (
    <MDBox
      component={Link}
      to={route}
      mx={1}
      p={1}
      display="flex"
      alignItems="center"
      sx={{ cursor: "pointer", userSelect: "none" }}
    >
      {icon && (
        <Icon
          sx={{
            color: ({ palette: { white, secondary } }) => (light ? white.main : secondary.main),
            verticalAlign: "middle",
          }}
        >
          {icon}
        </Icon>
      )}
      <MDTypography
        variant="button"
        fontWeight="regular"
        color={light ? "white" : "dark"}
        textTransform="capitalize"
        sx={{ width: "100%", lineHeight: 0 }}
      >
        &nbsp;{name}
      </MDTypography>
      {/* <Icon
          sx={{
            color: ({ palette: { white, secondary } }) => (light ? white.main : secondary.main),
            verticalAlign: "middle",
          }}
        >
          {"expand_more"}
        </Icon> */}
    </MDBox>
  );
}

// Typechecking props for the NavbarLink
NavbarLink.propTypes = {
  icon: PropTypes.string,
  name: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,
  light: PropTypes.bool.isRequired,
};

export default NavbarLink;
