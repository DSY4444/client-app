import _ from "lodash";

export const WORKERS = {
    "FILE_WORKER": "FILE_WORKER"
};

export const FILE_WORKER_MESSAGETYPE = {
    "ANALYZE_FILE": "ANALYZE_FILE",
    "CHANGE_SHEET": "CHANGE_SHEET",
    "GET_ROW_COUNT": "GET_ROW_COUNT",
    "GET_COLUMN_NAMES": "GET_COLUMN_NAMES",
};

export const getHeaderRowNumber = (rows) => {
    const filledRowNumbers = rows?.map((row, index) => {
        const colNames = Object.values(row);
        const distinctColNames = _.uniq(colNames);
        return colNames.some(c => !c) || distinctColNames.length !== colNames.length ? null : index;
    }).filter(row => row !== null);
    return filledRowNumbers?.length > 0 ? filledRowNumbers[0] + 1 : null;
};