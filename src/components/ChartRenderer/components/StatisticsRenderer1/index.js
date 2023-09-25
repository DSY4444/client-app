// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import PerfectScrollbar from 'react-perfect-scrollbar';
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import colors from "assets/theme/base/colors";

function StatisticsRenderer1({ color, label1, value1, varValue, varWith, label2, value2, label3, value3, smallFont, bannerIcon, textColour, valQualifier }) {
  return (
    <Card sx={{width: "100%", border:"none",boxShadow:"0px 2px 8px rgba(48, 53, 109, 0.1);", borderRadius:"12px", paddingLeft: "10px", paddingRight: "10px"}}>
      <PerfectScrollbar>
      <MDBox 
        variant="gradient"
        bgColor={color === "light" ? "white" : color}
        color={color === "light" ? "dark" : "white"}
        borderRadius="md"
        pl={0}
        >
        <MDBox pt={1.5} px={1} bgColor={colors.chartBackground}>
          <MDBox px={1} pb={0.8} display="flex" flexDirection="row" textOverflow="ellipsis">
                <MDBox flex={1}>
                  <MDBox display="flex" flexDirection="row">
                      { bannerIcon ? <><Icon>{bannerIcon}</Icon>&nbsp;</> : '' }
                      <MDTypography data-testid = {label1?.toLowerCase().replaceAll(' ', '')} variant="h6" fontWeight="light" color= {(color === "light" ? "dark" : "white")} whiteSpace="nowrap">
                      {label1}&nbsp;
                      </MDTypography>
                  </MDBox>
                  <MDBox display="flex" flexDirection="row" textOverflow="ellipsis">
                    {smallFont ?
                      <>
                        <MDTypography lineHeight={1.5} variant="h4" fontWeight="bold" color= {(color === "light" ? "dark" : "white")}  textOverflow="ellipsis" whiteSpace="nowrap">{value1}&nbsp;</MDTypography>
                        <MDTypography lineHeight={2.7} variant="caption" fontWeight="bold" color= {(color === "light" ? "dark" : "white")}  textOverflow="ellipsis" whiteSpace="nowrap">{valQualifier}&nbsp;</MDTypography>
                        <MDTypography lineHeight={2.5} variant="caption" color= {textColour ? textColour : (color === "light" ? "dark" : "white")} whiteSpace="nowrap">&nbsp;{varValue}&nbsp;</MDTypography>
                        <MDTypography lineHeight={2.5} variant="caption" color= {(color === "light" ? "dark" : "white")} whiteSpace="nowrap">{varWith}&nbsp;</MDTypography>
                      </>
                    :
                      <>
                        <MDTypography lineHeight={1.5} variant="h4" fontWeight="bold" color= {(color === "light" ? "dark" : "white")}  textOverflow="ellipsis" whiteSpace="nowrap">{value1}&nbsp;</MDTypography>
                        <MDTypography lineHeight={2.45} variant="button" fontWeight="bold" color= {(color === "light" ? "dark" : "white")}  textOverflow="ellipsis" whiteSpace="nowrap">{valQualifier}&nbsp;</MDTypography>
                        <MDTypography lineHeight={2.3} variant="button" color= {textColour ? textColour : (color === "light" ? "dark" : "white")} whiteSpace="nowrap">&nbsp;{varValue}&nbsp;</MDTypography>
                        <MDTypography lineHeight={2.3} variant="button" color= {(color === "light" ? "dark" : "white")} whiteSpace="nowrap">{varWith}&nbsp;</MDTypography>
                      </>
                    }
                  </MDBox>
                </MDBox>
                { label2 || value2 ? 
                <MDBox display="flex" flex={1} pl={1} flexDirection="column"  textOverflow="ellipsis">
                  <MDTypography  data-testid = {label2?.toLowerCase().replaceAll(' ', '')}variant="h6" fontWeight="light" color= {(color === "light" ? "dark" : "white")} whiteSpace="nowrap">
                      {label2}&nbsp;
                  </MDTypography>
                  <MDTypography lineHeight={1.6} variant="h4" fontWeight="bold" color={(color === "light" ? "dark" : "white")}  textOverflow="ellipsis" whiteSpace="nowrap">{value2}&nbsp;</MDTypography>
                </MDBox> : ''}
                { label3 || value3 ? 
                <MDBox display="flex" flex={1} pl={1} flexDirection="column"  textOverflow="ellipsis">
                  <MDTypography  data-testid = {label3?.toLowerCase().replaceAll(' ', '')}variant="h6" fontWeight="light" color= {(color === "light" ? "dark" : "white")}  textOverflow="ellipsis" whiteSpace="nowrap">
                      {label3}&nbsp;
                  </MDTypography>
                  <MDTypography lineHeight={1.6} variant="h4" fontWeight="bold" color={(color === "light" ? "dark" : "white")} whiteSpace="nowrap">{value3}&nbsp;</MDTypography>
                </MDBox> : ''}
            </MDBox>
        </MDBox>
        {/* <MDBox display="flex" flexDirection="row" px={2} pt={1} pb={2}>
            <MDBox flex={1}>
            <MDTypography lineHeight={1.5} variant="h5" color= {textColour ? textColour : (color === "light" ? "dark" : "white")}>{value1}&nbsp;</MDTypography>
            </MDBox>
            <MDBox flex={1} pl={1}>
            <MDTypography lineHeight={1.5} variant="h5" color={textColour ? textColour : (color === "light" ? "dark" : "white")}>{value2}&nbsp;</MDTypography>
            </MDBox>
        </MDBox> */}
      </MDBox>
    </PerfectScrollbar>
    </Card>
  );
}

// Setting default values for the props of ComplexStatisticsCard
StatisticsRenderer1.defaultProps = {
  color: "light",
  percentage: {
    color: "success",
    text: "",
    label: "",
  },
};

// Typechecking props for the ComplexStatisticsCard
StatisticsRenderer1.propTypes = {
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

export default StatisticsRenderer1;
