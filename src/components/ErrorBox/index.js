import EmptyState from "components/EmptyState";
import MDBox from "components/MDBox";

const ErrorBox = ({ error }) => {
  if (error)
    console.error(error.toString())
  return <MDBox borderRadius="4px" display="flex" flexDirection="column" justifyContent="center" alignItems="center"
    sx={({ borders: { borderWidth }, palette: { black }, functions: { rgba } }) => ({
      position: 'absolute',
      inset: 0,
      border: `${borderWidth[1]} solid ${rgba(black.main, 0.125)}`
    })}
  >
    <EmptyState variant="error" iconName="warning" title="Error!" description="Something went wrong" />
  </MDBox>
}

export default ErrorBox;