import AnimatedRoute from "components/AnimatedRoute";
import EmptyState from "components/EmptyState";
import MDBox from "components/MDBox";
import access_denied_img from "assets/svg/access_denied.svg";

const AccessDenied = ({ message, desc }) => {
  return (
    <MDBox display="flex" alignItems="center" justifyContent="center" minHeight="calc(100vh - 150px)">
      <EmptyState
        variant="error"
        size="large"
        image={access_denied_img}
        title={message || "Access Denied!"}
        description={desc || "You don't have enough permissions to access this page. Contact your administrator for more details."}
      />
    </MDBox>
  );
};

export default AnimatedRoute(AccessDenied);