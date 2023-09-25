import AnimatedRoute from "components/AnimatedRoute";
import EmptyState from "components/EmptyState";
import MDBox from "components/MDBox";
import not_found_img from "assets/svg/not_found.svg";

const NotFound = () => {
  return (
    <MDBox display="flex" alignItems="center" justifyContent="center" minHeight="calc(100vh - 150px)">
      <EmptyState
        size="large"
        image={not_found_img}
        title="Page Not Found!"
        description="The page you are looking for doesn't exist or has been moved."
      />
    </MDBox>
  );
};

export default AnimatedRoute(NotFound);