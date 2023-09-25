import { Link, useMatch } from "react-router-dom";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function Breadcrumbs() {
  let customDashboardDrilldownMatches = useMatch({ path: "/dashboard/custom/:dashboardId" });
  let alertingDrilldownMatches = useMatch({ path: "/alerting/:alertId/alert-details" });

  return (
    <MDBox mr={{ xs: 0, xl: 8 }}>
        {customDashboardDrilldownMatches && (
          <Link to="/dashboards" key="dashboards">
            <MDTypography
              component="span"
              variant="caption"
              fontWeight="medium"
              color="info"
              sx={{ lineHeight: 0, display: "flex", alignItems: "center"}}
            >
              <Icon>west</Icon>&nbsp;&nbsp;Dashboards
            </MDTypography>
          </Link>
        )}
        {alertingDrilldownMatches && (
          <Link to="/alerting" key="alerting">
            <MDTypography
              component="span"
              variant="caption"
              fontWeight="medium"
              color="info"
              sx={{ lineHeight: 0, display: "flex", alignItems: "center" }}
            >
              <Icon>west</Icon>&nbsp;&nbsp;Alerting
            </MDTypography>
          </Link>
        )}
    </MDBox>
  );
}

// // Setting default values for the props of Breadcrumbs
// Breadcrumbs.defaultProps = {
//   light: false,
//   loading: false,
// };

// // Typechecking props for the Breadcrumbs
// Breadcrumbs.propTypes = {
//   icon: PropTypes.node.isRequired,
//   title: PropTypes.string.isRequired,
//   pageTitle: PropTypes.string,
//   route: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
//   light: PropTypes.bool,
//   loading: PropTypes.bool,
// };

export default Breadcrumbs;
