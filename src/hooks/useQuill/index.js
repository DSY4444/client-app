import { useRef, useState, useEffect } from 'react';
import Quill from 'quill';

const theme = 'snow';

const readOnly = false;

const modules = {
    toolbar: [
        [{ color: [] }, { background: [] }],
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic'],
        // [{ align: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        // [{ indent: '-1' }, { indent: '+1' }],
        // [{ size: ['small', false, 'large', 'huge'] }],
        // ['link'],
        // ['clean'],
    ],
    clipboard: {
        matchVisual: false,
    },
};

const formats = [
    'bold',
    'italic',
    'underline',
    'strike',
    'align',
    'list',
    'indent',
    // 'size',
    'header',
    // 'link',
    // 'image',
    // 'video',
    'color',
    'background',
    // 'clean',
];

function assign(target) {
    if (target === null || target === undefined) {
        throw new TypeError('Cannot convert undefined or null to object');
    }

    const to = Object(target);

    for (let index = 1; index < arguments.length; index++) {
        const nextSource = arguments[index];

        if (nextSource !== null && nextSource !== undefined) {
            for (const nextKey in nextSource) {
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    to[nextKey] = nextSource[nextKey];
                }
            }
        }
    }
    return to;
}

export const useQuill = (options = { theme, modules, formats, readOnly }) => {
    const quillRef = useRef();

    const [isLoaded, setIsLoaded] = useState(false);
    const [obj, setObj] = useState({
        Quill: Quill,
        quillRef,
        quill: undefined,
        editorRef: quillRef,
        editor: undefined,
    });

    useEffect(() => {
        if (obj.Quill && !obj.quill && quillRef && quillRef.current && isLoaded) {

            const opts = assign(options, {
                modules: assign(modules, options.modules),
                formats: options.formats || formats,
                theme: options.theme || theme,
                readOnly: options.readOnly || false,
            });
            const quill = new obj.Quill(quillRef.current, opts);

            setObj(assign(assign({}, obj), { quill, editor: quill }));
        }
        setIsLoaded(true);
    }, [isLoaded, obj, options]);

    return obj;
};

export default useQuill;