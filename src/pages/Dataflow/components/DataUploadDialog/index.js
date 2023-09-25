import { Card, Icon, IconButton, Modal } from "@mui/material";
import MDBox from "components/MDBox";
import { useState } from "react";
import MDTypography from "components/MDTypography";
import DataUpload from "components/DataUpload";


const DataUploadDialog = (props) => {

  const { onClose, yearFilterName, monthFilterName, reloadData, uploadType ,setRefresh } = props;
    const [uploadSuccess, setUploadSuccess] = useState(null);
    const [activeStep, setActiveStep] = useState(uploadType ? "upload" : "select-type");

  const handleUploadDialogClose = () => {
    if (uploadSuccess && reloadData) {
      if(setRefresh)
      {
        setRefresh(Math.random())
      }
      reloadData();
    }
    if (onClose) onClose();
  }

  return (
    <Modal open={true} onClose={handleUploadDialogClose}>
      <MDBox p={3} height="100%" width="100%" display="flex" alignItems="center" justifyContent="center">
        <Card
          sx={{
            overflow: 'hidden',
            width: (activeStep === "preview") ? "calc(100vw - 32px)" : undefined,
            height: (activeStep === "preview") ? "calc(100vh - 32px)" : undefined
          }}
        >
          <MDBox px={3} pt={2} display="flex" justifyContent="space-between" alignItems="center">
            <MDBox>
              <MDTypography variant="h6" component="span" color="text">
                {`Upload for ${monthFilterName}, FY ${yearFilterName}`}
              </MDTypography>
            </MDBox>
            <MDBox display="flex">
              <IconButton onClick={handleUploadDialogClose} title="Close">
                <Icon>close</Icon>
              </IconButton>
            </MDBox>
          </MDBox>
          <DataUpload {...props} uploadSuccess={uploadSuccess} setUploadSuccess={setUploadSuccess} activeStep={activeStep} setActiveStep={setActiveStep} />
        </Card>
      </MDBox>
    </Modal>
  )
};

export default DataUploadDialog;