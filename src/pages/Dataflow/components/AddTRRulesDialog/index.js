import { Card, Modal, Icon, IconButton } from "@mui/material";
import AddTowerRule from "components/AddTowerRule";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";


const AddTRRulesDialog = (props) => {
  const { onClose } = props;

  const handleTRRulesDialogClose = () => {
    if (onClose) onClose();
  }
  return (
    <Modal open={true} onClose={handleTRRulesDialogClose}>
      <MDBox p={3} height="100%" width="100%" display="flex" alignItems="center" justifyContent="center">
        <Card sx={{ height: "100%", width: "100%", overflow: 'hidden' }}>
          <MDBox px={3} pt={2} display="flex" justifyContent="space-between" alignItems="center">
            <MDBox>
              <MDTypography variant="h6" component="span" color="text">Tower Rules</MDTypography>
            </MDBox>
            <MDBox display="flex">
              <IconButton onClick={handleTRRulesDialogClose} title="Close">
                <Icon>close</Icon>
              </IconButton>
            </MDBox>
          </MDBox>
          <AddTowerRule {...props} mt={-8} containerHeight={"calc(91vh - 226px)"}  typeFilter={"Spend"} />
        </Card>
      </MDBox>
    </Modal>
  )
}



export default AddTRRulesDialog;