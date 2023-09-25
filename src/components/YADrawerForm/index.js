import { useCallback } from "react";
import YADrawer from "components/YADrawer";
import YAForm from "components/YAForm";

const YADrawerForm = (props) => {
    const { dialog, onClose } = props;
    const key = dialog.id || new Date().getTime();

    const handleRequestClose = useCallback(() => {
        if (onClose) onClose();
    }, []);

    return (
        <YADrawer
            open={true}
            key={key}
            title={dialog.title}
            onClose={handleRequestClose}
        >
                <YAForm dialog={dialog} onClose={onClose} />
        </YADrawer>
    )
};

export default YADrawerForm;