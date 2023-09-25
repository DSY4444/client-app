import { Card, Modal, Icon, IconButton,Alert } from "@mui/material";
import CopyFiles from "components/CopyFiles";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import {useState} from 'react';

const CopyFilesDialog = (props) => {
  const { onClose, variant, categoryFilter, typeFilter, data, alert} = props;
  const [beforeUpload, setBeforeUpload] = useState(true)

  const handleUploadDialogClose = () => {
    if (onClose) onClose();
  }
  return (
    <Modal open={true} onClose={handleUploadDialogClose}>
      <MDBox p={3} height="100%" width="100%" display="flex" alignItems="center" justifyContent="center">
        <Card sx={{ height: "500px", width: "500px", overflow: 'hidden' }}>
          <MDBox px={3} pt={2} display="flex" justifyContent="space-between" alignItems="center">
            <MDBox>
              {variant === "copyFiles" && <MDTypography variant="h6" component="span" color="text">Copy {typeFilter}</MDTypography>}
              {variant === "copyCPRules" && <MDTypography variant="h6" component="span" color="text">Copy Cost Pool Rules</MDTypography>}
              {variant === "copyTRRules" && <MDTypography variant="h6" component="span" color="text">Copy Tower Rules</MDTypography>}
              {variant === "copySRRules" && <MDTypography variant="h6" component="span" color="text">Copy Solution Rules</MDTypography>}
              {variant === "copyBURules" && <MDTypography variant="h6" component="span" color="text">Copy Business Unit Rules</MDTypography>}
            </MDBox>
            <MDBox display="flex">
              <IconButton onClick={handleUploadDialogClose} title="Close">
                <Icon>close</Icon>
              </IconButton>
            </MDBox>
          </MDBox>
          {(alert === 'month' &&  beforeUpload) ? variant === "copyBURules" ? <Alert sx={{fontSize:13}} severity="warning">Existing rules with the same unique key will be updated.</Alert> : <Alert sx={{fontSize:13}} severity="warning">All existing {typeFilter} will be deleted.</Alert>: ""}
          <MDBox p={3} display="block">
            <CopyFiles typeFilter= {typeFilter} setBeforeUpload = {setBeforeUpload} categoryFilter={categoryFilter} data = {data} variant={variant} handleUploadDialogClose={handleUploadDialogClose} {...props} />
          </MDBox>
        </Card>
      </MDBox>
    </Modal>
  )
}

export default CopyFilesDialog;