import { useEffect, useRef, useState } from "react";
import useQuill from "hooks/useQuill";
import "quill/dist/quill.snow.css";

const RichTextbox = ({ value, onChange }) => {
    const isMounted = useRef(false);
    const { quill, quillRef } = useQuill();
    const [settingValue, setSettingValue] = useState();

    useEffect(() => {
        if (quill) {
            if (!isMounted.current) {
                isMounted.current = true;
                if (value && typeof value === "string") {
                    quill.setContents([{ insert: value }]);
                }
                else
                    quill.setContents(value);
            }
        }
    }, [quill, value]);

    useEffect(() => {
        onChange(settingValue);
    }, [settingValue]);

    useEffect(() => {
        if (quill) {
            quill.on('text-change', () => {
                const contents = quill.getContents();
                setSettingValue(contents?.ops);
            });
        }
    }, [quill]);


    return <div style={{ width: '100%', height: 300 }}>
        <div ref={quillRef} />
    </div>
}

export default RichTextbox;