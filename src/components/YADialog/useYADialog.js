import { useContext } from "react";
import YADialogContext from "components/YADialog/YADialogContext";

const useYADialog = () => {
    const context = useContext(YADialogContext);
  
    if (!context) {
      throw new Error(
        "useYADialog should be used inside the YADialogProvider."
      );
    }
  
    return context;
  };

export default useYADialog;