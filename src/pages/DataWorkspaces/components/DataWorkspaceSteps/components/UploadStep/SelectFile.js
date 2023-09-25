import { CircularProgress, Icon } from "@mui/material";
import AnimatedComponent from "components/AnimatedComponent";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { useYADialog } from "components/YADialog";
import { useState } from "react";
import { useDropzone } from "react-dropzone";

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
    top: -32,
    // left: -146,
    borderRadius: "50%",
    backgroundColor: isDragReject ? "red" : isDragAccept ? "green" : "inherit",
    border: "10px solid #aca394",
    zIndex: 1,
    animation: "myEffect .7s infinite alternate",
});

const SelectFile = (props) => {
    const { onFileSelection } = props;
    // const [fileWorker,] = useState(workerFactory.createWorker(WORKERS.FILE_WORKER));
    const [fileChecking, setFileChecking] = useState(false);
    const { showAlert } = useYADialog();

    // useEffect(() => {
    //     fileWorker.addEventListener('message', ({ data }) => {
    //         console.log("Message from worker", data);
    //         if (onFileUpload) {
    //             // onFileUpload(
    //             //     data.file,
    //             //     data.fileName,
    //             //     data.rows,
    //             //     data.columns
    //             // );
    //         }
    //     });
    // }, [fileWorker]);

    const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
        accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel.sheet.binary.macroEnabled.12, application/vnd.ms-excel, application/vnd.ms-excel.sheet.macroEnabled.12, text/csv",
        multiple: false,
        maxFiles: 1,
        minSize: 1,
        maxSize: 1024 * 1024 * 5,
        onDrop: async (acceptedFiles) => {
            if (acceptedFiles?.length > 0) {
                const fileExt = acceptedFiles[0].name.split('.').pop();
                if ([".xls", ".xlsx", ".csv"].includes(fileExt.toLowerCase())) {
                    showAlert("Invalid file format", "Upload a valid .xls, .xlsx or .csv file");
                    setFileChecking(false);
                }
                try {
                    setFileChecking(true);
                    onFileSelection(acceptedFiles[0]);
                    // fileWorker.postMessage(acceptedFiles[0]);
                } catch (err) {
                    showAlert("Invalid file format", "Upload a valid .xls, .xlsx or .csv file");
                    console.error("Upload a valid .xls, .xlsx or .csv file", err);
                    setFileChecking(false);
                }
            }
            else {
                showAlert("Invalid file format", "Upload a valid .xls, .xlsx or .csv file");
                setFileChecking(false);
            }
        }
    });

    return (
        <MDBox flex={1} display="flex" alignItems="center" justifyContent="center">
            <MDBox display="flex" alignItems="center" justifyContent="center" height={350} width={350}>
                <MDBox {...getRootProps({ className: 'dropzone' })} display="flex" alignItems="center" justifyContent="center" height="100%" width="100%">
                    <input {...getInputProps()} />
                    <MDBox display="flex" flexDirection="column" alignItems="center">
                        <MDBox sx={{
                            m: 1,
                            position: 'relative',
                            height: 200,
                            width: 200,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px dashed #ddd"
                        }}
                        >
                            <Icon
                                sx={{
                                    position: "absolute",
                                    // top: (isDragReject || isDragAccept) ? 8 : -28,
                                    // left: -28,
                                    zIndex: 2,
                                    color: (isDragReject || isDragAccept) ? "#ffffff" : "#74acf7",
                                    fontSize: "56px!important",
                                }}
                            >
                                cloud_upload
                            </Icon>
                            <MDBox sx={{ position: "absolute", display: "flex", flexDirection: "column", zIndex: 2, mt: 11, width: 200, }}>
                                {isDragReject && (
                                    <>
                                        <MDTypography variant="button" color="white" component="span" fontWeight="medium" textAlign="center">
                                            Invalid File!
                                        </MDTypography>
                                        <MDTypography variant="button" color="white" component="span" textAlign="center">
                                            only .xls, .xslx or .csv files
                                        </MDTypography>
                                    </>
                                )}
                                {isDragAccept && (
                                    <>
                                        <MDTypography variant="button" color="white" component="span" fontWeight="medium" textAlign="center">
                                            Valid File!
                                        </MDTypography>
                                        <MDTypography variant="button" color="white" component="span" textAlign="center">
                                            proceed. drop it here...
                                        </MDTypography>
                                    </>
                                )}
                            </MDBox>
                            <MDBox sx={(theme) => uploadBoxStyles(theme, { isDragReject, isDragAccept })}></MDBox>
                            {fileChecking && (
                                <CircularProgress
                                    size={200}
                                    thickness={1}
                                    sx={() => ({
                                        color: "#1A73E8",
                                        backgroundColor: "transparent",
                                        position: 'absolute',
                                        zIndex: 1,
                                    })}
                                />
                            )}
                        </MDBox>
                        {fileChecking && (
                            <MDTypography variant="button" fontWeight="medium" color={"text"} mt={2}>
                                Analyzing file....
                            </MDTypography>)
                        }
                        {!fileChecking && (
                            <>
                                <MDTypography variant="h4" fontWeight="light" color="text" component="span" textAlign="center" mt={4}>
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
    );
};

export default AnimatedComponent(SelectFile);