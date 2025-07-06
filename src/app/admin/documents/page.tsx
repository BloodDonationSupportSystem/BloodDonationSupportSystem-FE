'use client';

import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Button,
    Input,
    Space,
    Tag,
    Tooltip,
    Modal,
    Form,
    Select,
    Switch,
    App,
    Pagination,
    DatePicker,
    Row,
    Col,
    Tabs
} from 'antd';
import {
    SearchOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useAdminDocuments } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import SimpleRichEditor from '@/components/SimpleRichEditor';
import { Document } from '@/services/api';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

export default function AdminDocumentsPage() {
    const { documents, loading, error, totalCount, pageSize, pageNumber, totalPages, fetchDocuments, createDocument, updateDocument, deleteDocument } = useAdminDocuments();
    const { user } = useAuth();
    const { message, modal } = App.useApp();

    // State for search and filters
    const [searchText, setSearchText] = useState<string>('');
    const [documentTypeFilter, setDocumentTypeFilter] = useState<string | undefined>('BloodType');
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
    const [activeTab, setActiveTab] = useState<string>('BloodType');

    // State for modals
    const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState<boolean>(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

    // Form instances
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    // Fetch documents on component mount and when tab changes
    useEffect(() => {
        fetchDocuments({ documentType: activeTab });
    }, [activeTab]);

    // Handle search input change
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    // Apply filters and search
    const applyFilters = () => {
        const params: any = {
            pageNumber: 1, // Reset to first page when filtering
            searchTerm: searchText || undefined,
            documentType: activeTab
        };

        if (dateRange && dateRange[0] && dateRange[1]) {
            params.createdDateFrom = dateRange[0].toISOString();
            params.createdDateTo = dateRange[1].toISOString();
        }

        fetchDocuments(params);
    };

    // Reset filters
    const resetFilters = () => {
        setSearchText('');
        setDateRange(null);
        fetchDocuments({ pageNumber: 1, documentType: activeTab });
    };

    // Handle pagination change
    const handlePageChange = (page: number, pageSize?: number) => {
        fetchDocuments({
            pageNumber: page,
            pageSize: pageSize || 10,
            searchTerm: searchText || undefined,
            documentType: activeTab,
        });
    };

    // Handle tab change
    const handleTabChange = (key: string) => {
        setActiveTab(key);
    };

    // Handle document creation
    const handleCreateDocument = async (values: any) => {
        if (!user?.id) {
            message.error('User information is not available');
            return;
        }

        const success = await createDocument({
            title: values.title,
            content: values.content,
            documentType: values.documentType,
            createdBy: user.id
        });

        if (success) {
            setIsCreateModalVisible(false);
            createForm.resetFields();
            // Refresh the documents list with the current active tab
            fetchDocuments({ documentType: activeTab });
        }
    };

    // Handle document update
    const handleUpdateDocument = async (values: any) => {
        if (!selectedDocument) return;

        const success = await updateDocument(selectedDocument.id, {
            title: values.title,
            content: values.content,
            documentType: values.documentType
        });

        if (success) {
            setIsEditModalVisible(false);
            setSelectedDocument(null);
            // Refresh the documents list with the current active tab
            fetchDocuments({ documentType: activeTab });
        }
    };

    // Handle document deletion
    const handleDeleteDocument = (id: string) => {
        modal.confirm({
            title: 'Are you sure you want to delete this document?',
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await deleteDocument(id);
                    message.success('Document deleted successfully');
                    // Refresh the documents list with the current active tab
                    fetchDocuments({ documentType: activeTab });
                } catch (error) {
                    message.error('Failed to delete document');
                    console.error('Error deleting document:', error);
                }
            },
        });
    };

    // Open edit modal with document data
    const openEditModal = (document: Document) => {
        setSelectedDocument(document);
        editForm.setFieldsValue({
            title: document.title,
            content: document.content,
            documentType: document.documentType
        });
        setIsEditModalVisible(true);
    };

    // Open view modal with document data
    const openViewModal = (document: Document) => {
        setSelectedDocument(document);
        setIsViewModalVisible(true);
    };

    const columns: ColumnsType<Document> = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <a className="text-blue-600 hover:text-blue-800">{text}</a>,
            sorter: (a: Document, b: Document) => a.title.localeCompare(b.title),
            width: 250,
        },
        {
            title: 'Created By',
            dataIndex: 'createdByName',
            key: 'createdByName',
            width: 150,
        },
        {
            title: 'Created Date',
            dataIndex: 'createdDate',
            key: 'createdDate',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
            sorter: (a: Document, b: Document) => dayjs(a.createdDate).unix() - dayjs(b.createdDate).unix(),
            width: 150,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Document) => (
                <Space size="small">
                    <Tooltip title="View">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => openViewModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => openEditModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteDocument(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
            width: 120,
        },
    ];

    const breadcrumbItems = [
        { title: 'Documents', href: '/admin/documents' },
    ];

    return (
        <AdminLayout breadcrumbItems={breadcrumbItems} title="Document Management">
            <Card
                title={
                    <div className="flex items-center">
                        <span className="text-xl font-semibold">Documents</span>
                    </div>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            createForm.setFieldsValue({ documentType: activeTab });
                            setIsCreateModalVisible(true);
                        }}
                    >
                        Create Document
                    </Button>
                }
                className="shadow-sm"
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    className="mb-4"
                    type="card"
                >
                    <TabPane tab="Blood Types" key="BloodType" />
                    <TabPane tab="Component Types" key="ComponentType" />
                </Tabs>

                <div className="mb-6">
                    <Row gutter={16} className="mb-4">
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Input
                                placeholder="Search by title"
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={handleSearch}
                                allowClear
                            />
                        </Col>
                        <Col xs={24} sm={12} md={10} lg={8}>
                            <RangePicker
                                style={{ width: '100%' }}
                                value={dateRange}
                                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6}>
                            <Space>
                                <Button type="primary" onClick={applyFilters}>
                                    Filter
                                </Button>
                                <Button onClick={resetFilters}>
                                    Reset
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </div>

                <Table
                    dataSource={documents}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    className="mb-6"
                />

                <div className="flex justify-between items-center">
                    <div>
                        Showing {documents.length} of {totalCount} items
                    </div>
                    <Pagination
                        current={pageNumber}
                        pageSize={pageSize}
                        total={totalCount}
                        onChange={handlePageChange}
                        showSizeChanger
                        showQuickJumper
                    />
                </div>
            </Card>

            {/* Create Document Modal */}
            <Modal
                title="Create Document"
                open={isCreateModalVisible}
                onCancel={() => {
                    setIsCreateModalVisible(false);
                    createForm.resetFields();
                }}
                footer={null}
                width="100%"
                style={{ top: 0, maxWidth: '100%', paddingBottom: 0 }}
                bodyStyle={{ height: 'calc(100vh - 110px)', padding: '16px', overflow: 'auto' }}
            >
                <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={handleCreateDocument}
                    initialValues={{ documentType: activeTab }}
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter a title' }]}
                    >
                        <Input placeholder="Enter document title" />
                    </Form.Item>

                    <Form.Item
                        name="documentType"
                        label="Document Type"
                        rules={[{ required: true, message: 'Please select a document type' }]}
                    >
                        <Select placeholder="Select document type">
                            <Option value="BloodType">Blood Type</Option>
                            <Option value="ComponentType">Component Type</Option>
                        </Select>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="content"
                                label="Content"
                                rules={[{ required: true, message: 'Please enter content' }]}
                            >
                                <SimpleRichEditor />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item className="mt-10">
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Create
                            </Button>
                            <Button onClick={() => {
                                setIsCreateModalVisible(false);
                                createForm.resetFields();
                            }}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Document Modal */}
            <Modal
                title="Edit Document"
                open={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                footer={null}
                width="100%"
                style={{ top: 0, maxWidth: '100%', paddingBottom: 0 }}
                bodyStyle={{ height: 'calc(100vh - 110px)', padding: '16px', overflow: 'auto' }}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleUpdateDocument}
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter a title' }]}
                    >
                        <Input placeholder="Enter document title" />
                    </Form.Item>

                    <Form.Item
                        name="documentType"
                        label="Document Type"
                        rules={[{ required: true, message: 'Please select a document type' }]}
                    >
                        <Select placeholder="Select document type">
                            <Option value="BloodType">Blood Type</Option>
                            <Option value="ComponentType">Component Type</Option>
                        </Select>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="content"
                                label="Content"
                                rules={[{ required: true, message: 'Please enter content' }]}
                            >
                                <SimpleRichEditor />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item className="mt-10">
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Update
                            </Button>
                            <Button onClick={() => setIsEditModalVisible(false)}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Document Modal */}
            {selectedDocument && (
                <Modal
                    title={selectedDocument.title}
                    open={isViewModalVisible}
                    onCancel={() => setIsViewModalVisible(false)}
                    footer={[
                        <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                            Close
                        </Button>,
                        <Button
                            key="edit"
                            type="primary"
                            onClick={() => {
                                setIsViewModalVisible(false);
                                openEditModal(selectedDocument);
                            }}
                        >
                            Edit
                        </Button>
                    ]}
                    width="100%"
                    style={{ top: 0, maxWidth: '100%', paddingBottom: 0 }}
                    bodyStyle={{ height: 'calc(100vh - 110px)', padding: '16px', overflow: 'auto' }}
                >
                    <Row gutter={16}>
                        <Col xs={24} md={8} lg={6}>
                            <div className="mb-4">
                                <p className="text-gray-500 mb-1">Document Type</p>
                                <p>
                                    <Tag color={selectedDocument.documentType === 'BloodType' ? 'red' : 'blue'}>
                                        {selectedDocument.documentType}
                                    </Tag>
                                </p>
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-500 mb-1">Created By</p>
                                <p>{selectedDocument.createdByName}</p>
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-500 mb-1">Created Date</p>
                                <p>{dayjs(selectedDocument.createdDate).format('YYYY-MM-DD HH:mm')}</p>
                            </div>
                        </Col>

                        <Col xs={24} md={16} lg={18}>
                            <div className="mt-6 md:mt-0">
                                <p className="text-gray-500 mb-1">Content</p>
                                <div
                                    className="border p-4 rounded-md bg-white blog-content blood-doc"
                                    style={{ minHeight: '500px', overflow: 'auto' }}
                                    dangerouslySetInnerHTML={{ __html: selectedDocument.content }}
                                />
                            </div>
                        </Col>
                    </Row>
                </Modal>
            )}
        </AdminLayout>
    );
} 