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
    CloseCircleOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { useAdminLocations } from '@/hooks';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import {
    Location,
    CreateLocationRequest,
    UpdateLocationRequest
} from '@/services/api/locationService';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Dynamically import the map components to avoid SSR issues
const MapSelector = dynamic(() => import('@/components/MapSelector'), { ssr: false });
const LocationViewer = dynamic(() => import('@/components/LocationViewer'), { ssr: false });

const { Option } = Select;

export default function AdminLocationsPage() {
    const {
        locations,
        loading,
        error,
        totalCount,
        pageSize,
        pageNumber,
        totalPages,
        fetchLocations,
        createLocation,
        updateLocation,
        deleteLocation
    } = useAdminLocations();

    // State for search and filters
    const [searchText, setSearchText] = useState<string>('');

    // State for modals
    const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState<boolean>(false);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [mapVisible, setMapVisible] = useState<boolean>(false);

    // Form instances
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const { message, modal } = App.useApp();
    const { user } = useAuth();
    const router = useRouter();

    // Fetch locations on component mount
    useEffect(() => {
        fetchLocations();
    }, []);

    // Handle search input change
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    // Apply filters and search
    const applyFilters = () => {
        fetchLocations({
            pageNumber: 1, // Reset to first page when filtering
            searchTerm: searchText || undefined
        });
    };

    // Reset filters
    const resetFilters = () => {
        setSearchText('');
        fetchLocations({ pageNumber: 1 });
    };

    // Handle pagination change
    const handlePageChange = (page: number, pageSize?: number) => {
        fetchLocations({
            pageNumber: page,
            pageSize: pageSize,
            searchTerm: searchText || undefined
        });
    };

    // Handle location creation
    const handleCreateLocation = async (values: any) => {
        try {
            const locationData: CreateLocationRequest = {
                name: values.name,
                address: values.address,
                latitude: values.latitude,
                longitude: values.longitude,
                description: values.description || '',
                contactPhone: values.contactPhone || '',
                contactEmail: values.contactEmail || '',
                isActive: values.isActive
            };

            const success = await createLocation(locationData);

            if (success) {
                setIsCreateModalVisible(false);
                createForm.resetFields();
            }
        } catch (error) {
            console.error('Error creating location:', error);
            message.error('An error occurred while creating the location');
        }
    };

    // Handle location update
    const handleUpdateLocation = async (values: any) => {
        if (!selectedLocation) return;

        try {
            const locationData: UpdateLocationRequest = {
                name: values.name,
                address: values.address,
                latitude: values.latitude,
                longitude: values.longitude,
                description: values.description || '',
                contactPhone: values.contactPhone || '',
                contactEmail: values.contactEmail || '',
                isActive: values.isActive
            };

            const success = await updateLocation(selectedLocation.id, locationData);

            if (success) {
                setIsEditModalVisible(false);
                setSelectedLocation(null);
            }
        } catch (error) {
            console.error('Error updating location:', error);
            message.error('An error occurred while updating the location');
        }
    };

    // Handle location deletion
    const handleDeleteLocation = (id: string) => {
        modal.confirm({
            title: 'Are you sure you want to delete this location?',
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                await deleteLocation(id);
            },
        });
    };

    // Open edit modal with location data
    const openEditModal = (location: Location) => {
        setSelectedLocation(location);
        editForm.setFieldsValue({
            name: location.name,
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
            description: location.description,
            contactPhone: location.contactPhone,
            contactEmail: location.contactEmail,
            isActive: location.isActive
        });
        setIsEditModalVisible(true);
    };

    // Open view modal with location data
    const openViewModal = (location: Location) => {
        setSelectedLocation(location);
        setIsViewModalVisible(true);
    };

    // Handle map selection
    const handleMapSelection = (lat: string, lng: string, address: string, formInstance: any) => {
        formInstance.setFieldsValue({
            latitude: lat,
            longitude: lng,
            address: address
        });
        setMapVisible(false);
    };

    const columns: ColumnsType<Location> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <a className="text-blue-600 hover:text-blue-800">{text}</a>,
            sorter: (a: Location, b: Location) => a.name.localeCompare(b.name),
            width: 200,
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
            width: 250,
        },
        {
            title: 'Contact Phone',
            dataIndex: 'contactPhone',
            key: 'contactPhone',
            width: 150,
        },
        {
            title: 'Contact Email',
            dataIndex: 'contactEmail',
            key: 'contactEmail',
            width: 200,
            ellipsis: true,
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => (
                isActive ?
                    <Tag icon={<CheckCircleOutlined />} color="success">Active</Tag> :
                    <Tag icon={<CloseCircleOutlined />} color="error">Inactive</Tag>
            ),
            width: 100,
            filters: [
                { text: 'Active', value: true },
                { text: 'Inactive', value: false },
            ],
            onFilter: (value, record) => record.isActive === value,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Location) => (
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
                            onClick={() => handleDeleteLocation(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
            width: 120,
        },
    ];

    const breadcrumbItems = [
        { title: 'Locations', href: '/admin/locations' },
    ];

    return (
        <AdminLayout breadcrumbItems={breadcrumbItems} title="Location Management">
            <Card
                title={
                    <div className="flex items-center">
                        <EnvironmentOutlined className="mr-2 text-xl" />
                        <span className="text-xl font-semibold">Locations</span>
                    </div>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsCreateModalVisible(true)}
                    >
                        Add Location
                    </Button>
                }
                className="shadow-sm"
            >
                <div className="mb-6">
                    <Row gutter={16} className="mb-4">
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Input
                                placeholder="Search by name or address"
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={handleSearch}
                                allowClear
                                onPressEnter={applyFilters}
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
                    dataSource={locations}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    className="mb-6"
                />

                <div className="flex justify-between items-center">
                    <div>
                        Showing {locations.length} of {totalCount} items
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

            {/* Map Selection Modal */}
            <Modal
                title={
                    <div className="flex items-center text-red-500">
                        <EnvironmentOutlined className="mr-2 text-xl" />
                        <span className="text-xl font-semibold">Select Location on Map</span>
                    </div>
                }
                open={mapVisible}
                onCancel={() => setMapVisible(false)}
                footer={null}
                width="90%"
                style={{ top: 10, height: 'calc(100vh - 20px)' }}
                bodyStyle={{ height: 'calc(100vh - 80px)', padding: 0 }}
                className="location-modal map-modal"
                maskClosable={false}
                destroyOnClose
                zIndex={1060}
            >
                <MapSelector
                    onSelect={(lat, lng, address) =>
                        handleMapSelection(
                            lat,
                            lng,
                            address,
                            isEditModalVisible ? editForm : createForm
                        )
                    }
                />
            </Modal>

            {/* Create Location Modal */}
            <Modal
                title={
                    <div className="flex items-center text-red-500">
                        <EnvironmentOutlined className="mr-2 text-xl" />
                        <span className="text-xl font-semibold">Add New Location</span>
                    </div>
                }
                open={isCreateModalVisible && !mapVisible}
                onCancel={() => {
                    setIsCreateModalVisible(false);
                    createForm.resetFields();
                }}
                footer={null}
                width={800}
                className="location-modal"
                maskClosable={false}
                destroyOnClose
                zIndex={1050}
            >
                <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={handleCreateLocation}
                    initialValues={{ isActive: true }}
                    className="mt-4"
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="name"
                                label="Location Name"
                                rules={[{ required: true, message: 'Please enter location name' }]}
                            >
                                <Input placeholder="Enter location name" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="address"
                                label="Address"
                                rules={[{ required: true, message: 'Please enter address' }]}
                            >
                                <Input.TextArea
                                    placeholder="Enter full address or select on map"
                                    rows={2}
                                    size="large"
                                />
                            </Form.Item>
                            <div className="mb-6 mt-2">
                                <Button
                                    onClick={() => setMapVisible(true)}
                                    icon={<EnvironmentOutlined />}
                                    type="primary"
                                    ghost
                                    size="large"
                                >
                                    Select Location on Map
                                </Button>
                            </div>
                        </Col>
                    </Row>

                    <Form.Item
                        name="latitude"
                        hidden
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="longitude"
                        hidden
                    >
                        <Input />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="contactPhone"
                                label="Contact Phone"
                            >
                                <Input placeholder="Contact phone number" size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="contactEmail"
                                label="Contact Email"
                                rules={[
                                    {
                                        type: 'email',
                                        message: 'Please enter a valid email address',
                                    }
                                ]}
                            >
                                <Input placeholder="Contact email" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="description"
                                label="Description"
                            >
                                <Input.TextArea placeholder="Enter description" rows={4} size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="isActive"
                                label="Status"
                                valuePropName="checked"
                            >
                                <Switch
                                    checkedChildren="Active"
                                    unCheckedChildren="Inactive"
                                    size="default"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item className="mt-6">
                        <Space size="middle">
                            <Button type="primary" htmlType="submit" size="large">
                                Create
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsCreateModalVisible(false);
                                    createForm.resetFields();
                                }}
                                size="large"
                            >
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Location Modal */}
            <Modal
                title={
                    <div className="flex items-center text-red-500">
                        <EnvironmentOutlined className="mr-2 text-xl" />
                        <span className="text-xl font-semibold">Edit Location</span>
                    </div>
                }
                open={isEditModalVisible && !mapVisible}
                onCancel={() => setIsEditModalVisible(false)}
                footer={null}
                width={800}
                className="location-modal"
                maskClosable={false}
                destroyOnClose
                zIndex={1050}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleUpdateLocation}
                    className="mt-4"
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="name"
                                label="Location Name"
                                rules={[{ required: true, message: 'Please enter location name' }]}
                            >
                                <Input placeholder="Enter location name" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="address"
                                label="Address"
                                rules={[{ required: true, message: 'Please enter address' }]}
                            >
                                <Input.TextArea
                                    placeholder="Enter full address or select on map"
                                    rows={2}
                                    size="large"
                                />
                            </Form.Item>
                            <div className="mb-6 mt-2">
                                <Button
                                    onClick={() => setMapVisible(true)}
                                    icon={<EnvironmentOutlined />}
                                    type="primary"
                                    ghost
                                    size="large"
                                >
                                    Select Location on Map
                                </Button>
                            </div>
                        </Col>
                    </Row>

                    <Form.Item
                        name="latitude"
                        hidden
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="longitude"
                        hidden
                    >
                        <Input />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="contactPhone"
                                label="Contact Phone"
                            >
                                <Input placeholder="Contact phone number" size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="contactEmail"
                                label="Contact Email"
                                rules={[
                                    {
                                        type: 'email',
                                        message: 'Please enter a valid email address',
                                    }
                                ]}
                            >
                                <Input placeholder="Contact email" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="description"
                                label="Description"
                            >
                                <Input.TextArea placeholder="Enter description" rows={4} size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="isActive"
                                label="Status"
                                valuePropName="checked"
                            >
                                <Switch
                                    checkedChildren="Active"
                                    unCheckedChildren="Inactive"
                                    size="default"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item className="mt-6">
                        <Space size="middle">
                            <Button type="primary" htmlType="submit" size="large">
                                Update
                            </Button>
                            <Button onClick={() => setIsEditModalVisible(false)} size="large">
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Location Modal */}
            {selectedLocation && (
                <Modal
                    title={
                        <div className="flex items-center text-red-500">
                            <EnvironmentOutlined className="mr-2 text-xl" />
                            <span className="text-xl font-semibold">{selectedLocation.name}</span>
                        </div>
                    }
                    open={isViewModalVisible && !mapVisible}
                    onCancel={() => setIsViewModalVisible(false)}
                    footer={[
                        <Button key="close" onClick={() => setIsViewModalVisible(false)} size="large">
                            Close
                        </Button>,
                        <Button
                            key="edit"
                            type="primary"
                            onClick={() => {
                                setIsViewModalVisible(false);
                                openEditModal(selectedLocation);
                            }}
                            size="large"
                        >
                            Edit
                        </Button>
                    ]}
                    width={800}
                    className="location-modal"
                    maskClosable={false}
                    destroyOnClose
                    zIndex={1050}
                >
                    <Row gutter={16} className="mb-4 mt-4">
                        <Col xs={24} md={12}>
                            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-gray-700 font-medium mb-2">Address</h3>
                                <p className="text-gray-800">{selectedLocation.address}</p>
                            </div>

                            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-gray-700 font-medium mb-2">Contact Information</h3>
                                <p className="text-gray-800">Phone: {selectedLocation.contactPhone || 'N/A'}</p>
                                <p className="text-gray-800">Email: {selectedLocation.contactEmail || 'N/A'}</p>
                            </div>

                            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-gray-700 font-medium mb-2">Status</h3>
                                <p>
                                    {selectedLocation.isActive ?
                                        <Tag icon={<CheckCircleOutlined />} color="success">Active</Tag> :
                                        <Tag icon={<CloseCircleOutlined />} color="error">Inactive</Tag>
                                    }
                                </p>
                            </div>

                            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-gray-700 font-medium mb-2">Description</h3>
                                <p className="text-gray-800">{selectedLocation.description || 'No description available'}</p>
                            </div>
                        </Col>

                        <Col xs={24} md={12}>
                            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-gray-700 font-medium mb-2">Location Coordinates</h3>
                                <p className="text-gray-800">Latitude: {selectedLocation.latitude}</p>
                                <p className="text-gray-800">Longitude: {selectedLocation.longitude}</p>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-gray-700 font-medium mb-2">Map</h3>
                                <div style={{ height: '300px', width: '100%' }} className="rounded-lg overflow-hidden border border-gray-200">
                                    {selectedLocation.latitude && selectedLocation.longitude && (
                                        <LocationViewer
                                            latitude={selectedLocation.latitude}
                                            longitude={selectedLocation.longitude}
                                            address={selectedLocation.address || ''}
                                        />
                                    )}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Modal>
            )}
        </AdminLayout>
    );
} 