'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Typography, Card, Spin, Table, Tag, Button, Tooltip, Calendar, Badge, Tabs, Modal, Form, Input, DatePicker, TimePicker, Select, Empty, Alert, message, Descriptions } from 'antd';
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
  totalDonations?: number;
  lastDonationDate?: string;
  nextEligibleDonationDate?: string;
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
  checkInTime?: string;
  completedTime?: string;
  cancelledTime?: string;
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
  const [activeTab, setActiveTab] = useState('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'response'>('create');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRequest | null>(null);
  const [responseType, setResponseType] = useState<'Accepted' | 'Denied'>('Accepted');
  const [responseNote, setResponseNote] = useState('');
  const [form] = Form.useForm();
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');

  // State for appointments
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Appointment detail modal
  const [isAppointmentDetailModalVisible, setIsAppointmentDetailModalVisible] = useState(false);
  const [appointmentDetail, setAppointmentDetail] = useState<AppointmentRequest | null>(null);
  const [loadingAppointmentDetail, setLoadingAppointmentDetail] = useState(false);

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
    setResponseNote('');
  };

  const handleSubmit = (values: any) => {
    console.log('Form values:', values);
    // Here you would make an API call to create or update an appointment
    // For now, we'll just show a success message
    setIsModalVisible(false);
    form.resetFields();
  };

  // Show modal for responding to staff-initiated appointment
  const showResponseModal = (appointment: AppointmentRequest, type: 'Accepted' | 'Denied') => {
    setSelectedAppointment(appointment);
    setResponseType(type);
    setResponseNote('');
    setModalMode('response');
    setIsModalVisible(true);
  };

  // Handle response submission
  const handleResponseSubmit = () => {
    if (selectedAppointment) {
      handleAppointmentResponse(selectedAppointment.id, responseType, responseNote);
      setIsModalVisible(false);
      setResponseNote('');
    }
  };

  // Function to view appointment details
  const viewAppointmentDetail = async (appointmentId: string) => {
    setLoadingAppointmentDetail(true);
    setIsAppointmentDetailModalVisible(true);

    try {
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        statusCode: number;
        errors: string[];
        data: AppointmentRequest;
        count: number;
      }>(`/DonationAppointmentRequests/${appointmentId}`);

      if (response.data.success) {
        setAppointmentDetail(response.data.data);
      } else {
        message.error(response.data.message || 'Không thể tải thông tin cuộc hẹn');
        setAppointmentDetail(null);
      }
    } catch (error: any) {
      console.error('Error fetching appointment details:', error);
      message.error('Lỗi khi tải thông tin cuộc hẹn');
      setAppointmentDetail(null);
    } finally {
      setLoadingAppointmentDetail(false);
    }
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
        handleCancelAppointment(appointmentId);
      },
    });
  };

  // Handle cancellation of appointment
  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const payload = {
        status: "Cancelled",
        note: "Cancelled by user",
        updatedByUserId: user?.id || ''
      };

      const response = await apiClient.put(
        `/DonationAppointmentRequests/${appointmentId}/status`,
        payload
      );

      if (response.data.success) {
        // Show success message
        message.success('Appointment cancelled successfully');

        // Refresh appointments
        const updatedAppointments = appointments.map(appt =>
          appt.id === appointmentId ? { ...appt, status: 'Cancelled' } : appt
        );
        setAppointments(updatedAppointments);
      } else {
        message.error(response.data.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      message.error('An error occurred while cancelling your appointment. Please try again later.');
    }
  };

  // Handle response to staff-initiated appointment (Accept or Deny)
  const handleAppointmentResponse = async (appointmentId: string, status: 'Accepted' | 'Denied', notes: string = '') => {
    try {
      const payload = {
        status: status,
        note: notes || (status === 'Denied' ? 'Người truyền máu từ chối cuộc hẹn.' : ''),
        updatedByUserId: user?.id || ''
      };

      const response = await apiClient.put(
        `/DonationAppointmentRequests/${appointmentId}/status`,
        payload
      );

      if (response.data.success) {
        // Show success message
        message.success(`Appointment ${status.toLowerCase()} successfully`);

        // Update local state
        const updatedAppointments = appointments.map(appt =>
          appt.id === appointmentId ? {
            ...appt,
            status: status,
            donorAccepted: status === 'Accepted',
            donorResponseNotes: notes,
            donorResponseAt: new Date().toISOString()
          } : appt
        );
        setAppointments(updatedAppointments);
      } else {
        message.error(response.data.message || `Failed to ${status.toLowerCase()} appointment`);
      }
    } catch (error) {
      console.error(`Error ${status.toLowerCase()} appointment:`, error);
      message.error(`An error occurred while ${status.toLowerCase()} your appointment. Please try again later.`);
    }
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
      case 'denied':
      case 'failed':
        return 'red';
      case 'accepted':
        return 'cyan';
      case 'checkedin':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'approved':
      case 'accepted':
        return <CheckCircleOutlined />;
      case 'pending':
        return <ClockCircleOutlined />;
      case 'completed':
        return <CheckCircleOutlined />;
      case 'cancelled':
      case 'rejected':
      case 'denied':
      case 'failed':
        return <CloseCircleOutlined />;
      case 'checkedin':
        return <CheckCircleOutlined />;
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
        const utcDate = dayjs(record.preferredDate);
        // Không cần add 7 giờ vì đã thiết lập timezone 'Asia/Ho_Chi_Minh'
        const localDate = utcDate.tz('Asia/Ho_Chi_Minh');

        return (
          <span>
            <div className="flex items-center">
              <CalendarOutlined className="mr-1" /> {localDate.format('DD/MM/YYYY HH:mm:ss')}
            </div>
            <div className="flex items-center text-gray-500 mt-1">
              <ClockCircleOutlined className="mr-1" /> {record.preferredTimeSlot}
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
        // Check if appointment has a status that can be cancelled
        const canBeCancelled = ['pending', 'approved', 'accepted'].includes(record.status.toLowerCase());

        // Check if appointment date is in the past
        const isAppointmentInPast = dayjs(record.preferredDate).isBefore(dayjs(), 'day');

        // Check if this is a staff-initiated appointment that needs response
        const isStaffInitiatedPending =
          record.status.toLowerCase() === 'pending' &&
          record.requestType === 'StaffInitiated';

        if (isStaffInitiatedPending) {
          return (
            <div className="flex space-x-2">
              <Button
                type="primary"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => showResponseModal(record, 'Accepted')}
              >
                Accept
              </Button>
              <Button
                danger
                onClick={() => showResponseModal(record, 'Denied')}
              >
                Deny
              </Button>
              <Button
                size="small"
                onClick={() => viewAppointmentDetail(record.id)}
              >
                View Details
              </Button>
            </div>
          );
        }

        return (
          <div className="flex space-x-2">
            {canBeCancelled && !isAppointmentInPast && (
              <Button
                danger
                onClick={() => showCancelConfirm(record.id)}
              >
                Cancel
              </Button>
            )}
            <Button
              size="small"
              onClick={() => viewAppointmentDetail(record.id)}
            >
              View Details
            </Button>
          </div>
        );
      },
    },
  ];

  // Filter appointments by status
  const allAppointments = appointments; // All appointments

  const confirmedAppointments = appointments.filter(appointment =>
    appointment.status.toLowerCase() === 'confirmed'
  );

  const pendingAppointments = appointments.filter(appointment =>
    appointment.status.toLowerCase() === 'pending'
  );

  const approvedAppointments = appointments.filter(appointment =>
    appointment.status.toLowerCase() === 'approved'
  );

  const rejectedAppointments = appointments.filter(appointment =>
    appointment.status.toLowerCase() === 'rejected'
  );

  const acceptedAppointments = appointments.filter(appointment =>
    appointment.status.toLowerCase() === 'accepted'
  );

  const deniedAppointments = appointments.filter(appointment =>
    appointment.status.toLowerCase() === 'denied'
  );

  const checkedInAppointments = appointments.filter(appointment =>
    appointment.status.toLowerCase() === 'checkedin'
  );

  const completedAppointments = appointments.filter(appointment =>
    appointment.status.toLowerCase() === 'completed'
  );

  const failedAppointments = appointments.filter(appointment =>
    appointment.status.toLowerCase() === 'failed'
  );

  const cancelledAppointments = appointments.filter(appointment =>
    appointment.status.toLowerCase() === 'cancelled'
  );

  // Combined status groups
  const cancelledRejectedAppointments = appointments.filter(appointment =>
    appointment.status.toLowerCase() === 'cancelled' ||
    appointment.status.toLowerCase() === 'rejected' ||
    appointment.status.toLowerCase() === 'denied' ||
    appointment.status.toLowerCase() === 'failed'
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
      key: 'all',
      label: <span><FilterOutlined /> All</span>,
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
      ) : allAppointments.length > 0 ? (
        <Table
          dataSource={allAppointments}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      ) : (
        <Empty
          description="No appointments found"
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
      key: 'approved',
      label: <span><CheckCircleOutlined style={{ color: 'green' }} /> Approved</span>,
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
      ) : approvedAppointments.length > 0 ? (
        <Table
          dataSource={approvedAppointments}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      ) : (
        <Empty
          description="No approved appointments"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )
    },
    {
      key: 'accepted',
      label: <span><CheckCircleOutlined style={{ color: '#13c2c2' }} /> Accepted</span>,
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
      ) : acceptedAppointments.length > 0 ? (
        <Table
          dataSource={acceptedAppointments}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      ) : (
        <Empty
          description="No accepted appointments"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )
    },
    {
      key: 'confirmed',
      label: <span><CheckCircleOutlined style={{ color: 'green' }} /> Confirmed</span>,
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
      key: 'checkedin',
      label: <span><CheckCircleOutlined style={{ color: 'purple' }} /> Checked In</span>,
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
      ) : checkedInAppointments.length > 0 ? (
        <Table
          dataSource={checkedInAppointments}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      ) : (
        <Empty
          description="No checked-in appointments"
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
      key: 'rejected',
      label: <span><CloseCircleOutlined style={{ color: 'red' }} /> Rejected</span>,
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
      ) : rejectedAppointments.length > 0 ? (
        <Table
          dataSource={rejectedAppointments}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      ) : (
        <Empty
          description="No rejected appointments"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )
    },
    {
      key: 'denied',
      label: <span><CloseCircleOutlined style={{ color: 'red' }} /> Denied</span>,
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
      ) : deniedAppointments.length > 0 ? (
        <Table
          dataSource={deniedAppointments}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      ) : (
        <Empty
          description="No denied appointments"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )
    },
    {
      key: 'failed',
      label: <span><CloseCircleOutlined style={{ color: 'red' }} /> Failed</span>,
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
      ) : failedAppointments.length > 0 ? (
        <Table
          dataSource={failedAppointments}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      ) : (
        <Empty
          description="No failed appointments"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )
    },
    {
      key: 'cancelled',
      label: <span><CloseCircleOutlined style={{ color: 'red' }} /> Cancelled</span>,
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
      ) : cancelledAppointments.length > 0 ? (
        <Table
          dataSource={cancelledAppointments}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      ) : (
        <Empty
          description="No cancelled appointments"
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
              tabPosition="top"
              type="card"
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

        {/* <Alert
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
        /> */}

        {/* Modal for responding to staff-initiated appointments */}
        <Modal
          title={`${responseType} Appointment`}
          open={isModalVisible && modalMode === 'response'}
          onCancel={handleCancel}
          footer={[
            <Button key="back" onClick={handleCancel}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleResponseSubmit}
              className={responseType === 'Accepted' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {responseType}
            </Button>,
          ]}
          width={700}
          centered
        >
          <div className="mb-4">
            <p className="font-medium">
              {responseType === 'Accepted'
                ? 'You are accepting this appointment request.'
                : 'You are denying this appointment request.'}
            </p>

            {selectedAppointment && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <div className="mb-2">
                  <span className="font-medium">Date & Time:</span> {dayjs(selectedAppointment.preferredDate).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')} - {selectedAppointment.preferredTimeSlot}
                </div>
                <div className="mb-2">
                  <span className="font-medium">Location:</span> {selectedAppointment.locationName}
                </div>
                {selectedAppointment.bloodGroupName && (
                  <div className="mb-2">
                    <span className="font-medium">Blood Group:</span> {selectedAppointment.bloodGroupName}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4">
            <p className="mb-2 font-medium">Additional Notes (Optional):</p>
            <Input.TextArea
              rows={3}
              placeholder={responseType === 'Denied' ? "Please provide a reason for denying (optional)" : "Add any additional notes (optional)"}
              value={responseNote}
              onChange={(e) => setResponseNote(e.target.value)}
            />
            {responseType === 'Denied' && !responseNote && (
              <p className="text-xs text-gray-500 mt-1">
                If no reason is provided, a default message will be sent.
              </p>
            )}
          </div>
        </Modal>

        {/* Appointment Detail Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <CalendarOutlined className="mr-2" />
              <span>Appointment Details</span>
            </div>
          }
          open={isAppointmentDetailModalVisible}
          onCancel={() => setIsAppointmentDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsAppointmentDetailModalVisible(false)}>
              Close
            </Button>
          ]}
          width={900}
          centered
        >
          {loadingAppointmentDetail ? (
            <div className="flex justify-center items-center py-10">
              <Spin size="large" />
            </div>
          ) : appointmentDetail ? (
            <div>
              <Card className="mb-4">
                <Descriptions title="Thông tin người hiến máu" bordered column={2}>
                  <Descriptions.Item label="Họ tên" span={2}>
                    <strong>{appointmentDetail.donorName}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {appointmentDetail.donorEmail}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {appointmentDetail.donorPhone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nhóm máu">
                    <Tag color="red">{appointmentDetail.bloodGroupName || 'Chưa xác định'}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại hiến máu">
                    <Tag color={getDonationTypeColor(appointmentDetail.componentTypeName)}>
                      {appointmentDetail.componentTypeName || 'Máu toàn phần'}
                    </Tag>
                  </Descriptions.Item>
                  {/* <Descriptions.Item label="Tổng số lần hiến máu">
                    {appointmentDetail.totalDonations || 0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Lần hiến máu gần nhất">
                    {appointmentDetail.lastDonationDate ?
                      dayjs(appointmentDetail.lastDonationDate).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss') :
                      'Chưa có thông tin'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Lần hiến máu tiếp theo">
                    {appointmentDetail.nextEligibleDonationDate ?
                      dayjs(appointmentDetail.nextEligibleDonationDate).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss') :
                      'Chưa có thông tin'}
                  </Descriptions.Item> */}
                </Descriptions>
              </Card>

              <Card className="mb-4">
                <Descriptions title="Thông tin cuộc hẹn" bordered column={2}>
                  <Descriptions.Item label="Mã cuộc hẹn" span={2}>
                    {appointmentDetail.id}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag color={getStatusColor(appointmentDetail.status)}>
                      {appointmentDetail.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại yêu cầu">
                    {appointmentDetail.requestType}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày hẹn">
                    {dayjs(appointmentDetail.preferredDate).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Khung giờ">
                    {appointmentDetail.preferredTimeSlot}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa điểm" span={2}>
                    {appointmentDetail.locationName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ" span={2}>
                    {appointmentDetail.locationAddress}
                  </Descriptions.Item>
                  <Descriptions.Item label="Khẩn cấp">
                    {appointmentDetail.isUrgent ? (
                      <Tag color="red">Khẩn cấp</Tag>
                    ) : (
                      <Tag color="green">Thường</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Độ ưu tiên">
                    {appointmentDetail.priority}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ghi chú" span={2}>
                    {appointmentDetail.notes || 'Không có ghi chú'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card className="mb-4">
                <Descriptions title="Thông tin xử lý" bordered column={2}>
                  {appointmentDetail.reviewedByUserName && (
                    <>
                      <Descriptions.Item label="Người xử lý">
                        {appointmentDetail.reviewedByUserName}
                      </Descriptions.Item>
                      <Descriptions.Item label="Thời gian xử lý">
                        {appointmentDetail.reviewedAt ?
                          dayjs(appointmentDetail.reviewedAt).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss') :
                          'Chưa xử lý'}
                      </Descriptions.Item>
                    </>
                  )}
                  {appointmentDetail.rejectionReason && (
                    <Descriptions.Item label="Lý do từ chối" span={2}>
                      {appointmentDetail.rejectionReason}
                    </Descriptions.Item>
                  )}
                  {appointmentDetail.checkInTime && (
                    <Descriptions.Item label="Thời gian check-in">
                      {dayjs(appointmentDetail.checkInTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')}
                    </Descriptions.Item>
                  )}
                  {appointmentDetail.completedTime && (
                    <Descriptions.Item label="Thời gian hoàn thành">
                      {dayjs(appointmentDetail.completedTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')}
                    </Descriptions.Item>
                  )}
                  {appointmentDetail.cancelledTime && (
                    <Descriptions.Item label="Thời gian hủy">
                      {dayjs(appointmentDetail.cancelledTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Thời gian tạo">
                    {dayjs(appointmentDetail.createdTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cập nhật lần cuối">
                    {appointmentDetail.lastUpdatedTime ?
                      dayjs(appointmentDetail.lastUpdatedTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss') :
                      'Chưa cập nhật'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </div>
          ) : (
            <Empty description="Không tìm thấy thông tin cuộc hẹn" />
          )}
        </Modal>
      </div>
    </div>
  );
} 