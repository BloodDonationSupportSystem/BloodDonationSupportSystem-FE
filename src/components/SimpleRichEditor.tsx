'use client';

import React, { useState, useEffect } from 'react';
import { Button, Space, Tooltip, Tabs, Select } from 'antd';
import {
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    OrderedListOutlined,
    UnorderedListOutlined,
    AlignLeftOutlined,
    AlignCenterOutlined,
    AlignRightOutlined,
    LinkOutlined,
    FontSizeOutlined,
    HighlightOutlined,
    CodeOutlined,
    PictureOutlined,
    TableOutlined,
    HeartOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;

interface SimpleRichEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    style?: React.CSSProperties;
    className?: string;
}

const SimpleRichEditor: React.FC<SimpleRichEditorProps> = ({
    value = '',
    onChange,
    placeholder = 'Write something...',
    style = { minHeight: '300px' },
    className = '',
}) => {
    const [content, setContent] = useState(value);
    const [activeTab, setActiveTab] = useState('visual');
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setContent(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setContent(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    const insertText = (before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);

        setContent(newText);
        if (onChange) {
            onChange(newText);
        }

        // Set focus back to textarea and position cursor after insertion
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    // Basic formatting
    const formatBold = () => insertText('<strong>', '</strong>');
    const formatItalic = () => insertText('<em>', '</em>');
    const formatUnderline = () => insertText('<u>', '</u>');

    // Lists
    const formatOrderedList = () => insertText('<ol>\n  <li>', '</li>\n</ol>');
    const formatUnorderedList = () => insertText('<ul>\n  <li>', '</li>\n</ul>');

    // Alignment
    const formatAlignLeft = () => insertText('<div style="text-align: left;">', '</div>');
    const formatAlignCenter = () => insertText('<div style="text-align: center;">', '</div>');
    const formatAlignRight = () => insertText('<div style="text-align: right;">', '</div>');

    // Advanced formatting
    const formatHeading = (level: number) => {
        insertText(`<h${level}>`, `</h${level}>`);
    };

    const formatLink = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);

        const url = prompt('Enter URL:', 'https://');
        if (url) {
            const linkText = selectedText || 'link text';
            insertText(`<a href="${url}">`, '</a>');
        }
    };

    const formatCode = () => insertText('<code>', '</code>');

    const formatImage = () => {
        const url = prompt('Enter image URL:', 'https://');
        if (url) {
            const alt = prompt('Enter image description:', '') || '';
            insertText(`<img src="${url}" alt="${alt}" style="max-width: 100%;" />`);
        }
    };

    const formatTable = () => {
        insertText(`<table border="1" style="width:100%; border-collapse: collapse;">
  <thead>
    <tr>
      <th style="padding: 8px; text-align: left;">Header 1</th>
      <th style="padding: 8px; text-align: left;">Header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px;">Cell 1</td>
      <td style="padding: 8px;">Cell 2</td>
    </tr>
    <tr>
      <td style="padding: 8px;">Cell 3</td>
      <td style="padding: 8px;">Cell 4</td>
    </tr>
  </tbody>
</table>`);
    };

    return (
        <div className={`simple-rich-editor ${className}`}>
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="mb-2"
                items={[
                    {
                        key: 'visual',
                        label: 'Visual Editor',
                        children: (
                            <>
                                <div className="editor-toolbar bg-gray-100 p-2 mb-2 border rounded flex flex-wrap">
                                    <Space wrap>
                                        <Tooltip title="Bold">
                                            <Button icon={<BoldOutlined />} onClick={formatBold} />
                                        </Tooltip>
                                        <Tooltip title="Italic">
                                            <Button icon={<ItalicOutlined />} onClick={formatItalic} />
                                        </Tooltip>
                                        <Tooltip title="Underline">
                                            <Button icon={<UnderlineOutlined />} onClick={formatUnderline} />
                                        </Tooltip>

                                        <Select
                                            defaultValue="paragraph"
                                            style={{ width: 120 }}
                                            onChange={(value) => {
                                                if (value === 'paragraph') {
                                                    insertText('<p>', '</p>');
                                                } else {
                                                    const level = parseInt(value.replace('heading', ''));
                                                    formatHeading(level);
                                                }
                                            }}
                                        >
                                            <Option value="paragraph">Paragraph</Option>
                                            <Option value="heading1">Heading 1</Option>
                                            <Option value="heading2">Heading 2</Option>
                                            <Option value="heading3">Heading 3</Option>
                                            <Option value="heading4">Heading 4</Option>
                                        </Select>

                                        <Tooltip title="Ordered List">
                                            <Button icon={<OrderedListOutlined />} onClick={formatOrderedList} />
                                        </Tooltip>
                                        <Tooltip title="Unordered List">
                                            <Button icon={<UnorderedListOutlined />} onClick={formatUnorderedList} />
                                        </Tooltip>
                                        <Tooltip title="Align Left">
                                            <Button icon={<AlignLeftOutlined />} onClick={formatAlignLeft} />
                                        </Tooltip>
                                        <Tooltip title="Align Center">
                                            <Button icon={<AlignCenterOutlined />} onClick={formatAlignCenter} />
                                        </Tooltip>
                                        <Tooltip title="Align Right">
                                            <Button icon={<AlignRightOutlined />} onClick={formatAlignRight} />
                                        </Tooltip>
                                        <Tooltip title="Insert Link">
                                            <Button icon={<LinkOutlined />} onClick={formatLink} />
                                        </Tooltip>
                                        <Tooltip title="Insert Code">
                                            <Button icon={<CodeOutlined />} onClick={formatCode} />
                                        </Tooltip>
                                        <Tooltip title="Insert Image">
                                            <Button icon={<PictureOutlined />} onClick={formatImage} />
                                        </Tooltip>
                                        <Tooltip title="Insert Table">
                                            <Button icon={<TableOutlined />} onClick={formatTable} />
                                        </Tooltip>
                                    </Space>
                                </div>
                                <textarea
                                    ref={textareaRef}
                                    value={content}
                                    onChange={handleChange}
                                    placeholder={placeholder}
                                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ ...style, resize: 'vertical' }}
                                />
                            </>
                        ),
                    },
                    {
                        key: 'html',
                        label: 'HTML',
                        children: (
                            <textarea
                                value={content}
                                onChange={handleChange}
                                placeholder="Enter HTML content here..."
                                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ ...style, resize: 'vertical', fontFamily: 'monospace' }}
                            />
                        ),
                    },
                    {
                        key: 'preview',
                        label: 'Preview',
                        children: (
                            <div
                                className="p-4 border rounded bg-white min-h-[300px]"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        ),
                    }
                ]}
            />
        </div>
    );
};

export default SimpleRichEditor; 