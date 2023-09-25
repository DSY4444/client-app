import { Icon } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

const FinalizedStep = () => {

    return (
        <MDBox flex={1} display="flex" alignItems="center" justifyContent="center" p={3}>
            <MDBox display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <MDBox sx={() => ({
                    height: 70,
                    width: 70,
                    borderRadius: "50%",
                    backgroundColor: "#4CAF50",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                })
                }>
                    <Icon
                        fontSize="60"
                        sx={{
                            fontSize: 40,
                            color: "#fff"
                        }}>done</Icon>
                </MDBox>
                <MDTypography variant="button" fontWeight="medium" color={"text"} mt={2}>
                    Data processed successfully.
                </MDTypography>
                <MDTypography variant="button" color={"text"} mt={2}>
                    Your data is ready. Download a copy or load data into actuals object.
                </MDTypography>
                <MDBox mt={4} display="flex" flexDirection="row" alignItems="center" justifyContent="center">
                    <MDButton variant="outlined" color="info"
                        startIcon={<Icon>file_download</Icon>} 
                        onClick={() => { }}>
                        Export Data
                    </MDButton>
                    <MDButton sx={{ ml: 2 }} variant="gradient" color="info"
                        startIcon={<Icon>payments</Icon>} 
                        onClick={() => { }}>
                        Load Actuals
                    </MDButton>
                </MDBox>
            </MDBox>
        </MDBox>
    )
};

export default FinalizedStep;