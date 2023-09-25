import Card from "@mui/material/Card";
import {Icon, IconButton} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import PerfectScrollbar from 'react-perfect-scrollbar';
import colors from "assets/theme/base/colors";

function StatisticsRenderer3({ color, title, keyValArr }) {
  return (
    <Card sx={{width: "100%",border:"none",boxShadow:"0px 2px 8px rgba(48, 53, 109, 0.1);",borderRadius:"12px", paddingLeft: "10px", paddingRight: "10px"}}>
      <PerfectScrollbar>
      <MDBox 
        color={color === "light" ? "dark" : "white"}
        borderRadius="md"
        pl={0}
      >
        <MDBox height={title ? 85 : 60} display="flex" alignItems="center" flexDirection="row" px={2} pb={2}>
            {title ? 
                <MDBox pt={1} px={2} bgColor={colors.chartBackground}>
                    <MDBox   textOverflow="ellipsis">
                    <MDTypography style={{writingMode: "vertical-rl", transform: "rotate(180deg)", textOrientation: "mixed"}} variant="h6" fontWeight="light" color={color === "light" ? "text" : "white"}>
                        {title}&nbsp;
                    </MDTypography>
                    </MDBox>
                </MDBox> 
            : ''}
            {
            keyValArr && keyValArr.map(val => (
                <MDBox pt={1} key={val.key} flex={1}>
                        {val.value !== 'X' ? <MDTypography lineHeight={1.2} variant="h6" fontWeight={val.key === 'X' ? "regular" : "medium"} color={color === "light" ? "dark" : "white"}>
                          {
                            val.value === -1 || val.value === '0' ? 
                              <IconButton>
                                <Icon size="small" color="error" title="Not Loaded/Mapped">close</Icon>
                              </IconButton> 
                            :
                            (val.key === 'X' ?
                            <>
                              <IconButton>
                                <Icon color="success" title={val.value}>done</Icon>
                              </IconButton><br/>{val.value}
                            </>
                             : <>
                             <IconButton>
                               <Icon color="success" title="Loaded/Mapped">done</Icon>
                             </IconButton> {val.value}
                           </>) 
                          }
                          &nbsp;</MDTypography> : ''}
                        {val.key !== 'X' ? <MDTypography variant="h6" fontWeight={val.value === 'X' ? "medium" : "light"} color={color === "light" ? "dark" : "white"}>{val.key}&nbsp;</MDTypography> : ''}
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
StatisticsRenderer3.defaultProps = {
  title: "",
  color: "info",
  percentage: {
    color: "success",
    text: "",
    label: "",
  },
};

export default StatisticsRenderer3;
