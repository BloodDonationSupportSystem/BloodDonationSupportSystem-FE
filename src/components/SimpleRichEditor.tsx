'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, Tooltip, Tabs, Select, Row, Col, Dropdown, Menu } from 'antd';
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
    HeartOutlined,
    UndoOutlined,
    RedoOutlined,
    DownOutlined,
    FileTextOutlined
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
    const [showSideBySide, setShowSideBySide] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // History for undo/redo functionality
    const [history, setHistory] = useState<string[]>([value]);
    const [historyIndex, setHistoryIndex] = useState(0);
    // Flag to prevent adding formatting operations to history
    const isUndoRedoOperation = useRef(false);

    useEffect(() => {
        setContent(value);
        // Initialize history with the initial value
        if (history.length === 1 && history[0] !== value) {
            setHistory([value]);
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setContent(newValue);

        // Add to history if content changed and not during undo/redo
        if (newValue !== content && !isUndoRedoOperation.current) {
            // Remove any future history if we're not at the end
            const newHistory = history.slice(0, historyIndex + 1);
            // Add new content to history
            newHistory.push(newValue);
            // Update history and index
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }

        if (onChange) {
            onChange(newValue);
        }
    };

    const undo = () => {
        if (historyIndex > 0) {
            isUndoRedoOperation.current = true;
            const newIndex = historyIndex - 1;
            const previousContent = history[newIndex];
            setHistoryIndex(newIndex);
            setContent(previousContent);
            if (onChange) {
                onChange(previousContent);
            }
            // Reset the flag after state updates
            setTimeout(() => {
                isUndoRedoOperation.current = false;
            }, 0);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            isUndoRedoOperation.current = true;
            const newIndex = historyIndex + 1;
            const nextContent = history[newIndex];
            setHistoryIndex(newIndex);
            setContent(nextContent);
            if (onChange) {
                onChange(nextContent);
            }
            // Reset the flag after state updates
            setTimeout(() => {
                isUndoRedoOperation.current = false;
            }, 0);
        }
    };

    const insertText = (before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);

        // Set content without triggering history update
        setContent(newText);

        // Add to history manually
        if (!isUndoRedoOperation.current) {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(newText);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }

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

    const insertBloodTypeTemplate = (bloodType: string) => {
        const template = `<div class="blood-doc">
  <h1>Blood Type ${bloodType}</h1>
  <div class="summary">
    <p>Blood type ${bloodType} is a specific blood group with unique characteristics and compatibility profiles.</p>
  </div>

  <section class="characteristics">
    <h2>Key Characteristics</h2>
    <ul>
      <li>Characteristic 1</li>
      <li>Characteristic 2</li>
      <li>Characteristic 3</li>
    </ul>
  </section>

  <section class="compatibility">
    <h2>Transfusion Compatibility</h2>
    <div class="compatibility-grid">
      <div class="can-donate">
        <h3>Can donate to:</h3>
        <ul>
          <li>Compatible blood type 1</li>
          <li>Compatible blood type 2</li>
        </ul>
      </div>
      <div class="can-receive">
        <h3>Can receive from:</h3>
        <ul>
          <li>Compatible blood type 1</li>
          <li>Compatible blood type 2</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="significance">
    <h2>Medical Significance</h2>
    <p>Information about the medical significance of this blood type.</p>
  </section>
</div>`;

        setContent(template);

        // Add to history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(template);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);

        if (onChange) {
            onChange(template);
        }
    };

    const insertComponentTypeTemplate = (componentType: string) => {
        const template = `<div class="blood-doc">
  <h1>Blood Component: ${componentType}</h1>
  <div class="summary">
    <p>Description of ${componentType} as a blood component.</p>
  </div>

  <section class="characteristics">
    <h2>Key Characteristics</h2>
    <ul>
      <li>Characteristic 1</li>
      <li>Characteristic 2</li>
      <li>Characteristic 3</li>
    </ul>
  </section>

  <section class="compatibility">
    <h2>Usage and Applications</h2>
    <ul>
      <li>Application 1</li>
      <li>Application 2</li>
      <li>Application 3</li>
    </ul>
  </section>

  <section class="significance">
    <h2>Clinical Significance</h2>
    <p>Information about the clinical significance of this blood component.</p>
  </section>
</div>`;

        setContent(template);

        // Add to history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(template);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);

        if (onChange) {
            onChange(template);
        }
    };

    const renderEditorToolbar = () => (
        <div className="editor-toolbar bg-gray-100 p-2 mb-2 border rounded flex flex-wrap">
            <Space wrap>
                <Tooltip title="Undo (Ctrl+Z)">
                    <Button
                        icon={<UndoOutlined />}
                        onClick={undo}
                        disabled={historyIndex <= 0}
                    />
                </Tooltip>
                <Tooltip title="Redo (Ctrl+Y)">
                    <Button
                        icon={<RedoOutlined />}
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                    />
                </Tooltip>
                <div className="border-r border-gray-300 h-6 mx-2"></div>
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

                <Dropdown
                    overlay={
                        <Menu>
                            <Menu.SubMenu key="bloodType" title="Blood Type Template">
                                <Menu.Item key="a+" onClick={() => insertBloodTypeTemplate("A+")}>A+</Menu.Item>
                                <Menu.Item key="a-" onClick={() => insertBloodTypeTemplate("A-")}>A-</Menu.Item>
                                <Menu.Item key="b+" onClick={() => insertBloodTypeTemplate("B+")}>B+</Menu.Item>
                                <Menu.Item key="b-" onClick={() => insertBloodTypeTemplate("B-")}>B-</Menu.Item>
                                <Menu.Item key="ab+" onClick={() => insertBloodTypeTemplate("AB+")}>AB+</Menu.Item>
                                <Menu.Item key="ab-" onClick={() => insertBloodTypeTemplate("AB-")}>AB-</Menu.Item>
                                <Menu.Item key="o+" onClick={() => insertBloodTypeTemplate("O+")}>O+</Menu.Item>
                                <Menu.Item key="o-" onClick={() => insertBloodTypeTemplate("O-")}>O-</Menu.Item>
                            </Menu.SubMenu>
                            <Menu.SubMenu key="componentType" title="Component Type Template">
                                <Menu.Item key="rbc" onClick={() => insertComponentTypeTemplate("Red Blood Cells")}>Red Blood Cells</Menu.Item>
                                <Menu.Item key="plasma" onClick={() => insertComponentTypeTemplate("Plasma")}>Plasma</Menu.Item>
                                <Menu.Item key="platelets" onClick={() => insertComponentTypeTemplate("Platelets")}>Platelets</Menu.Item>
                                <Menu.Item key="wbc" onClick={() => insertComponentTypeTemplate("White Blood Cells")}>White Blood Cells</Menu.Item>
                            </Menu.SubMenu>
                        </Menu>
                    }
                >
                    <Button>
                        <Space>
                            <FileTextOutlined />
                            Templates
                            <DownOutlined />
                        </Space>
                    </Button>
                </Dropdown>

                <div className="border-r border-gray-300 h-6 mx-2"></div>

                <Tooltip title={showSideBySide ? "Hide Preview" : "Show Preview"}>
                    <Button onClick={() => setShowSideBySide(!showSideBySide)}>
                        {showSideBySide ? "Hide Preview" : "Show Preview"}
                    </Button>
                </Tooltip>
            </Space>
        </div>
    );

    // Add keyboard shortcuts for undo/redo
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z') {
                e.preventDefault();
                undo();
            } else if (e.key === 'y' || (e.shiftKey && e.key === 'z')) {
                e.preventDefault();
                redo();
            }
        }
    };

    const renderVisualEditor = () => (
        <>
            {renderEditorToolbar()}
            {showSideBySide ? (
                <Row gutter={16}>
                    <Col span={12}>
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ ...style, resize: 'vertical', height: 'calc(100vh - 300px)' }}
                        />
                    </Col>
                    <Col span={12}>
                        <div
                            className="p-4 border rounded bg-white"
                            style={{ height: 'calc(100vh - 300px)', overflow: 'auto' }}
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </Col>
                </Row>
            ) : (
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ ...style, resize: 'vertical' }}
                />
            )}
        </>
    );

    const renderHtmlEditor = () => (
        <textarea
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter HTML content here..."
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ ...style, resize: 'vertical', fontFamily: 'monospace', height: showSideBySide ? 'calc(100vh - 300px)' : undefined }}
        />
    );

    const renderPreview = () => (
        <div
            className="p-4 border rounded bg-white min-h-[300px]"
            style={{ height: showSideBySide ? 'calc(100vh - 300px)' : undefined, overflow: 'auto' }}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );

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
                        children: renderVisualEditor(),
                    },
                    {
                        key: 'html',
                        label: 'HTML',
                        children: showSideBySide ? (
                            <Row gutter={16}>
                                <Col span={12}>
                                    {renderHtmlEditor()}
                                </Col>
                                <Col span={12}>
                                    {renderPreview()}
                                </Col>
                            </Row>
                        ) : renderHtmlEditor(),
                    },
                    {
                        key: 'preview',
                        label: 'Preview',
                        children: renderPreview(),
                    }
                ]}
            />
        </div>
    );
};

export default SimpleRichEditor; 