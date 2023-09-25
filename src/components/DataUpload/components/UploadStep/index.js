import { CircularProgress, Icon,Alert } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { useYADialog } from "components/YADialog";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";

const uploadBoxStyles = (theme, { isDragReject, isDragAccept }) => ({
    "@keyframes myEffect": {
        from: {
            transform: "scale(1.0)"
        },
        to: {
            transform: "scale(1.1)"
        }
    },
    display: (isDragReject || isDragAccept) ? "block" : "none",
    position: "absolute",
    height: 290,
    width: 290,
    top: -80,
    left: -146,
    borderRadius: "50%",
    backgroundColor: isDragReject ? "red" : isDragAccept ? "green" : "inherit",
    border: "10px solid #aca394",
    zIndex: 1,
    animation: "myEffect .7s infinite alternate",
})

const UploadStep = (props) => {

    const { onFileUpload, uploadSubType,assets } = props;
    const { showAlert } = useYADialog();

    const [fileChecking, setFileChecking] = useState(false);

    const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
        accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel.sheet.binary.macroEnabled.12, application/vnd.ms-excel, application/vnd.ms-excel.sheet.macroEnabled.12, text/csv",
        onDrop: async (acceptedFiles) => {
            try {
                setFileChecking(true);

                var reader = new FileReader();
                reader.onload = function (e) {
                    let data1 = new Uint8Array(e.target.result);
                    let wb = XLSX.read(data1, { type: 'array', sheetRows: 20000 });
                    let wsheet = wb.Sheets[wb.SheetNames[0]];
                    let rows = XLSX.utils.sheet_to_json(wsheet, { defval: null });
                    let columns = rows?.length > 0 ? Object.keys(rows[0]) : [];

                    if (onFileUpload) {
                        onFileUpload(
                            acceptedFiles[0],
                            acceptedFiles[0].name,
                            rows,
                            columns
                        );
                    }
                    setTimeout(() => {
                        setFileChecking(false);
                    }, 1000);
                };
                reader.readAsArrayBuffer(acceptedFiles[0]);
            } catch (err) {
                showAlert("Upload a valid .xls, .xlsx or .csv file");
                console.error("Upload a valid .xls, .xlsx or .csv file", err);
                setFileChecking(false);
            }
        }
    });
    
    let fileUploadInfo="";

    assets?.map((i =>{
        if(i.name == uploadSubType)
          fileUploadInfo = "Records with the same key will be rejected during the load. All other records will be loaded."
    }))
    
    uploadSubType == "budget" ? fileUploadInfo = "Budget records will always be loaded and added to existing budget records." : "";
    uploadSubType == "expenditure" || uploadSubType == "businessUnitOffering" ? fileUploadInfo = "Records with the same key will be rejected during the load. All other records will be loaded." : "";
    uploadSubType == "assetRelationship" || uploadSubType == "capabilityOffering"  ? fileUploadInfo = "Existing records with the same unique key will be updated with records in this file." : "";
    uploadSubType == "costPoolMapping" || uploadSubType == "towerMapping" || uploadSubType == "solutionMapping" ? fileUploadInfo = "All existing rules will be deleted." : "";
    

    return (
        <>
        <MDBox width="600px">
            { fileUploadInfo &&  (<Alert sx={{fontSize:13}} severity="warning">{fileUploadInfo}</Alert>)}
        </MDBox>
        <MDBox height="400px" width="600px" display="flex" alignItems="center" justifyContent="center" >
            <MDBox display="flex" alignItems="center" justifyContent="center" height={350} width={350}>
                <MDBox {...getRootProps({ className: 'dropzone' })} display="flex" alignItems="center" justifyContent="center" height="100%" width="100%">
                    <input {...getInputProps()} />
                    <MDBox display="flex" flexDirection="column" alignItems="center">
                        <MDBox sx={{ m: 1, position: 'relative' }}>
                            <Icon sx={{
                                position: "absolute",
                                top: (isDragReject || isDragAccept) ? 8 : -28,
                                left: -28,
                                zIndex: 2,
                                color: (isDragReject || isDragAccept) ? "#ffffff" : "#74acf7",
                                fontSize: "56px!important",
                            }}
                            >cloud_upload
                            </Icon>
                            <MDBox sx={{ position: "absolute", display: "flex", flexDirection: "column", zIndex: 2, mt: 11, width: 200, left: -100 }}>
                                {isDragReject && (
                                    <>
                                        <MDTypography variant="button" color="white" component="span" fontWeight="medium" textAlign="center">
                                            Invalid File!
                                        </MDTypography>
                                        <MDTypography variant="button" color="white" component="span" textAlign="center">
                                            only .xls, .xslx or .csv files
                                        </MDTypography>
                                    </>
                                )

                                }
                                {isDragAccept && (
                                    <>
                                        <MDTypography variant="button" color="white" component="span" fontWeight="medium" textAlign="center">
                                            Valid File!
                                        </MDTypography>
                                        <MDTypography variant="button" color="white" component="span" textAlign="center">
                                            proceed. drop it here...
                                        </MDTypography>
                                    </>
                                )
                                }
                            </MDBox>
                            <MDBox sx={(theme) => uploadBoxStyles(theme, { isDragReject, isDragAccept })}></MDBox>
                            {fileChecking && (
                                <CircularProgress
                                    size={78}
                                    sx={() => ({
                                        color: "#1A73E8",
                                        backgroundColor: "transparent",
                                        position: 'absolute',
                                        top: -36,
                                        left: -39,
                                        zIndex: 1,
                                    })}
                                />
                            )}
                        </MDBox>
                        {!fileChecking && (
                            <>
                                <MDTypography variant="subtitle1" fontWeight="light" color="text" component="span" textAlign="center" mt={8}>
                                    Drag &amp; drop your file here...
                                </MDTypography>
                                <MDButton variant="gradient" color="info" sx={{ mt: 2 }}>
                                    Or Browse
                                </MDButton>
                                <MDTypography variant="button" color="text" component="span" textAlign="center" mt={1}>
                                    {".xls, .xslx or .csv"}
                                </MDTypography>
                            </>
                        )}
                    </MDBox>
                </MDBox>
            </MDBox>
        </MDBox>
        </>
    );
};

export default UploadStep;