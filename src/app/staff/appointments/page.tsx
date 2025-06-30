'use client';

import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Select, DatePicker, Input, Card, Tabs, Modal, Form, Spin, Tooltip, App } from 'antd';
import { SearchOutlined, CheckOutlined, CloseOutlined, CalendarOutlined, ExclamationCircleOutlined, ClockCircleOutlined, InfoCircleOutlined, UserOutlined } from '@ant-design/icons';
import StaffLayout from '@/components/Layout/StaffLayout';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/api/apiConfig';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useRouter } from 'next/navigation';

// Configure dayjs to use timezone
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh'); // Set Vietnam timezone

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { confirm } = Modal;
const { TextArea } = Input;

// Interface for appointment data from API
interface AppointmentRequest {
  id: string;
  donorId: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  preferredDate: string;
  preferredTimeSlot: string;
  locationId: string;
  locationName: string;
  locationAddress: string;
  bloodGroupId: string | null;
  bloodGroupName: string | null;
  componentTypeId: string | null;
  componentTypeName: string | null;
  requestType: string;
  initiatedByUserId: string;
  initiatedByUserName: string;
  status: string;
  notes: string;
  rejectionReason: string | null;
  reviewedByUserId: string | null;
  reviewedByUserName: string | null;
  reviewedAt: string | null;
  confirmedDate: string | null;
  confirmedTimeSlot: string | null;
  confirmedLocationId: string | null;
  confirmedLocationName: string | null;
  donorAccepted: boolean | null;
  donorResponseAt: string | null;
  donorResponseNotes: string | null;
  workflowId: string | null;
  isUrgent: boolean;
  priority: number;
  createdTime: string;
  lastUpdatedTime: string | null;
  expiresAt: string | null;
}

// Interface for API response
interface ApiResponse {
  data: AppointmentRequest[];
  count: number;
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
}

