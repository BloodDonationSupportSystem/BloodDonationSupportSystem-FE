'use client';

import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Select, DatePicker, Input, Card, Spin, Typography, Form, Modal, Descriptions, Empty, Divider, Alert } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined, PlusOutlined, CalendarOutlined, EditOutlined } from '@ant-design/icons';
import StaffLayout from '@/components/Layout/StaffLayout';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/api/apiConfig';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
    DonationEvent,
    DonationEventsParams,
    WalkInDonationRequest,
    createWalkInDonation
} from '@/services/api/donationEventService';
import { getUserLocations } from '@/services/api/locationService';

// Configure dayjs to use timezone
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh'); // Set Vietnam timezone

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function StaffDonationEventsPage() {
    const { user } = useAuth();
    const [donationEvents, setDonationEvents] = useState<DonationEvent[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filteredInfo, setFilteredInfo] = useState<any>({});
    const [sortedInfo, setSortedInfo] = useState<any>({});
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState<any>(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
    });
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [requestTypeFilter, setRequestTypeFilter] = useState<string | null>(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
    const [selectedEvent, setSelectedEvent] = useState<DonationEvent | null>(null);
    const [loadingEventDetail, setLoadingEventDetail] = useState<boolean>(false);

    // Walk-in donation states
    const [isWalkInModalVisible, setIsWalkInModalVisible] = useState<boolean>(false);
    const [walkInForm] = Form.useForm();
    const [creatingWalkIn, setCreatingWalkIn] = useState<boolean>(false);
    const [bloodGroups, setBloodGroups] = useState<any[]>([]);
    const [componentTypes, setComponentTypes] = useState<any[]>([]);
    const [staffLocation, setStaffLocation] = useState<any>(null);
    const [loadingInitialData, setLoadingInitialData] = useState<boolean>(false);

    // Donation process states
    const [isStartDonationModalVisible, setIsStartDonationModalVisible] = useState<boolean>(false);
    const [selectedDonationEventId, setSelectedDonationEventId] = useState<string>('');
    const [processingDonation, setProcessingDonation] = useState<boolean>(false);

    useEffect(() => {
        fetchDonationEvents();
    }, [pagination.current, pagination.pageSize, statusFilter, requestTypeFilter, dateRange]);

    // Fetch initial data for walk-in form
    useEffect(() => {
        if (isWalkInModalVisible) {
            fetchInitialData();
        }
    }, [isWalkInModalVisible]);

    const fetchInitialData = async () => {
        setLoadingInitialData(true);
        try {
            // Fetch blood groups
            const bloodGroupsResponse = await apiClient.get('/BloodGroups');
            if (bloodGroupsResponse.data.success) {
                setBloodGroups(bloodGroupsResponse.data.data);
            }

            // Fetch component types
            const componentTypesResponse = await apiClient.get('/ComponentTypes');
            if (componentTypesResponse.data.success) {
                setComponentTypes(componentTypesResponse.data.data);
            }

            // Fetch staff location
            if (user?.id) {
                const locationsResponse = await getUserLocations(user.id);
                if (locationsResponse.success && locationsResponse.data.length > 0) {
                    // Use the first location if staff is assigned to multiple locations
                    setStaffLocation(locationsResponse.data[0]);
                } else {
                    Modal.error({
                        title: 'Location Error',
                        content: 'You are not assigned to any location. Please contact an administrator.',
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        } finally {
            setLoadingInitialData(false);
        }
    };

    const fetchDonationEvents = async () => {
        setLoading(true);
        try {
            // Build query parameters
            const params: DonationEventsParams = {
                pageNumber: pagination.current,
                pageSize: pagination.pageSize,
                sortBy: sortedInfo.columnKey,
                sortAscending: sortedInfo.order === 'ascend'
            };

            // Add filters if they exist
            if (statusFilter) {
                params.status = statusFilter;
            }

            if (requestTypeFilter) {
                params.requestType = requestTypeFilter;
            }

            // Add date range if it exists
            if (dateRange && dateRange[0] && dateRange[1]) {
                params.startDate = dateRange[0].format('YYYY-MM-DD');
                params.endDate = dateRange[1].format('YYYY-MM-DD');
            }

            const response = await apiClient.get('/DonationEvents', { params });

            if (response.data.success) {
                setDonationEvents(response.data.data);
                setPagination({
                    ...pagination,
                    total: response.data.totalCount,
                    totalPages: response.data.totalPages
                });
            } else {
                console.error('Failed to fetch donation events:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching donation events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
        setPagination(prev => ({
            ...prev,
            current: pagination.current,
            pageSize: pagination.pageSize
        }));
    };

    const clearFilters = () => {
        setFilteredInfo({});
        setSearchText('');
        setDateRange(null);
        setStatusFilter(null);
        setRequestTypeFilter(null);
        setSortedInfo({});
        setPagination({
            ...pagination,
            current: 1
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'green';
            case 'in progress':
            case 'started':
                return 'blue';
            case 'checked in':
                return 'purple';
            case 'scheduled':
                return 'gold';
            case 'cancelled':
            case 'rejected':
            case 'failed':
                return 'red';
            default:
                return 'default';
        }
    };

    const getFilteredEvents = () => {
        if (!searchText) return donationEvents;

        const searchLower = searchText.toLowerCase();
        return donationEvents.filter(event =>
            (event.donorName && event.donorName.toLowerCase().includes(searchLower)) ||
            (event.donorEmail && event.donorEmail.toLowerCase().includes(searchLower)) ||
            (event.donorPhone && event.donorPhone.toLowerCase().includes(searchLower)) ||
            (event.locationName && event.locationName.toLowerCase().includes(searchLower)) ||
            (event.bloodGroupName && event.bloodGroupName.toLowerCase().includes(searchLower))
        );
    };

    const handleCreateWalkIn = async (values: any) => {
        setCreatingWalkIn(true);
        try {
            // Check if staff location is available
            if (!staffLocation || !staffLocation.id) {
                Modal.error({
                    title: 'Error',
                    content: 'Staff location information is not available. Please try again later.',
                });
                setCreatingWalkIn(false);
                return;
            }

            // Format the request body
            const requestBody: WalkInDonationRequest = {
                donorInfo: {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    phoneNumber: values.phoneNumber,
                    email: values.email,
                    bloodGroupId: values.bloodGroupId,
                    dateOfBirth: values.dateOfBirth?.toISOString(),
                    address: values.address,
                    lastDonationDate: values.lastDonationDate?.toISOString()
                },
                locationId: staffLocation.id,
                staffId: user?.id || '',
                componentTypeId: values.componentTypeId,
                notes: values.notes || "Walk-in donor"
            };

            // Check if staffId is available
            if (!requestBody.staffId) {
                Modal.error({
                    title: 'Error',
                    content: 'Staff ID is required. Please log in again.',
                });
                setCreatingWalkIn(false);
                return;
            }

            const response = await createWalkInDonation(requestBody);

            if (response.success) {
                // Reset form and close modal
                walkInForm.resetFields();
                setIsWalkInModalVisible(false);

                // Refresh donation events list
                fetchDonationEvents();

                // Show success message
                Modal.success({
                    title: 'Success',
                    content: 'Walk-in donation event created successfully',
                });
            } else {
                Modal.error({
                    title: 'Error',
                    content: response.message || 'Failed to create walk-in donation event',
                });
            }
        } catch (error: any) {
            console.error('Error creating walk-in donation event:', error);
            Modal.error({
                title: 'Error',
                content: error.response?.data?.message || 'Failed to create walk-in donation event',
            });
        } finally {
            setCreatingWalkIn(false);
        }
    };

    const viewEventDetails = async (eventId: string) => {
        setLoadingEventDetail(true);
        setIsDetailModalVisible(true);

        try {
            const response = await apiClient.get(`/DonationEvents/${eventId}`);

            if (response.data.success) {
                setSelectedEvent(response.data.data);
            } else {
                console.error('Failed to fetch donation event details:', response.data.message);
                setSelectedEvent(null);
            }
        } catch (error) {
            console.error('Error fetching donation event details:', error);
            setSelectedEvent(null);
        } finally {
            setLoadingEventDetail(false);
        }
    };

    // Handle starting donation process for walk-in events
    const startDonationProcess = (eventId: string) => {
        setSelectedDonationEventId(eventId);
        setIsStartDonationModalVisible(true);

        // Fetch the event details to show in the modal
        fetchEventForDonation(eventId);
    };

    // Fetch event details for donation process
    const fetchEventForDonation = async (eventId: string) => {
        setProcessingDonation(true);
        try {
            const response = await apiClient.get(`/DonationEvents/${eventId}`);

            if (response.data.success) {
                setSelectedEvent(response.data.data);
            } else {
                Modal.error({
                    title: 'Error',
                    content: 'Failed to fetch donation event details. Please try again.',
                });
            }
        } catch (error) {
            console.error('Error fetching event for donation:', error);
            Modal.error({
                title: 'Error',
                content: 'An error occurred while fetching event details.',
            });
        } finally {
            setProcessingDonation(false);
        }
    };

    // Navigate to donation workflow
    const navigateToDonationWorkflow = () => {
        if (selectedDonationEventId) {
            window.location.href = `/staff/donation-workflow/${selectedDonationEventId}`;
        }
    };

    const columns = [
        {
            title: 'Donor Name',
            dataIndex: 'donorName',
            key: 'donorName',
            sorter: true,
            sortOrder: sortedInfo.columnKey === 'donorName' && sortedInfo.order,
            render: (text: string, record: DonationEvent) => (
                <div className="max-w-[200px]">
                    <div className="font-medium truncate" title={text || 'Unknown'}>{text || 'Unknown'}</div>
                    {record.donorEmail && (
                        <div className="text-xs text-gray-500 truncate" title={record.donorEmail}>
                            <span className="mr-1">Email:</span>{record.donorEmail}
                        </div>
                    )}
                    {record.donorPhone && (
                        <div className="text-xs text-gray-500 truncate" title={record.donorPhone}>
                            <span className="mr-1">SĐT:</span>{record.donorPhone}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Blood Group',
            dataIndex: 'bloodGroupName',
            key: 'bloodGroupName',
            render: (text: string) => <Tag color="red">{text}</Tag>,
            filters: [
                { text: 'A+', value: 'A+' },
                { text: 'A-', value: 'A-' },
                { text: 'B+', value: 'B+' },
                { text: 'B-', value: 'B-' },
                { text: 'AB+', value: 'AB+' },
                { text: 'AB-', value: 'AB-' },
                { text: 'O+', value: 'O+' },
                { text: 'O-', value: 'O-' },
            ],
            filteredValue: filteredInfo.bloodGroupName || null,
            onFilter: (value: any, record: DonationEvent) => record.bloodGroupName === value,
        },
        {
            title: 'Component Type',
            dataIndex: 'componentTypeName',
            key: 'componentTypeName',
            render: (text: string) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Location',
            dataIndex: 'locationName',
            key: 'locationName',
            render: (text: string, record: DonationEvent) => (
                <div className="max-w-[200px]">
                    <div className="truncate">{text}</div>
                    {record.locationAddress && (
                        <div className="text-xs text-gray-500 truncate" title={record.locationAddress}>
                            {record.locationAddress}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Appointment Date',
            dataIndex: 'appointmentDate',
            key: 'appointmentDate',
            render: (text: string) => text ? dayjs(text).format('DD/MM/YYYY HH:mm') : 'N/A',
            sorter: true,
            sortOrder: sortedInfo.columnKey === 'appointmentDate' && sortedInfo.order,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: DonationEvent) => (
                <div>
                    <Tag color={getStatusColor(status)}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Tag>
                    {record.statusDescription && (
                        <div className="text-xs text-gray-500 mt-1">{record.statusDescription}</div>
                    )}
                </div>
            ),
        },
        {
            title: 'Donation Date',
            dataIndex: 'donationDate',
            key: 'donationDate',
            render: (text: string) => text ? dayjs(text).format('DD/MM/YYYY HH:mm') : 'N/A',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text: string, record: DonationEvent) => (
                <Space size="small">
                    <Button
                        size="small"
                        type="primary"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => viewEventDetails(record.id)}
                    >
                        View Details
                    </Button>

                    {/* Add Start Donation button for Walk-in events */}
                    {record.status === 'WalkIn' && (
                        <Button
                            size="small"
                            type="primary"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => startDonationProcess(record.id)}
                        >
                            Start Donation
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <StaffLayout title="Donation Events" breadcrumbItems={[{ title: 'Donation Events' }]}>
            <style jsx global>{`
                .responsive-descriptions .ant-descriptions-item-label, 
                .responsive-descriptions .ant-descriptions-item-content {
                    word-break: break-word;
                    white-space: normal;
                }
                .ant-table-cell {
                    white-space: normal;
                    word-break: break-word;
                }
                .ant-table-cell .truncate {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            `}</style>
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-semibold">Manage Donation Events</h2>
                        <p className="text-gray-500">View and track all donation events</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsWalkInModalVisible(true)}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        Create Walk-in Donation
                    </Button>
                </div>

                <Card className="mb-6">
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                            <RangePicker
                                style={{ width: '100%' }}
                                value={dateRange}
                                onChange={(dates) => setDateRange(dates)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <Select
                                style={{ width: 200 }}
                                placeholder="Filter by status"
                                allowClear
                                onChange={(value) => setStatusFilter(value)}
                                value={statusFilter}
                            >
                                <Option value="Scheduled">Scheduled</Option>
                                <Option value="CheckedIn">Checked In</Option>
                                <Option value="Started">Started</Option>
                                <Option value="Completed">Completed</Option>
                                <Option value="Failed">Failed</Option>
                                <Option value="Cancelled">Cancelled</Option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
                            <Select
                                style={{ width: 200 }}
                                placeholder="Filter by request type"
                                allowClear
                                onChange={(value) => setRequestTypeFilter(value)}
                                value={requestTypeFilter}
                            >
                                <Option value="Voluntary">Voluntary</Option>
                                <Option value="Emergency">Emergency</Option>
                                <Option value="Replacement">Replacement</Option>
                            </Select>
                        </div>
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <Input
                                placeholder="Search by donor name, email, phone, or location"
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                        <div className="self-end">
                            <Button icon={<ReloadOutlined />} onClick={clearFilters}>Reset Filters</Button>
                        </div>
                    </div>
                </Card>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Spin size="large" />
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={getFilteredEvents()}
                        rowKey="id"
                        onChange={handleTableChange}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} items`,
                        }}
                        scroll={{ x: 'max-content' }}
                        className="overflow-x-auto"
                    />
                )}
            </div>

            {/* Donation Event Detail Modal */}
            <Modal
                title={
                    <div className="flex items-center">
                        <CalendarOutlined className="mr-2" />
                        <span>Event Details</span>
                    </div>
                }
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={900}
                centered
            >
                {loadingEventDetail ? (
                    <div className="flex justify-center items-center py-10">
                        <Spin size="large" />
                    </div>
                ) : selectedEvent ? (
                    <div>
                        <Card className="mb-4">
                            <Descriptions
                                title="Thông tin người hiến máu"
                                bordered
                                column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
                                className="responsive-descriptions"
                            >
                                <Descriptions.Item label="Họ tên" span={2}>
                                    <strong>{selectedEvent.donorName || 'Không xác định'}</strong>
                                </Descriptions.Item>
                                <Descriptions.Item label="Email">
                                    {selectedEvent.donorEmail || 'Không có thông tin'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Số điện thoại">
                                    {selectedEvent.donorPhone || 'Không có thông tin'}
                                </Descriptions.Item>
                                <Descriptions.Item label="ID người hiến máu">
                                    {selectedEvent.donorId || 'Không có thông tin'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Nhóm máu">
                                    <Tag color="red">{selectedEvent.bloodGroupName || 'Chưa xác định'}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Loại hiến máu">
                                    <Tag color="blue">{selectedEvent.componentTypeName || 'Máu toàn phần'}</Tag>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <Card className="mb-4">
                            <Descriptions
                                title="Thông tin sự kiện hiến máu"
                                bordered
                                column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
                                className="responsive-descriptions"
                            >
                                <Descriptions.Item label="Mã sự kiện" span={2}>
                                    {selectedEvent.id}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    <Tag color={getStatusColor(selectedEvent.status)}>
                                        {selectedEvent.status}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Loại yêu cầu">
                                    {selectedEvent.requestType}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày hẹn">
                                    {selectedEvent.appointmentDate ?
                                        dayjs(selectedEvent.appointmentDate).format('DD/MM/YYYY HH:mm') :
                                        'Không có thông tin'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Địa điểm hẹn">
                                    {selectedEvent.appointmentLocation || 'Không có thông tin'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Cơ sở y tế">
                                    {selectedEvent.locationName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Địa chỉ">
                                    {selectedEvent.locationAddress || 'Không có thông tin'}
                                </Descriptions.Item>
                                {/* <Descriptions.Item label="Nhân viên phụ trách">
                                    {selectedEvent.staffName || 'Chưa phân công'}
                                </Descriptions.Item> */}
                                <Descriptions.Item label="Ghi chú">
                                    {selectedEvent.notes || 'Không có ghi chú'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Thời gian check-in">
                                    {selectedEvent.checkInTime ?
                                        dayjs(selectedEvent.checkInTime).format('DD/MM/YYYY HH:mm') :
                                        'Chưa check-in'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Thời gian bắt đầu hiến">
                                    {selectedEvent.donationStartTime ?
                                        dayjs(selectedEvent.donationStartTime).format('DD/MM/YYYY HH:mm') :
                                        'Chưa bắt đầu'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Thời gian hoàn thành">
                                    {selectedEvent.completedTime ?
                                        dayjs(selectedEvent.completedTime).format('DD/MM/YYYY HH:mm') :
                                        'Chưa hoàn thành'}
                                </Descriptions.Item>
                                {/* {selectedEvent.deletedTime && (
                                    <Descriptions.Item label="Thời gian xóa">
                                        {dayjs(selectedEvent.deletedTime).format('DD/MM/YYYY HH:mm')}
                                    </Descriptions.Item>
                                )}
                                <Descriptions.Item label="Thời gian tạo">
                                    {dayjs(selectedEvent.createdTime).format('DD/MM/YYYY HH:mm')}
                                </Descriptions.Item>
                                <Descriptions.Item label="Cập nhật lần cuối">
                                    {dayjs(selectedEvent.lastUpdatedTime).format('DD/MM/YYYY HH:mm')}
                                </Descriptions.Item> */}
                            </Descriptions>
                        </Card>

                        {(selectedEvent.bloodPressure || selectedEvent.temperature || selectedEvent.hemoglobinLevel || selectedEvent.weight || selectedEvent.height) && (
                            <Card className="mb-4">
                                <Descriptions
                                    title="Thông tin kiểm tra sức khỏe"
                                    bordered
                                    column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
                                    className="responsive-descriptions"
                                >
                                    {selectedEvent.bloodPressure && (
                                        <Descriptions.Item label="Huyết áp">
                                            {selectedEvent.bloodPressure}
                                        </Descriptions.Item>
                                    )}
                                    {selectedEvent.temperature && (
                                        <Descriptions.Item label="Nhiệt độ">
                                            {selectedEvent.temperature}°C
                                        </Descriptions.Item>
                                    )}
                                    {selectedEvent.hemoglobinLevel && (
                                        <Descriptions.Item label="Mức hemoglobin">
                                            {selectedEvent.hemoglobinLevel} g/dL
                                        </Descriptions.Item>
                                    )}
                                    {selectedEvent.weight && (
                                        <Descriptions.Item label="Cân nặng">
                                            {selectedEvent.weight} kg
                                        </Descriptions.Item>
                                    )}
                                    {selectedEvent.height && (
                                        <Descriptions.Item label="Chiều cao">
                                            {selectedEvent.height} cm
                                        </Descriptions.Item>
                                    )}
                                    {selectedEvent.medicalNotes && (
                                        <Descriptions.Item label="Ghi chú y tế" span={2}>
                                            {selectedEvent.medicalNotes}
                                        </Descriptions.Item>
                                    )}
                                </Descriptions>
                            </Card>
                        )}

                        {(selectedEvent.donationDate || selectedEvent.quantityDonated) && (
                            <Card className="mb-4">
                                <Descriptions
                                    title="Thông tin hiến máu"
                                    bordered
                                    column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
                                    className="responsive-descriptions"
                                >
                                    {selectedEvent.donationDate && (
                                        <Descriptions.Item label="Ngày hiến máu">
                                            {dayjs(selectedEvent.donationDate).format('DD/MM/YYYY HH:mm')}
                                        </Descriptions.Item>
                                    )}
                                    {selectedEvent.quantityDonated && (
                                        <Descriptions.Item label="Lượng máu hiến">
                                            {selectedEvent.quantityDonated} {selectedEvent.quantityUnits ? `(${selectedEvent.quantityUnits} đơn vị)` : 'ml'}
                                        </Descriptions.Item>
                                    )}
                                    {selectedEvent.isUsable !== undefined && (
                                        <Descriptions.Item label="Có thể sử dụng">
                                            {selectedEvent.isUsable ?
                                                <Tag color="green">Có</Tag> :
                                                <Tag color="red">Không</Tag>}
                                        </Descriptions.Item>
                                    )}
                                </Descriptions>
                            </Card>
                        )}

                        {(selectedEvent.complicationType || selectedEvent.complicationDetails) && (
                            <Card>
                                <Descriptions
                                    title="Thông tin biến chứng"
                                    bordered
                                    column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
                                    className="responsive-descriptions"
                                >
                                    {selectedEvent.complicationType && (
                                        <Descriptions.Item label="Loại biến chứng">
                                            {selectedEvent.complicationType}
                                        </Descriptions.Item>
                                    )}
                                    {selectedEvent.complicationDetails && (
                                        <Descriptions.Item label="Chi tiết biến chứng">
                                            {selectedEvent.complicationDetails}
                                        </Descriptions.Item>
                                    )}
                                    {selectedEvent.actionTaken && (
                                        <Descriptions.Item label="Hành động đã thực hiện">
                                            {selectedEvent.actionTaken}
                                        </Descriptions.Item>
                                    )}
                                </Descriptions>
                            </Card>
                        )}
                    </div>
                ) : (
                    <Empty description="Không tìm thấy thông tin sự kiện hiến máu" />
                )}
            </Modal>

            {/* Walk-in Donation Modal */}
            <Modal
                title={
                    <div className="flex items-center">
                        <PlusOutlined className="mr-2" />
                        <span>Create Donation Event</span>
                    </div>
                }
                open={isWalkInModalVisible}
                onCancel={() => setIsWalkInModalVisible(false)}
                footer={null}
                width={900}
                centered
            >
                <Spin spinning={loadingInitialData || creatingWalkIn}>
                    <Form
                        form={walkInForm}
                        layout="vertical"
                        onFinish={handleCreateWalkIn}
                        initialValues={{
                            dateOfBirth: null,
                            lastDonationDate: null
                        }}
                    >
                        <div className="mb-4">
                            <Title level={5}>Donor Information</Title>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item
                                label="First Name"
                                name="firstName"
                                rules={[{ required: true, message: 'Please enter first name' }]}
                            >
                                <Input placeholder="Enter first name" />
                            </Form.Item>

                            <Form.Item
                                label="Last Name"
                                name="lastName"
                                rules={[{ required: true, message: 'Please enter last name' }]}
                            >
                                <Input placeholder="Enter last name" />
                            </Form.Item>

                            <Form.Item
                                label="Phone Number"
                                name="phoneNumber"
                                rules={[
                                    { required: true, message: 'Please enter phone number' },
                                    { pattern: /^[0-9]{10,11}$/, message: 'Please enter a valid phone number' }
                                ]}
                            >
                                <Input placeholder="Enter phone number" />
                            </Form.Item>

                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { type: 'email', message: 'Please enter a valid email' }
                                ]}
                            >
                                <Input placeholder="Enter email (optional)" />
                            </Form.Item>

                            <Form.Item
                                label="Date of Birth"
                                name="dateOfBirth"
                                rules={[{ required: true, message: 'Please select date of birth' }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    placeholder="Select date of birth"
                                    disabledDate={(current) => {
                                        // Disable dates less than 18 years ago and future dates
                                        return (
                                            current &&
                                            (current > dayjs().endOf('day') ||
                                                current > dayjs().subtract(18, 'years'))
                                        );
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Blood Group"
                                name="bloodGroupId"
                                rules={[{ required: true, message: 'Please select blood group' }]}
                            >
                                <Select placeholder="Select blood group">
                                    {bloodGroups.map(group => (
                                        <Option key={group.id} value={group.id}>
                                            {group.groupName} - {group.description}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Address"
                                name="address"
                            >
                                <Input.TextArea rows={2} placeholder="Enter address (optional)" />
                            </Form.Item>

                            <Form.Item
                                label="Last Donation Date"
                                name="lastDonationDate"
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    placeholder="Select last donation date (if any)"
                                    disabledDate={current => current && current > dayjs().endOf('day')}
                                />
                            </Form.Item>
                        </div>

                        <Divider />

                        <div className="mb-4">
                            <Title level={5}>Donation Information</Title>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item
                                label="Component Type"
                                name="componentTypeId"
                                rules={[{ required: true, message: 'Please select component type' }]}
                            >
                                <Select placeholder="Select component type">
                                    {componentTypes.map(type => (
                                        <Option key={type.id} value={type.id}>
                                            {type.name} (Shelf Life: {type.shelfLifeDays} days)
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Location"
                            >
                                <Input
                                    value={staffLocation?.name}
                                    disabled
                                    addonAfter={<Tag color="blue">Your location</Tag>}
                                />
                                {staffLocation?.address && (
                                    <div className="text-xs text-gray-500 mt-1">{staffLocation.address}</div>
                                )}
                            </Form.Item>

                            <Form.Item
                                label="Notes"
                                name="notes"
                                className="col-span-1 md:col-span-2"
                            >
                                <Input.TextArea rows={3} placeholder="Enter any additional notes" />
                            </Form.Item>
                        </div>

                        <div className="flex justify-end mt-4">
                            <Button
                                type="default"
                                onClick={() => setIsWalkInModalVisible(false)}
                                className="mr-2"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={creatingWalkIn}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Create Walk-in Donation
                            </Button>
                        </div>
                    </Form>
                </Spin>
            </Modal>

            {/* Start Donation Process Modal */}
            <Modal
                title="Start Donation Process"
                open={isStartDonationModalVisible}
                onCancel={() => setIsStartDonationModalVisible(false)}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => setIsStartDonationModalVisible(false)}
                    >
                        Cancel
                    </Button>,
                    <Button
                        key="start"
                        type="primary"
                        loading={processingDonation}
                        onClick={navigateToDonationWorkflow}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        Start Donation Process
                    </Button>
                ]}
                bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
            >
                <Spin spinning={processingDonation}>
                    {selectedEvent && (
                        <div>
                            <p className="mb-4">
                                You are about to start the donation process for:
                            </p>
                            <Descriptions
                                bordered
                                column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
                                size="small"
                                className="responsive-descriptions"
                            >
                                <Descriptions.Item label="Donor Name">
                                    <strong>{selectedEvent.donorName || 'Unknown'}</strong>
                                </Descriptions.Item>
                                <Descriptions.Item label="Blood Group">
                                    <Tag color="red">{selectedEvent.bloodGroupName}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Component Type">
                                    <Tag color="blue">{selectedEvent.componentTypeName}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Location">
                                    {selectedEvent.locationName}
                                </Descriptions.Item>
                            </Descriptions>

                            <Alert
                                className="mt-4"
                                message="Donation Process Steps"
                                description={
                                    <ol className="list-decimal ml-4">
                                        <li>Health check and eligibility verification</li>
                                        <li>Blood donation procedure</li>
                                        <li>Post-donation care and completion</li>
                                    </ol>
                                }
                                type="info"
                                showIcon
                            />
                        </div>
                    )}
                </Spin>
            </Modal>
        </StaffLayout>
    );
} 