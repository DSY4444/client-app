import { useEffect } from "react";
import useQuill from "hooks/useQuill";
import "quill/dist/quill.bubble.css";
import MDBox from "components/MDBox";

const richTextareaStyles = () => ({
    width: "100%",
    "& .ql-editor": {
        padding: 0,
    },
});

const RichTextarea = ({ value }) => {
    const { quill, quillRef } = useQuill({ theme: "bubble", readOnly: true });

    useEffect(() => {
        if (quill) {
            if (value && typeof value === "string") {
                quill.setContents([{ insert: value }]);
            }
            else
                quill.setContents(value);
        }
    }, [quill, value]);

    return <MDBox sx={(theme) => richTextareaStyles(theme)}>
        <div ref={quillRef} />
    </MDBox>
}

export default RichTextarea;