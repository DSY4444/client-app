import { CircularProgress, Icon } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useEffect, useRef, useState } from "react";
import DataloadErrorsDialog from "components/DataloadErrorsDialog";
import fetchRequest from "utils/fetchRequest";
import _ from "lodash";

const FinalStep = (props) => {

    const { destinationTable, yearFilter, monthFilter, pkId, fileName, selectedFile, totalRecords, mappingFields, onFinish } = props;
    const timer = useRef();
    const [fileProcessingState, setFileProcessingState] = useState("processing");
    const [errors, setErrors] = useState({});
    const [fileInfo, setFileInfo] = useState({});
    const [error, setError] = useState(false);
    const [openErr, setOpenErr] = useState(false);
    const getPresignedUrl = async (fId) => {
        return await fetchRequest.get(`/api/blob/presignedPost/${fId}`);
    }

    const checkFileUploadStatus = async (fileId) => {
        const [error, data] = await fetchRequest.get(`/api/dataload/uploadstatus/${fileId}`);
        if (error) {
            console.error("An error occured while fetching upload status");
            console.error(error);
        }
        return data;
    }

    // const deleteConsumptions = async () => {

    //     let [err, data] = await fetchRequest.delete(`/api/dataflow/${destinationTable}/${yearFilter}/${monthFilter}`)
    //     if (err) {
    //         console.error(err)
    //     }
    //     else if (data) {
    //         console.log(data);
    //     }
    // }

    const processFile = async () => {
        const [err, data] = await fetchRequest.get(`/api/dataload/list`);
        if (err) {
            console.error(err);
        }
        const checkFile = _.find(data, { originalFileName: fileName, monthNameId: monthFilter, yearNameId: yearFilter })
        if (checkFile) {
            setFileProcessingState("exists");
            return;
        }
        // if (uploadSubType == "mobileConsumption") deleteConsumptions();
        try {
            var uf = {}
            uf.originalFileName = fileName;
            uf.mappingFields = JSON.stringify(mappingFields);
            uf.yearNameId = yearFilter;
            uf.monthNameId = monthFilter;
            uf.totalRecords = totalRecords;
            uf.destinationTable = destinationTable;
            uf.pkId = pkId;

            const [resError, response] = await fetchRequest.post(`/api/dataload/createupload`, uf);
            if (resError) {
                console.error("An error occured while creating upload");
                console.error(resError);
                setError(true);
                return false;
            }

            const [presignedUrlError, presignedUrlResponse] = await getPresignedUrl(response.id);
            if (presignedUrlError) {
                console.error("An error occured while getting presigned url");
                console.error(presignedUrlError);
                setError(true);
                return false;
            }

            const [putError,] = await fetchRequest.put(presignedUrlResponse, selectedFile, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (putError) {
                console.error("An error occured while uploading to blob store");
                console.error(putError);
                setError(true);
                return false;
            }

            const [uploadedError, uploadedResponse] = await fetchRequest.post(`/api/dataload/uploaded`, { fileId: response.id });
            if (uploadedError) {
                console.error("An error occured while updating file status");
                console.error(uploadedError);
                setError(true);
                setFileProcessingState("error");
                return false;
            }
            else if (uploadedResponse?.result === false) {
                console.error("An error occured while updating file status");
                setError(true);
                setFileProcessingState("error");
                return false;
            }

            timer.current = setInterval(async () => {
                const uploadFile = await checkFileUploadStatus(response.id);
                const uploadStatus = uploadFile?.fileStatus.toLowerCase();
                const totalRecords = uploadFile?.totalRecords || 0;
                const loadedRecords = uploadFile?.loadedRecords || 0;
                const errorsJson = uploadFile?.errors || "[]";
                const errs = JSON.parse(errorsJson.replace(/'/g, ""));
                if (["loaded", "error", "partial"].includes(uploadStatus)) {
                    clearInterval(timer.current);

                    setErrors(errs);
                    setFileInfo(uploadFile);

                    if (uploadStatus === "loaded") {
                        // if (loadedRecords > 0 && uploadSubType === `mobileConsumption` ? uniqueRecords !== loadedRecords : loadedRecords !== totalRecords)
                        if (loadedRecords > 0 && loadedRecords !== totalRecords)
                            setFileProcessingState("partial");
                        else if (loadedRecords === 0)
                            setFileProcessingState("error");
                        else
                            setFileProcessingState("loaded");
                    }
                    else
                        setFileProcessingState(uploadStatus);

                    if (onFinish)
                        onFinish();
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
        processFile();
    }, [destinationTable, fileName, totalRecords, mappingFields]);

    const handleErrDialogOpen = () => {
        setOpenErr(true);
    }

    const handleErrDialogClose = () => {
        setOpenErr(false);
    }

    if (error)
        return <MDBox height="400px" width="600px" display="flex" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" px={6}>
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

    return (
        <MDBox height="400px" width="600px" display="flex" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" px={6}>
            {
                fileProcessingState === "processing" && (
                    <MDBox sx={{ m: 1, position: 'relative' }}>
                        <Icon sx={{ color: "#74acf7", fontSize: "56px!important" }}>cloud_upload</Icon>
                        <CircularProgress
                            size={78}
                            sx={() => ({
                                color: "#1A73E8",
                                backgroundColor: "transparent",
                                position: 'absolute',
                                top: -8,
                                left: -11,
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
                fileProcessingState === "partial" || fileProcessingState === "exists" && (
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
                {fileProcessingState === "processing" && "Processing file...."}
                {fileProcessingState === "loaded" && "File processed successfully."}
                {fileProcessingState === "error" && "Errors occured while processing the file."}
                {fileProcessingState === "partial" && "File processing partially succeeded."}
                {fileProcessingState === "exists" && "File already exists in system."}
            </MDTypography>
            {
                fileProcessingState === "processing" && (
                    <MDTypography variant="subtitle2" fontWeight="light" color={"text"} mt={2}>
                        {destinationTable !== "budgetDetail" ? "File is being processed in the background. You may close this window and check the file status in uploaded files list." : "File is being processed in the background. You may close this window."}
                    </MDTypography>
                )
            }
            {
                fileProcessingState !== "processing" && fileProcessingState !== "exists" && (
                    <MDBox mt={6} display="flex">
                        <MDBox mr={4} display="flex" flexDirection="column">
                            <MDTypography variant="h2" component="span" fontWeight="medium" color={"dark"}>{fileInfo?.totalRecords}</MDTypography>
                            <MDTypography variant="button" fontWeight="light" color={"text"}>Total Records</MDTypography>
                        </MDBox>
                        {/* {uploadSubType === 'mobileConsumption' && (<MDBox mr={4} display="flex" flexDirection="column">
                            <MDTypography variant="h2" component="span" fontWeight="medium" color={"dark"}>{uniqueRecords}</MDTypography>
                            <MDTypography variant="button" fontWeight="light" color={"text"}>Total Unique Records</MDTypography>
                        </MDBox>)} */}
                        <MDBox display="flex" flexDirection="column">
                            <MDTypography variant="h2" component="span" fontWeight="medium" color={"dark"}>{fileInfo?.loadedRecords}</MDTypography>
                            <MDTypography variant="button" fontWeight="light" color={"text"}>Loaded Records</MDTypography>
                        </MDBox>
                        {
                            errors && errors.length > 0 && (
                                <MDBox ml={4} display="flex" flexDirection="column" onClick={handleErrDialogOpen}>
                                    <MDTypography
                                        variant="h2"
                                        component="span"
                                        fontWeight="medium"
                                        color="error"
                                        sx={{
                                            "cursor": "pointer",
                                            "&:hover": {
                                                textDecoration: "underline"
                                            }
                                        }}
                                    >
                                        {errors.length}
                                    </MDTypography>
                                    <MDTypography variant="button" fontWeight="light" color={"text"}>Errors</MDTypography>
                                </MDBox>
                            )
                        }
                    </MDBox>
                )
            }
            {
                openErr && <DataloadErrorsDialog info={fileInfo} rows={errors} onErrDialogClose={handleErrDialogClose} />
            }
        </MDBox>
    );
};

export default FinalStep;