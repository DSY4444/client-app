import { createContext, useCallback } from "react";
import YADrawer from "components/YADrawer";

export const YADrawerCustomFormContext = createContext();

const YADrawerCustomForm = (props) => {
    const { dialog, onClose } = props;
    const key = dialog.id || new Date().getTime();

    const handleRequestClose = useCallback(() => {
        if (onClose) onClose();
    }, []);

    return (
        <YADrawer
            variant={dialog.variant || "persistent"}
            anchor={dialog.anchor || "right"}
            topPadded={false}
            hideHeader={true}
            open={true}
            width={dialog.width || 300}
            key={key}
            title={dialog.title}
            onClose={handleRequestClose}
        >
            <YADrawerCustomFormContext.Provider value={{ onDialogClose: handleRequestClose }}>
                {dialog.form && dialog.form()}
            </YADrawerCustomFormContext.Provider>
        </YADrawer>
    )
};

export default YADrawerCustomForm;