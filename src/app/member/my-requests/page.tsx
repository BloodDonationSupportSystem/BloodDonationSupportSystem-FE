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
  Collapse,
  Input,
  message,
  Form,
  Select,
  DatePicker,
  InputNumber
} from 'antd';
import HtmlContent from '@/components/Common/HtmlContent';
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
import { BloodRequestDetail, getUserBloodRequests, updateRequestStatus, updateBloodRequest, UpdateBloodRequestRequest } from '@/services/api/bloodRequestService';
import { useBloodGroups } from '@/hooks/api/useBloodGroups';
import { useComponentTypes } from '@/hooks/api/useComponentTypes';
import { useLocations } from '@/hooks/api/useLocations';

dayjs.extend(relativeTime);

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;
const { Panel } = Collapse;
const { confirm } = Modal;
const { TextArea } = Input;

export default function MyBloodRequestsPage() {
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<BloodRequestDetail | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [donorsModalVisible, setDonorsModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);

  // API data states
  const [bloodRequests, setBloodRequests] = useState<BloodRequestDetail[]>([]);
  const [fetchingRequests, setFetchingRequests] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch blood groups, component types, and locations for edit form
  const { bloodGroups, isLoading: bloodGroupsLoading } = useBloodGroups();
  const { componentTypes, isLoading: componentTypesLoading } = useComponentTypes();
  const { locations, isLoading: locationsLoading } = useLocations();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);

  // Fetch user's blood requests
  useEffect(() => {
    const fetchUserRequests = async () => {
      if (!isLoggedIn || !user) return;

      try {
        setFetchingRequests(true);
        setFetchError(null);

        const response = await getUserBloodRequests(user.id);

        if (response.success && response.data) {
          setBloodRequests(response.data);
        } else {
          setFetchError(response.message || 'Failed to load blood requests');
        }
      } catch (error) {
        console.error('Error fetching blood requests:', error);
        setFetchError('An error occurred while loading your blood requests');
      } finally {
        setFetchingRequests(false);
      }
    };

    fetchUserRequests();
  }, [isLoggedIn, user]);

  const showDetailsModal = (request: BloodRequestDetail) => {
    setSelectedRequest(request);
    setDetailsModalVisible(true);
  };

  const showDonorsModal = (request: BloodRequestDetail) => {
    setSelectedRequest(request);
    setDonorsModalVisible(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalVisible(false);
  };

  const closeDonorsModal = () => {
    setDonorsModalVisible(false);
  };

  const showCancelModal = (request: BloodRequestDetail) => {
    setSelectedRequest(request);
    setCancelModalVisible(true);
  };

  const closeCancelModal = () => {
    setCancelModalVisible(false);
    setCancelReason('');
  };

  const handleCancelRequest = async () => {
    if (!selectedRequest) return;

    setCancelLoading(true);

    try {
      const response = await updateRequestStatus(selectedRequest.id, {
        status: 'Cancelled',
        notes: cancelReason || 'Cancelled by user',
        isActive: false
      });

      if (response.success) {
        message.success('Blood request cancelled successfully');

        // Update the request in the local state
        setBloodRequests(prev =>
          prev.map(req =>
            req.id === selectedRequest.id
              ? { ...req, status: 'Cancelled', isActive: false }
              : req
          )
        );

        closeCancelModal();
        closeDetailsModal();
      } else {
        message.error(response.message || 'Failed to cancel request');
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      message.error('An error occurred while cancelling the request');
    } finally {
      setCancelLoading(false);
    }
  };

  const showEditModal = (request: BloodRequestDetail) => {
    setSelectedRequest(request);

    // Set form values
    editForm.setFieldsValue({
      patientName: request.patientName,
      quantityUnits: request.quantityUnits,
      urgencyLevel: request.urgencyLevel,
      neededByDate: dayjs(request.neededByDate),
      bloodGroupId: request.bloodGroupId,
      componentTypeId: request.componentTypeId,
      locationId: request.locationId,
      hospitalName: request.hospitalName,
      contactInfo: request.contactInfo,
      address: request.address,
      medicalNotes: request.medicalNotes || '',
      isEmergency: request.isEmergency
    });

    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    editForm.resetFields();
  };

  const handleEditRequest = async (values: any) => {
    if (!selectedRequest) return;

    setEditLoading(true);

    try {
      const updateData: UpdateBloodRequestRequest = {
        ...values,
        neededByDate: values.neededByDate.toISOString()
      };

      const response = await updateBloodRequest(selectedRequest.id, updateData);

      if (response.success) {
        message.success('Blood request updated successfully');

        // Update the request in the local state
        const updatedRequest = { ...selectedRequest, ...updateData };
        setBloodRequests(prev =>
          prev.map(req => req.id === selectedRequest.id ? updatedRequest : req)
        );

        closeEditModal();

        // Refresh the requests list
        if (user) {
          const refreshResponse = await getUserBloodRequests(user.id);
          if (refreshResponse.success && refreshResponse.data) {
            setBloodRequests(refreshResponse.data);
          }
        }
      } else {
        message.error(response.message || 'Failed to update request');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      message.error('An error occurred while updating the request');
    } finally {
      setEditLoading(false);
    }
  };

  // Filter requests based on status
  const activeRequests = bloodRequests.filter(
    request => request.isActive && ['Pending', 'Processing', 'In Progress'].includes(request.status)
  );

  const completedRequests = bloodRequests.filter(
    request => !request.isActive || ['Fulfilled', 'Cancelled', 'Completed'].includes(request.status)
  );

  const getUrgencyTag = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'critical':
        return <Tag color="red" icon={<ExclamationCircleOutlined />}>Critical</Tag>;
      case 'high':
        return <Tag color="orange">High</Tag>;
      case 'medium':
        return <Tag color="blue">Medium</Tag>;
      default:
        return <Tag color="default">{urgency}</Tag>;
    }
  };

  const getStatusTag = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Tag color="gold" icon={<ClockCircleOutlined />}>Pending</Tag>;
      case 'processing':
      case 'in progress':
        return <Tag color="processing" icon={<ClockCircleOutlined />}>In Progress</Tag>;
      case 'fulfilled':
      case 'completed':
        return <Tag color="success" icon={<CheckCircleOutlined />}>Fulfilled</Tag>;
      case 'cancelled':
        return <Tag color="error" icon={<CloseCircleOutlined />}>Cancelled</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  // Calculate progress based on status
  const calculateProgress = (request: BloodRequestDetail) => {
    switch (request.status.toLowerCase()) {
      case 'pending':
        return 25;
      case 'processing':
      case 'in progress':
        return 50;
      case 'fulfilled':
      case 'completed':
        return 100;
      case 'cancelled':
        return 0;
      default:
        return 0;
    }
  };

  const getStatusSteps = (request: BloodRequestDetail) => {
    // Calculate the current step based on status
    let currentStep = 0;
    switch (request.status.toLowerCase()) {
      case 'pending':
        currentStep = 0;
        break;
      case 'processing':
      case 'in progress':
        currentStep = 2;
        break;
      case 'fulfilled':
      case 'completed':
        currentStep = 4;
        break;
      case 'cancelled':
        currentStep = -1; // Special case for cancelled
        break;
    }

    const steps = [
      { title: 'Request Created', status: currentStep >= 0 ? 'finish' : 'wait' },
      { title: 'Request Processing', status: currentStep >= 1 ? 'finish' : (currentStep === 0 ? 'wait' : 'error') },
      { title: 'Donors Matched', status: currentStep >= 2 ? 'finish' : (currentStep < 0 ? 'error' : 'wait') },
      { title: 'Donations Complete', status: currentStep >= 3 ? 'finish' : (currentStep < 0 ? 'error' : 'wait') },
      { title: 'Request Fulfilled', status: currentStep >= 4 ? 'finish' : (currentStep < 0 ? 'error' : 'wait') },
    ];

    return steps;
  };

  const activeColumns = [
    {
      title: 'Request Info',
      dataIndex: 'patientName',
      key: 'patientName',
      render: (text: string, record: BloodRequestDetail) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">
            <Badge color="red" /> {record.bloodGroupName} • {record.componentTypeName}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {getUrgencyTag(record.urgencyLevel)} {record.isEmergency ? 'Emergency' : 'Regular'}
          </div>
        </div>
      ),
    },
    {
      title: 'Hospital',
      dataIndex: 'hospitalName',
      key: 'hospitalName',
      render: (text: string, record: BloodRequestDetail) => (
        <div>
          <div>{text}</div>
          <div className="text-xs text-gray-500 mt-1">
            <EnvironmentOutlined className="mr-1" />
            {record.address}
          </div>
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'neededByDate',
      key: 'neededByDate',
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
      render: (text: string, record: BloodRequestDetail) => (
        <div>
          {getStatusTag(text)}
          {/* <Progress
            percent={calculateProgress(record)}
            size="small"
            status={record.status.toLowerCase() === 'fulfilled' || record.status.toLowerCase() === 'completed' ? 'success' : 'active'}
            className="mt-2"
          /> */}
          <div className="text-xs text-gray-500 mt-1">
            <TeamOutlined className="mr-1" />
            {record.quantityUnits} units requested
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: BloodRequestDetail) => (
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
          {record.status.toLowerCase() === 'pending' && (
            <Dropdown
              menu={{
                items: [
                  {
                    key: '1',
                    icon: <EditOutlined />,
                    label: 'Edit Request',
                    onClick: () => showEditModal(record),
                  },
                  {
                    key: '3',
                    icon: <CloseCircleOutlined />,
                    label: 'Cancel Request',
                    danger: true,
                    onClick: () => showCancelModal(record),
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
      render: (_: any, record: BloodRequestDetail) => (
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
        </Space>
      ),
    },
  ];

  // Define tab items for Tabs component
  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          <Badge status="default" />
          <span className="ml-2">All Requests</span>
        </span>
      ),
      children: fetchingRequests ? (
        <div className="text-center py-12">
          <Spin size="large" />
          <div className="mt-4">Loading your blood requests...</div>
        </div>
      ) : fetchError ? (
        <Alert
          message="Error Loading Requests"
          description={fetchError}
          type="error"
          showIcon
        />
      ) : bloodRequests.length > 0 ? (
        <Table
          dataSource={bloodRequests}
          columns={activeColumns}
          rowKey="id"
          pagination={false}
          className="shadow-sm"
        />
      ) : (
        <Empty
          description="No blood requests"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )
    },
    {
      key: 'active',
      label: (
        <span>
          <Badge status="processing" />
          <span className="ml-2">Active Requests</span>
        </span>
      ),
      children: fetchingRequests ? (
        <div className="text-center py-12">
          <Spin size="large" />
          <div className="mt-4">Loading your blood requests...</div>
        </div>
      ) : fetchError ? (
        <Alert
          message="Error Loading Requests"
          description={fetchError}
          type="error"
          showIcon
        />
      ) : activeRequests.length > 0 ? (
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
          {/* <Link href="/member/emergency-request">
            <Button
              type="primary"
              className="bg-red-600 hover:bg-red-700 mt-4"
            >
              Create New Request
            </Button>
          </Link> */}
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
      children: fetchingRequests ? (
        <div className="text-center py-12">
          <Spin size="large" />
          <div className="mt-4">Loading your blood requests...</div>
        </div>
      ) : fetchError ? (
        <Alert
          message="Error Loading Requests"
          description={fetchError}
          type="error"
          showIcon
        />
      ) : completedRequests.length > 0 ? (
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

          {/* <Link href="/member/emergency-request">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              className="bg-red-600 hover:bg-red-700 mt-4 md:mt-0"
            >
              New Request
            </Button>
          </Link> */}
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
            selectedRequest && selectedRequest.status.toLowerCase() === 'pending' && (
              <Button
                key="edit"
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  closeDetailsModal();
                  showEditModal(selectedRequest);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Edit Request
              </Button>
            )
          ]}
          width={1000}
        >
          {selectedRequest && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="shadow-sm">
                  <Statistic
                    title="Status"
                    value={selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                    valueStyle={{
                      color: selectedRequest.status.toLowerCase() === 'fulfilled' || selectedRequest.status.toLowerCase() === 'completed' ? '#52c41a' :
                        selectedRequest.status.toLowerCase() === 'cancelled' ? '#ff4d4f' :
                          '#1890ff'
                    }}
                    prefix={
                      selectedRequest.status.toLowerCase() === 'fulfilled' || selectedRequest.status.toLowerCase() === 'completed' ? <CheckCircleOutlined /> :
                        selectedRequest.status.toLowerCase() === 'cancelled' ? <CloseCircleOutlined /> :
                          <ClockCircleOutlined />
                    }
                  />
                </Card>
                <Card className="shadow-sm">
                  <Statistic
                    title="Blood Type Needed"
                    value={selectedRequest.bloodGroupName}
                    valueStyle={{ color: '#ff4d4f' }}
                    prefix={<HeartOutlined />}
                  />
                </Card>
                <Card className="shadow-sm">
                  <Statistic
                    title="Quantity"
                    value={`${selectedRequest.quantityUnits} units`}
                    prefix={<TeamOutlined />}
                  />
                  {/* <Progress
                    percent={calculateProgress(selectedRequest)}
                    status={selectedRequest.status.toLowerCase() === 'fulfilled' || selectedRequest.status.toLowerCase() === 'completed' ? 'success' : 'active'}
                    className="mt-2"
                  /> */}
                </Card>
              </div>

              <Descriptions title="Request Information" bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Patient">{selectedRequest.patientName}</Descriptions.Item>
                <Descriptions.Item label="Component Needed">{selectedRequest.componentTypeName}</Descriptions.Item>
                <Descriptions.Item label="Urgency">{getUrgencyTag(selectedRequest.urgencyLevel)}</Descriptions.Item>
                <Descriptions.Item label="Type">{selectedRequest.isEmergency ? 'Emergency' : 'Regular'}</Descriptions.Item>
                <Descriptions.Item label="Date Needed">{dayjs(selectedRequest.neededByDate).format('MMMM D, YYYY')}</Descriptions.Item>
                <Descriptions.Item label="Created">{dayjs(selectedRequest.createdTime).format('MMMM D, YYYY')}</Descriptions.Item>
                <Descriptions.Item label="Hospital" span={2}>{selectedRequest.hospitalName}</Descriptions.Item>
                <Descriptions.Item label="Address" span={2}>{selectedRequest.address}</Descriptions.Item>
                {selectedRequest.medicalNotes && (
                  <Descriptions.Item label="Medical Notes" span={3}>
                    <HtmlContent content={selectedRequest.medicalNotes} />
                  </Descriptions.Item>
                )}
              </Descriptions>

              {/* <div className="mt-6">
                <Collapse defaultActiveKey={['1']}>
                  <Panel header="Request Progress" key="1">
                    <Steps
                      current={getStatusSteps(selectedRequest).findIndex(step => step.status === 'process')}
                      status={
                        selectedRequest.status.toLowerCase() === 'cancelled' ? 'error' :
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
                </Collapse>
              </div> */}

              <div className="mt-6 flex justify-between">
                {selectedRequest.status.toLowerCase() === 'pending' && (
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => {
                      closeDetailsModal();
                      showCancelModal(selectedRequest);
                    }}
                  >
                    Cancel Request
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Cancel Request Modal */}
        <Modal
          title={
            <div className="flex items-center text-red-500">
              <CloseCircleOutlined className="mr-2" />
              <span>Cancel Blood Request</span>
            </div>
          }
          open={cancelModalVisible}
          onCancel={closeCancelModal}
          footer={[
            <Button key="back" onClick={closeCancelModal}>
              No, Keep Request
            </Button>,
            <Button
              key="submit"
              type="primary"
              danger
              loading={cancelLoading}
              onClick={handleCancelRequest}
            >
              Yes, Cancel Request
            </Button>,
          ]}
        >
          <Alert
            message="Are you sure you want to cancel this blood request?"
            description="This action cannot be undone. The request will be marked as cancelled and will no longer be active."
            type="warning"
            showIcon
            className="mb-4"
          />

          <div className="mb-4">
            <p className="mb-2 font-medium">Reason for cancellation (optional):</p>
            <TextArea
              rows={4}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason for cancelling this request"
            />
          </div>
        </Modal>

        {/* Edit Request Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <EditOutlined className="text-blue-500 mr-2" />
              <span>Edit Blood Request</span>
            </div>
          }
          open={editModalVisible}
          onCancel={closeEditModal}
          footer={null}
          width={800}
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditRequest}
            initialValues={{
              urgencyLevel: 'Medium',
              isEmergency: false
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="patientName"
                label="Patient Name"
                rules={[{ required: true, message: 'Please enter patient name' }]}
              >
                <Input placeholder="Enter patient name" />
              </Form.Item>

              <Form.Item
                name="quantityUnits"
                label="Quantity (Units)"
                rules={[{ required: true, message: 'Please enter quantity' }]}
              >
                <InputNumber min={1} max={10} style={{ width: '100%' }} placeholder="Enter quantity" />
              </Form.Item>

              <Form.Item
                name="urgencyLevel"
                label="Urgency Level"
                rules={[{ required: true, message: 'Please select urgency level' }]}
              >
                <Select placeholder="Select urgency level">
                  <Select.Option value="Critical">Critical</Select.Option>
                  <Select.Option value="High">High</Select.Option>
                  <Select.Option value="Medium">Medium</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="neededByDate"
                label="Needed By Date"
                rules={[{ required: true, message: 'Please select needed by date' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>

              <Form.Item
                name="bloodGroupId"
                label="Blood Group"
                rules={[{ required: true, message: 'Please select blood group' }]}
              >
                <Select placeholder="Select blood group" loading={bloodGroupsLoading}>
                  {bloodGroups.map(group => (
                    <Select.Option key={group.id} value={group.id}>
                      {group.groupName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="componentTypeId"
                label="Component Type"
                rules={[{ required: true, message: 'Please select component type' }]}
              >
                <Select placeholder="Select component type" loading={componentTypesLoading}>
                  {componentTypes.map(type => (
                    <Select.Option key={type.id} value={type.id}>
                      {type.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="locationId"
                label="Location"
                rules={[{ required: true, message: 'Please select location' }]}
              >
                <Select placeholder="Select location" loading={locationsLoading}>
                  {locations.map(location => (
                    <Select.Option key={location.id} value={location.id}>
                      {location.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="hospitalName"
                label="Hospital Name"
                rules={[{ required: true, message: 'Please enter hospital name' }]}
              >
                <Input placeholder="Enter hospital name" />
              </Form.Item>

              <Form.Item
                name="contactInfo"
                label="Contact Information"
                rules={[{ required: true, message: 'Please enter contact information' }]}
              >
                <Input placeholder="Enter contact information" />
              </Form.Item>

              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: 'Please enter address' }]}
              >
                <Input placeholder="Enter address" />
              </Form.Item>

              <Form.Item
                name="medicalNotes"
                label="Medical Notes"
                className="col-span-1 md:col-span-2"
              >
                <TextArea rows={4} placeholder="Enter any relevant medical notes" />
              </Form.Item>

              {/* <Form.Item
                name="isEmergency"
                valuePropName="checked"
                className="col-span-1 md:col-span-2"
              >
                <Alert
                  message="This is an emergency request"
                  description="Emergency requests are prioritized and will be processed immediately."
                  type="warning"
                  showIcon
                />
              </Form.Item> */}
            </div>

            <div className="flex justify-end mt-4">
              <Button onClick={closeEditModal} className="mr-2">
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={editLoading} className="bg-blue-600 hover:bg-blue-700">
                Update Request
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
}