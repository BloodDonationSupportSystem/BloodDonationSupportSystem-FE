declare module 'react-quill' {
    import React from 'react';

    export interface ReactQuillProps {
        id?: string;
        className?: string;
        theme?: string;
        style?: React.CSSProperties;
        readOnly?: boolean;
        value?: string;
        defaultValue?: string;
        placeholder?: string;
        tabIndex?: number;
        bounds?: string | HTMLElement;
        scrollingContainer?: string | HTMLElement;
        onChange?: (content: string, delta: any, source: any, editor: any) => void;
        onChangeSelection?: (range: any, source: any, editor: any) => void;
        onFocus?: (range: any, source: any, editor: any) => void;
        onBlur?: (previousRange: any, source: any, editor: any) => void;
        onKeyPress?: React.KeyboardEventHandler<HTMLDivElement>;
        onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
        onKeyUp?: React.KeyboardEventHandler<HTMLDivElement>;
        formats?: string[];
        children?: React.ReactElement<any>;
        modules?: {
            [key: string]: any;
        };
        preserveWhitespace?: boolean;
    }

    declare const ReactQuill: React.ForwardRefExoticComponent<
        ReactQuillProps & React.RefAttributes<any>
    >;

    export default ReactQuill;
} 