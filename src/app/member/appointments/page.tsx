'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Typography, Card, Spin, Table, Tag, Button, Tooltip, Calendar, Badge, Tabs, Modal, Form, Input, DatePicker, TimePicker, Select, Empty, Alert } from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  MedicineBoxOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  EditOutlined,
  FilterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { CalendarMode } from 'antd/es/calendar/generateCalendar';
import type { CellRenderInfo } from 'rc-picker/lib/interface';
import apiClient from '@/services/api/apiConfig';

// Configure dayjs to use timezone
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh'); // Set Vietnam timezone

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

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

const donationTypes = ['Whole Blood', 'Platelets', 'Plasma', 'Double Red Cells'];

export default function AppointmentsPage() {
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRequest | null>(null);
  const [form] = Form.useForm();
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');
  
  // State for appointments
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);
  
  // Fetch appointment data
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!isLoggedIn || !user) return;
      
      setIsLoadingAppointments(true);
      setError(null);
      
      try {
        const response = await apiClient.get<ApiResponse>(
          '/DonationAppointmentRequests/my-requests'
        );
        
        if (response.data.success) {
          setAppointments(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch appointments');
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('An error occurred while fetching your appointments. Please try again later.');
      } finally {
        setIsLoadingAppointments(false);
      }
    };
    
    fetchAppointments();
  }, [isLoggedIn, user]);

  const showCreateModal = () => {
    setModalMode('create');
    setSelectedAppointment(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (appointment: AppointmentRequest) => {
    setModalMode('edit');
    setSelectedAppointment(appointment);
    
    // Format the date and time for the form
    const appointmentDate = dayjs(appointment.preferredDate);
    
    form.setFieldsValue({
      donationCenter: appointment.locationId,
      donationType: appointment.componentTypeName || 'Whole Blood',
      date: appointmentDate,
      time: appointmentDate,
      notes: appointment.notes,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = (values: any) => {
    console.log('Form values:', values);
    // Here you would make an API call to create or update an appointment
    // For now, we'll just show a success message
    setIsModalVisible(false);
    form.resetFields();
  };

  const showCancelConfirm = (appointmentId: string) => {
    confirm({
      title: 'Are you sure you want to cancel this appointment?',
      icon: <ExclamationCircleOutlined />,
      content: 'Once cancelled, you will need to make a new appointment.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        console.log('OK');
        // Here you would make an API call to cancel the appointment
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'green';
      case 'pending':
        return 'gold';
      case 'completed':
        return 'blue';
      case 'cancelled':
      case 'rejected':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircleOutlined />;
      case 'pending':
        return <ClockCircleOutlined />;
      case 'completed':
        return <CheckCircleOutlined />;
      case 'cancelled':
      case 'rejected':
        return <CloseCircleOutlined />;
      default:
        return null;
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

  const columns = [
    {
      title: 'Date & Time',
      dataIndex: 'preferredDate',
      key: 'preferredDate',
      sorter: (a: AppointmentRequest, b: AppointmentRequest) => 
        dayjs(a.preferredDate).unix() - dayjs(b.preferredDate).unix(),
      render: (text: string, record: AppointmentRequest) => {
        // Convert UTC time to Vietnam time zone
        const utcDate = dayjs(text);
        const localDate = utcDate.tz('Asia/Ho_Chi_Minh');
        
        // Get the hour range based on timeSlot
        let hourRange = '';
        if (record.preferredTimeSlot === 'Morning') {
          hourRange = '(7AM - 11AM)';
        } else if (record.preferredTimeSlot === 'Afternoon') {
          hourRange = '(1PM - 6PM)';
        } else if (record.preferredTimeSlot === 'Evening') {
          hourRange = '(6PM - 9PM)';
        }
        
        return (
          <span>
            <div className="flex items-center">
              <CalendarOutlined className="mr-1" /> {localDate.format('MMM D, YYYY')}
            </div>
            <div className="flex items-center text-gray-500 mt-1">
              <ClockCircleOutlined className="mr-1" /> {localDate.format('HH:mm:ss')} - {record.preferredTimeSlot} {hourRange}
            </div>
          </span>
        );
      },
    },
    {
      title: 'Facility',
      dataIndex: 'locationName',
      key: 'locationName',
      render: (text: string, record: AppointmentRequest) => (
        <span>
          <div>{text}</div>
          <div className="flex items-center text-gray-500 mt-1 text-xs">
            <EnvironmentOutlined className="mr-1" /> {record.locationAddress}
          </div>
        </span>
      ),
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
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => (
        <Tag icon={getStatusIcon(text)} color={getStatusColor(text)}>
          {text.charAt(0).toUpperCase() + text.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AppointmentRequest) => {
        if (record.status.toLowerCase() === 'completed' || 
            record.status.toLowerCase() === 'cancelled' || 
            record.status.toLowerCase() === 'rejected') {
          return (
            <Button 
              type="link" 
              onClick={() => console.log('View details', record.id)}
            >
              View Details
            </Button>
          );
        }
        
        // Check if appointment date is in the past
        const isAppointmentInPast = dayjs(record.preferredDate).isBefore(dayjs(), 'day');
        
        return (
          <div className="flex space-x-2">
            <Tooltip title={isAppointmentInPast ? "Past appointments cannot be edited" : "Edit Appointment"}>
              <Button 
                icon={<EditOutlined />} 
                type="primary" 
                size="small" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => showEditModal(record)}
                disabled={record.status.toLowerCase() === 'completed' || isAppointmentInPast}
              >
                Edit
              </Button>
            </Tooltip>
            <Tooltip title={record.status.toLowerCase() === 'completed' ? "Completed appointments cannot be cancelled" : "Cancel Appointment"}>
              <Button 
                danger 
                size="small"
                onClick={() => showCancelConfirm(record.id)}
                disabled={
                  record.status.toLowerCase() === 'completed' || 
                  record.status.toLowerCase() === 'cancelled' ||
                  record.status.toLowerCase() === 'rejected'
                }
              >
                Cancel
              </Button>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  // Filter appointments by status
  const confirmedAppointments = appointments.filter(appointment => 
    appointment.status.toLowerCase() === 'confirmed'
  );
  
  const pendingAppointments = appointments.filter(appointment => 
    appointment.status.toLowerCase() === 'pending'
  );
  
  const completedAppointments = appointments.filter(appointment => 
    appointment.status.toLowerCase() === 'completed'
  );
  
  const cancelledRejectedAppointments = appointments.filter(appointment => 
    appointment.status.toLowerCase() === 'cancelled' || 
    appointment.status.toLowerCase() === 'rejected'
  );

  // Divide appointments into upcoming and past
  const upcomingAppointments = appointments.filter(appointment => {
    // Status is pending or confirmed AND date is in the future or today
    return (
      (appointment.status.toLowerCase() === 'pending' || 
       appointment.status.toLowerCase() === 'confirmed') && 
      (dayjs(appointment.preferredDate).isAfter(dayjs()) || 
       dayjs(appointment.preferredDate).isSame(dayjs(), 'day'))
    );
  });

  const pastAppointments = appointments.filter(appointment => {
    // Either the date is in the past OR status is completed/cancelled/rejected
    return (
      dayjs(appointment.preferredDate).isBefore(dayjs(), 'day') || 
      appointment.status.toLowerCase() === 'completed' || 
      appointment.status.toLowerCase() === 'cancelled' ||
      appointment.status.toLowerCase() === 'rejected'
    );
  });

  const dateCellRender = (value: dayjs.Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const appointmentsOnDate = appointments.filter(appt => 
      dayjs(appt.preferredDate).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD') === dateStr
    );
    
    return (
      <ul className="events p-0 m-0 list-none">
        {appointmentsOnDate.map(appt => {
          // Convert UTC time to Vietnam time zone for display
          const localTime = dayjs(appt.preferredDate).tz('Asia/Ho_Chi_Minh');
          
          return (
            <li key={appt.id} className="mb-1">
              <Badge 
                color={getStatusColor(appt.status)} 
                text={
                  <span className="text-xs">
                    {localTime.format('HH:mm')} - {appt.preferredTimeSlot} - {appt.locationName}
                  </span>
                } 
              />
            </li>
          );
        })}
      </ul>
    );
  };

  // Updated cellRender function for newer Ant Design versions
  const cellRender = (current: dayjs.Dayjs, info: CellRenderInfo<dayjs.Dayjs>) => {
    if (info.type === 'date') {
      return dateCellRender(current);
    }
    return null;
  };

  const renderCalendarHeader = ({ value, type, onChange }: any) => {
    const start = 0;
    const end = 12;
    const monthOptions = [];

    for (let i = start; i < end; i++) {
      monthOptions.push(
        <Select.Option key={i} value={i}>
          {value.clone().month(i).format('MMMM')}
        </Select.Option>
      );
    }

    const year = value.year();
    const month = value.month();
    const options = [];
    for (let i = year - 10; i < year + 10; i++) {
      options.push(
        <Select.Option key={i} value={i}>
          {i}
        </Select.Option>
      );
    }

    return (
      <div className="flex justify-between items-center mb-4">
        <div>
          <Button 
            type="text" 
            onClick={() => onChange(value.clone().subtract(1, 'month'))}
          >
            Previous
          </Button>
          <Select
            value={month}
            onChange={(newMonth) => {
              const now = value.clone().month(newMonth);
              onChange(now);
            }}
            className="mx-2"
            style={{ width: 120 }}
          >
            {monthOptions}
          </Select>
          <Select
            value={year}
            onChange={(newYear) => {
              const now = value.clone().year(newYear);
              onChange(now);
            }}
            className="mr-2"
            style={{ width: 100 }}
          >
            {options}
          </Select>
          <Button 
            type="text" 
            onClick={() => onChange(value.clone().add(1, 'month'))}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  // Define tab items for Tabs component
  const tabItems = [
    {
      key: 'upcoming',
      label: <span><CalendarOutlined /> Upcoming</span>,
      children: isLoadingAppointments ? (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          showIcon 
        />
      ) : upcomingAppointments.length > 0 ? (
        <Table 
          dataSource={upcomingAppointments} 
          columns={columns} 
          rowKey="id" 
          pagination={{ pageSize: 5 }}
        />
      ) : (
        <Empty 
          description="No upcoming appointments" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        >
          <Button 
            type="primary" 
            onClick={showCreateModal}
            className="bg-red-600 hover:bg-red-700 mt-4"
          >
            Schedule Now
          </Button>
        </Empty>
      )
    },
    {
      key: 'past',
      label: <span><ClockCircleOutlined /> Past</span>,
      children: isLoadingAppointments ? (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          showIcon 
        />
      ) : pastAppointments.length > 0 ? (
        <Table 
          dataSource={pastAppointments} 
          columns={columns} 
          rowKey="id" 
          pagination={{ pageSize: 5 }}
        />
      ) : (
        <Empty 
          description="No past appointments" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      )
    },
    {
      key: 'confirmed',
      label: <span><CheckCircleOutlined /> Confirmed</span>,
      children: isLoadingAppointments ? (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          showIcon 
        />
      ) : confirmedAppointments.length > 0 ? (
        <Table 
          dataSource={confirmedAppointments} 
          columns={columns} 
          rowKey="id" 
          pagination={{ pageSize: 5 }}
        />
      ) : (
        <Empty 
          description="No confirmed appointments" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      )
    },
    {
      key: 'pending',
      label: <span><ClockCircleOutlined /> Pending</span>,
      children: isLoadingAppointments ? (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          showIcon 
        />
      ) : pendingAppointments.length > 0 ? (
        <Table 
          dataSource={pendingAppointments} 
          columns={columns} 
          rowKey="id" 
          pagination={{ pageSize: 5 }}
        />
      ) : (
        <Empty 
          description="No pending appointments" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      )
    },
    {
      key: 'completed',
      label: <span><CheckCircleOutlined style={{ color: '#1890ff' }} /> Completed</span>,
      children: isLoadingAppointments ? (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          showIcon 
        />
      ) : completedAppointments.length > 0 ? (
        <Table 
          dataSource={completedAppointments} 
          columns={columns} 
          rowKey="id" 
          pagination={{ pageSize: 5 }}
        />
      ) : (
        <Empty 
          description="No completed appointments" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      )
    },
    {
      key: 'cancelled',
      label: <span><CloseCircleOutlined /> Cancelled/Rejected</span>,
      children: isLoadingAppointments ? (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          showIcon 
        />
      ) : cancelledRejectedAppointments.length > 0 ? (
        <Table 
          dataSource={cancelledRejectedAppointments} 
          columns={columns} 
          rowKey="id" 
          pagination={{ pageSize: 5 }}
        />
      ) : (
        <Empty 
          description="No cancelled or rejected appointments" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      )
    },
    {
      key: 'calendar',
      label: <span><CalendarOutlined /> Calendar</span>,
      children: isLoadingAppointments ? (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          showIcon 
        />
      ) : (
        <Calendar 
          cellRender={cellRender}
          mode={calendarMode}
          onPanelChange={(date, mode) => setCalendarMode(mode)}
          headerRender={renderCalendarHeader}
        />
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // If not logged in (and redirecting), don't render the content
  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <Title level={2}>My Donation Appointments</Title>
          <Paragraph className="text-gray-500">
            Manage your upcoming and past blood donation appointments
          </Paragraph>
        </div>

        <div className="mb-4">
          <Card className="bg-white rounded-md shadow-sm">
            <div className="flex items-center">
              <FilterOutlined className="mr-2 text-gray-500" />
              <span className="text-gray-700 font-medium">Filter by Status:</span>
            </div>
            <Tabs 
              activeKey={activeTab} 
              onChange={(key) => setActiveTab(key)}
              items={tabItems}
              className="mt-2"
              size="small"
              tabBarGutter={8}
              // tabBarExtraContent={
              //   <Button 
              //     type="primary" 
              //     icon={<PlusOutlined />} 
              //     onClick={showCreateModal}
              //     className="bg-red-600 hover:bg-red-700"
              //   >
              //     New Appointment
              //   </Button>
              // }
            />
          </Card>
        </div>

        <Alert 
          message="Next Eligible Donation Date" 
          description={
            <div className="flex items-center">
              <CalendarOutlined className="mr-2 text-green-600" />
              <span>
                You are eligible to donate whole blood after <strong>December 20, 2023</strong>. 
                Please schedule your next appointment after this date.
              </span>
            </div>
          }
          type="info" 
          showIcon={false}
          className="mt-8 bg-blue-50"
        />

        <Modal
          title={modalMode === 'create' ? 'Schedule New Appointment' : 'Edit Appointment'}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={[
            <Button key="back" onClick={handleCancel}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={() => form.submit()}
              className="bg-red-600 hover:bg-red-700"
            >
              {modalMode === 'create' ? 'Schedule' : 'Update'}
            </Button>,
          ]}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              date: dayjs().add(2, 'day'),
              time: dayjs('10:00:00', 'HH:mm:ss'),
              donationType: 'Whole Blood',
            }}
          >
            <Form.Item
              name="donationCenter"
              label="Donation Center"
              rules={[{ required: true, message: 'Please select a donation center' }]}
            >
              <Select placeholder="Select a donation center">
                {/* We would fetch this data from an API */}
              </Select>
            </Form.Item>

            <Form.Item
              name="donationType"
              label="Donation Type"
              rules={[{ required: true, message: 'Please select a donation type' }]}
            >
              <Select placeholder="Select donation type">
                {donationTypes.map(type => (
                  <Option key={type} value={type}>{type}</Option>
                ))}
              </Select>
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Please select a date' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  disabledDate={(current) => {
                    // Can't select days before today and Sundays
                    return current && (
                      current < dayjs().startOf('day') ||
                      current.day() === 0
                    );
                  }}
                />
              </Form.Item>

              <Form.Item
                name="time"
                label="Time"
                rules={[{ required: true, message: 'Please select a time' }]}
              >
                <TimePicker
                  style={{ width: '100%' }} 
                  format="h:mm a"
                  minuteStep={15}
                  disabledTime={() => ({
                    disabledHours: () => [0, 1, 2, 3, 4, 5, 6, 7, 19, 20, 21, 22, 23],
                  })}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="notes"
              label="Notes (Optional)"
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Any special requests or information for the donation center"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
} 