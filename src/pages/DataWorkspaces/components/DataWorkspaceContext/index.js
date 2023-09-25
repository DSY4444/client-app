import produce from "immer";
import { createContext, useReducer, useMemo, useContext } from "react";

const DataWorkspaceContext = createContext();

const progressByStatus = {
  "DATA_UPLOAD_FAILED": { currentStep: 1, stepProgress: 1, selectedStepKey: "upload" },
  "DATA_LOADED": { currentStep: 2, stepProgress: 1, selectedStepKey: "mapping" },
  "FIELDS_MAPPED": { currentStep: 3, stepProgress: 1, selectedStepKey: "review" },
  "DATA_PREPARED": { currentStep: 3, stepProgress: 100, selectedStepKey: "finalized" }
}

const initialUploadStepConfig = {
  fileName: "",
  fileType: "",
  sheetName: null,
  headerRowNumber: 0,
  totalRowCount: "--",
  dateFormat: "",
  uploadState: "selectFile"
};

const initialMappingStepConfig = {
  mappingState: "mapFields",
  inputFileColumnNames: [],
  mappings: []
};

const initialReviewStepConfig = {
  reviewState: "analyzeData"
};

const initialState = {
  loading: true,
  workspaceId: null,
  status: 'DRAFT',
  uploadedFileRef: null,
  config: {},
  uploadStepConfig: {
    fileName: "",
    isCsv: false,
    sheetName: null,
    headerRowNumber: 1,
    totalRowCount: "--",
    dateFormat: "",
    uploadState: "selectFile"
  },
  mappingStepConfig: {
    mappingState: "mapFields",
    inputFileColumnNames: [],
    mappings: []
  },
  reviewStepConfig: {
    reviewState: "analyzeData"
  },
  step3Config: {},
  selectedStepKey: "home",
  currentStep: 1,
  stepProgress: 0,
  initiated: false,
  lookups: {},
  showMarkAsCompleteBtn: false
}

const reducer = (state, action) => {
  switch (action.type) {
    case "WORKSPACE_LOADED": {
      const { workspaceId, name, type, description, status, config, uploadConfig, mappingConfig, reviewConfig } = action.value;
      return produce(state, draft => {
        draft.loading = false;
        draft.workspaceId = workspaceId;
        draft.name = name;
        draft.type = type;
        draft.description = description;
        draft.status = status;
        draft.config = config;
        draft.uploadStepConfig = uploadConfig || initialUploadStepConfig;
        draft.mappingStepConfig = mappingConfig || initialMappingStepConfig;
        draft.reviewStepConfig = reviewConfig || initialReviewStepConfig;
        draft.initiated = status !== "DRAFT";

        const currentProgress = progressByStatus[status];
        if (currentProgress) {
          draft.currentStep = currentProgress.currentStep;
          draft.stepProgress = currentProgress.stepProgress;
          draft.selectedStepKey = currentProgress.selectedStepKey;
        }
      });
    }
    case "INIT_WORKSPACE": {
      return produce(state, draft => {
        draft.initiated = true;
        draft.currentStep = 1;
        draft.stepProgress = 1;
        draft.selectedStepKey = "upload";
      });
    }
    case "SELECT_STEP": {
      return produce(state, draft => {
        draft.selectedStepKey = action.value;
      });
    }
    case "SET_SELECTED_FILEDETAILS": {
      return produce(state, draft => {
        draft.uploadStepConfig.fileName = action.value.fileName;
        draft.uploadStepConfig.isCsv = action.value.isCsv;
        draft.uploadStepConfig.sheetName = action.value.sheetName;
        draft.uploadStepConfig.uploadState = action.value.sheetName ? "previewData" : "selectSheet";
        draft.uploadStepConfig.headerRowNumber = action.value.headerRowNumber;
        draft.mappingStepConfig.inputFileColumnNames = action.value.columnNames;
      });
    }
    case "DATA_UPLOAD_FAILED": {
      return produce(state, draft => {
        draft.uploadStepConfig.uploadState = "dataUploadFailed";
      });
    }
    case "DATA_UPLOAD_FAILED_RETRY": {
      return produce(state, draft => {
        draft.uploadStepConfig.uploadState = "retryFailedDataUpload";
      });
    }
    case "SET_SELECTED_SHEETNAME": {
      return produce(state, draft => {
        draft.uploadStepConfig.uploadState = "previewData";
        draft.uploadStepConfig.sheetName = action.value;
      });
    }
    case "SET_HEADER_ROWNUMBER": {
      return produce(state, draft => {
        draft.uploadStepConfig.headerRowNumber = action.headerRowNumber;
        draft.mappingStepConfig.inputFileColumnNames = action.columnNames;
      });
    }
    case "SET_TOTAL_ROWCOUNT": {
      return produce(state, draft => {
        draft.uploadStepConfig.totalRowCount = action.value;
      });
    }
    case "SET_COLUMN_NAMES": {
      return produce(state, draft => {
        draft.mappingStepConfig.inputFileColumnNames = action.value;
      });
    }
    case "START_UPLOAD": {
      return produce(state, draft => {
        draft.uploadStepConfig.uploadState = "uplodFile";
      });
    }
    case "FINISHED_UPLOAD": {
      return produce(state, draft => {
        draft.currentStep = 2;
        draft.stepProgress = 1;
        draft.selectedStepKey = "mapping";
        draft.mappingStepConfig.mappingState = "mapFields";
        draft.uploadStepConfig.uploadState = "uploadSuccess";
      });
    }
    case "SET_FIELD_MAPPINGS": {
      return produce(state, draft => {
        draft.currentStep = 3;
        draft.stepProgress = 1;
        draft.selectedStepKey = "review";
        draft.mappingStepConfig.mappingState = "fieldsMapped";
        draft.mappingStepConfig.mappings = action.value;
      });
    }
    case "PROCESS_DATA": {
      return produce(state, draft => {
        draft.reviewStepConfig.reviewState = "processData";
      });
    }
    case "DATA_PROCESSED": {
      return produce(state, draft => {
        draft.reviewStepConfig.reviewState = "correctData";
      });
    }
    case "SHOW_NEWITEMS": {
      return produce(state, draft => {
        draft.reviewStepConfig.reviewState = "showNewItems";
      });
    }
    case "SET_LOOKUPDATA": {
      return produce(state, draft => {
        draft.lookups = action.value;
      });
    }
    case "FINISHED": {
      return produce(state, draft => {
        draft.stepProgress = 100;
        draft.reviewStepConfig.reviewState = "dataCorrected";
        draft.status = "DATA_PREPARED";
        draft.selectedStepKey = "finalized";
      });
    }
    case "SHOW_MARK_AS_COMPLETE": {
      return produce(state, draft => {
        draft.showMarkAsCompleteBtn = true;
      });
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};

function DataWorkspaceProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => [state, dispatch], [state, dispatch]);
  return (
    <DataWorkspaceContext.Provider value={value}>
      {props.children}
    </DataWorkspaceContext.Provider>
  );
}

