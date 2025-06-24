'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Typography, 
  Card, 
  Spin, 
  Tabs, 
  Table, 
  Tag, 
  Button, 
  Progress, 
  Space, 
  Steps, 
  Tooltip, 
  Badge, 
  Dropdown, 
  Modal, 
  Empty, 
  Alert, 
  Descriptions, 
  Statistic,
  Timeline,
  Collapse
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  UserOutlined, 
  ExclamationCircleOutlined, 
  HeartOutlined, 
  FileTextOutlined,
  PhoneOutlined,
  MailOutlined,
  MoreOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ArrowRightOutlined,
  LikeOutlined,
  AuditOutlined,
  MessageOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;
const { Panel } = Collapse;
const { confirm } = Modal;

// Mock data for blood requests
const mockBloodRequests = [
  {
    id: 1,
    patientName: 'Nguyen Van A (Self)',
    bloodType: 'A+',
    requiredComponents: ['Whole Blood'],
    quantity: 2, // units
    urgency: 'normal',
    reason: 'Scheduled Surgery',
    hospital: 'City General Hospital',
    hospitalAddress: '123 Health St, District 1, HCMC',
    date: '2023-12-05',
    status: 'fulfilled',
    progress: 100,
    donorsMatched: 3,
    donorsConfirmed: 2,
    donorsCompleted: 2,
    notes: 'Surgery went well. Thank you to all donors!',
    updates: [
      { time: '2023-11-20 09:15', message: 'Request created' },
      { time: '2023-11-20 10:30', message: '3 potential donors matched' },
      { time: '2023-11-22 14:20', message: '2 donors confirmed appointment' },
      { time: '2023-12-01 11:45', message: '2 donors completed donation' },
      { time: '2023-12-05 09:00', message: 'Blood used in successful surgery' },
    ],
    donors: [
      { id: 101, name: 'Tran Van B', bloodType: 'A+', status: 'completed', date: '2023-11-30' },
      { id: 102, name: 'Le Thi C', bloodType: 'O+', status: 'completed', date: '2023-12-01' },
    ]
  },
  {
    id: 2,
    patientName: 'Pham Thi B (Family)',
    bloodType: 'B-',
    requiredComponents: ['Red Blood Cells', 'Platelets'],
    quantity: 3, // units
    urgency: 'high',
    reason: 'Cancer Treatment',
    hospital: 'Oncology Medical Center',
    hospitalAddress: '456 Medical Blvd, District 3, HCMC',
    date: '2023-12-15',
    status: 'in-progress',
    progress: 67,
    donorsMatched: 5,
    donorsConfirmed: 3,
    donorsCompleted: 2,
    notes: 'Need B- donors for ongoing cancer treatment',
    updates: [
      { time: '2023-12-01 14:20', message: 'Request created' },
      { time: '2023-12-01 15:10', message: '5 potential donors matched' },
      { time: '2023-12-02 10:45', message: '3 donors confirmed appointment' },
      { time: '2023-12-05 16:30', message: '2 donors completed donation' },
    ],
    donors: [
      { id: 103, name: 'Nguyen Van D', bloodType: 'B-', status: 'completed', date: '2023-12-04' },
      { id: 104, name: 'Hoang Van E', bloodType: 'O-', status: 'completed', date: '2023-12-05' },
      { id: 105, name: 'Tran Thi F', bloodType: 'B-', status: 'scheduled', date: '2023-12-10' },
    ]
  },
  {
    id: 3,
    patientName: 'Do Van C (Friend)',
    bloodType: 'O+',
    requiredComponents: ['Whole Blood'],
    quantity: 1, // units
    urgency: 'emergency',
    reason: 'Accident Victim',
    hospital: 'Emergency Hospital',
    hospitalAddress: '789 Urgent St, District 5, HCMC',
    date: '2023-11-25',
    status: 'fulfilled',
    progress: 100,
    donorsMatched: 4,
    donorsConfirmed: 1,
    donorsCompleted: 1,
    notes: 'Emergency request for accident victim. Patient is now stable.',
    updates: [
      { time: '2023-11-25 08:30', message: 'Emergency request created' },
      { time: '2023-11-25 08:35', message: '4 potential donors matched and notified' },
      { time: '2023-11-25 09:15', message: '1 donor confirmed and arrived at hospital' },
      { time: '2023-11-25 10:00', message: 'Donation completed' },
      { time: '2023-11-25 11:30', message: 'Blood transfusion successful' },
    ],
    donors: [
      { id: 106, name: 'Pham Van G', bloodType: 'O+', status: 'completed', date: '2023-11-25' },
    ]
  },
  {
    id: 4,
    patientName: 'Ly Thi D (Self)',
    bloodType: 'AB+',
    requiredComponents: ['Plasma'],
    quantity: 2, // units
    urgency: 'normal',
    reason: 'Chronic Condition',
    hospital: 'Hematology Center',
    hospitalAddress: '101 Blood St, District 10, HCMC',
    date: '2023-12-20',
    status: 'pending',
    progress: 25,
    donorsMatched: 3,
    donorsConfirmed: 0,
    donorsCompleted: 0,
    notes: 'Regular plasma therapy',
    updates: [
      { time: '2023-12-07 11:20', message: 'Request created' },
      { time: '2023-12-07 14:15', message: '3 potential donors matched' },
    ],
    donors: []
  }
];

