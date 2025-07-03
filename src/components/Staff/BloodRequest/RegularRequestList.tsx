'use client';

import React, { useState } from 'react';
import { Table, Button, Tag, Badge, Space, Modal, Typography, Card, Divider, Alert, message, Spin } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, InfoCircleOutlined, CalendarOutlined, PhoneOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { BloodRequestDetail } from '@/services/api/bloodRequestService';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

interface RegularRequestListProps {
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

export default function RegularRequestList({
    requests,
    pagination,
    onRefresh,
    onPageChange
}: RegularRequestListProps) {
    const [selectedRequest, setSelectedRequest] = useState<BloodRequestDetail | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [processModalVisible, setProcessModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // Handle processing a request
    const handleProcessRequest = (request: BloodRequestDetail) => {
        setSelectedRequest(request);
        setProcessModalVisible(true);
    };

    // Handle viewing request details
    const handleViewDetails = (request: BloodRequestDetail) => {
        setSelectedRequest(request);
        setDetailModalVisible(true);
    };

    // Process with inventory
    const handleProcessWithInventory = () => {
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            message.success('Request processed with inventory');
            setProcessModalVisible(false);
            setLoading(false);
            onRefresh();
        }, 1000);
    };

    // Process with donor search
    const handleProcessWithDonorSearch = () => {
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            message.success('Donor search initiated');
            setProcessModalVisible(false);
            setLoading(false);
            onRefresh();
        }, 1000);
    };

    const columns = [
        {
            title: 'Request Info',
            key: 'requestInfo',
            render: (_: any, record: BloodRequestDetail) => (
                <div>
                    <div className="font-medium">
                        ID: {record.id.substring(0, 8)}...
                    </div>
                    <div className="text-xs text-gray-500">
                        Created: {dayjs(record.createdTime).format('MMM D, YYYY')}
                    </div>
                </div>
            ),
        },
        {
            title: 'Requester',
            key: 'requester',
            render: (_: any, record: BloodRequestDetail) => (
                <div>
                    <div className="font-medium">{record.requesterName || 'Unknown'}</div>
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
            title: 'Needed By',
            key: 'neededBy',
            render: (_: any, record: BloodRequestDetail) => {
                const daysUntil = dayjs(record.neededByDate).diff(dayjs(), 'day');
                let urgencyClass = '';

                if (daysUntil <= 0) {
                    urgencyClass = 'text-red-600 font-bold';
                } else if (daysUntil <= 2) {
                    urgencyClass = 'text-orange-500';
                }

                return (
                    <div>
                        <div className="flex items-center">
                            <CalendarOutlined className="mr-1" />
                            <span>{dayjs(record.neededByDate).format('MMM D, YYYY')}</span>
                        </div>
                        <div className={`text-xs ${urgencyClass}`}>
                            {daysUntil <= 0
                                ? 'URGENT'
                                : daysUntil === 1
                                    ? 'Tomorrow'
                                    : `In ${daysUntil} days`}
                        </div>
                    </div>
                );
            },
            sorter: (a: BloodRequestDetail, b: BloodRequestDetail) =>
                dayjs(a.neededByDate).unix() - dayjs(b.neededByDate).unix(),
            defaultSortOrder: 'ascend' as 'ascend',
        },
        {
            title: 'Location',
            key: 'location',
            render: (_: any, record: BloodRequestDetail) => (
                <div>
                    <div className="font-medium">{record.locationName}</div>
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
            render: (status: string) => {
                let statusColor = 'default';

                switch (status) {
                    case 'Pending':
                        statusColor = 'processing';
                        break;
                    case 'Processing':
                        statusColor = 'warning';
                        break;
                    case 'Fulfilled':
                        statusColor = 'success';
                        break;
                    default:
                        statusColor = 'default';
                }

                return <Badge status={statusColor as any} text={status} />;
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
                            onClick={() => handleProcessRequest(record)}
                        >
                            Process
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
                    message="Regular Blood Requests"
                    description="These are standard blood requests that need to be processed. Check inventory first, then create donation events if needed."
                    type="info"
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
                    <div className="flex items-center">
                        <InfoCircleOutlined className="mr-2 text-blue-600" />
                        Blood Request Details
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
                            onClick={() => {
                                setDetailModalVisible(false);
                                handleProcessRequest(selectedRequest);
                            }}
                        >
                            Process
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
                                    <Text type="secondary">Request ID:</Text>
                                    <div className="font-mono">{selectedRequest.id}</div>
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
                                    <Text type="secondary">Requested By:</Text>
                                    <div className="font-medium">{selectedRequest.requesterName || 'Unknown'}</div>
                                </div>
                                <div>
                                    <Text type="secondary">Contact:</Text>
                                    <div className="flex items-center">
                                        <PhoneOutlined className="mr-1" />
                                        <a href={`tel:${selectedRequest.contactInfo}`}>{selectedRequest.contactInfo}</a>
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
                                    <Text type="secondary">Needed By:</Text>
                                    <div className="flex items-center">
                                        <CalendarOutlined className="mr-1" />
                                        <span>{dayjs(selectedRequest.neededByDate).format('MMMM D, YYYY')}</span>
                                    </div>
                                </div>
                                <div>
                                    <Text type="secondary">Requested On:</Text>
                                    <div>{dayjs(selectedRequest.createdTime).format('MMM D, YYYY HH:mm')}</div>
                                </div>
                                <div>
                                    <Text type="secondary">Location:</Text>
                                    <div className="font-medium">{selectedRequest.locationName}</div>
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
                    <div className="flex items-center text-blue-600">
                        <InfoCircleOutlined className="mr-2" />
                        Process Blood Request
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
                                message="Blood Request Processing"
                                description="Choose how you want to process this blood request."
                                type="info"
                                showIcon
                                className="mb-4"
                            />

                            <Card className="mb-4 bg-gray-50">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Text type="secondary">Requester:</Text>
                                        <div className="font-medium">{selectedRequest.requesterName || 'Unknown'}</div>
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
                                        <Text type="secondary">Needed By:</Text>
                                        <div>{dayjs(selectedRequest.neededByDate).format('MMMM D, YYYY')}</div>
                                    </div>
                                </div>
                            </Card>

                            <Divider />

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <Card
                                    title="Check Inventory"
                                    className="text-center hover:shadow-md transition-shadow cursor-pointer border-blue-200"
                                    onClick={handleProcessWithInventory}
                                >
                                    <p>Check if blood is available in inventory and fulfill the request immediately.</p>
                                    <Button type="primary" className="mt-4">
                                        Process with Inventory
                                    </Button>
                                </Card>

                                <Card
                                    title="Find Donors"
                                    className="text-center hover:shadow-md transition-shadow cursor-pointer border-blue-200"
                                    onClick={handleProcessWithDonorSearch}
                                >
                                    <p>Search for donors and create a donation event to fulfill this request.</p>
                                    <Button type="primary" className="mt-4">
                                        Create Donation Event
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