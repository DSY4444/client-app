import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Modal } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import YADialogForm from "components/YADialogForm";
import YADrawerForm from "components/YADrawerForm";
import { useCallback } from "react";
import { createPortal } from "react-dom";
import ReportPopup from "components/ReportPopup";
import YADialogCustomForm from "components/YADialogCustomForm";
import YADrawerCustomForm from "components/YADrawerCustomForm";
import DataloadDialog from "components/DataloadDialog";
import { useNavigate } from "react-router-dom";
import colors from 'assets/theme/base/colors';
import AskMeDialog from "components/AskMeDialog";
export const YADialogType = {
    "ALERT": "alert",
    "PROMPT": "prompt",
    "FORM": "form",
    "CUSTOM_FORM": "custom_form",
    "DRAWER": "drawer",
    "CUSTOM_DRAWER_FORM": "custom_drawer_form",
    "SEARCH": "search",
    "REPORT": "report",
    "UPLOAD_DIALOG": "upload_dialog"
}

const YADialogContainer = (props) => {
    const { domRoot, dialogs, onRequestClose } = props;
    let navigate = useNavigate()
    const handleRequestClose = useCallback((dialog, returnValue) => {
        if (onRequestClose) {
            onRequestClose(dialog);
        }
        if (dialog.onClose) {
            dialog.onClose(returnValue);
        }
    }, []);

    let navigateToPage = (linkTo, dialog) => {
        handleRequestClose(dialog)
        linkTo && linkTo !== "" && navigate(linkTo, { state: {} })
    }
    const handlePromptSuccess = (dialog) => {
        if (dialog.onSuccess) {
            dialog.onSuccess();
        }
        handleRequestClose(dialog);
    }

    const handlePromptFailure = (dialog) => {
        if (dialog.onFailure) {
            dialog.onFailure();
        }
        if (onRequestClose) {
            onRequestClose(dialog);
        }
    }

    const renderDialog = (dialog) => {

        const { id, type, title, message, hyperlink, hypertext, reportId, filters } = dialog;
        const key = id || new Date().getTime();

        if (type === YADialogType.FORM) {
            return (
                <YADialogForm key={key} dialog={dialog} onClose={() => handleRequestClose(dialog)} />
            );
        }
        else if (type === YADialogType.CUSTOM_FORM) {
            return (
                <YADialogCustomForm key={key} dialog={dialog} onClose={() => handleRequestClose(dialog)} />
            );
        }
        else if (type === YADialogType.DRAWER) {
            return (
                <YADrawerForm key={key} dialog={dialog} onClose={() => handleRequestClose(dialog)} />
            );
        }
        else if (type === YADialogType.CUSTOM_DRAWER_FORM) {
            return (
                <YADrawerCustomForm key={key} dialog={dialog} onClose={() => handleRequestClose(dialog)} />
            );
        }
        else if (type === YADialogType.UPLOAD_DIALOG) {
            return (
                <DataloadDialog key={key} title={title} uploadConfig={dialog.uploadConfig} onClose={(returnValue) => handleRequestClose(dialog, returnValue)} />
            );
        }
        else if (type === YADialogType.SEARCH) {
            return (
                (<Modal key={key} open={true} onClose={() => handleRequestClose(dialog)}>
                    <MDBox p={3} height="100vh" width="100vw" overflow="auto">
                        <AskMeDialog onClose={() => handleRequestClose(dialog)}/>
                    </MDBox>
                </Modal>)
            );
        }
        else if (type === YADialogType.REPORT) {

            return (<Modal key={key} open={true} onClose={() => handleRequestClose(dialog)}>
                <MDBox p={3} height="100%" width="100%" overflow="auto">
                    <ReportPopup reportId={reportId} filters={filters} onClose={() => handleRequestClose(dialog)} />
                </MDBox>
            </Modal>)
        }
        else if (type === YADialogType.PROMPT) {

            return (<Dialog
                key={key}
                open={true}
                onClose={() => handleRequestClose(dialog)}
            >
                <DialogTitle sx={{ paddingLeft: 3 }}>
                    {title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText maxWidth={450} sx={{ paddingLeft: 1 }}>
                        {message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handlePromptFailure(dialog)}>
                        {dialog.cancelButtonText || "Cancel"}
                    </Button>
                    <Button onClick={() => handlePromptSuccess(dialog)}>
                        {dialog.okButtonText || "Ok"}
                    </Button>
                </DialogActions>
            </Dialog>)
        }

        return (
            <Dialog
                key={key}
                open={true}
                onClose={() => handleRequestClose(dialog)}
            >
                <DialogTitle sx={{ paddingLeft: 3 }}>
                    {title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText maxWidth={500} sx={{ paddingLeft: 1 }}>
                        {message}
                    </DialogContentText>
                </DialogContent>

                {
                    hyperlink && hyperlink !== "" &&
                    <MDBox display="flex" pt={0} mr={1} flexDirection="row" justifyContent="flex-end">
                        <MDTypography style={{ bottom: '1px', right: '15px' }} variant="button" px={0.5} py={0.5} fontWeight="medium" whiteSpace="nowrap" sx={{ "&:hover": { cursor: 'pointer', backgroundColor: colors.linkBackColour ? colors.linkBackColour : "light" }, color: colors.linkColour, borderRadius: "5px" }} color={colors.linkColour ? colors.linkColour : "dark"} onClick={() => { navigateToPage(hyperlink, dialog) }}>
                            {hypertext}&nbsp;
                        </MDTypography>
                    </MDBox>
                }
                <DialogActions>
                    <Button onClick={() => handleRequestClose(dialog)}>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        );

    };

    const dialogElements = dialogs && dialogs.length > 0 ? (
        dialogs.map(d => renderDialog(d))
    ) : null;

    return domRoot ? createPortal(dialogElements, domRoot) : dialogElements
};

export default YADialogContainer;