'use client';

import React, { useState } from 'react';
import { Table, Button, Tag, Badge, Space, Modal, Typography, Card, Divider, Alert, message, Spin, List, Avatar, Input, Descriptions } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, WarningOutlined, PhoneOutlined, InfoCircleOutlined, UserOutlined, SearchOutlined, EnvironmentOutlined, CloseCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { BloodRequestDetail, checkInventory, fulfillFromInventory, InventoryCheckResponse, updateRequestStatus } from '@/services/api/bloodRequestService';
import { getNearbyEmergencyDonors, DonorProfile } from '@/services/api/donorProfileService';
import { StaffAssignmentRequest } from '@/services/api/donationAppointmentService';
import * as donationAppointmentService from '@/services/api/donationAppointmentService';
import { useAuth } from '@/context/AuthContext';
import HtmlContent from '@/components/Common/HtmlContent';

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

// Define status colors
const statusColors: Record<string, string> = {
    'Pending': 'blue',
    'Processing': 'orange',
    'Fulfilled': 'green',
    'Picked Up': 'green',
    'Cancelled': 'red',
    'Expired': 'gray',
    'Failed': 'red',
};

export default function EmergencyRequestList({
    requests,
    pagination,
    onRefresh,
    onPageChange
}: EmergencyRequestListProps) {
    const { user } = useAuth();
    const [selectedRequest, setSelectedRequest] = useState<BloodRequestDetail | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [processModalVisible, setProcessModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [inventoryChecking, setInventoryChecking] = useState(false);
    const [inventoryData, setInventoryData] = useState<InventoryCheckResponse | null>(null);

    // New state for donor search
    const [donorSearchModalVisible, setDonorSearchModalVisible] = useState(false);
    const [searchingDonors, setSearchingDonors] = useState(false);
    const [nearbyDonors, setNearbyDonors] = useState<DonorProfile[]>([]);
    const [selectedDonors, setSelectedDonors] = useState<DonorProfile[]>([]);
    const [radiusKm, setRadiusKm] = useState<number>(50);
    const [assigningDonors, setAssigningDonors] = useState(false);

    // New state for status update
    const [statusUpdateModalVisible, setStatusUpdateModalVisible] = useState(false);
    const [statusUpdateNotes, setStatusUpdateNotes] = useState('');
    const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
    const [statusToUpdate, setStatusToUpdate] = useState<'Picked Up' | 'Cancelled' | null>(null);

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
        if (!selectedRequest || !user?.id) return;

        setLoading(true);

        try {
            // Call the API to fulfill the request from inventory
            const response = await fulfillFromInventory(
                selectedRequest.id,
                user.id,
                `Emergency request processed by ${user.firstName} ${user.lastName}`
            );

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

        setDonorSearchModalVisible(true);
        await searchForNearbyDonors(selectedRequest);
    };

    // Search for nearby donors
    const searchForNearbyDonors = async (request: BloodRequestDetail) => {
        setSearchingDonors(true);
        setNearbyDonors([]);
        setSelectedDonors([]);

        try {
            const response = await getNearbyEmergencyDonors(
                request.latitude,
                request.longitude,
                request.bloodGroupId,
                radiusKm,
                true, // isAvailable
                true  // isAvailableForEmergency
            );

            if (response.success && response.data) {
                setNearbyDonors(response.data);
                console.log('Found nearby donors:', response.data.length);
            } else {
                message.warning('No eligible donors found in the area');
                console.error('Failed to find donors:', response.message);
            }
        } catch (error) {
            console.error('Error searching for donors:', error);
            message.error('Failed to search for donors');
        } finally {
            setSearchingDonors(false);
        }
    };

    // Toggle donor selection
    const toggleDonorSelection = (donor: DonorProfile) => {
        if (selectedDonors.some(d => d.id === donor.id)) {
            setSelectedDonors(selectedDonors.filter(d => d.id !== donor.id));
        } else {
            setSelectedDonors([...selectedDonors, donor]);
        }
    };

    // Assign selected donors
    const assignSelectedDonors = async () => {
        if (!selectedRequest || selectedDonors.length === 0) {
            message.warning('Please select at least one donor');
            return;
        }

        setAssigningDonors(true);
        let successCount = 0;
        let failCount = 0;

        try {
            // Create appointment requests for each selected donor
            for (const donor of selectedDonors) {
                const appointmentRequest: StaffAssignmentRequest = {
                    donorId: donor.userId,
                    preferredDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
                    preferredTimeSlot: 'Morning', // Default time slot
                    locationId: selectedRequest.locationId,
                    bloodGroupId: donor.bloodGroupId || selectedRequest.bloodGroupId,
                    componentTypeId: selectedRequest.componentTypeId,
                    notes: `Emergency request for patient: ${selectedRequest.patientName}. Blood request ID: ${selectedRequest.id}`,
                    isUrgent: true,
                    priority: 3, // High priority
                    autoExpireHours: 24 // Expire after 24 hours if no response
                };

                try {
                    const response = await donationAppointmentService.createStaffAssignment(appointmentRequest);
                    if (response.success) {
                        successCount++;
                    } else {
                        failCount++;
                        console.error('Failed to create appointment for donor:', donor.userName, response.message);
                    }
                } catch (error) {
                    failCount++;
                    console.error('Error creating appointment for donor:', donor.userName, error);
                }
            }

            if (successCount > 0) {
                // Update the blood request status to Processing
                const updateResponse = await updateRequestStatus(selectedRequest.id, {
                    status: 'Processing',
                    notes: `Donors have been identified and appointment requests sent to ${successCount} donors`
                });

                if (updateResponse.success) {
                    message.success(`Successfully sent appointment requests to ${successCount} donors`);
                    setDonorSearchModalVisible(false);
                    onRefresh(); // Refresh the list to show updated status
                } else {
                    message.warning('Appointments created but failed to update request status');
                }
            } else {
                message.error('Failed to create any appointment requests');
            }
        } catch (error) {
            console.error('Error assigning donors:', error);
            message.error('Failed to assign donors');
        } finally {
            setAssigningDonors(false);
        }
    };

    // Mark request as fulfilled
    const markRequestAsFulfilled = async () => {
        if (!selectedRequest) return;

        setLoading(true);
        try {
            const response = await updateRequestStatus(selectedRequest.id, {
                status: 'Fulfilled',
                notes: 'Required blood units collected from donors'
            });

            if (response.success) {
                message.success('Blood request marked as fulfilled');
                setDonorSearchModalVisible(false);
                onRefresh(); // Refresh the list
            } else {
                message.error('Failed to update request status');
            }
        } catch (error) {
            console.error('Error updating request status:', error);
            message.error('Failed to update request status');
        } finally {
            setLoading(false);
        }
    };

    // Handle showing status update modal
    const showStatusUpdateModal = (request: BloodRequestDetail, status: 'Picked Up' | 'Cancelled') => {
        setSelectedRequest(request);
        setStatusToUpdate(status);
        setStatusUpdateModalVisible(true);
    };

    // Handle updating request status to Picked Up or Cancelled
    const handleUpdateStatus = async () => {
        if (!selectedRequest || !statusToUpdate) return;

        setStatusUpdateLoading(true);
        try {
            const response = await updateRequestStatus(selectedRequest.id, {
                status: statusToUpdate,
                notes: statusUpdateNotes || `Emergency request ${statusToUpdate.toLowerCase()} by staff`,
                isActive: statusToUpdate === 'Cancelled' ? false : true,
                isPickedUp: statusToUpdate === 'Picked Up' ? true : false,
                pickupNotes: statusToUpdate === 'Picked Up' ? statusUpdateNotes : undefined
            });

            if (response.success) {
                message.success(`Emergency request marked as ${statusToUpdate.toLowerCase()}`);
                setStatusUpdateModalVisible(false);
                setStatusUpdateNotes('');
                onRefresh(); // Refresh the list
            } else {
                message.error(`Failed to update request status to ${statusToUpdate}`);
            }
        } catch (error) {
            console.error('Error updating request status:', error);
            message.error('Failed to update request status');
        } finally {
            setStatusUpdateLoading(false);
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
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: BloodRequestDetail) => (
                <div>
                    <Tag color={statusColors[status] || 'default'}>
                        {status}
                    </Tag>
                    <div className="text-xs text-gray-500 mt-1">
                        {dayjs(record.createdTime).fromNow()}
                    </div>
                </div>
            ),
            filters: [
                { text: 'Pending', value: 'Pending' },
                { text: 'Processing', value: 'Processing' },
                { text: 'Fulfilled', value: 'Fulfilled' },
                { text: 'Picked Up', value: 'Picked Up' },
                { text: 'Cancelled', value: 'Cancelled' },
            ],
            onFilter: (value: any, record: BloodRequestDetail) => record.status === value,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: BloodRequestDetail) => (
                <Space size="small">
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => handleViewDetails(record)}
                    >
                        Details
                    </Button>

                    {record.status === 'Pending' && (
                        <Button
                            type="primary"
                            danger
                            size="small"
                            onClick={() => handleProcessRequest(record)}
                        >
                            Process Now
                        </Button>
                    )}

                    {record.status === 'Fulfilled' && (
                        <>
                            <Button
                                type="primary"
                                size="small"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => showStatusUpdateModal(record, 'Picked Up')}
                            >
                                Pick Up
                            </Button>
                            <Button
                                type="primary"
                                danger
                                size="small"
                                onClick={() => showStatusUpdateModal(record, 'Cancelled')}
                            >
                                Cancel
                            </Button>
                        </>
                    )}
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
                    type="warning"
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
                    <div className="p-4">
                        <div className="mb-4">
                            <Alert
                                message={
                                    <span className="flex items-center">
                                        <Tag color={urgencyColors[selectedRequest.urgencyLevel as keyof typeof urgencyColors]}>
                                            {selectedRequest.urgencyLevel}
                                        </Tag>
                                        <span className="ml-2">Emergency Blood Request</span>
                                    </span>
                                }
                                description={`Patient: ${selectedRequest.patientName}`}
                                type="error"
                                showIcon
                            />
                        </div>

                        <Card className="mb-4">
                            <Descriptions title="Request Details" bordered column={2}>
                                <Descriptions.Item label="Blood Group">{selectedRequest.bloodGroupName}</Descriptions.Item>
                                <Descriptions.Item label="Component">{selectedRequest.componentTypeName}</Descriptions.Item>
                                <Descriptions.Item label="Quantity">{selectedRequest.quantityUnits} unit(s)</Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    <Tag color={statusColors[selectedRequest.status]}>{selectedRequest.status}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Hospital">{selectedRequest.hospitalName}</Descriptions.Item>
                                <Descriptions.Item label="Contact">{selectedRequest.contactInfo}</Descriptions.Item>
                                <Descriptions.Item label="Address" span={2}>{selectedRequest.address}</Descriptions.Item>
                                {selectedRequest.medicalNotes && (
                                    <Descriptions.Item label="Medical Notes" span={2}>
                                        <HtmlContent content={selectedRequest.medicalNotes} />
                                    </Descriptions.Item>
                                )}
                                {selectedRequest.fulfilledDate && (
                                    <Descriptions.Item label="Fulfilled Date">{dayjs(selectedRequest.fulfilledDate).format('MMM D, YYYY HH:mm')}</Descriptions.Item>
                                )}
                                {selectedRequest.fulfilledByStaffName && (
                                    <Descriptions.Item label="Fulfilled By">{selectedRequest.fulfilledByStaffName}</Descriptions.Item>
                                )}
                                {selectedRequest.isPickedUp !== undefined && (
                                    <Descriptions.Item label="Picked Up">
                                        {selectedRequest.isPickedUp ?
                                            <Tag color="green">Yes</Tag> :
                                            <Tag color="orange">No</Tag>
                                        }
                                    </Descriptions.Item>
                                )}
                                {selectedRequest.pickupDate && (
                                    <Descriptions.Item label="Pickup Date">{dayjs(selectedRequest.pickupDate).format('MMM D, YYYY HH:mm')}</Descriptions.Item>
                                )}
                                {selectedRequest.pickupNotes && (
                                    <Descriptions.Item label="Pickup Notes" span={2}>{selectedRequest.pickupNotes}</Descriptions.Item>
                                )}
                            </Descriptions>
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

            {/* Donor Search Modal */}
            <Modal
                title={
                    <div className="flex items-center">
                        <SearchOutlined className="mr-2 text-blue-600" />
                        Search for Emergency Donors
                    </div>
                }
                open={donorSearchModalVisible}
                onCancel={() => setDonorSearchModalVisible(false)}
                width={800}
                footer={[
                    <Button key="cancel" onClick={() => setDonorSearchModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button
                        key="search"
                        type="primary"
                        icon={<SearchOutlined />}
                        loading={searchingDonors}
                        onClick={() => selectedRequest && searchForNearbyDonors(selectedRequest)}
                    >
                        Refresh Search
                    </Button>,
                    <Button
                        key="assign"
                        type="primary"
                        danger
                        disabled={selectedDonors.length === 0}
                        loading={assigningDonors}
                        onClick={assignSelectedDonors}
                    >
                        Assign {selectedDonors.length} Donor(s)
                    </Button>,
                    <Button
                        key="fulfill"
                        type="primary"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={markRequestAsFulfilled}
                    >
                        Mark as Fulfilled
                    </Button>
                ]}
            >
                {selectedRequest && (
                    <div className="mb-4">
                        <Alert
                            message={`Emergency Blood Request for ${selectedRequest.patientName}`}
                            description={
                                <div>
                                    <p><strong>Blood Group:</strong> {selectedRequest.bloodGroupName}</p>
                                    <p><strong>Component Type:</strong> {selectedRequest.componentTypeName}</p>
                                    <p><strong>Units Required:</strong> {selectedRequest.quantityUnits}</p>
                                    <p><strong>Hospital:</strong> {selectedRequest.hospitalName}</p>
                                </div>
                            }
                            type="error"
                            showIcon
                        />
                    </div>
                )}

                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <div className="font-medium">Search Radius (km):</div>
                        <div>
                            <Space>
                                <Button
                                    size="small"
                                    onClick={() => setRadiusKm(Math.max(10, radiusKm - 10))}
                                    disabled={radiusKm <= 10}
                                >
                                    -
                                </Button>
                                <span className="mx-2">{radiusKm} km</span>
                                <Button
                                    size="small"
                                    onClick={() => setRadiusKm(Math.min(100, radiusKm + 10))}
                                    disabled={radiusKm >= 100}
                                >
                                    +
                                </Button>
                            </Space>
                        </div>
                    </div>
                </div>

                {searchingDonors ? (
                    <div className="text-center py-10">
                        <Spin size="large" />
                        <div className="mt-4">Searching for nearby donors...</div>
                    </div>
                ) : nearbyDonors.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="text-gray-500">No eligible donors found within {radiusKm} km</div>
                        <Button
                            type="primary"
                            className="mt-4"
                            onClick={() => selectedRequest && searchForNearbyDonors(selectedRequest)}
                        >
                            Try Again
                        </Button>
                    </div>
                ) : (
                    <div>
                        <div className="mb-4 flex justify-between items-center">
                            <div className="font-medium">Found {nearbyDonors.length} eligible donor(s)</div>
                            <div>
                                <Button
                                    size="small"
                                    type={selectedDonors.length === nearbyDonors.length ? "primary" : "default"}
                                    onClick={() => {
                                        if (selectedDonors.length === nearbyDonors.length) {
                                            setSelectedDonors([]);
                                        } else {
                                            setSelectedDonors([...nearbyDonors]);
                                        }
                                    }}
                                >
                                    {selectedDonors.length === nearbyDonors.length ? "Deselect All" : "Select All"}
                                </Button>
                            </div>
                        </div>

                        <List
                            itemLayout="horizontal"
                            dataSource={nearbyDonors}
                            renderItem={donor => (
                                <List.Item
                                    key={donor.id}
                                    className={`cursor-pointer transition-all border-l-4 ${selectedDonors.some(d => d.id === donor.id)
                                        ? 'border-red-600 bg-red-50'
                                        : 'border-transparent hover:bg-gray-50'
                                        }`}
                                    onClick={() => toggleDonorSelection(donor)}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar icon={<UserOutlined />} className="bg-red-500" />
                                        }
                                        title={
                                            <div className="flex justify-between">
                                                <span>{donor.firstName} {donor.lastName}</span>
                                                <Tag color="red">{donor.bloodGroupName}</Tag>
                                            </div>
                                        }
                                        description={
                                            <div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div><PhoneOutlined className="mr-1" /> {donor.phoneNumber}</div>
                                                    <div><EnvironmentOutlined className="mr-1" /> {donor.distanceKm.toFixed(1)} km away</div>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Last donation: {donor.lastDonationDate ? dayjs(donor.lastDonationDate).format('MMM D, YYYY') : 'Never'}
                                                </div>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                )}
            </Modal>

            {/* Status Update Modal */}
            <Modal
                title={
                    <div className="flex items-center">
                        {statusToUpdate === 'Picked Up' ? (
                            <CheckCircleOutlined className="mr-2 text-green-600" />
                        ) : (
                            <CloseCircleOutlined className="mr-2 text-red-600" />
                        )}
                        {statusToUpdate === 'Picked Up' ? 'Pick Up Emergency Request' : 'Cancel Emergency Request'}
                    </div>
                }
                open={statusUpdateModalVisible}
                onCancel={() => setStatusUpdateModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setStatusUpdateModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={statusUpdateLoading}
                        onClick={handleUpdateStatus}
                        className={statusToUpdate === 'Picked Up' ? 'bg-green-600 hover:bg-green-700' : ''}
                        danger={statusToUpdate === 'Cancelled'}
                    >
                        {statusToUpdate === 'Picked Up' ? 'Mark as Picked Up' : 'Mark as Cancelled'}
                    </Button>,
                ]}
            >
                <div className="mb-4">
                    {statusToUpdate === 'Picked Up' ? (
                        <Alert
                            message="Pick Up Emergency Request"
                            description="Mark this emergency request as picked up when the recipient has picked up the blood units."
                            type="success"
                            showIcon
                            className="mb-4"
                        />
                    ) : (
                        <Alert
                            message="Cancel Emergency Request"
                            description="Mark this emergency request as cancelled if the recipient did not arrive or the blood units were not used."
                            type="error"
                            showIcon
                            className="mb-4"
                        />
                    )}
                </div>

                {selectedRequest && (
                    <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <div className="font-medium mb-2">Request Details:</div>
                        <div><strong>Patient:</strong> {selectedRequest.patientName}</div>
                        <div><strong>Blood Group:</strong> {selectedRequest.bloodGroupName}</div>
                        <div><strong>Component:</strong> {selectedRequest.componentTypeName}</div>
                        <div><strong>Units:</strong> {selectedRequest.quantityUnits}</div>
                        <div><strong>Hospital:</strong> {selectedRequest.hospitalName || 'Not specified'}</div>
                    </div>
                )}

                <div className="mb-4">
                    <div className="mb-2">Notes (optional):</div>
                    <Input.TextArea
                        rows={4}
                        placeholder="Enter any additional notes about this status change..."
                        value={statusUpdateNotes}
                        onChange={(e) => setStatusUpdateNotes(e.target.value)}
                    />
                </div>
            </Modal>
        </div>
    );
} 