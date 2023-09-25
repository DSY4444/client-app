import { Dialog, DialogTitle, DialogContent, Icon, IconButton, Alert } from "@mui/material";
import PerfectScrollbar from 'react-perfect-scrollbar';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useCallback } from "react";
import YAForm from "components/YAForm";

const YADialogForm = (props) => {
    const { dialog, onClose } = props;
    const key = dialog.id || new Date().getTime();

    const handleRequestClose = useCallback(() => {
        if (onClose) onClose();
    }, []);

    return (
        <Dialog
            key={key}
            open={true}
            onClose={handleRequestClose}
            maxWidth="md">
            <DialogTitle>
                <MDBox pl={2} display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography fontWeight={"medium"}>{dialog.title}</MDTypography>
                    <IconButton onClick={handleRequestClose} title="Close">
                        <Icon>close</Icon>
                    </IconButton>
                </MDBox>
                {
                dialog.info &&
                <MDBox width="600px">
                    <Alert sx={{fontSize:13}} severity="warning">{dialog.info}</Alert>
                </MDBox>
                }
            </DialogTitle>
            <DialogContent>
                <PerfectScrollbar>
                    <YAForm dialog={dialog} onClose={onClose} />
                </PerfectScrollbar>
            </DialogContent>
        </Dialog>
    )
};

export default YADialogForm;