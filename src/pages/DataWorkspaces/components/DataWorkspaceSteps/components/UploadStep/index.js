import EmptyState from "components/EmptyState";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { setTotalRowCount } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import { setSelectedFileDetails } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import { setColumnNames } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import { finishedUpload } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import { setHeaderRowNumber } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import { setSelectedSheetName } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import { useDataWorkspaceContext } from "pages/DataWorkspaces/components/DataWorkspaceContext";
import { useCallback, useEffect, useState } from "react";
import { WORKERS } from "workers/constants";
import { FILE_WORKER_MESSAGETYPE } from "workers/constants";
import workerFactory from "workers/workerFactory";
import PreviewData from "./PreviewData";
import SelectFile from "./SelectFile";
import SelectSheet from "./SelectSheet";
import UploadedData from "./UploadedData";
import UploadFile from "./UploadFile";
import error_img from "assets/svg/error.svg";
import MDButton from "components/MDButton";
import { Icon } from "@mui/material";
import { retryFailedDataUpload } from "pages/DataWorkspaces/components/DataWorkspaceContext";

const UploadStep = (props) => {
    const { workspaceId } = props;
    const [state, dispatch] = useDataWorkspaceContext();
    const { uploadStepConfig: { fileName, sheetName, headerRowNumber, uploadState }, mappingStepConfig: { inputFileColumnNames } } = state;
    const [fileWorker,] = useState(workerFactory.createWorker(WORKERS.FILE_WORKER));
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileSheetNames, setFileSheetNames] = useState(null);
    const [previewData, setPreviewData] = useState(null);

    useEffect(() => {
        fileWorker.addEventListener('message', ({ data }) => {
            if (data.messageType === FILE_WORKER_MESSAGETYPE.ANALYZE_FILE) {
                if (data.rows) {
                    fileWorker.postMessage({ messageType: FILE_WORKER_MESSAGETYPE.GET_ROW_COUNT, file: data.file });
                    setPreviewData({ columns: data.columns, rows: data.rows });
                }
                setSelectedFileDetails(dispatch, { fileName: data.fileName, isCsv: data.isCsv, sheetName: data.sheetName, headerRowNumber: data.headerRowNumber, columnNames: data.columnNames });
                setFileSheetNames(data.sheetNames);
            }
            else if (data.messageType === FILE_WORKER_MESSAGETYPE.CHANGE_SHEET) {
                fileWorker.postMessage({ messageType: FILE_WORKER_MESSAGETYPE.GET_ROW_COUNT, file: data.file, sheetName: data.sheetName });
                setHeaderRowNumber(dispatch, data.headerRowNumber, data.columnNames);
                setPreviewData({ columns: data.columns, rows: data.rows });
                setFileSheetNames(data.sheetNames);
            }
            else if (data.messageType === FILE_WORKER_MESSAGETYPE.GET_ROW_COUNT) {
                setTotalRowCount(dispatch, data.totalRowCount);
            }
            else if (data.messageType === FILE_WORKER_MESSAGETYPE.GET_COLUMN_NAMES) {
                setColumnNames(dispatch, data.columns);
            }
        });

        () => fileWorker.removeEventListener('message');
    }, [fileWorker]);

    const handleOnFileSelection = useCallback((file) => {
        setSelectedFile(file);
        fileWorker.postMessage({ messageType: FILE_WORKER_MESSAGETYPE.ANALYZE_FILE, file });
        // fileWorker.postMessage({ messageType: FILE_WORKER_MESSAGETYPE.GET_ROW_COUNT, file });
    }, [fileWorker]);

    const handleOnSheetSelection = useCallback((sheetName) => {
        setSelectedSheetName(dispatch, sheetName);
        fileWorker.postMessage({ messageType: FILE_WORKER_MESSAGETYPE.CHANGE_SHEET, file: selectedFile, sheetName });
        // fileWorker.postMessage({ messageType: FILE_WORKER_MESSAGETYPE.GET_ROW_COUNT, file: selectedFile, sheetName });
    }, [dispatch, fileWorker, selectedFile]);

    const handleOnHeaderRowSelection = useCallback((headerRowNumber, columnNames) => {
        // fileWorker.postMessage({ messageType: FILE_WORKER_MESSAGETYPE.GET_COLUMN_NAMES, file: selectedFile, sheetName, headerRowNumber: value });
        setHeaderRowNumber(dispatch, headerRowNumber, columnNames);
    }, [dispatch, selectedFile, sheetName]);

    const handleOnUploadSuccess = useCallback(() => {
        finishedUpload(dispatch);
    }, [dispatch, selectedFile]);

    const handleOnRetryClick = useCallback(async () => {
        retryFailedDataUpload(dispatch);
    }, [dispatch]);

    if (uploadState === "previewData")
        return <PreviewData sheetNames={fileSheetNames} inputFileColumnNames={inputFileColumnNames} headerRowNumber={headerRowNumber} data={previewData} onSheetSelection={handleOnSheetSelection} onHeaderRowSelection={handleOnHeaderRowSelection} />
    if (uploadState === "uploadSuccess")
        return <UploadedData workspaceId={workspaceId} inputFileColumnNames={inputFileColumnNames} />

    return (
        <MDBox flex={1} display="flex" height="calc(100vh - 56px)" flexDirection="column" py={3}>
            <MDBox display="flex" flexDirection="row" alignItems="flex-start" justifyContent="space-between" px={2}>
                <MDTypography variant="subtitle1" fontWeight="medium" component="span" textAlign="center">
                    Upload your file
                </MDTypography>
            </MDBox>
            <MDBox flex={1} pt={2} display="flex" sx={{ overflow: "hidden", height: "100%", width: "100%" }}>
                {
                    uploadState === "selectFile" &&
                    <SelectFile onFileSelection={handleOnFileSelection} />
                }
                {
                    uploadState === "selectSheet" &&
                    <SelectSheet sheetNames={fileSheetNames} onSheetSelection={handleOnSheetSelection} />
                }
                {
                    (uploadState === "uplodFile" || uploadState === "retryFailedDataUpload") &&
                    <UploadFile workspaceId={workspaceId} retryFailedDataUpload={uploadState === "retryFailedDataUpload"} uploadedFile={selectedFile} fileName={fileName} onUploadSuccess={handleOnUploadSuccess} />
                }
                {
                    uploadState === "dataUploadFailed" &&
                    <MDBox
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        height="100%"
                        width="100%"
                    >
                        <EmptyState
                            variant="error"
                            size="large"
                            image={error_img}
                            title={`Something went wrong`}
                            description="An error occurred while uploading data."
                            actions={
                                <MDButton
                                    variant="gradient"
                                    color="info"
                                    startIcon={<Icon>refresh</Icon>}
                                    onClick={handleOnRetryClick}
                                >
                                    Try Again
                                </MDButton>
                            }
                        />
                    </MDBox>
                }
            </MDBox>
        </MDBox>
    )
};

export default UploadStep;