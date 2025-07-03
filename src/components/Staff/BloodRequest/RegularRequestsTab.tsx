'use client';

import React, { useState } from 'react';
import { Table, Button, Space, Tag, Tooltip, Badge, Modal, message, Spin, Typography, Alert, Card, Divider } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, InfoCircleOutlined, WarningOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { BloodRequestDetail } from '@/hooks/api/useStaffBloodRequest';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

// Define prop types
interface RegularRequestsTabProps {
    requests: BloodRequestDetail[];
    loading: boolean;
    checkInventory: (requestId: string) => Promise<any>;
    createFromInventory: (requestId: string, locationId: string, notes?: string) => Promise<boolean>;
    createNeedingDonor: (requestId: string, locationId: string, notes?: string) => Promise<any>;
    refreshRequests: () => void;
}

export default function RegularRequestsTab({
    requests,
    loading,
    checkInventory,
    createFromInventory,
    createNeedingDonor,
    refreshRequests,
}: RegularRequestsTabProps) {
    const [selectedRequest, setSelectedRequest] = useState<BloodRequestDetail | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [inventoryStatus, setInventoryStatus] = useState<any>(null);

    // Handle button click to process a request
    const handleProcessRequest = async (request: BloodRequestDetail) => {
        setSelectedRequest(request);
        setActionLoading(true);

        try {
            // Check if we have this blood type in inventory
            const inventoryCheck = await checkInventory(request.id);
            setInventoryStatus(inventoryCheck);
            setModalVisible(true);
        } catch (error) {
            console.error('Error checking inventory:', error);
            message.error('Failed to check inventory status');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle fulfilling from inventory
    const handleFulfillFromInventory = async () => {
        if (!selectedRequest) return;

        setActionLoading(true);
        try {
            const success = await createFromInventory(
                selectedRequest.id,
                selectedRequest.locationId,
                `Fulfilled from inventory for request #${selectedRequest.id.substring(0, 8)}`
            );

            if (success) {
                message.success('Blood request fulfilled from inventory');
                setModalVisible(false);
                refreshRequests();
            }
        } catch (error) {
            console.error('Error fulfilling from inventory:', error);
            message.error('Failed to fulfill request from inventory');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle creating donation event needing donor
    const handleCreateDonationEvent = async () => {
        if (!selectedRequest) return;

        setActionLoading(true);
        try {
            const result = await createNeedingDonor(
                selectedRequest.id,
                selectedRequest.locationId,
                `Need to find donor for request #${selectedRequest.id.substring(0, 8)}`
            );

            if (result) {
                message.success('Donation event created successfully');
                setModalVisible(false);
                refreshRequests();
            }
        } catch (error) {
            console.error('Error creating donation event:', error);
            message.error('Failed to create donation event');
        } finally {
            setActionLoading(false);
        }
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
                        Created: {dayjs(record.createdAt).format('MMM D, YYYY')}
                    </div>
                </div>
            ),
        },
        {
            title: 'Requester',
            key: 'requester',
            render: (_: any, record: BloodRequestDetail) => (
                <div>
                    <div className="font-medium">{record.requestedByName || record.requestedBy.substring(0, 8)}</div>
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
            render: (_: any, record: BloodRequestDetail) => (
                <div>
                    <div className="flex items-center">
                        <CalendarOutlined className="mr-1" />
                        <span>{dayjs(record.neededByDate).format('MMM D, YYYY')}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        {dayjs(record.neededByDate).diff(dayjs(), 'day') > 0
                            ? `In ${dayjs(record.neededByDate).diff(dayjs(), 'day')} days`
                            : 'ASAP'}
                    </div>
                </div>
            ),
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
                    <div className="text-xs text-gray-500">{record.address}</div>
                </div>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            render: (_: any, record: BloodRequestDetail) => {
                let statusColor = 'default';
                let statusIcon = null;

                switch (record.status) {
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
                        <Badge status={statusColor as any} text={record.status} />
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
                            onClick={() => handleProcessRequest(record)}
                            loading={actionLoading && selectedRequest?.id === record.id}
                        >
                            Process
                        </Button>
                    )}
                    {record.status === 'Processing' && (
                        <Button type="default">View Details</Button>
                    )}
                    {record.status === 'Fulfilled' && (
                        <Button type="default">View Details</Button>
                    )}
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
                dataSource={requests}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                className="mt-4"
            />

            {/* Process Blood Request Modal */}
            <Modal
                title={
                    <Title level={4}>
                        <InfoCircleOutlined className="mr-2 text-blue-600" />
                        Process Blood Request
                    </Title>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={700}
            >
                {actionLoading ? (
                    <div className="text-center py-6">
                        <Spin size="large" />
                        <div className="mt-4">Checking inventory...</div>
                    </div>
                ) : (
                    <>
                        {selectedRequest && (
                            <div className="p-4">
                                <div className="flex flex-col space-y-4">
                                    <Card className="bg-gray-50">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Text type="secondary">Request ID:</Text>
                                                <div className="font-mono">{selectedRequest.id}</div>
                                            </div>
                                            <div>
                                                <Text type="secondary">Requested By:</Text>
                                                <div>{selectedRequest.requestedByName || selectedRequest.requestedBy}</div>
                                            </div>
                                            <div>
                                                <Text type="secondary">Contact:</Text>
                                                <div>{selectedRequest.contactInfo}</div>
                                            </div>
                                            <div>
                                                <Text type="secondary">Needed By:</Text>
                                                <div>{dayjs(selectedRequest.neededByDate).format('MMMM D, YYYY')}</div>
                                            </div>
                                            <div>
                                                <Text type="secondary">Blood Type:</Text>
                                                <div className="text-lg font-medium">{selectedRequest.bloodGroupName}</div>
                                            </div>
                                            <div>
                                                <Text type="secondary">Component:</Text>
                                                <div className="text-lg font-medium">{selectedRequest.componentTypeName}</div>
                                            </div>
                                            <div>
                                                <Text type="secondary">Quantity:</Text>
                                                <div className="text-lg font-medium">{selectedRequest.quantityUnits} unit(s)</div>
                                            </div>
                                            <div>
                                                <Text type="secondary">Location:</Text>
                                                <div>{selectedRequest.locationName}</div>
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

                                    <Divider />

                                    {/* Inventory Status */}
                                    <div>
                                        <Title level={5}>Inventory Check</Title>

                                        {inventoryStatus && (
                                            <Alert
                                                message={
                                                    inventoryStatus.available
                                                        ? `Available in Inventory: ${inventoryStatus.availableUnits} unit(s)`
                                                        : 'Not Available in Inventory'
                                                }
                                                description={
                                                    inventoryStatus.available
                                                        ? 'You can fulfill this request from inventory.'
                                                        : 'You need to create a donation event to find a donor.'
                                                }
                                                type={inventoryStatus.available ? 'success' : 'warning'}
                                                showIcon
                                                className="mb-4"
                                            />
                                        )}

                                        <div className="flex justify-end space-x-4 mt-6">
                                            <Button onClick={() => setModalVisible(false)}>
                                                Cancel
                                            </Button>

                                            {inventoryStatus && inventoryStatus.available ? (
                                                <Button
                                                    type="primary"
                                                    onClick={handleFulfillFromInventory}
                                                    loading={actionLoading}
                                                >
                                                    Fulfill from Inventory
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="primary"
                                                    onClick={handleCreateDonationEvent}
                                                    loading={actionLoading}
                                                >
                                                    Create Donation Event
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Modal>
        </div>
    );
} 