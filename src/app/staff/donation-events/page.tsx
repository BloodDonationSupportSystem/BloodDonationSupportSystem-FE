'use client';

import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Select, DatePicker, Input, Card, Spin, Typography, Form, Modal, Descriptions, Empty } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import StaffLayout from '@/components/Layout/StaffLayout';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/api/apiConfig';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { DonationEvent, DonationEventsParams } from '@/services/api/donationEventService';

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

    useEffect(() => {
        fetchDonationEvents();
    }, [pagination.current, pagination.pageSize, statusFilter, requestTypeFilter, dateRange]);

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

    const columns = [
        {
            title: 'Donor Name',
            dataIndex: 'donorName',
            key: 'donorName',
            sorter: true,
            sortOrder: sortedInfo.columnKey === 'donorName' && sortedInfo.order,
            render: (text: string, record: DonationEvent) => (
                <div>
                    <div className="font-medium">{text || 'Unknown'}</div>
                    {record.donorEmail && (
                        <div className="text-xs text-gray-500">
                            <span className="mr-1">Email:</span>{record.donorEmail}
                        </div>
                    )}
                    {record.donorPhone && (
                        <div className="text-xs text-gray-500">
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
                <div>
                    <div>{text}</div>
                    {record.locationAddress && (
                        <div className="text-xs text-gray-500">{record.locationAddress}</div>
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
                </Space>
            ),
        },
    ];

    return (
        <StaffLayout title="Donation Events" breadcrumbItems={[{ title: 'Donation Events' }]}>
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-semibold">Manage Donation Events</h2>
                        <p className="text-gray-500">View and track all donation events</p>
                    </div>
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
                    />
                )}
            </div>

            {/* Donation Event Detail Modal */}
            <Modal
                title="Chi tiết sự kiện hiến máu"
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={800}
            >
                {loadingEventDetail ? (
                    <div className="flex justify-center items-center py-10">
                        <Spin size="large" />
                    </div>
                ) : selectedEvent ? (
                    <div>
                        <Card className="mb-4">
                            <Descriptions title="Thông tin người hiến máu" bordered column={2}>
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
                            <Descriptions title="Thông tin sự kiện hiến máu" bordered column={2}>
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
                                <Descriptions title="Thông tin kiểm tra sức khỏe" bordered column={2}>
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
                                <Descriptions title="Thông tin hiến máu" bordered column={2}>
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
                                <Descriptions title="Thông tin biến chứng" bordered column={1}>
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
        </StaffLayout>
    );
} 