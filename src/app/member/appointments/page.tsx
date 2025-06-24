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
  EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { CalendarMode } from 'antd/es/calendar/generateCalendar';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

// Mock data for appointments
const mockAppointments = [
  {
    id: 1,
    date: '2023-12-22',
    time: '10:00 AM',
    facility: 'Central Blood Bank',
    facilityId: 1,
    address: '123 Main St, District 1, HCMC',
    status: 'confirmed',
    donationType: 'Whole Blood',
    notes: 'Regular donation appointment',
  },
  {
    id: 2,
    date: '2024-01-15',
    time: '2:30 PM',
    facility: 'City Hospital Blood Center',
    facilityId: 2,
    address: '456 Oak St, District 3, HCMC',
    status: 'pending',
    donationType: 'Platelets',
    notes: 'First time donating platelets',
  },
  {
    id: 3,
    date: '2023-11-05',
    time: '9:15 AM',
    facility: 'Mobile Blood Drive - City Hall',
    facilityId: 3,
    address: '789 Government St, District 1, HCMC',
    status: 'completed',
    donationType: 'Whole Blood',
    notes: 'Community blood drive',
  },
  {
    id: 4,
    date: '2023-10-12',
    time: '11:00 AM',
    facility: 'Central Blood Bank',
    facilityId: 1,
    address: '123 Main St, District 1, HCMC',
    status: 'cancelled',
    donationType: 'Whole Blood',
    notes: 'Cancelled due to illness',
  },
];

// Mock data for donation centers
const mockDonationCenters = [
  {
    id: 1,
    name: 'Central Blood Bank',
    address: '123 Main St, District 1, HCMC',
    phone: '(+84) 28-1234-5678',
    openingHours: '8:00 AM - 5:00 PM',
    donationTypes: ['Whole Blood', 'Platelets', 'Plasma'],
  },
  {
    id: 2,
    name: 'City Hospital Blood Center',
    address: '456 Oak St, District 3, HCMC',
    phone: '(+84) 28-2345-6789',
    openingHours: '9:00 AM - 6:00 PM',
    donationTypes: ['Whole Blood', 'Double Red Cells', 'Platelets', 'Plasma'],
  },
  {
    id: 3,
    name: 'Mobile Blood Drive - City Hall',
    address: '789 Government St, District 1, HCMC',
    phone: '(+84) 28-3456-7890',
    openingHours: '8:00 AM - 3:00 PM',
    donationTypes: ['Whole Blood'],
  },
];

const donationTypes = ['Whole Blood', 'Platelets', 'Plasma', 'Double Red Cells'];

export default function AppointmentsPage() {
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [form] = Form.useForm();
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);

  const showCreateModal = () => {
    setModalMode('create');
    setSelectedAppointment(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (appointment: any) => {
    setModalMode('edit');
    setSelectedAppointment(appointment);
    form.setFieldsValue({
      donationCenter: appointment.facilityId,
      donationType: appointment.donationType,
      date: dayjs(appointment.date),
      time: dayjs(appointment.time, 'h:mm A'),
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

  const showCancelConfirm = (appointmentId: number) => {
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
        return <CloseCircleOutlined />;
      default:
        return null;
    }
  };

  const getDonationTypeColor = (type: string) => {
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
      dataIndex: 'date',
      key: 'date',
      sorter: (a: any, b: any) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (text: string, record: any) => (
        <span>
          <div className="flex items-center">
            <CalendarOutlined className="mr-1" /> {dayjs(text).format('MMM D, YYYY')}
          </div>
          <div className="flex items-center text-gray-500 mt-1">
            <ClockCircleOutlined className="mr-1" /> {record.time}
          </div>
        </span>
      ),
    },
    {
      title: 'Facility',
      dataIndex: 'facility',
      key: 'facility',
      render: (text: string, record: any) => (
        <span>
          <div>{text}</div>
          <div className="flex items-center text-gray-500 mt-1 text-xs">
            <EnvironmentOutlined className="mr-1" /> {record.address}
          </div>
        </span>
      ),
    },
    {
      title: 'Donation Type',
      dataIndex: 'donationType',
      key: 'donationType',
      render: (text: string) => (
        <Tag color={getDonationTypeColor(text)}>{text}</Tag>
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
      render: (_: any, record: any) => {
        if (record.status === 'completed' || record.status === 'cancelled') {
          return (
            <Button 
              type="link" 
              onClick={() => console.log('View details', record.id)}
            >
              View Details
            </Button>
          );
        }
        
        return (
          <div className="flex space-x-2">
            <Tooltip title="Edit Appointment">
              <Button 
                icon={<EditOutlined />} 
                type="primary" 
                size="small" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => showEditModal(record)}
                disabled={record.status === 'completed' || dayjs(record.date).isBefore(dayjs(), 'day')}
              >
                Edit
              </Button>
            </Tooltip>
            <Tooltip title="Cancel Appointment">
              <Button 
                danger 
                size="small"
                onClick={() => showCancelConfirm(record.id)}
                disabled={record.status === 'completed' || record.status === 'cancelled'}
              >
                Cancel
              </Button>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const upcomingAppointments = mockAppointments.filter(
    appointment => 
      (appointment.status === 'confirmed' || appointment.status === 'pending') && 
      dayjs(appointment.date).isAfter(dayjs()) || dayjs(appointment.date).isSame(dayjs(), 'day')
  );

  const pastAppointments = mockAppointments.filter(
    appointment => 
      dayjs(appointment.date).isBefore(dayjs(), 'day') || 
      appointment.status === 'completed' || 
      appointment.status === 'cancelled'
  );

  const dateCellRender = (value: dayjs.Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const appointmentsOnDate = mockAppointments.filter(appointment => appointment.date === dateStr);
    
    return (
      <ul className="events p-0 m-0 list-none">
        {appointmentsOnDate.map(appointment => (
          <li key={appointment.id} className="mb-1">
            <Badge 
              color={getStatusColor(appointment.status)} 
              text={
                <span className="text-xs">
                  {appointment.time} - {appointment.facility}
                </span>
              } 
            />
          </li>
        ))}
      </ul>
    );
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
        <div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showCreateModal}
            className="bg-red-600 hover:bg-red-700"
          >
            New Appointment
          </Button>
        </div>
      </div>
    );
  };

  // Define tab items for Tabs component
  const tabItems = [
    {
      key: 'upcoming',
      label: <span><CalendarOutlined /> Upcoming Appointments</span>,
      children: upcomingAppointments.length > 0 ? (
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
      label: <span><ClockCircleOutlined /> Past Appointments</span>,
      children: pastAppointments.length > 0 ? (
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
      key: 'calendar',
      label: <span><CalendarOutlined /> Calendar View</span>,
      children: (
        <Calendar 
          dateCellRender={dateCellRender} 
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

        <Tabs 
          activeKey={activeTab} 
          onChange={(key) => setActiveTab(key)}
          items={tabItems}
          tabBarExtraContent={
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={showCreateModal}
              className="bg-red-600 hover:bg-red-700"
            >
              New Appointment
            </Button>
          }
        />

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
                {mockDonationCenters.map(center => (
                  <Option key={center.id} value={center.id}>
                    {center.name} - {center.address}
                  </Option>
                ))}
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