const useDataWorkspaceContext = () => {
  const context = useContext(DataWorkspaceContext);

  if (!context) {
    throw new Error(
      "useDataWorkspaceContext should be used inside the DataWorkspaceProvider."
    );
  }

  return context;
};

const loadWorkspace = (dispatch, value) => dispatch({ type: "WORKSPACE_LOADED", value });
const initWorkspace = (dispatch) => dispatch({ type: "INIT_WORKSPACE" });
const selectStep = (dispatch, value) => dispatch({ type: "SELECT_STEP", value });
const setSelectedFileDetails = (dispatch, value) => dispatch({ type: "SET_SELECTED_FILEDETAILS", value });
const setSelectedSheetName = (dispatch, value) => dispatch({ type: "SET_SELECTED_SHEETNAME", value });
const setHeaderRowNumber = (dispatch, headerRowNumber, columnNames) => dispatch({ type: "SET_HEADER_ROWNUMBER", headerRowNumber, columnNames });
const setTotalRowCount = (dispatch, value) => dispatch({ type: "SET_TOTAL_ROWCOUNT", value });
const setColumnNames = (dispatch, value) => dispatch({ type: "SET_COLUMN_NAMES", value });
const startUpload = (dispatch) => dispatch({ type: "START_UPLOAD" });
const finishedUpload = (dispatch) => dispatch({ type: "FINISHED_UPLOAD" });
const dataUploadFailed = (dispatch) => dispatch({ type: "DATA_UPLOAD_FAILED" });
const retryFailedDataUpload = (dispatch) => dispatch({ type: "DATA_UPLOAD_FAILED_RETRY" });
const setFieldsMapping = (dispatch, value) => dispatch({ type: "SET_FIELD_MAPPINGS", value });
const processData = (dispatch) => dispatch({ type: "PROCESS_DATA" });
const setLookups = (dispatch, value) => dispatch({ type: "SET_LOOKUPDATA", value });
const dataProcessed = (dispatch) => dispatch({ type: "DATA_PROCESSED" });
const showNewItems = (dispatch) => dispatch({ type: "SHOW_NEWITEMS" });
const showMarkAsComplete = (dispatch) => dispatch({ type: "SHOW_MARK_AS_COMPLETE" });
const markAsComplete = (dispatch) => dispatch({ type: "FINISHED" });

export {
  DataWorkspaceProvider,
  useDataWorkspaceContext,
  loadWorkspace,
  initWorkspace,
  selectStep,
  setSelectedFileDetails,
  setSelectedSheetName,
  setHeaderRowNumber,
  setTotalRowCount,
  setColumnNames,
  startUpload,
  finishedUpload,
  dataUploadFailed,
  retryFailedDataUpload,
  setFieldsMapping,
  processData,
  setLookups,
  dataProcessed,
  showNewItems,
  showMarkAsComplete,
  markAsComplete
}
