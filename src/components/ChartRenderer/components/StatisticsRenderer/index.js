// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function StatisticsRenderer({ color, title, label1, value1, label2, value2, textColour }) {
  return (
    <Card sx={{width: "100%", paddingLeft: "10px", paddingRight: "10px"}}>
      <MDBox 
        variant="gradient"
        bgColor={color === "light" ? "white" : color}
        color={color === "light" ? "dark" : "white"}
        borderRadius="md"
        pl={0.5}
        >
      <MDBox pt={1} px={2}>
        <MDBox overflow="hidden" textOverflow="ellipsis">
          <MDTypography variant="button" fontWeight="medium" color={color === "light" ? "text" : "white"} whiteSpace="nowrap">
            {title}
          </MDTypography>
        </MDBox>
      </MDBox>
      <MDBox display="flex" flexDirection="row" px={2} pb={2}>
        <MDBox flex={1}>
          <MDTypography lineHeight={1.5} variant="h5" color= {textColour ? textColour : (color === "light" ? "dark" : "white")}>{value1}&nbsp;</MDTypography>
          <MDTypography variant="h6" fontWeight="light" color={color === "light" ? "dark" : "white"}>{label1}&nbsp;</MDTypography>
        </MDBox>
        <MDBox flex={1} pl={1.5}>
          <MDTypography lineHeight={1.5} variant="h5" color={textColour ? textColour : (color === "light" ? "dark" : "white")}>{value2}&nbsp;</MDTypography>
          <MDTypography variant="h6" fontWeight="light" color={color === "light" ? "dark" : "white"}>{label2}&nbsp;</MDTypography>
        </MDBox>
      </MDBox>
      </MDBox>
    </Card>
  );
}

// Setting default values for the props of ComplexStatisticsCard
StatisticsRenderer.defaultProps = {
  color: "light",
  percentage: {
    color: "success",
    text: "",
    label: "",
  },
};

// Typechecking props for the ComplexStatisticsCard
StatisticsRenderer.propTypes = {
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
  title: PropTypes.string.isRequired,
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

export default StatisticsRenderer;
