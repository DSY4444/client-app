import { useCallback, useMemo, useState } from "react";
import produce from "immer";
import YADialogContext from "components/YADialog/YADialogContext";
import YADialogContainer, { YADialogType } from "components/YADialog/YADialogContainer";
import { generateUUID } from "utils";
import { useSnackbar } from 'notistack';
import cubejs from "@cubejs-client/core";
import { CubeProvider } from "@cubejs-client/react";
import { getDomain } from "utils";
import { Icon, IconButton } from "@mui/material";

const domain = getDomain();
const cubejsApi = cubejs({ apiUrl: `${domain}/cubejs-api/v1` });

const YADialogProvider = (props) => {
    const { children } = props;
    const [dialogs, setDialogs] = useState([]);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const createDialog = useCallback((dialog) => {
        const defaultDialogOptions = {
            id: generateUUID(),
            title: null,
            message: null
        };

        const newDialog = Object.assign({}, defaultDialogOptions, dialog)
        setDialogs(
            produce((draft) => {
                draft.push(newDialog);
            })
        );

        return newDialog.id;
    }, [])

    const createSnackbar = useCallback((options) => {
        const defaultAction = (key) => (
            <IconButton color="inherit" padding={0} onClick={() => { closeSnackbar(key) }} title="Close">
                <Icon fontSize="small">close</Icon>
            </IconButton>
        );

        const { message, variant, position, action } = options;
        let anchorOrigin = { horizontal: 'center', vertical: 'top' };
        switch (position) {
            case "topRight":
                anchorOrigin = { horizontal: 'right', vertical: 'top' };
                break;
            case "topLeft":
                anchorOrigin = { horizontal: 'left', vertical: 'top' };
                break;
            case "bottomRight":
                anchorOrigin = { horizontal: 'right', vertical: 'bottom' };
                break;
            case "bottomLeft":
                anchorOrigin = { horizontal: 'left', vertical: 'bottom' };
                break;
            case "bottom":
                anchorOrigin = { horizontal: 'center', vertical: 'bottom' };
                break;
            default:
                break;
        }
        return enqueueSnackbar(message, { variant, anchorOrigin, autoHideDuration: 3000, action: action || defaultAction });
    })

    const removeDialog = useCallback((dialog) => {
        setDialogs(produce(
            (draft) => {
                const index = draft.findIndex(d => d.id === dialog.id)
                if (index !== -1) draft.splice(index, 1)
            }
        ));
    }, [])

    const showAlert = useCallback((title, message,hyperlink,hypertext, onSuccess) => {
        createDialog({
            type: YADialogType.ALERT,
            title,
            message,
            hyperlink,
            hypertext,
            onSuccess
        });
    }, [])

    const showPrompt = useCallback((title, message, onSuccess, onFailure, cancelButtonText, okButtonText) => {
        createDialog({
            type: YADialogType.PROMPT,
            title,
            message,
            onSuccess,
            onFailure,
            cancelButtonText,
            okButtonText
        });
    }, [])

    const showSnackbar = useCallback((message, variant, position = "top") => {
        return createSnackbar({
            message,
            variant,
            position
        });
    }, [])

    const hideSnackbar = useCallback((snackbarId) => {
        closeSnackbar(snackbarId);
    }, [])

    const showForm = useCallback((title, definition, onClose, mode, pkId, info) => {
        createDialog({
            type: YADialogType.FORM,
            title,
            definition,
            onClose,
            mode,
            pkId,
            info
        });
    }, [])

    const showCustomForm = useCallback((title, form, onClose, mode, pkId, maxWidthBp) => {
        createDialog({
            type: YADialogType.CUSTOM_FORM,
            title,
            form,
            onClose,
            mode,
            pkId,
            maxWidthBp
        });
    }, [])

    const showReport = useCallback((reportId, filters, onClose) => {
        createDialog({
            type: YADialogType.REPORT,
            reportId,
            filters,
            onClose
        });
    }, [])

    const showDrawer = useCallback((title, definition, width, onClose, mode, pkId) => {
        return createDialog({
            type: YADialogType.DRAWER,
            title,
            definition,
            width,
            onClose,
            mode,
            pkId
        });
    }, [])

    const showCustomDrawer = useCallback((form, width, variant, anchor, onClose, mode, pkId) => {
        return createDialog({
            type: YADialogType.CUSTOM_DRAWER_FORM,
            title: "",
            form,
            width,
            variant,
            anchor,
            onClose,
            mode,
            pkId
        });
    }, [])

    const hideDrawer = useCallback((id) => {
        removeDialog({ id })
    }, [])

    const showUploadDialog = useCallback((title, uploadConfig, onClose) => {
        createDialog({
            type: YADialogType.UPLOAD_DIALOG,
            title,
            uploadConfig,
            onClose
        });
    }, [])

    const showGlobalSearch = useCallback((title, subtitle, definition, onClose) => {
        createDialog({
            type: YADialogType.SEARCH,
            title,
            onClose
        });
    }, [])

    const handleRequestClose = useCallback((dialog) => {
        removeDialog(dialog)
    }, [])

    const value = useMemo(() => ({ showSnackbar, hideSnackbar, showAlert, showPrompt, showForm, showCustomForm, showReport, showDrawer, showCustomDrawer, hideDrawer, showUploadDialog, showGlobalSearch }), [showSnackbar, hideSnackbar, showAlert, showPrompt, showForm, showCustomForm, showReport, showDrawer, showCustomDrawer, hideDrawer, showUploadDialog, showGlobalSearch]);

    return (
        <CubeProvider cubejsApi={cubejsApi}>
            <YADialogContext.Provider value={value}>
                {children}
                <YADialogContainer dialogs={dialogs} onRequestClose={handleRequestClose} />
            </YADialogContext.Provider>
        </CubeProvider>
    );
};

export default YADialogProvider;