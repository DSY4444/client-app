import {
  Dialog,
  DialogTitle,
  DialogContent,
  Icon,
  IconButton,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { createContext, useCallback } from "react";

export const YADialogCustomFormContext = createContext();

const YADialogCustomForm = (props) => {
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
      maxWidth={dialog.maxWidthBp || "md"}
      fullWidth
    >
      <DialogTitle>
        <MDBox
          pl={1}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <MDTypography fontWeight={"medium"}>{dialog.title}</MDTypography>
          <IconButton onClick={handleRequestClose} title="Close">
            <Icon>close</Icon>
          </IconButton>
        </MDBox>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <YADialogCustomFormContext.Provider
          value={{ onDialogClose: handleRequestClose }}
        >
          {dialog.form && dialog.form()}
        </YADialogCustomFormContext.Provider>
      </DialogContent>
    </Dialog>
  );
};

export default YADialogCustomForm;
