'use client';

import React, { useState } from 'react';
import { Table, Card, Button, Input, Space, Tag, Tooltip, Modal, Form, Select, DatePicker, Switch, App } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, MailOutlined, CheckCircleOutlined, CloseCircleOutlined, CheckOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useMembers, useActivateUser } from '@/hooks/api/useUsers';
import dayjs from 'dayjs';

const { Option } = Select;

export default function AdminUsersPage() {
  const { members, loading, error, refresh } = useMembers();
  const { activateUser, loading: activateLoading } = useActivateUser();
  const { message, modal } = App.useApp();
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const filteredUsers = members.filter(user =>
    user.userName.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchText.toLowerCase()) ||
    user.roleName.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    form.setFieldsValue({
      userName: user.userName,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      isEmailVerified: user.isEmailVerified,
      isActivated: user.isActivated
    });
    setIsModalVisible(true);
  };

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setDetailsVisible(true);
  };

  const handleDelete = (userId: string) => {
    modal.confirm({
      title: 'Are you sure you want to delete this user?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        message.success('User deleted successfully');
      },
    });
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      console.log('Form values:', values);
      // Update activation status if changed
      if (values.isActivated !== selectedUser.isActivated) {
        handleActivationChange(selectedUser.id, values.isActivated);
      }
      message.success('User updated successfully');
      setIsModalVisible(false);
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleActivationChange = async (userId: string, newStatus: boolean) => {
    try {
      console.log('Changing activation status for user:', userId, 'to:', newStatus, 'type:', typeof newStatus);
      const result = await activateUser(userId, Boolean(newStatus));
      if (result.success) {
        message.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
        refresh(); // Refresh the user list
      } else {
        message.error(result.error || `Failed to ${newStatus ? 'activate' : 'deactivate'} user`);
      }
    } catch (error: any) {
      console.error('Error updating activation status:', error);
      message.error(error?.message || `An error occurred while ${newStatus ? 'activating' : 'deactivating'} user`);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (_: any, record: any) => `${record.firstName} ${record.lastName}`,
      sorter: (a: any, b: any) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
      width: 150,
    },
    {
      title: 'Username',
      dataIndex: 'userName',
      key: 'userName',
      sorter: (a: any, b: any) => a.userName.localeCompare(b.userName),
      width: 120,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a: any, b: any) => a.email.localeCompare(b.email),
      width: 200,
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 120,
    },
    {
      title: 'Role',
      dataIndex: 'roleName',
      key: 'roleName',
      render: (role: string) => {
        let color = 'default';
        if (role === 'Admin') color = 'gold';
        if (role === 'Staff') color = 'blue';
        if (role === 'Member') color = 'green';
        return <Tag color={color}>{role}</Tag>;
      },
      filters: [
        { text: 'Admin', value: 'Admin' },
        { text: 'Staff', value: 'Staff' },
        { text: 'Member', value: 'Member' },
      ],
      onFilter: (value: any, record: any) => record.roleName === value,
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'isActivated',
      key: 'isActivated',
      render: (isActivated: boolean) =>
        isActivated !== undefined ? (
          <Tag color={isActivated ? 'success' : 'error'} icon={isActivated ? <CheckOutlined /> : <CloseOutlined />}>
            {isActivated ? 'Active' : 'Inactive'}
          </Tag>
        ) : (
          <span>-</span>
        ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value: any, record: any) => record.isActivated === value,
      width: 100,
    },
    {
      title: 'Email Verified',
      dataIndex: 'isEmailVerified',
      key: 'isEmailVerified',
      render: (verified: boolean) =>
        verified ?
          <Tag icon={<CheckCircleOutlined />} color="success">Verified</Tag> :
          <Tag icon={<CloseCircleOutlined />} color="error">Not Verified</Tag>,
      filters: [
        { text: 'Verified', value: true },
        { text: 'Not Verified', value: false },
      ],
      onFilter: (value: any, record: any) => record.isEmailVerified === value,
      width: 140,
    },
    {
      title: 'Created Date',
      dataIndex: 'createdTime',
      key: 'createdTime',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
      sorter: (a: any, b: any) => {
        if (!a.createdTime || !b.createdTime) return 0;
        return dayjs(a.createdTime).unix() - dayjs(b.createdTime).unix();
      },
      width: 120,
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : 'Never',
      sorter: (a: any, b: any) => {
        if (!a.lastLogin) return 1;
        if (!b.lastLogin) return -1;
        return dayjs(a.lastLogin).unix() - dayjs(b.lastLogin).unix();
      },
      width: 150,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 170,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
          <Tooltip title="Send Email">
            <Button type="text" icon={<MailOutlined />} />
          </Tooltip>
          <Tooltip title={record.isActivated ? "Deactivate" : "Activate"}>
            <Switch
              checked={Boolean(record.isActivated)}
              size="small"
              onChange={(checked) => handleActivationChange(record.id, Boolean(checked))}
              loading={activateLoading}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const breadcrumbItems = [
    { title: 'Users', href: '/admin/users' },
  ];

  return (
    <AdminLayout
      title="User Management"
      breadcrumbItems={breadcrumbItems}
    >
      <Card>
        <div className="flex justify-between mb-4">
          <Input
            placeholder="Search users..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={handleSearch}
          />
          <Button type="primary" icon={<PlusOutlined />}>
            Add User
          </Button>
        </div>
        <Table
          dataSource={filteredUsers}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Edit User Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <EditOutlined className="mr-2" />
            <span>Edit User</span>
          </div>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={900}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ remember: true }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'Please input the first name!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Please input the last name!' }]}
            >
              <Input />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="userName"
              label="Username"
              rules={[{ required: true, message: 'Please input the username!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please input the email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="phoneNumber"
              label="Phone Number"
            >
              <Input />
            </Form.Item>
          </div>

          {/* <Form.Item
            name="isEmailVerified"
            label="Email Verification Status"
            valuePropName="checked"
          >
            <Select>
              <Option value={true}>Email Verified</Option>
              <Option value={false}>Email Not Verified</Option>
            </Select>
          </Form.Item> */}
        </Form>
      </Modal>

      {/* User Details Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <UserOutlined className="mr-2" />
            <span>User Details</span>
          </div>
        }
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            Close
          </Button>
        ]}
        width={900}
        centered
      >
        {selectedUser && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-500 mb-1">Full Name</p>
              <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Username</p>
              <p className="font-medium">{selectedUser.userName}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Email</p>
              <p className="font-medium">{selectedUser.email}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Phone Number</p>
              <p className="font-medium">{selectedUser.phoneNumber || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Role</p>
              <p className="font-medium">
                <Tag color={
                  selectedUser.roleName === 'Admin' ? 'gold' :
                    selectedUser.roleName === 'Staff' ? 'blue' :
                      selectedUser.roleName === 'Member' ? 'green' : 'default'
                }>
                  {selectedUser.roleName}
                </Tag>
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Status</p>
              <p className="font-medium">
                {selectedUser.isActivated !== undefined ? (
                  <Tag color={selectedUser.isActivated ? 'success' : 'error'}>
                    {selectedUser.isActivated ? 'Active' : 'Inactive'}
                  </Tag>
                ) : (
                  '-'
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Email Verification</p>
              <p className="font-medium">
                {selectedUser.isEmailVerified ?
                  <Tag icon={<CheckCircleOutlined />} color="success">Verified</Tag> :
                  <Tag icon={<CloseCircleOutlined />} color="error">Not Verified</Tag>
                }
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Created Date</p>
              <p className="font-medium">{selectedUser.createdTime ? dayjs(selectedUser.createdTime).format('YYYY-MM-DD') : '-'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Last Login</p>
              <p className="font-medium">{selectedUser.lastLogin ? dayjs(selectedUser.lastLogin).format('YYYY-MM-DD HH:mm') : 'Never'}</p>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
