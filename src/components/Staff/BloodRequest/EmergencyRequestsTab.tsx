'use client';

import React, { useState } from 'react';
import { Table, Button, Space, Tag, Tooltip, Badge, Modal, message, Spin, Typography, Alert } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { BloodRequestDetail } from '@/hooks/api/useStaffBloodRequest';
import { useAuth } from '@/context/AuthContext';
import HtmlContent from '@/components/Common/HtmlContent';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

// Define prop types
interface EmergencyRequestsTabProps {
    requests: BloodRequestDetail[];
    loading: boolean;
    checkInventory: (requestId: string) => Promise<any>;
    createFromInventory: (requestId: string, locationId: string, notes?: string, staffId?: string) => Promise<boolean>;
    createNeedingDonor: (requestId: string, locationId: string, notes?: string) => Promise<any>;
    refreshRequests: () => void;
}

// Maps urgency levels to colors
const urgencyColors = {
    Critical: 'red',
    High: 'orange',
    Medium: 'gold',
};

export default function EmergencyRequestsTab({
    requests,
    loading,
    checkInventory,
    createFromInventory,
    createNeedingDonor,
    refreshRequests,
}: EmergencyRequestsTabProps) {
    const { user } = useAuth();
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
        if (!selectedRequest || !user?.id) return;

        setActionLoading(true);
        try {
            const success = await createFromInventory(
                selectedRequest.id,
                selectedRequest.locationId,
                `EMERGENCY - Fulfilled from inventory for ${selectedRequest.patientName}`,
                user.id
            );

            if (success) {
                message.success('Emergency request fulfilled from inventory');
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
                `EMERGENCY - Need immediate donor for ${selectedRequest.patientName}`
            );

            if (result) {
                message.success('Emergency donation event created');
                setModalVisible(false);
                refreshRequests();
            }
        } catch (error) {
            console.error('Error creating donation event:', error);
            message.error('Failed to create emergency donation event');
        } finally {
            setActionLoading(false);
        }
    };

    const columns = [
        {
            title: 'Urgency',
            dataIndex: 'urgencyLevel',
            key: 'urgencyLevel',
            render: (urgency: string) => (
                <Tag color={urgencyColors[urgency as keyof typeof urgencyColors]} className="text-xs px-2 py-1">
                    {urgency}
                </Tag>
            ),
            sorter: (a: BloodRequestDetail, b: BloodRequestDetail) => {
                const urgencyOrder = { Critical: 3, High: 2, Medium: 1 };
                return urgencyOrder[a.urgencyLevel as keyof typeof urgencyOrder] - urgencyOrder[b.urgencyLevel as keyof typeof urgencyOrder];
            },
            defaultSortOrder: 'descend' as 'descend',
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
                        <div className="text-xs text-gray-500 mt-1">
                            {dayjs(record.createdAt).fromNow()}
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
                            loading={actionLoading && selectedRequest?.id === record.id}
                        >
                            Process Now
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
                    message="Emergency Requests"
                    description="These are urgent blood requests that need immediate attention. Process them as quickly as possible."
                    type="error"
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

            {/* Process Emergency Request Modal */}
            <Modal
                title={
                    <Title level={4} className="text-red-600">
                        <WarningOutlined className="mr-2" />
                        Process Emergency Blood Request
                    </Title>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={900}
                centered
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
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Text type="secondary">Patient:</Text>
                                                <div className="text-lg font-medium">{selectedRequest.patientName}</div>
                                            </div>
                                            <div>
                                                <Text type="secondary">Urgency:</Text>
                                                <div>
                                                    <Tag color={urgencyColors[selectedRequest.urgencyLevel as keyof typeof urgencyColors]}>
                                                        {selectedRequest.urgencyLevel}
                                                    </Tag>
                                                </div>
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
                                                <Text type="secondary">Hospital:</Text>
                                                <div className="text-lg font-medium">{selectedRequest.hospitalName}</div>
                                            </div>
                                            <div className="col-span-2">
                                                <Text type="secondary">Address:</Text>
                                                <div>{selectedRequest.address}</div>
                                            </div>
                                            {selectedRequest.medicalNotes && (
                                                <div className="col-span-2">
                                                    <Text type="secondary">Medical Notes:</Text>
                                                    <HtmlContent content={selectedRequest.medicalNotes} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Inventory Status */}
                                    <div className="border-t pt-4">
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
                                                        ? 'You can fulfill this request from inventory immediately.'
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
                                                    danger
                                                    onClick={handleCreateDonationEvent}
                                                    loading={actionLoading}
                                                >
                                                    Create Emergency Donation Event
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