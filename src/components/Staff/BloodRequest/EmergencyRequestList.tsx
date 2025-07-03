'use client';

import React, { useState } from 'react';
import { Table, Button, Tag, Badge, Space, Modal, Typography, Card, Divider, Alert, message, Spin } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, WarningOutlined, PhoneOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { BloodRequestDetail, checkInventory, fulfillFromInventory, InventoryCheckResponse } from '@/services/api/bloodRequestService';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

interface EmergencyRequestListProps {
    requests: BloodRequestDetail[];
    pagination: {
        current: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
    onRefresh: () => void;
    onPageChange: (page: number) => void;
}

// Maps urgency levels to colors
const urgencyColors: Record<string, string> = {
    Critical: 'red',
    High: 'orange',
    Medium: 'gold',
};

export default function EmergencyRequestList({
    requests,
    pagination,
    onRefresh,
    onPageChange
}: EmergencyRequestListProps) {
    const [selectedRequest, setSelectedRequest] = useState<BloodRequestDetail | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [processModalVisible, setProcessModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [inventoryChecking, setInventoryChecking] = useState(false);
    const [inventoryData, setInventoryData] = useState<InventoryCheckResponse | null>(null);

    // Handle processing a request
    const handleProcessRequest = async (request: BloodRequestDetail) => {
        setSelectedRequest(request);
        setProcessModalVisible(true);

        // Reset inventory data
        setInventoryData(null);

        // Check inventory
        await checkInventoryForRequest(request.id);
    };

    // Check inventory for a blood request
    const checkInventoryForRequest = async (requestId: string) => {
        setInventoryChecking(true);
        try {
            const response = await checkInventory(requestId);
            if (response.success && response.data) {
                console.log('Inventory check response:', response.data);
                setInventoryData(response.data.data);
            } else {
                message.error('Failed to check inventory');
                console.error('Inventory check failed:', response);
            }
        } catch (error) {
            console.error('Error checking inventory:', error);
            message.error('Failed to check inventory');
        } finally {
            setInventoryChecking(false);
        }
    };

    // Handle viewing request details
    const handleViewDetails = (request: BloodRequestDetail) => {
        setSelectedRequest(request);
        setDetailModalVisible(true);
    };

    // Process with inventory
    const handleProcessWithInventory = async () => {
        if (!selectedRequest) return;

        setLoading(true);

        try {
            // Call the API to fulfill the request from inventory
            const response = await fulfillFromInventory(selectedRequest.id);

            if (response.success) {
                message.success('Emergency request processed with inventory successfully');
                setProcessModalVisible(false);
                onRefresh(); // Refresh the list to show updated status
            } else {
                message.error('Failed to process request with inventory');
                console.error('Failed to process with inventory:', response);
            }
        } catch (error) {
            console.error('Error processing with inventory:', error);
            message.error('An error occurred while processing the request');
        } finally {
            setLoading(false);
        }
    };

    // Process with donor search
    const handleProcessWithDonorSearch = async () => {
        if (!selectedRequest) return;

        setLoading(true);

        try {
            // In a real implementation, this would call an API to create a donor search event
            // For now, we'll just simulate a successful response after a short delay
            await new Promise(resolve => setTimeout(resolve, 800));

            message.success('Emergency donor search initiated successfully');
            setProcessModalVisible(false);
            onRefresh(); // Refresh the list to show updated status
        } catch (error) {
            console.error('Error initiating donor search:', error);
            message.error('An error occurred while initiating the donor search');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Urgency',
            dataIndex: 'urgencyLevel',
            key: 'urgencyLevel',
            render: (urgency: string) => (
                <Tag color={urgencyColors[urgency] || 'default'} className="text-xs px-2 py-1">
                    {urgency}
                </Tag>
            ),
        },
        {
            title: 'Patient',
            dataIndex: 'patientName',
            key: 'patientName',
            render: (text: string, record: BloodRequestDetail) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div className="text-xs text-gray-500">{record.contactInfo}</div>
                </div>
            ),
        },
        {
            title: 'Blood Info',
            key: 'bloodInfo',
            render: (_: any, record: BloodRequestDetail) => (
                <div>
                    <div className="font-medium">{record.bloodGroupName}</div>
                    <div className="text-xs text-gray-500">{record.componentTypeName}</div>
                    <div className="text-xs font-bold">{record.quantityUnits} unit(s)</div>
                </div>
            ),
        },
        {
            title: 'Hospital',
            dataIndex: 'hospitalName',
            key: 'hospitalName',
            render: (text: string, record: BloodRequestDetail) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[150px]" title={record.address}>
                        {record.address}
                    </div>
                </div>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            render: (status: string, record: BloodRequestDetail) => {
                let statusColor = 'default';
                let statusIcon = null;

                switch (status) {
                    case 'Pending':
                        statusColor = 'processing';
                        statusIcon = <ClockCircleOutlined />;
                        break;
                    case 'Processing':
                        statusColor = 'warning';
                        statusIcon = <WarningOutlined />;
                        break;
                    case 'Fulfilled':
                        statusColor = 'success';
                        statusIcon = <CheckCircleOutlined />;
                        break;
                    default:
                        statusColor = 'default';
                        statusIcon = <InfoCircleOutlined />;
                }

                return (
                    <div>
                        <Badge status={statusColor as any} text={status} />
                        <div className="text-xs text-gray-500 mt-1">
                            {dayjs(record.createdTime).fromNow()}
                        </div>
                    </div>
                );
            },
            filters: [
                { text: 'Pending', value: 'Pending' },
                { text: 'Processing', value: 'Processing' },
                { text: 'Fulfilled', value: 'Fulfilled' },
            ],
            onFilter: (value: any, record: BloodRequestDetail) => record.status === value,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: BloodRequestDetail) => (
                <Space size="small">
                    {record.status === 'Pending' && (
                        <Button
                            type="primary"
                            danger
                            onClick={() => handleProcessRequest(record)}
                        >
                            Process Now
                        </Button>
                    )}
                    <Button
                        type="link"
                        onClick={() => handleViewDetails(record)}
                    >
                        Details
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="mb-4">
                <Alert
                    message="Emergency Blood Requests"
                    description="These are urgent blood requests that need immediate attention. Process them as quickly as possible."
                    type="error"
                    showIcon
                />
            </div>

            <Table
                columns={columns}
                dataSource={requests}
                rowKey="id"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    onChange: onPageChange,
                    showSizeChanger: false,
                }}
            />

            {/* Details Modal */}
            <Modal
                title={
                    <div className="flex items-center text-red-600">
                        <WarningOutlined className="mr-2" />
                        Emergency Request Details
                    </div>
                }
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setDetailModalVisible(false)}>
                        Close
                    </Button>,
                    selectedRequest?.status === 'Pending' && (
                        <Button
                            key="process"
                            type="primary"
                            danger
                            onClick={() => {
                                setDetailModalVisible(false);
                                handleProcessRequest(selectedRequest);
                            }}
                        >
                            Process Now
                        </Button>
                    ),
                ]}
                width={700}
            >
                {selectedRequest && (
                    <div className="p-2">
                        <Card className="mb-4 bg-gray-50">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Text type="secondary">Patient Name:</Text>
                                    <div className="font-medium">{selectedRequest.patientName}</div>
                                </div>
                                <div>
                                    <Text type="secondary">Urgency Level:</Text>
                                    <div>
                                        <Tag color={urgencyColors[selectedRequest.urgencyLevel] || 'default'}>
                                            {selectedRequest.urgencyLevel}
                                        </Tag>
                                    </div>
                                </div>
                                <div>
                                    <Text type="secondary">Contact Info:</Text>
                                    <div className="flex items-center">
                                        <PhoneOutlined className="mr-1" />
                                        <a href={`tel:${selectedRequest.contactInfo}`}>{selectedRequest.contactInfo}</a>
                                    </div>
                                </div>
                                <div>
                                    <Text type="secondary">Status:</Text>
                                    <div>
                                        <Badge
                                            status={selectedRequest.status === 'Pending' ? 'processing' :
                                                selectedRequest.status === 'Processing' ? 'warning' :
                                                    selectedRequest.status === 'Fulfilled' ? 'success' : 'default'}
                                            text={selectedRequest.status}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Text type="secondary">Blood Group:</Text>
                                    <div className="font-medium">{selectedRequest.bloodGroupName}</div>
                                </div>
                                <div>
                                    <Text type="secondary">Component Type:</Text>
                                    <div className="font-medium">{selectedRequest.componentTypeName}</div>
                                </div>
                                <div>
                                    <Text type="secondary">Quantity:</Text>
                                    <div className="font-medium">{selectedRequest.quantityUnits} unit(s)</div>
                                </div>
                                <div>
                                    <Text type="secondary">Requested On:</Text>
                                    <div>{dayjs(selectedRequest.createdTime).format('MMM D, YYYY HH:mm')}</div>
                                </div>
                                <div className="col-span-2">
                                    <Text type="secondary">Hospital:</Text>
                                    <div className="font-medium">{selectedRequest.hospitalName}</div>
                                </div>
                                <div className="col-span-2">
                                    <Text type="secondary">Address:</Text>
                                    <div>{selectedRequest.address}</div>
                                </div>
                                {selectedRequest.medicalNotes && (
                                    <div className="col-span-2">
                                        <Text type="secondary">Medical Notes:</Text>
                                        <div>{selectedRequest.medicalNotes}</div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                )}
            </Modal>

            {/* Process Modal */}
            <Modal
                title={
                    <div className="flex items-center text-red-600">
                        <WarningOutlined className="mr-2" />
                        Process Emergency Request
                    </div>
                }
                open={processModalVisible}
                onCancel={() => setProcessModalVisible(false)}
                footer={null}
                width={700}
            >
                {loading ? (
                    <div className="text-center py-8">
                        <Spin size="large" />
                        <div className="mt-4">Processing request...</div>
                    </div>
                ) : (
                    selectedRequest && (
                        <div className="p-2">
                            <Alert
                                message="Emergency Request Processing"
                                description="This is an emergency blood request. Choose how you want to process it."
                                type="warning"
                                showIcon
                                className="mb-4"
                            />

                            <Card className="mb-4 bg-gray-50">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Text type="secondary">Patient:</Text>
                                        <div className="font-medium">{selectedRequest.patientName}</div>
                                    </div>
                                    <div>
                                        <Text type="secondary">Blood Type Needed:</Text>
                                        <div className="font-medium">{selectedRequest.bloodGroupName} ({selectedRequest.componentTypeName})</div>
                                    </div>
                                    <div>
                                        <Text type="secondary">Quantity:</Text>
                                        <div className="font-medium">{selectedRequest.quantityUnits} unit(s)</div>
                                    </div>
                                    <div>
                                        <Text type="secondary">Hospital:</Text>
                                        <div className="font-medium">{selectedRequest.hospitalName}</div>
                                    </div>
                                </div>
                            </Card>

                            {/* Inventory Check Results */}
                            {inventoryChecking ? (
                                <div className="text-center py-4">
                                    <Spin size="small" />
                                    <div className="mt-2">Checking inventory...</div>
                                </div>
                            ) : inventoryData ? (
                                <div className="mb-4">
                                    <Alert
                                        message={
                                            inventoryData.hasSufficientInventory
                                                ? "Sufficient Inventory Available"
                                                : "Insufficient Inventory"
                                        }
                                        description={
                                            <div>
                                                <p>
                                                    Requested: <strong>{inventoryData.requestedUnits} units</strong> |
                                                    Available: <strong>{inventoryData.availableUnits} units</strong>
                                                </p>
                                                {!inventoryData.hasSufficientInventory && (
                                                    <p className="text-red-500 mt-1">
                                                        Not enough inventory available. Consider searching for donors.
                                                    </p>
                                                )}
                                            </div>
                                        }
                                        type={inventoryData.hasSufficientInventory ? "success" : "error"}
                                        showIcon
                                    />
                                </div>
                            ) : null}

                            <Divider />

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <Card
                                    title="Process with Inventory"
                                    className={`text-center transition-shadow cursor-pointer ${inventoryData && !inventoryData.hasSufficientInventory
                                        ? 'opacity-50 border-gray-200'
                                        : 'hover:shadow-md border-blue-200'
                                        }`}
                                    onClick={() => {
                                        if (!inventoryData || inventoryData.hasSufficientInventory) {
                                            handleProcessWithInventory();
                                        }
                                    }}
                                >
                                    <p>Check if blood is available in inventory and fulfill the request immediately.</p>
                                    <Button
                                        type="primary"
                                        className="mt-4"
                                        disabled={!!(inventoryData && !inventoryData.hasSufficientInventory)}
                                        loading={inventoryChecking}
                                    >
                                        {inventoryChecking ? 'Checking...' : 'Process with Inventory'}
                                    </Button>
                                </Card>

                                <Card
                                    title="Find Donors"
                                    className="text-center hover:shadow-md transition-shadow cursor-pointer border-red-200"
                                    onClick={handleProcessWithDonorSearch}
                                >
                                    <p>Search for nearby donors and create an emergency donation event.</p>
                                    <Button type="primary" danger className="mt-4">
                                        Search for Donors
                                    </Button>
                                </Card>
                            </div>
                        </div>
                    )
                )}
            </Modal>
        </div>
    );
} 