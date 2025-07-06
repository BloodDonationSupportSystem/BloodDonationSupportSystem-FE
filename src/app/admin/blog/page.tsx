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
    Col
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
import { useAdminBlogPosts } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import dayjs from 'dayjs';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import type { ColumnsType } from 'antd/es/table';
import SimpleRichEditor from '@/components/SimpleRichEditor';
import { BlogPost } from '@/services/api';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function AdminBlogPage() {
    const { blogPosts, loading, error, totalCount, pageSize, pageNumber, totalPages, fetchBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } = useAdminBlogPosts();
    const { user } = useAuth();
    const { message, modal } = App.useApp();

    // State for search and filters
    const [searchText, setSearchText] = useState<string>('');
    const [publishedFilter, setPublishedFilter] = useState<boolean | undefined>(undefined);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

    // State for modals
    const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState<boolean>(false);
    const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);

    // Form instances
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    // Fetch blog posts on component mount
    useEffect(() => {
        fetchBlogPosts();
    }, []);

    // Handle search input change
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    // Apply filters and search
    const applyFilters = () => {
        const params: any = {
            pageNumber: 1, // Reset to first page when filtering
            searchTerm: searchText || undefined
        };

        if (publishedFilter !== undefined) {
            params.isPublished = publishedFilter;
        }

        if (dateRange && dateRange[0] && dateRange[1]) {
            params.createdDateFrom = dateRange[0].toISOString();
            params.createdDateTo = dateRange[1].toISOString();
        }

        fetchBlogPosts(params);
    };

    // Reset filters
    const resetFilters = () => {
        setSearchText('');
        setPublishedFilter(undefined);
        setDateRange(null);
        fetchBlogPosts({ pageNumber: 1 });
    };

    // Handle pagination change
    const handlePageChange = (page: number, pageSize?: number) => {
        fetchBlogPosts({
            pageNumber: page,
            pageSize: pageSize || 10,
            searchTerm: searchText || undefined,
            isPublished: publishedFilter,
            createdDateFrom: dateRange && dateRange[0] ? dateRange[0].toISOString() : undefined,
            createdDateTo: dateRange && dateRange[1] ? dateRange[1].toISOString() : undefined
        });
    };

    // Handle blog post creation
    const handleCreateBlogPost = async (values: any) => {
        if (!user?.id) {
            message.error('User information is not available');
            return;
        }

        const success = await createBlogPost({
            title: values.title,
            body: values.body,
            isPublished: values.isPublished,
            authorId: user.id
        });

        if (success) {
            setIsCreateModalVisible(false);
            createForm.resetFields();
        }
    };

    // Handle blog post update
    const handleUpdateBlogPost = async (values: any) => {
        if (!selectedBlogPost) return;

        const success = await updateBlogPost(selectedBlogPost.id, {
            title: values.title,
            body: values.body,
            isPublished: values.isPublished
        });

        if (success) {
            setIsEditModalVisible(false);
            setSelectedBlogPost(null);
        }
    };

    // Handle blog post deletion
    const handleDeleteBlogPost = (id: string) => {
        modal.confirm({
            title: 'Are you sure you want to delete this blog post?',
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await deleteBlogPost(id);
                    message.success('Blog post deleted successfully');
                } catch (error) {
                    message.error('Failed to delete blog post');
                    console.error('Error deleting blog post:', error);
                }
            },
        });
    };

    // Open edit modal with blog post data
    const openEditModal = (blogPost: BlogPost) => {
        setSelectedBlogPost(blogPost);
        editForm.setFieldsValue({
            title: blogPost.title,
            body: blogPost.body,
            isPublished: blogPost.isPublished
        });
        setIsEditModalVisible(true);
    };

    // Open view modal with blog post data
    const openViewModal = (blogPost: BlogPost) => {
        setSelectedBlogPost(blogPost);
        setIsViewModalVisible(true);
    };

    // Table columns
    const columns: ColumnsType<BlogPost> = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: BlogPost) => (
                <span
                    className="text-blue-600 cursor-pointer hover:underline"
                    onClick={() => openViewModal(record)}
                >
                    {text}
                </span>
            ),
            sorter: (a: BlogPost, b: BlogPost) => a.title.localeCompare(b.title),
            width: 250,
        },
        {
            title: 'Author',
            dataIndex: 'authorName',
            key: 'authorName',
            sorter: (a: BlogPost, b: BlogPost) => a.authorName.localeCompare(b.authorName),
            width: 150,
        },
        {
            title: 'Status',
            dataIndex: 'isPublished',
            key: 'isPublished',
            render: (isPublished: boolean) => (
                isPublished ?
                    <Tag icon={<CheckCircleOutlined />} color="success">Published</Tag> :
                    <Tag icon={<CloseCircleOutlined />} color="default">Draft</Tag>
            ),
            filters: [
                { text: 'Published', value: true },
                { text: 'Draft', value: false },
            ],
            onFilter: (value: boolean | React.Key, record: BlogPost) =>
                record.isPublished === (typeof value === 'boolean' ? value : Boolean(value)),
            width: 120,
        },
        {
            title: 'Created',
            dataIndex: 'createdTime',
            key: 'createdTime',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
            sorter: (a: BlogPost, b: BlogPost) => dayjs(a.createdTime).unix() - dayjs(b.createdTime).unix(),
            width: 150,
        },
        {
            title: 'Last Updated',
            dataIndex: 'lastUpdatedTime',
            key: 'lastUpdatedTime',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
            sorter: (a: BlogPost, b: BlogPost) => dayjs(a.lastUpdatedTime).unix() - dayjs(b.lastUpdatedTime).unix(),
            width: 150,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: BlogPost) => (
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
                            onClick={() => handleDeleteBlogPost(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
            width: 120,
        },
    ];

    const breadcrumbItems = [
        { title: 'Blog', href: '/admin/blog' },
    ];

    return (
        <AdminLayout
            title="Blog Management"
            breadcrumbItems={breadcrumbItems}
        >
            <Card>
                {/* Filters */}
                <div className="mb-6">
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} md={8}>
                            <Input
                                placeholder="Search by title or content..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={handleSearch}
                                onPressEnter={applyFilters}
                            />
                        </Col>
                        <Col xs={24} md={6}>
                            <Select
                                placeholder="Filter by status"
                                style={{ width: '100%' }}
                                allowClear
                                onChange={(value) => setPublishedFilter(value)}
                                value={publishedFilter}
                            >
                                <Option value={true}>Published</Option>
                                <Option value={false}>Draft</Option>
                            </Select>
                        </Col>
                        <Col xs={24} md={6}>
                            <RangePicker
                                style={{ width: '100%' }}
                                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                                value={dateRange}
                            />
                        </Col>
                        <Col xs={24} md={4}>
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

                {/* Actions */}
                <div className="flex justify-between mb-4">
                    <div>
                        <span className="text-gray-500">
                            Total: {totalCount} blog posts
                        </span>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsCreateModalVisible(true)}
                    >
                        Create Blog Post
                    </Button>
                </div>

                {/* Blog posts table */}
                <Table
                    dataSource={blogPosts}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 'max-content' }}
                />

                {/* Pagination */}
                <div className="mt-4 flex justify-end">
                    <Pagination
                        current={pageNumber}
                        pageSize={pageSize}
                        total={totalCount}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total) => `Total ${total} items`}
                        onChange={handlePageChange}
                        onShowSizeChange={handlePageChange}
                    />
                </div>
            </Card>

            {/* Create Blog Post Modal */}
            <Modal
                title="Create New Blog Post"
                open={isCreateModalVisible}
                onCancel={() => setIsCreateModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={handleCreateBlogPost}
                    initialValues={{ isPublished: false }}
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter a title' }]}
                    >
                        <Input placeholder="Enter blog post title" />
                    </Form.Item>

                    <Form.Item
                        name="body"
                        label="Content"
                        rules={[{ required: true, message: 'Please enter content' }]}
                    >
                        <SimpleRichEditor />
                    </Form.Item>

                    <Form.Item
                        name="isPublished"
                        label="Publish Status"
                        valuePropName="checked"
                    >
                        <Switch
                            checkedChildren="Published"
                            unCheckedChildren="Draft"
                        />
                    </Form.Item>

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

            {/* Edit Blog Post Modal */}
            <Modal
                title="Edit Blog Post"
                open={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleUpdateBlogPost}
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter a title' }]}
                    >
                        <Input placeholder="Enter blog post title" />
                    </Form.Item>

                    <Form.Item
                        name="body"
                        label="Content"
                        rules={[{ required: true, message: 'Please enter content' }]}
                    >
                        <SimpleRichEditor />
                    </Form.Item>

                    <Form.Item
                        name="isPublished"
                        label="Publish Status"
                        valuePropName="checked"
                    >
                        <Switch
                            checkedChildren="Published"
                            unCheckedChildren="Draft"
                        />
                    </Form.Item>

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

            {/* View Blog Post Modal */}
            {selectedBlogPost && (
                <Modal
                    title={selectedBlogPost.title}
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
                                openEditModal(selectedBlogPost);
                            }}
                        >
                            Edit
                        </Button>
                    ]}
                    width={800}
                >
                    <div className="mb-4">
                        <p className="text-gray-500 mb-1">Author</p>
                        <p>{selectedBlogPost.authorName}</p>
                    </div>

                    <div className="mb-4">
                        <p className="text-gray-500 mb-1">Status</p>
                        <p>
                            {selectedBlogPost.isPublished ?
                                <Tag icon={<CheckCircleOutlined />} color="success">Published</Tag> :
                                <Tag icon={<CloseCircleOutlined />} color="default">Draft</Tag>
                            }
                        </p>
                    </div>

                    <div className="mb-4">
                        <p className="text-gray-500 mb-1">Created</p>
                        <p>{dayjs(selectedBlogPost.createdTime).format('YYYY-MM-DD HH:mm')}</p>
                    </div>

                    <div className="mb-4">
                        <p className="text-gray-500 mb-1">Last Updated</p>
                        <p>{dayjs(selectedBlogPost.lastUpdatedTime).format('YYYY-MM-DD HH:mm')}</p>
                    </div>

                    <div className="mt-6">
                        <p className="text-gray-500 mb-1">Content</p>
                        <div
                            className="border p-4 rounded-md bg-gray-50"
                            dangerouslySetInnerHTML={{ __html: selectedBlogPost.body }}
                        />
                    </div>
                </Modal>
            )}
        </AdminLayout>
    );
} 