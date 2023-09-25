import { Icon } from "@mui/material";
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
const DataUpload = (props) => {
    const { yearFilter, monthFilter, uploadType, setUploadSuccess, activeStep, setActiveStep,assets } = props;
    const [uploadSubType, setUploadSubType] = useState(uploadType);
    const [fileName, setFileName] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [ws, setWs] = useState(null);
    const [sourceFields, setSourceFields] = useState([]);
    const [mappingFields, setMappingFields] = useState([]);
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
  
    const handleOnMappingNext = async (mappingFields1) => {
      let bgData = await backgroundProcessCheck(monthFilter,yearFilter)
      if(bgData.length>0)
      {
        showAlert(bgData[0],bgData[1],bgData[2],bgData[3]);
      }else
      {
        setMappingFields(mappingFields1);
        setActiveStep("finish");
      }
    }
  
    const handleOnFinish = () => {
      setUploadSuccess(true);
    }
  
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
          !uploadType && setActiveStep("select-type");
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
        <>
        {
            activeStep === "select-type" && (
              <SelectionStep uploadSubType={uploadSubType} onFileTypeChange={handleOnFileTypeChange} />
            )
          }
          {
            activeStep === "upload" && (
              <UploadStep uploadSubType={uploadSubType} onFileUpload={handleOnFileUpload} assets={assets} />
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
              <FinalStep uploadSubType={uploadSubType} yearFilter={yearFilter} monthFilter={monthFilter} fileName={fileName} selectedFile={selectedFile} totalRecords={ws?.length} mappingFields={mappingFields} onFinish={handleOnFinish} />
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
          </>
    )
}

export default DataUpload