export default function StaffAppointmentsPage() {
  const { user } = useAuth();
  const { message } = App.useApp(); // Use App context for message notifications
  const [activeTab, setActiveTab] = useState('all');
  const [filteredInfo, setFilteredInfo] = useState<any>({});
  const [sortedInfo, setSortedInfo] = useState<any>({});
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<any>(null);
  
  // Status modification modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | 'checkin' | 'complete' | 'fail'>('approve');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRequest | null>(null);
  const [form] = Form.useForm();
  
  // Donor profile modal
  const [isDonorProfileModalVisible, setIsDonorProfileModalVisible] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    bloodGroupName: string | null;
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Build query parameters
      let queryParams = new URLSearchParams();
      if (activeTab !== 'all') {
        queryParams.append('Status', activeTab);
      }
      
      const response = await apiClient.get<ApiResponse>(
        `/DonationAppointmentRequests?${queryParams.toString()}`
      );
      
      if (response.data.success) {
        setAppointments(response.data.data);
      } else {
        message.error(response.data.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      message.error('Failed to fetch appointments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string, note?: string) => {
    try {
      const payload = {
        status: newStatus,
        note: note || '',
        updatedByUserId: user?.id
      };

      const response = await apiClient.put(
        `/DonationAppointmentRequests/${appointmentId}/status`,
        payload
      );

      if (response.data.success) {
        message.success(`Appointment ${newStatus.toLowerCase()} successfully`);
        fetchAppointments(); // Refresh data
      } else {
        message.error(response.data.message || `Failed to ${newStatus.toLowerCase()} appointment`);
      }
    } catch (error) {
      console.error(`Error updating appointment status:`, error);
      message.error(`Failed to ${newStatus.toLowerCase()} appointment. Please try again later.`);
    }
  };

  const showStatusModal = (appointment: AppointmentRequest, action: 'approve' | 'reject' | 'checkin' | 'complete' | 'fail') => {
    setSelectedAppointment(appointment);
    setModalAction(action);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (!selectedAppointment) return;

      let newStatus = '';
      switch (modalAction) {
        case 'approve':
          newStatus = 'Approved';
          break;
        case 'reject':
          newStatus = 'Rejected';
          break;
        case 'checkin':
          newStatus = 'CheckedIn';
          break;
        case 'complete':
          newStatus = 'Completed';
          break;
        case 'fail':
          newStatus = 'Failed';
          break;
      }

      handleStatusChange(selectedAppointment.id, newStatus, values.note);
      setIsModalVisible(false);
    });
  };

  const showCancelConfirm = (appointment: AppointmentRequest) => {
    confirm({
      title: 'Are you sure you want to cancel this appointment?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes, Cancel',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        handleStatusChange(appointment.id, 'Cancelled');
      }
    });
  };

  const handleChange = (pagination: any, filters: any, sorter: any) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  const clearFilters = () => {
    setFilteredInfo({});
    setSearchText('');
    setDateRange(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'green';
      case 'pending':
        return 'gold';
      case 'completed':
        return 'blue';
      case 'cancelled':
      case 'rejected':
      case 'failed':
        return 'red';
      case 'checkedin':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getDonationTypeColor = (type: string | null) => {
    if (!type) return 'default';
    
    switch (type.toLowerCase()) {
      case 'whole blood':
        return 'red';
      case 'platelets':
        return 'orange';
      case 'plasma':
        return 'blue';
      case 'double red cells':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getAvailableActions = (record: AppointmentRequest) => {
    const status = record.status.toLowerCase();
    
    if (status === 'pending') {
      return (
        <Space size="small">
          <Button 
            type="primary" 
            size="small" 
            icon={<CheckOutlined />}
            onClick={() => showStatusModal(record, 'approve')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Approve
          </Button>
          <Button 
            danger 
            size="small" 
            icon={<CloseOutlined />}
            onClick={() => showStatusModal(record, 'reject')}
          >
            Reject
          </Button>
        </Space>
      );
    } else if (status === 'approved') {
      return (
        <Space size="small">
          <Button 
            type="primary" 
            size="small" 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => showStatusModal(record, 'checkin')}
          >
            Check In
          </Button>
          <Button 
            danger 
            size="small"
            onClick={() => showCancelConfirm(record)}
          >
            Cancel
          </Button>
        </Space>
      );
    } else if (status === 'checkedin') {
      return (
        <Space size="small">
          <Button 
            type="primary" 
            size="small" 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => showStatusModal(record, 'complete')}
          >
            Complete
          </Button>
          <Button 
            danger 
            size="small"
            onClick={() => showStatusModal(record, 'fail')}
          >
            Mark Failed
          </Button>
        </Space>
      );
    } else {
      return (
        <Button size="small">View Details</Button>
      );
    }
  };

  const showDonorProfileModal = (record: AppointmentRequest) => {
    setSelectedDonor({
      id: record.donorId,
      name: record.donorName,
      email: record.donorEmail,
      phone: record.donorPhone,
      bloodGroupName: record.bloodGroupName
    });
    setIsDonorProfileModalVisible(true);
  };

  const columns = [
    {
      title: 'Donor Name',
      dataIndex: 'donorName',
      key: 'donorName',
      sorter: (a: AppointmentRequest, b: AppointmentRequest) => a.donorName.localeCompare(b.donorName),
      sortOrder: sortedInfo.columnKey === 'donorName' && sortedInfo.order,
      render: (text: string, record: AppointmentRequest) => (
        <div className="flex items-center">
          <span>{text}</span>
          <Tooltip title="View donor profile">
            <InfoCircleOutlined 
              className="ml-2 text-blue-500 cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation();
                showDonorProfileModal(record);
              }} 
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: 'Date & Time',
      key: 'date',
      render: (text: string, record: AppointmentRequest) => {
        // Convert UTC time to Vietnam time zone
        const utcDate = dayjs(record.preferredDate);
        const localDate = utcDate.tz('Asia/Ho_Chi_Minh');
        
        return (
          <span>
            <div className="flex items-center">
              <CalendarOutlined className="mr-1" /> {localDate.format('MMM D, YYYY')}
            </div>
            <div className="flex items-center text-gray-500 mt-1">
              <ClockCircleOutlined className="mr-1" /> {localDate.format('HH:mm:ss')} - {record.preferredTimeSlot}
            </div>
          </span>
        );
      },
      sorter: (a: AppointmentRequest, b: AppointmentRequest) => 
        dayjs(a.preferredDate).unix() - dayjs(b.preferredDate).unix(),
      sortOrder: sortedInfo.columnKey === 'date' && sortedInfo.order,
    },
    {
      title: 'Facility',
      dataIndex: 'locationName',
      key: 'locationName',
      render: (text: string, record: AppointmentRequest) => (
        <span>
          <div>{text}</div>
          <div className="flex items-center text-gray-500 mt-1 text-xs">
            {record.locationAddress}
          </div>
        </span>
      ),
    },
    {
      title: 'Blood Group',
      dataIndex: 'bloodGroupName',
      key: 'bloodGroupName',
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
      onFilter: (value: any, record: AppointmentRequest) => record.bloodGroupName === value,
    },
    {
      title: 'Donation Type',
      dataIndex: 'componentTypeName',
      key: 'componentTypeName',
      render: (text: string | null, record: AppointmentRequest) => (
        <Tag color={getDonationTypeColor(text)}>
          {text || 'Whole Blood'}
        </Tag>
      ),
      filters: [
        { text: 'Whole Blood', value: 'Whole Blood' },
        { text: 'Plasma', value: 'Plasma' },
        { text: 'Platelets', value: 'Platelets' },
      ],
      filteredValue: filteredInfo.componentTypeName || null,
      onFilter: (value: any, record: AppointmentRequest) => record.componentTypeName === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: any, record: AppointmentRequest) => getAvailableActions(record),
    },
  ];

  // Filter data based on search text and date range
  const getFilteredAppointments = () => {
    let filtered = [...appointments];
    
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(appt => 
        appt.donorName.toLowerCase().includes(searchLower) ||
        appt.donorId.toLowerCase().includes(searchLower) ||
        appt.donorEmail.toLowerCase().includes(searchLower) ||
        appt.locationName.toLowerCase().includes(searchLower)
      );
    }
    
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');
      
      filtered = filtered.filter(appt => {
        const appointmentDate = dayjs(appt.preferredDate);
        return appointmentDate.isAfter(startDate) && appointmentDate.isBefore(endDate);
      });
    }
    
    return filtered;
  };

  const modalTitle = () => {
    switch (modalAction) {
      case 'approve': return 'Approve Appointment';
      case 'reject': return 'Reject Appointment';
      case 'checkin': return 'Check In Donor';
      case 'complete': return 'Complete Donation';
      case 'fail': return 'Mark Donation as Failed';
      default: return 'Update Appointment';
    }
  };

  return (
    <StaffLayout title="Appointments" breadcrumbItems={[{ title: 'Appointments' }]}>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Manage Donation Appointments</h2>
            <p className="text-gray-500">View and manage all donor appointments</p>
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
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input 
                placeholder="Search by donor name, email or location" 
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div className="self-end">
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          </div>
        </Card>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="mb-6"
          type="card"
        >
          <TabPane tab="All" key="all" />
          <TabPane tab="Pending" key="Pending" />
          <TabPane tab="Approved" key="Approved" />
          <TabPane tab="Checked In" key="CheckedIn" />
          <TabPane tab="Completed" key="Completed" />
          <TabPane tab="Rejected" key="Rejected" />
          <TabPane tab="Cancelled" key="Cancelled" />
          <TabPane tab="Failed" key="Failed" />
        </Tabs>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={getFilteredAppointments()}
            rowKey="id"
            onChange={handleChange}
            pagination={{ pageSize: 10 }}
          />
        )}
      </div>

      <Modal
        title={modalTitle()}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="note"
            label="Add a note (optional)"
            rules={[
              { 
                required: modalAction === 'reject' || modalAction === 'fail', 
                message: `Please provide a reason for ${modalAction === 'reject' ? 'rejection' : 'failure'}` 
              }
            ]}
          >
            <TextArea rows={4} placeholder="Add any relevant notes or comments" />
          </Form.Item>
          
          {selectedAppointment && (
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <p><strong>Donor:</strong> {selectedAppointment.donorName}</p>
              <p><strong>Date:</strong> {dayjs(selectedAppointment.preferredDate).format('MMM D, YYYY HH:mm')}</p>
              <p><strong>Location:</strong> {selectedAppointment.locationName}</p>
            </div>
          )}
        </Form>
      </Modal>

      {/* Donor Profile Modal */}
      <Modal
        title="Donor Profile"
        open={isDonorProfileModalVisible}
        onCancel={() => setIsDonorProfileModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDonorProfileModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedDonor && (
          <div>
            <Card className="mb-4" bordered={false}>
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-3 rounded-full mr-4">
                  <UserOutlined style={{ fontSize: '24px', color: '#f5222d' }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold m-0">{selectedDonor.name}</h2>
                  <p className="text-gray-500 m-0">Donor ID: {selectedDonor.id.substring(0, 8)}...</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="text-base font-medium mb-2">Contact Information</h3>
                  <p className="flex items-center mb-2">
                    <span className="text-gray-600 w-20">Email:</span>
                    <span className="font-medium">{selectedDonor.email}</span>
                  </p>
                  <p className="flex items-center mb-2">
                    <span className="text-gray-600 w-20">Phone:</span>
                    <span className="font-medium">{selectedDonor.phone}</span>
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-medium mb-2">Medical Information</h3>
                  <p className="flex items-center mb-2">
                    <span className="text-gray-600 w-20">Blood Group:</span>
                    <Tag color="red">{selectedDonor.bloodGroupName || 'Not specified'}</Tag>
                  </p>
                </div>
              </div>
            </Card>

            <Card title="Donation History" className="mb-4" bordered={false}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-gray-500 m-0">Total Donations</p>
                  <p className="text-xl font-bold">Loading...</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-gray-500 m-0">Last Donation</p>
                  <p className="text-xl font-bold">Loading...</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-gray-500 m-0">Next Eligible</p>
                  <p className="text-xl font-bold">Loading...</p>
                </div>
              </div>
            </Card>
            
            <div className="flex justify-end mt-4">
              <Button 
                type="primary" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setIsDonorProfileModalVisible(false);
                  // Navigate to full donor profile
                  router.push(`/staff/donors/${selectedDonor.id}`);
                }}
              >
                View Complete Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </StaffLayout>
  );
} 