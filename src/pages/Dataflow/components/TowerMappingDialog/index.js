import { Card, Modal, Icon, IconButton } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import TowerMappingView from "components/TowerMappingView";

const TowerMappingDialog = (props) => {
    const { onClose , setRefresh, reloadAllocationData} = props;

    const handleUploadDialogClose = () => {
        if(reloadAllocationData)
        {
        reloadAllocationData()
        }
        if (onClose) onClose();
    }
    return (
        <Modal open={true} onClose={handleUploadDialogClose}>
            <MDBox p={3} height="100%" width="100%" display="flex" alignItems="center" justifyContent="center">
                <Card sx={{ height: "100%", width: "100%", overflow: 'hidden' }}>
                    <MDBox px={3} pt={2} display="flex" justifyContent="space-between" alignItems="center">
                        <MDBox>
                            <MDTypography variant="h6" component="span" color="text">
                                Tower Rules
                            </MDTypography>
                        </MDBox>
                        <MDBox display="flex">
                            <IconButton onClick={handleUploadDialogClose} title="Close">
                                <Icon>close</Icon>
                            </IconButton>
                        </MDBox>
                    </MDBox>
                    <TowerMappingView {...props} containerHeight={"calc(100vh - 226px)"} typeFilter={"Spend"} setRefresh={setRefresh}/>
                </Card>
            </MDBox>
        </Modal>
    )
}



export default TowerMappingDialog;