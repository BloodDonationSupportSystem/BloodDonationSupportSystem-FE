'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Import ReactQuill dynamically with SSR disabled
const ReactQuillBase = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <div className="h-[300px] border border-gray-300 rounded p-4 bg-gray-50">Loading editor...</div>
});

// Default modules configuration
const defaultModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image'],
        ['clean']
    ],
};

// Default formats
const defaultFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'color', 'background',
    'link', 'image'
];

interface RichTextEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    modules?: any;
    formats?: string[];
    style?: React.CSSProperties;
    className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value = '',
    onChange,
    placeholder = 'Write something...',
    readOnly = false,
    modules = defaultModules,
    formats = defaultFormats,
    style = { height: '300px', marginBottom: '50px' },
    className = '',
}) => {
    const [mounted, setMounted] = useState(false);
    const [editorValue, setEditorValue] = useState(value);

    // Set mounted state when component mounts
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Update internal value when prop changes
    useEffect(() => {
        setEditorValue(value);
    }, [value]);

    // Handle editor change
    const handleChange = (content: string) => {
        setEditorValue(content);
        if (onChange) {
            onChange(content);
        }
    };

    // Don't render on server
    if (!mounted) {
        return <div className="h-[300px] border border-gray-300 rounded p-4 bg-gray-50">Loading editor...</div>;
    }

    return (
        <div className={`rich-text-editor ${className}`}>
            <ReactQuillBase
                theme="snow"
                value={editorValue}
                onChange={handleChange}
                placeholder={placeholder}
                readOnly={readOnly}
                modules={modules}
                formats={formats}
                style={style}
            />
        </div>
    );
};

export default RichTextEditor; 