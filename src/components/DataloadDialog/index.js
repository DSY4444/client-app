import { Card, Icon, IconButton, Modal } from "@mui/material";
import MDBox from "components/MDBox";
import { useState } from "react";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import SelectionStep from "./components/SelectionStep";
import UploadStep from "./components/UploadStep";
import PreviewStep from "./components/PreviewStep";
import MappingStep from "./components/MappingStep";
import FinalStep from "./components/FinalStep";
import{backgroundProcessCheck} from '../../utils'
import { useYADialog } from "../YADialog";
const DataloadDialog = (props) => {

  const { title, uploadConfig, onClose } = props;
  const uploadCategory = uploadConfig?.uploadCategory;
  const uploadType = uploadConfig?.uploadType;
  const yearFilter = uploadConfig?.yearFilter;
  const monthFilter = uploadConfig?.monthFilter;
  const yearFilterName = uploadConfig?.yearFilterName
  const monthFilterName = uploadConfig?.monthFilterName
  const pkId = uploadConfig?.pkId;

  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadSubType, setUploadSubType] = useState(uploadType || null);
  const [activeStep, setActiveStep] = useState(uploadType ? "upload" : "select-type");
  const [fileName, setFileName] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [ws, setWs] = useState(null);
  const [sourceFields, setSourceFields] = useState([]);
  const [mappingFields, setMappingFields] = useState([]);
  const [destinationTable, setDestinationTable] = useState(uploadType || null);
  const { showAlert } = useYADialog();
  const handleOnFileTypeChange = (value) => {
    setUploadSubType(value);
    setActiveStep("upload");
  }

  const handleOnFileUpload = (file, fileName1, ws1, sourceFields1) => {
    setSelectedFile(file);
    setFileName(fileName1);
    setWs(ws1);
    setSourceFields(sourceFields1);
    setActiveStep("preview");
  }

  const handleOnMappingBack = () => {
    setActiveStep("preview");
  }

  const handleOnMappingNext = async (mappingFields1, destination) => {
    let bgData = await backgroundProcessCheck(monthFilter,yearFilter)
    if(bgData.length>0)
    {
      handleUploadDialogClose();
      showAlert(bgData[0],bgData[1],bgData[2],bgData[3]);
    }else{
      setMappingFields(mappingFields1);
      setDestinationTable(destination);
      setActiveStep("finish");
    }
  }

  const handleUploadDialogClose = () => {
    if (onClose) onClose(uploadSuccess);
  }

  const handleOnFinish = () => {
    setUploadSuccess(true);
  }

  // const uniqueRecords = (records) => {
  //   let mappedTable = records?.map((t) => {
  //     let r = {}
  //     let sourceColumn = ''
  //     mappingFields.map((a) => {
  //       sourceColumn = a.sourceColumn.trim()
  //       r[a.destinationColumn] = t[sourceColumn];
  //     })
  //     return r
  //   })
  //   let uniqueRecords = mappedTable?.filter((values, index, self) => self.findIndex(value => ['phoneNumber', 'chargeType', 'chargeDate'].every(k => value[k] === values[k])) === index);
  //   return uniqueRecords.length;
  // }

  const handleNext = () => {
    switch (activeStep) {
      case "select-type": {
        setActiveStep("upload");
        break;
      }
      case "upload": {
        break;
      }
      case "preview": {
        setActiveStep("mapping");
        break;
      }
      case "mapping": {
        setActiveStep("finish");
        break;
      }
      case "finish": {
        break;
      }

      default:
        break;
    }
  };

  const handleBack = () => {
    switch (activeStep) {
      case "select-type": {
        break;
      }
      case "upload": {
        setActiveStep("select-type");
        break;
      }
      case "preview": {
        setActiveStep("upload");
        break;
      }
      case "mapping": {
        setActiveStep("preview");
        break;
      }
      case "finish": {
        break;
      }

      default:
        break;
    }
  };

  let enableBackBtn = false;
  let enableNextBtn = false;

  switch (activeStep) {
    case "select-type": {
      enableBackBtn = false;
      if (uploadSubType)
        enableNextBtn = true;
      break;
    }
    case "upload": {
      enableBackBtn = uploadType ? false : true;
      enableNextBtn = false;
      break;
    }
    case "preview": {
      enableBackBtn = true;
      if (ws?.length > 0)
        enableNextBtn = true;
      break;
    }
    case "mapping": {
      enableBackBtn = true;
      if (mappingFields?.length > 0)
        enableNextBtn = true;
      break;
    }
    case "finish": {
      enableBackBtn = false;
      enableNextBtn = false;
      break;
    }

    default:
      break;
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
                {title}
              </MDTypography>
            </MDBox>
            <MDBox display="flex">
              <IconButton onClick={handleUploadDialogClose} title="Close">
                <Icon>close</Icon>
              </IconButton>
            </MDBox>
          </MDBox>
          {
            activeStep === "select-type" && (
              <SelectionStep uploadSubType={uploadSubType} uploadCategory={uploadCategory} onFileTypeChange={handleOnFileTypeChange} />
            )
          }
          {
            activeStep === "upload" && (
              <UploadStep uploadSubType={uploadSubType} yearFilterName={yearFilterName} monthFilterName={monthFilterName} onFileUpload={handleOnFileUpload} />
            )
          }
          {
            activeStep === "preview" && (
              <PreviewStep uploadSubType={uploadSubType} ws={ws} />
            )
          }
          {
            activeStep === "mapping" && (
              <MappingStep uploadSubType={uploadSubType} sourceFields={sourceFields} onMappingBack={handleOnMappingBack} onMappingNext={handleOnMappingNext} />
            )
          }
          {
            activeStep === "finish" && (
              // <FinalStep destinationTable={destinationTable} uploadSubType={uploadSubType} yearFilter={yearFilter} monthFilter={monthFilter} pkId={pkId} fileName={fileName} selectedFile={selectedFile} uniqueRecords={ uploadSubType === `mobileConsumption` ? uniqueRecords(ws) : 0 } totalRecords={ws?.length} mappingFields={mappingFields} onFinish={handleOnFinish} />
              <FinalStep destinationTable={destinationTable} uploadSubType={uploadSubType} yearFilter={yearFilter} monthFilter={monthFilter} pkId={pkId} fileName={fileName} selectedFile={selectedFile} totalRecords={ws?.length} mappingFields={mappingFields} onFinish={handleOnFinish} />
            )
          }
          {
            activeStep !== "mapping" && (
              <MDBox px={2.5} pb={2} pt={1} display="flex" justifyContent="space-between" alignItems="center">
                <MDBox>
                  {
                    enableBackBtn && (
                      <MDButton
                        size="medium"
                        color="info"
                        startIcon={<Icon>arrow_back_ios</Icon>}
                        onClick={handleBack}
                      >
                        Prev
                      </MDButton>
                    )
                  }
                </MDBox>
                {
                  activeStep === "preview" && <MDTypography color="text" variant="subtitle2" fontWeight="medium">Data Preview</MDTypography>
                }
                <MDBox>
                  {
                    enableNextBtn && (
                      <MDButton
                        size="medium"
                        color="info"
                        endIcon={<Icon>arrow_forward_ios</Icon>}
                        onClick={handleNext}
                      >
                        Next
                      </MDButton>
                    )
                  }
                </MDBox>
              </MDBox>
            )
          }
        </Card>
      </MDBox>
    </Modal>
  )
};

export default DataloadDialog;