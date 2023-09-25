import { CircularProgress, Icon } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useEffect, useRef, useState } from "react";
import fetchRequest from "utils/fetchRequest";
import { useDataWorkspaceContext } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import { dataUploadFailed } from "pages/DataWorkspaces/components/DataWorkspaceContext";

const UploadFile = (props) => {
    const [state, dispatch] = useDataWorkspaceContext();
    const { mappingStepConfig, uploadStepConfig } = state;
    const { workspaceId, uploadedFile, retryFailedDataUpload, fileName, onUploadSuccess } = props;
    const timer = useRef();
    const [fileProcessingState, setFileProcessingState] = useState("processing");
    const [, setErrors] = useState({});
    const [, setFileInfo] = useState({});
    const [error, setError] = useState(false);

    const checkFileUploadStatus = async () => {
        const [error, data] = await fetchRequest.get(`/api/dataWorkspaces/uploadstatus/${workspaceId}`);
        if (error) {
            console.error("An error occured while fetching upload status");
            console.error(error);
        }
        return data;
    }

    const processFile = async (retry) => {
        try {
            var uf = {}
            uf.originalFileName = fileName;
            uf.inputFileColumnNames = mappingStepConfig?.inputFileColumnNames || [];
            uf.destinationTable = "expenditure";
            uf.uploadConfig = uploadStepConfig;
            // uf.totalRecords = totalRecords;

            if (!retry) {

                const [error, presignedUrl] = await fetchRequest.post(`/api/dataWorkspaces/createupload/${workspaceId}`, uf);
                if (error) {
                    console.error("An error occured while creating upload");
                    console.error(error);
                    setError(true);
                    return false;
                }

                const [putError,] = await fetchRequest.put(presignedUrl, uploadedFile, { headers: { 'Content-Type': 'multipart/form-data' } });
                if (putError) {
                    console.error("An error occured while uploading to blob store");
                    console.error(putError);
                    setError(true);
                    return false;
                }
                else
                    setFileProcessingState("uploadingData");
            }

            const [uploadedError, data] = await fetchRequest.post(`/api/dataWorkspaces/uploaded/${workspaceId}`);
            if (uploadedError) {
                console.error("An error occured while updating file status");
                console.error(uploadedError);
                setError(true);
                return false;
            }
            else if (data && data.result === false) {
                dataUploadFailed(dispatch);
            }

            timer.current = setInterval(async () => {
                const uploadFile = await checkFileUploadStatus(workspaceId);
                const uploadStatus = uploadFile?.status.toLowerCase();
                const totalRecords = 1//uploadFile?.totalRecords || 0;
                const loadedRecords = 1//uploadFile?.loadedRecords || 0;
                const errorsJson = "[]"//uploadFile?.errors || "[]";
                const errs = JSON.parse(errorsJson.replace(/'/g, ""));
                if (["data_loaded", "error", "partial"].includes(uploadStatus)) {
                    clearInterval(timer.current);

                    setErrors(errs);
                    setFileInfo(uploadFile);

                    if (uploadStatus === "data_loaded") {
                        if (loadedRecords > 0 && loadedRecords !== totalRecords)
                            setFileProcessingState("partial");
                        else if (loadedRecords === 0)
                            setFileProcessingState("error");
                        else
                            setFileProcessingState("loaded");
                    }
                    else
                        setFileProcessingState(uploadStatus);

                    if (onUploadSuccess)
                        onUploadSuccess();
                }
            }, 3000);

        } catch (error1) {
            console.error(error1);
            setError(true);
        }
    }

    useEffect(() => {
        return () => {
            clearInterval(timer.current);
        }
    }, []);

    useEffect(() => {
        processFile(retryFailedDataUpload);
    }, [workspaceId, retryFailedDataUpload]);

    if (error)
        return <MDBox flex={1} display="flex" alignItems="center" justifyContent="center">
            <MDBox height="400px" width="600px" display="flex" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" px={6}>
                <MDBox sx={() => ({
                    height: 70,
                    width: 70,
                    borderRadius: "50%",
                    backgroundColor: "#fb0606",
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
                        }}>warning_amber</Icon>
                </MDBox>
                <MDTypography variant="button" fontWeight="medium" color={"text"} mt={2}>
                    An error occured while uploading the file.
                </MDTypography>
            </MDBox>
        </MDBox>

    return (
        <MDBox flex={1} display="flex" alignItems="center" justifyContent="center">
            <MDBox height="400px" width="600px" display="flex" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" px={6}>
                {
                    (["processing", "uploadingData"].includes(fileProcessingState)) && (
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
                                    zIndex: 2,
                                    color: "#74acf7",
                                    fontSize: "56px!important",
                                }}
                            >
                                cloud_upload
                            </Icon>
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
                        </MDBox>
                    )
                }
                {
                    fileProcessingState === "loaded" && (
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
                    )
                }
                {
                    fileProcessingState === "error" && (
                        <MDBox sx={() => ({
                            height: 70,
                            width: 70,
                            borderRadius: "50%",
                            backgroundColor: "#fb0606",
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
                                }}>warning_amber</Icon>
                        </MDBox>
                    )
                }
                {
                    fileProcessingState === "partial" && (
                        <MDBox sx={() => ({
                            height: 70,
                            width: 70,
                            borderRadius: "50%",
                            backgroundColor: "#dd7948",
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
                    )
                }

                <MDTypography variant="button" fontWeight="medium" color={"text"} mt={2}>
                    {fileProcessingState === "processing" && "Uploading file...."}
                    {fileProcessingState === "uploadingData" && "Loading data...."}
                    {fileProcessingState === "loaded" && "File uploaded successfully."}
                    {fileProcessingState === "error" && "Errors occured while uploading the file."}
                    {fileProcessingState === "partial" && "File processing partially succeeded."}
                </MDTypography>
            </MDBox>
        </MDBox>
    );
};

export default UploadFile;