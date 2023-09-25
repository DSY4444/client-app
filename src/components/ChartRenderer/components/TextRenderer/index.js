// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import colors from "assets/theme/base/colors";

function TextRenderer({ color, label1, textColour}) {
  return (
    <Card sx={{width: "100%", border: "none"}}>
      <MDBox 
        variant="gradient"
        bgColor={color === "light" ? "white" : color}
        color={color === "light" ? "dark" : "white"}
        // borderRadius="md"
        pl={0}
        >
        <MDBox pt={0.25} px={0.5} bgColor={colors.dashboardBackground}>
            <MDBox px={0.5} pb={0.75} display="flex" flexDirection="row" overflow="hidden" textOverflow="ellipsis">
                <MDBox flex={1}>
                    <MDTypography data-testid = {label1?.toLowerCase().replaceAll(' ', '')} variant="h5" fontWeight="medium" color= {textColour ? textColour : (color === "light" ? "dark" : "white")} whiteSpace="nowrap">
                        {label1}&nbsp;
                    </MDTypography>
                </MDBox>
            </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

// Setting default values for the props of ComplexStatisticsCard
TextRenderer.defaultProps = {
  color: "light",
  percentage: {
    color: "success",
    text: "",
    label: "",
  },
};

// Typechecking props for the ComplexStatisticsCard
TextRenderer.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
//   title: PropTypes.string.isRequired,
  // count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  percentage: PropTypes.shape({
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "dark",
      "white",
    ]),
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
  }),
};

export default TextRenderer;
