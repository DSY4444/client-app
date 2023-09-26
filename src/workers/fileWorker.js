import * as XLSX from "xlsx";
import { FILE_WORKER_MESSAGETYPE, getHeaderRowNumber } from "./constants";

self.onmessage = (event) => {
    const message = event.data;
    if (message.messageType === FILE_WORKER_MESSAGETYPE.ANALYZE_FILE) {
        let file = message.file;
        let reader = new FileReader();
        reader.onload = function (e) {
            let data1 = new Uint8Array(e.target.result);
            let wb = XLSX.read(data1, { type: 'array', sheetRows: 50, cellDates: true, cellNF: false, cellText: false });
            let sheetNames = wb.SheetNames;
            let wsheet = sheetNames?.length > 1 ? null : wb.Sheets[wb.SheetNames[0]];
            const rows = sheetNames?.length > 1 ? null : XLSX.utils.sheet_to_json(wsheet, { header: 1, blankrows: true, defval: null });
            const columns = rows?.length > 0 ? Object.keys(rows[0]) : [];
            const headerRowNumber = getHeaderRowNumber(rows);
            const columnNames = rows ? rows[headerRowNumber - 1] : null;

            self.postMessage({
                messageType: FILE_WORKER_MESSAGETYPE.ANALYZE_FILE,
                file,
                fileName: file.name,
                isCsv: file.type === "text/csv",
                sheetNames,
                sheetName: sheetNames?.length > 1 ? null : sheetNames[0],
                columns,
                rows,
                headerRowNumber,
                columnNames
            });

        };
        reader.readAsArrayBuffer(file);
    }
    if (message.messageType === FILE_WORKER_MESSAGETYPE.CHANGE_SHEET) {
        let file = message.file;
        let sheetName = message.sheetName;
        let reader = new FileReader();
        reader.onload = function (e) {
            let data1 = new Uint8Array(e.target.result);
            let wb = XLSX.read(data1, { type: 'array', sheetRows: 50, cellDates: true, cellNF: false, cellText: false });
            let wsheet = wb.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(wsheet, { header: 1, blankrows: true, defval: null });
            const columns = rows?.length > 0 ? Object.keys(rows[0]) : [];
            const headerRowNumber = getHeaderRowNumber(rows);
            const columnNames = headerRowNumber ? rows[headerRowNumber - 1] : null;

            self.postMessage({
                messageType: FILE_WORKER_MESSAGETYPE.CHANGE_SHEET,
                file,
                fileName: file.name,
                isCsv: file.type === "text/csv",
                sheetNames: wb.SheetNames,
                sheetName,
                columns,
                rows,
                headerRowNumber,
                columnNames
            });

        };
        reader.readAsArrayBuffer(file);
    }
    if (message.messageType === FILE_WORKER_MESSAGETYPE.GET_ROW_COUNT) {
        let file = message.file;
        let sheetName = message.sheetName;
        let reader = new FileReader();
        reader.onload = function (e) {
            let data = new Uint8Array(e.target.result);
            let wb = XLSX.read(data, { type: 'array' });
            let wsheet = wb.Sheets[sheetName || wb.SheetNames[0]];
            let rows = XLSX.utils.sheet_to_json(wsheet, { header: 1, blankrows: false, defval: null })

            self.postMessage({
                messageType: FILE_WORKER_MESSAGETYPE.GET_ROW_COUNT,
                totalRowCount: rows?.length - 1,
            });

        };
        reader.readAsArrayBuffer(file);
    }
    if (message.messageType === FILE_WORKER_MESSAGETYPE.GET_COLUMN_NAMES) {
        let file = message.file;
        let sheetName = message.sheetName;
        let headerRowNumber = Math.max((message.headerRowNumber || 0) - 1, 0);
        let reader = new FileReader();
        reader.onload = function (e) {
            let data = new Uint8Array(e.target.result);
            let wb = XLSX.read(data, { type: 'array', sheetRows: headerRowNumber + 2, cellNF: false});
            let wsheet = wb.Sheets[sheetName || wb.SheetNames[0]];
            let rows = XLSX.utils.sheet_to_json(wsheet, { range: headerRowNumber, blankrows: false, defval: null });
            let columns = rows?.length > 0 ? Object.keys(rows[0]) : [];
            columns = columns.map(c => c.trim());

            self.postMessage({
                messageType: FILE_WORKER_MESSAGETYPE.GET_COLUMN_NAMES,
                columns,
            });

        };
        reader.readAsArrayBuffer(file);
    }
}