import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const StepContainer = (props) => {
    const { title, titleComponent, children } = props;
    return (
        <MDBox flex={1} display="flex" height="calc(100vh - 56px)" flexDirection="column" pt={3} pb={2}>
            <MDBox display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" px={2}>
                {
                    titleComponent && titleComponent
                }
                {
                    !titleComponent && <MDTypography variant="subtitle1" fontWeight="medium" component="span" textAlign="center">{title}</MDTypography>
                }
            </MDBox>
            <MDBox sx={{ flex: 1, display: "flex", flexDirection: "column", pt: 1.5, pl: 1, pr: 3 }}>{children}</MDBox>
        </MDBox>
    )
};

export default StepContainer;