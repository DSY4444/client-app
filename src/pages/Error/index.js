import AnimatedRoute from "components/AnimatedRoute";
import EmptyState from "components/EmptyState";
import MDBox from "components/MDBox";
import error_img from "assets/svg/error.svg";
import { useLocation } from "react-router-dom";
import MDButton from "components/MDButton";
import { Icon } from "@mui/material";
import useNetwork from "hooks/useNetwork";

const Error = ({errorType}) => {
  const location = useLocation();
  const networkState = useNetwork();
  console.info(networkState.online)

  if (errorType === "client" || location.state?.errorType === "client")
    return (
      <MDBox display="flex" alignItems="center" justifyContent="center" height="calc(100vh - 150px)">
        <EmptyState
          variant="error"
          size="large"
          // image={error_img}
          iconName="cloud_off"
          title="The server cannot be reached"
          description="The response from the server seems to take a very long time. Either the server is down or there's a network issue. The application will automatically try to resume once your connection is restored."
          actions={(
            <MDButton variant="gradient" color="info" startIcon={<Icon>refresh</Icon>} onClick={() => window.location.reload()}>
              Refresh
            </MDButton>
          )}
        />
      </MDBox>
    );

  return (
    <MDBox display="flex" alignItems="center" justifyContent="center" height="calc(100vh - 150px)">
      <EmptyState
        variant="error"
        size="large"
        image={error_img}
        title="Error!"
        description="An error occured while processing your request. Contact your administrator for more details."
      />
    </MDBox>
  );
};

export default AnimatedRoute(Error);