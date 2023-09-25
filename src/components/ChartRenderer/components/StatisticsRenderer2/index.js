import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import PerfectScrollbar from 'react-perfect-scrollbar';
import colors from "assets/theme/base/colors";

function StatisticsRenderer2({ color, title, keyValArr }) {
  return (
    <Card sx={{width: "100%", border:"none",boxShadow:"0px 2px 8px rgba(48, 53, 109, 0.1);", borderRadius:"12px", paddingLeft: "10px", paddingRight: "10px"}}>
      <PerfectScrollbar>
      <MDBox 
        color={color === "light" ? "dark" : "white"}
        borderRadius="md"
        pl={0.5}
      >
      <MDBox pt={1} px={2} bgColor={colors.chartBackground}>
        <MDBox height={32}  textOverflow="ellipsis">
          <MDTypography variant="button" fontWeight="medium" color={color === "light" ? "text" : "white"} whiteSpace="nowrap">
            {title}&nbsp;
          </MDTypography>
        </MDBox>
      </MDBox>
      <MDBox height={72} display="flex" flexDirection="row" px={2} pb={2}>
        {
          keyValArr && keyValArr.map(val => (
            <MDBox key={val.key} flex={1}>
                      <MDTypography lineHeight={1.5} variant="h5" color={color === "light" ? "dark" : "white"}>{val.value}&nbsp;</MDTypography>
                      <MDTypography variant="h6" fontWeight="light" color={color === "light" ? "dark" : "white"}>{val.key}&nbsp;</MDTypography>
            </MDBox>
            )
         )
        }&nbsp;
      </MDBox>
      </MDBox>
      </PerfectScrollbar>
    </Card>
  );
}

// Setting default values for the props of ComplexStatisticsCard
StatisticsRenderer2.defaultProps = {
  title: "",
  color: "info",
  percentage: {
    color: "success",
    text: "",
    label: "",
  },
};

export default StatisticsRenderer2;