export default function MyBloodRequestsPage() {
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('active');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [donorsModalVisible, setDonorsModalVisible] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);

  const showDetailsModal = (request: any) => {
    setSelectedRequest(request);
    setDetailsModalVisible(true);
  };

  const showDonorsModal = (request: any) => {
    setSelectedRequest(request);
    setDonorsModalVisible(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalVisible(false);
  };

  const closeDonorsModal = () => {
    setDonorsModalVisible(false);
  };

  const showCancelConfirm = (requestId: number) => {
    confirm({
      title: 'Are you sure you want to cancel this blood request?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone. Any matched donors will be notified.',
      okText: 'Yes, Cancel Request',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        console.log('Cancelling request', requestId);
        // Here you would make an API call to cancel the request
      },
    });
  };

  // Filter requests based on status
  const activeRequests = mockBloodRequests.filter(
    request => ['pending', 'in-progress'].includes(request.status)
  );

  const completedRequests = mockBloodRequests.filter(
    request => ['fulfilled', 'cancelled'].includes(request.status)
  );

  const getUrgencyTag = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'emergency':
        return <Tag color="red" icon={<ExclamationCircleOutlined />}>Emergency</Tag>;
      case 'high':
        return <Tag color="orange">High</Tag>;
      case 'normal':
        return <Tag color="blue">Normal</Tag>;
      default:
        return <Tag color="default">{urgency}</Tag>;
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'pending':
        return <Tag color="gold" icon={<ClockCircleOutlined />}>Pending</Tag>;
      case 'in-progress':
        return <Tag color="processing" icon={<ClockCircleOutlined />}>In Progress</Tag>;
      case 'fulfilled':
        return <Tag color="success" icon={<CheckCircleOutlined />}>Fulfilled</Tag>;
      case 'cancelled':
        return <Tag color="error" icon={<CloseCircleOutlined />}>Cancelled</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getStatusSteps = (request: any) => {
    const steps = [
      { title: 'Request Created', status: 'finish' },
      { title: 'Donors Matched', status: request.donorsMatched > 0 ? 'finish' : 'wait' },
      { title: 'Donations Scheduled', status: request.donorsConfirmed > 0 ? 'finish' : 'wait' },
      { title: 'Donations Complete', status: request.donorsCompleted >= request.quantity ? 'finish' : (request.donorsCompleted > 0 ? 'process' : 'wait') },
      { title: 'Request Fulfilled', status: request.status === 'fulfilled' ? 'finish' : 'wait' },
    ];

    return steps;
  };

  const activeColumns = [
    {
      title: 'Request Info',
      dataIndex: 'patientName',
      key: 'patientName',
      render: (text: string, record: any) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">
            <Badge color="red" /> {record.bloodType} • {record.requiredComponents.join(', ')}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {getUrgencyTag(record.urgency)} {record.reason}
          </div>
        </div>
      ),
    },
    {
      title: 'Hospital',
      dataIndex: 'hospital',
      key: 'hospital',
      render: (text: string, record: any) => (
        <div>
          <div>{text}</div>
          <div className="text-xs text-gray-500 mt-1">
            <EnvironmentOutlined className="mr-1" />
            {record.hospitalAddress}
          </div>
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => (
        <div>
          <div>{dayjs(text).format('MMM D, YYYY')}</div>
          <div className="text-xs text-gray-500">
            {dayjs(text).fromNow()}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text: string, record: any) => (
        <div>
          {getStatusTag(text)}
          <Progress 
            percent={record.progress} 
            size="small" 
            status={record.status === 'fulfilled' ? 'success' : 'active'} 
            className="mt-2"
          />
          <div className="text-xs text-gray-500 mt-1">
            <TeamOutlined className="mr-1" />
            {record.donorsCompleted}/{record.quantity} units collected
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<FileTextOutlined />} 
            onClick={() => showDetailsModal(record)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Details
          </Button>
          {record.status !== 'fulfilled' && (
            <Dropdown 
              menu={{ 
                items: [
                  {
                    key: '1',
                    icon: <EditOutlined />,
                    label: 'Edit Request',
                    onClick: () => router.push(`/member/emergency-request/edit/${record.id}`),
                  },
                  {
                    key: '2',
                    icon: <TeamOutlined />,
                    label: 'View Donors',
                    onClick: () => showDonorsModal(record),
                  },
                  {
                    key: '3',
                    icon: <CloseCircleOutlined />,
                    label: 'Cancel Request',
                    danger: true,
                    onClick: () => showCancelConfirm(record.id),
                  },
                ]
              }} 
              placement="bottomRight"
            >
              <Button icon={<MoreOutlined />} size="small" />
            </Dropdown>
          )}
        </Space>
      ),
    },
  ];

  const completedColumns = [
    ...activeColumns.slice(0, -1),
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<FileTextOutlined />} 
            onClick={() => showDetailsModal(record)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Details
          </Button>
          <Button 
            type="default" 
            size="small" 
            icon={<TeamOutlined />} 
            onClick={() => showDonorsModal(record)}
          >
            Donors
          </Button>
        </Space>
      ),
    },
  ];

  // Donor list columns for the donors modal
  const donorColumns = [
    {
      title: 'Donor',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div className="flex items-center">
          <UserOutlined className="mr-2" />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Blood Type',
      dataIndex: 'bloodType',
      key: 'bloodType',
      render: (text: string) => (
        <Tag color="red">{text}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => {
        let icon, color;
        switch (text) {
          case 'completed':
            icon = <CheckCircleOutlined />;
            color = 'success';
            break;
          case 'scheduled':
            icon = <ClockCircleOutlined />;
            color = 'processing';
            break;
          case 'cancelled':
            icon = <CloseCircleOutlined />;
            color = 'error';
            break;
          default:
            icon = <ClockCircleOutlined />;
            color = 'default';
        }
        
        return (
          <Tag icon={icon} color={color}>
            {text.charAt(0).toUpperCase() + text.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => (
        dayjs(text).format('MMM D, YYYY')
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {record.status === 'completed' && (
            <Button 
              type="primary" 
              size="small" 
              icon={<LikeOutlined />}
              className="bg-green-600 hover:bg-green-700"
            >
              Thank
            </Button>
          )}
          <Button 
            type="default" 
            size="small" 
            icon={<MessageOutlined />}
          >
            Contact
          </Button>
        </Space>
      ),
    },
  ];

  // Define tab items for Tabs component
  const tabItems = [
    {
      key: 'active',
      label: (
        <span>
          <Badge status="processing" />
          <span className="ml-2">Active Requests</span>
        </span>
      ),
      children: activeRequests.length > 0 ? (
        <Table 
          dataSource={activeRequests} 
          columns={activeColumns} 
          rowKey="id" 
          pagination={false}
          className="shadow-sm"
        />
      ) : (
        <Empty 
          description="No active blood requests" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Link href="/member/emergency-request">
            <Button 
              type="primary" 
              className="bg-red-600 hover:bg-red-700 mt-4"
            >
              Create New Request
            </Button>
          </Link>
        </Empty>
      )
    },
    {
      key: 'completed',
      label: (
        <span>
          <Badge status="default" />
          <span className="ml-2">Completed</span>
        </span>
      ),
      children: completedRequests.length > 0 ? (
        <Table 
          dataSource={completedRequests} 
          columns={completedColumns} 
          rowKey="id" 
          pagination={false}
          className="shadow-sm"
        />
      ) : (
        <Empty 
          description="No completed blood requests" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <Title level={2}>My Blood Requests</Title>
            <Paragraph className="text-gray-500">
              Manage blood requests for yourself, family members, or friends
            </Paragraph>
          </div>
          
          <Link href="/member/emergency-request">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              size="large"
              className="bg-red-600 hover:bg-red-700 mt-4 md:mt-0"
            >
              New Request
            </Button>
          </Link>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={(key) => setActiveTab(key)}
          type="card"
          items={tabItems}
        />

        {/* Request Details Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <HeartOutlined className="text-red-500 mr-2" />
              <span>Blood Request Details</span>
            </div>
          }
          open={detailsModalVisible}
          onCancel={closeDetailsModal}
          footer={[
            <Button key="close" onClick={closeDetailsModal}>
              Close
            </Button>,
            selectedRequest && selectedRequest.status !== 'fulfilled' && selectedRequest.status !== 'cancelled' && (
              <Button 
                key="edit" 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={() => {
                  closeDetailsModal();
                  router.push(`/member/emergency-request/edit/${selectedRequest.id}`);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Edit Request
              </Button>
            )
          ]}
          width={800}
        >
          {selectedRequest && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="shadow-sm">
                  <Statistic 
                    title="Status" 
                    value={selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)} 
                    valueStyle={{ color: selectedRequest.status === 'fulfilled' ? '#52c41a' : selectedRequest.status === 'cancelled' ? '#ff4d4f' : '#1890ff' }}
                    prefix={
                      selectedRequest.status === 'fulfilled' ? <CheckCircleOutlined /> : 
                      selectedRequest.status === 'cancelled' ? <CloseCircleOutlined /> : 
                      <ClockCircleOutlined />
                    }
                  />
                </Card>
                <Card className="shadow-sm">
                  <Statistic 
                    title="Blood Type Needed" 
                    value={selectedRequest.bloodType} 
                    valueStyle={{ color: '#ff4d4f' }}
                    prefix={<HeartOutlined />}
                  />
                </Card>
                <Card className="shadow-sm">
                  <Statistic 
                    title="Progress" 
                    value={`${selectedRequest.donorsCompleted}/${selectedRequest.quantity} units`} 
                    prefix={<TeamOutlined />}
                  />
                  <Progress 
                    percent={selectedRequest.progress} 
                    status={selectedRequest.status === 'fulfilled' ? 'success' : 'active'} 
                    className="mt-2"
                  />
                </Card>
              </div>

              <Descriptions title="Request Information" bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Patient">{selectedRequest.patientName}</Descriptions.Item>
                <Descriptions.Item label="Components Needed">{selectedRequest.requiredComponents.join(', ')}</Descriptions.Item>
                <Descriptions.Item label="Urgency">{getUrgencyTag(selectedRequest.urgency)}</Descriptions.Item>
                <Descriptions.Item label="Reason">{selectedRequest.reason}</Descriptions.Item>
                <Descriptions.Item label="Date Needed">{dayjs(selectedRequest.date).format('MMMM D, YYYY')}</Descriptions.Item>
                <Descriptions.Item label="Created">{dayjs(selectedRequest.updates[0].time).format('MMMM D, YYYY')}</Descriptions.Item>
                <Descriptions.Item label="Hospital" span={2}>{selectedRequest.hospital}</Descriptions.Item>
                <Descriptions.Item label="Address" span={2}>{selectedRequest.hospitalAddress}</Descriptions.Item>
              </Descriptions>

              <div className="mt-6">
                <Collapse defaultActiveKey={['1', '2']}>
                  <Panel header="Request Progress" key="1">
                    <Steps 
                      current={getStatusSteps(selectedRequest).findIndex(step => step.status === 'process')}
                      status={
                        selectedRequest.status === 'cancelled' ? 'error' : 
                        getStatusSteps(selectedRequest).some(step => step.status === 'process') ? 'process' : 
                        getStatusSteps(selectedRequest).every(step => step.status === 'finish') ? 'finish' : 'wait'
                      }
                      direction="horizontal"
                      size="small"
                      className="mt-4 px-2"
                    >
                      {getStatusSteps(selectedRequest).map((step, index) => (
                        <Step key={index} title={step.title} />
                      ))}
                    </Steps>
                  </Panel>
                  
                  <Panel header="Activity Timeline" key="2">
                    <Timeline className="mt-4">
                      {selectedRequest.updates.map((update: any, index: number) => (
                        <Timeline.Item key={index} color={index === 0 ? 'green' : 'blue'}>
                          <p>{update.message}</p>
                          <p className="text-xs text-gray-500">{dayjs(update.time).format('MMM D, YYYY h:mm A')}</p>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </Panel>
                  
                  {selectedRequest.notes && (
                    <Panel header="Additional Notes" key="3">
                      <Paragraph>{selectedRequest.notes}</Paragraph>
                    </Panel>
                  )}
                </Collapse>
              </div>

              <div className="mt-6 flex justify-between">
                <Button 
                  type="default" 
                  icon={<TeamOutlined />}
                  onClick={() => {
                    closeDetailsModal();
                    showDonorsModal(selectedRequest);
                  }}
                >
                  View Donors ({selectedRequest.donors.length})
                </Button>
                
                {selectedRequest.status !== 'fulfilled' && selectedRequest.status !== 'cancelled' && (
                  <Button 
                    danger 
                    icon={<CloseCircleOutlined />}
                    onClick={() => {
                      closeDetailsModal();
                      showCancelConfirm(selectedRequest.id);
                    }}
                  >
                    Cancel Request
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Donors Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <TeamOutlined className="mr-2" />
              <span>Donors for Request #{selectedRequest?.id}</span>
            </div>
          }
          open={donorsModalVisible}
          onCancel={closeDonorsModal}
          footer={[
            <Button key="close" onClick={closeDonorsModal}>
              Close
            </Button>
          ]}
          width={800}
        >
          {selectedRequest && (
            <div>
              <Alert 
                message={
                  <div className="flex items-center">
                    <HeartOutlined className="text-red-500 mr-2" />
                    <span>
                      <strong>{selectedRequest.bloodType}</strong> {selectedRequest.requiredComponents.join(', ')} • 
                      {selectedRequest.donorsCompleted}/{selectedRequest.quantity} units collected
                    </span>
                  </div>
                }
                type="info"
                className="mb-4"
              />
              
              {selectedRequest.donors.length > 0 ? (
                <Table 
                  dataSource={selectedRequest.donors} 
                  columns={donorColumns} 
                  rowKey="id" 
                  pagination={false}
                />
              ) : (
                <Empty description="No donors have been matched yet" />
              )}
              
              {selectedRequest.status === 'pending' || selectedRequest.status === 'in-progress' ? (
                <div className="mt-6">
                  <Alert
                    type="info"
                    showIcon
                    message="Finding More Donors"
                    description={
                      <div>
                        <p>Our system is actively looking for more donors that match your requirements.</p>
                        <p className="mt-2">You'll be notified when new donors are found.</p>
                      </div>
                    }
                  />
                </div>
              ) : null}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
} 