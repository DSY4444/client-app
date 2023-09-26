
// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Link from "@mui/material/Link";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React base styles
import typography from "assets/theme/base/typography";

function Footer({ absolute, light }) {
  const { size } = typography;

  return (
    <MDBox position={absolute ? "absolute" : undefined} width="100%" bottom={0} py={2} px={6}>
        <MDBox
          width="100%"
          display="flex"
          flexDirection={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          alignItems="center"
          // px={1.5}
        >
          <MDBox
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexWrap="wrap"
            color={light ? "white" : "text"}
            fontSize={size.sm}
          >
            {/* Copyright&nbsp;&copy; {new Date().getFullYear()}, */}
            <Link href="https://yarken.com" target="_blank" rel="noopener">
              <MDTypography variant="button" fontWeight="medium" color={light ? "white" : "dark"}>
                {/* &nbsp;www.yarken.com&nbsp; */}
              </MDTypography>
            </Link>
          </MDBox>
          <MDBox
            component="ul"
            sx={({ breakpoints }) => ({
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              listStyle: "none",
              mt: 3,
              mb: 0,
              p: 0,

              [breakpoints.up("lg")]: {
                mt: 0,
              },
            })}
          >
            <MDBox component="li" px={2} lineHeight={1}>
              <Link href="https://yarken.com" target="_blank" rel="noopener">
                <MDTypography
                  variant="button"
                  fontWeight="regular"
                  color={light ? "white" : "dark"}
                >
                  {/* Terms &amp; Conditions */}
                </MDTypography>
              </Link>
            </MDBox>
            <MDBox component="li" px={2} lineHeight={1}>
              <Link href="https://yarken.com" target="_blank" rel="noopener">
                <MDTypography
                  variant="button"
                  fontWeight="regular"
                  color={light ? "white" : "dark"}
                >
                  {/* Privacy Policy */}
                </MDTypography>
              </Link>
            </MDBox>
            <MDBox component="li" pl={2} lineHeight={1}>
              <Link href="https://yarken.com" target="_blank" rel="noopener">
                <MDTypography
                  variant="button"
                  fontWeight="regular"
                  color={light ? "white" : "dark"}
                >
                  {/* About Us */}
                </MDTypography>
              </Link>
            </MDBox>
          </MDBox>
        </MDBox>
    </MDBox>
  );
}

// Setting default props for the Footer
Footer.defaultProps = {
  light: false,
  absolute: false,
};

// Typechecking props for the Footer
Footer.propTypes = {
  light: PropTypes.bool,
  absolute: PropTypes.bool,
};

export default Footer;
