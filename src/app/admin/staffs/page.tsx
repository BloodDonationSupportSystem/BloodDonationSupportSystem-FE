'use client';

import React, { useState } from 'react';
import { Table, Card, Button, Input, Space, Tag, Tooltip, Modal, Form, Select, Tabs, Collapse, Switch, App } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, EnvironmentOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useStaffs, useRegisterStaff, useActivateUser } from '@/hooks/api/useUsers';
import { useLocations } from '@/hooks/api/useLocations';
import { RegisterStaffWithLocationRequest } from '@/services/api/userService';
import dayjs from 'dayjs';

const { Option } = Select;

const { Panel } = Collapse;

export default function AdminStaffsPage() {
  const { staffs, loading, error, refresh } = useStaffs();
  const { registerStaff, loading: registerLoading } = useRegisterStaff();
  const { activateUser, loading: activateLoading } = useActivateUser();
  const { locations, isLoading: locationsLoading } = useLocations();
  const { message, modal } = App.useApp();
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [addStaffModalVisible, setAddStaffModalVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [form] = Form.useForm();
  const [addStaffForm] = Form.useForm();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const filteredStaffs = staffs.filter(staff => 
    staff.staff.userName.toLowerCase().includes(searchText.toLowerCase()) ||
    staff.staff.email.toLowerCase().includes(searchText.toLowerCase()) ||
    `${staff.staff.firstName} ${staff.staff.lastName}`.toLowerCase().includes(searchText.toLowerCase()) ||
    staff.staff.roleName.toLowerCase().includes(searchText.toLowerCase()) ||
    staff.locations.some(loc => loc.locationName.toLowerCase().includes(searchText.toLowerCase()))
  );

  const handleEdit = (staff: any) => {
    setSelectedStaff(staff);
    form.setFieldsValue({
      userName: staff.staff.userName,
      email: staff.staff.email,
      firstName: staff.staff.firstName,
      lastName: staff.staff.lastName,
      phoneNumber: staff.staff.phoneNumber,
      isActivated: staff.staff.isActivated,
    });
    setIsModalVisible(true);
  };

  const handleViewDetails = (staff: any) => {
    setSelectedStaff(staff);
    setDetailsVisible(true);
  };

  const handleDelete = (staffId: string) => {
    modal.confirm({
      title: 'Are you sure you want to delete this staff member?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        message.success('Staff member deleted successfully');
      },
    });
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      console.log('Form values:', values);
      // Update activation status if changed
      if (values.isActivated !== selectedStaff.staff.isActivated) {
        handleActivationChange(selectedStaff.staff.id, values.isActivated);
      }
      message.success('Staff member updated successfully');
      setIsModalVisible(false);
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const showAddStaffModal = () => {
    addStaffForm.resetFields();
    setAddStaffModalVisible(true);
  };

  const handleAddStaffOk = () => {
    addStaffForm.validateFields().then(async (values) => {
      const staffData: RegisterStaffWithLocationRequest = {
        userName: values.userName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber || '',
        locationId: values.locationId,
        locationRole: 'Staff',
        canManageCapacity: values.canManageCapacity,
        canApproveAppointments: values.canApproveAppointments,
        canViewReports: values.canViewReports,
        notes: values.notes || ''
      };

      try {
        const result = await registerStaff(staffData);
        if (result.success) {
          message.success('Staff member added successfully');
          setAddStaffModalVisible(false);
          refresh(); // Refresh the staff list
        } else {
          message.error(result.error || 'Failed to add staff member');
        }
      } catch (error: any) {
        console.error('Error adding staff:', error);
        message.error(error?.message || 'An error occurred while adding the staff member');
      }
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleActivationChange = async (userId: string, newStatus: boolean) => {
    try {
      console.log('Changing activation status for staff:', userId, 'to:', newStatus, 'type:', typeof newStatus);
      const result = await activateUser(userId, Boolean(newStatus));
      if (result.success) {
        message.success(`Staff ${newStatus ? 'activated' : 'deactivated'} successfully`);
        refresh(); // Refresh the staff list
      } else {
        message.error(result.error || `Failed to ${newStatus ? 'activate' : 'deactivate'} staff`);
      }
    } catch (error: any) {
      console.error('Error updating activation status:', error);
      message.error(error?.message || `An error occurred while ${newStatus ? 'activating' : 'deactivating'} staff`);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: ['staff', 'firstName'],
      key: 'name',
      render: (_: any, record: any) => `${record.staff.firstName} ${record.staff.lastName}`,
      sorter: (a: any, b: any) => `${a.staff.firstName} ${a.staff.lastName}`.localeCompare(`${b.staff.firstName} ${b.staff.lastName}`),
      width: 150,
    },
    {
      title: 'Username',
      dataIndex: ['staff', 'userName'],
      key: 'userName',
      sorter: (a: any, b: any) => a.staff.userName.localeCompare(b.staff.userName),
      width: 120,
    },
    {
      title: 'Email',
      dataIndex: ['staff', 'email'],
      key: 'email',
      sorter: (a: any, b: any) => a.staff.email.localeCompare(b.staff.email),
      width: 200,
    },
    {
      title: 'Phone',
      dataIndex: ['staff', 'phoneNumber'],
      key: 'phoneNumber',
      width: 120,
    },
    {
      title: 'Role',
      dataIndex: ['staff', 'roleName'],
      key: 'roleName',
      render: (role: string) => <Tag color="blue">{role}</Tag>,
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: ['staff', 'isActivated'],
      key: 'isActivated',
      render: (isActivated: boolean) => 
        isActivated !== undefined ? (
          <Tag color={isActivated ? 'success' : 'error'} icon={isActivated ? <CheckOutlined /> : <CloseOutlined />}>
            {isActivated ? 'Active' : 'Inactive'}
          </Tag>
        ) : (
          <span>-</span>
        ),
      sorter: (a: any, b: any) => {
        if (a.staff.isActivated === undefined || b.staff.isActivated === undefined) return 0;
        return (a.staff.isActivated === b.staff.isActivated) ? 0 : a.staff.isActivated ? -1 : 1;
      },
      width: 100,
    },
    {
      title: 'Created Date',
      dataIndex: ['staff', 'createdTime'],
      key: 'createdTime',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
      sorter: (a: any, b: any) => {
        if (!a.staff.createdTime || !b.staff.createdTime) return 0;
        return dayjs(a.staff.createdTime).unix() - dayjs(b.staff.createdTime).unix();
      },
      width: 120,
    },
    {
      title: 'Assigned Locations',
      key: 'locations',
      render: (_: any, record: any) => (
        <>
          {record.locations.length > 0 ? (
            <Space size={[0, 4]} wrap>
              {record.locations.slice(0, 2).map((loc: any) => (
                <Tag key={loc.id} icon={<EnvironmentOutlined />}>{loc.locationName}</Tag>
              ))}
              {record.locations.length > 2 && (
                <Tag>+{record.locations.length - 2} more</Tag>
              )}
            </Space>
          ) : (
            <span className="text-gray-400">No locations</span>
          )}
        </>
      ),
      width: 180,
    },
    {
      title: 'Last Login',
      dataIndex: ['staff', 'lastLogin'],
      key: 'lastLogin',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : 'Never',
      sorter: (a: any, b: any) => {
        if (!a.staff.lastLogin) return 1;
        if (!b.staff.lastLogin) return -1;
        return dayjs(a.staff.lastLogin).unix() - dayjs(b.staff.lastLogin).unix();
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
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.staff.id)} />
          </Tooltip>
          <Tooltip title={record.staff.isActivated ? "Deactivate" : "Activate"}>
            <Switch
              checked={Boolean(record.staff.isActivated)}
              size="small"
              onChange={(checked) => handleActivationChange(record.staff.id, Boolean(checked))}
              loading={activateLoading}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const breadcrumbItems = [
    { title: 'Staff', href: '/admin/staffs' },
  ];

  return (
    <AdminLayout 
      title="Staff Management" 
      breadcrumbItems={breadcrumbItems}
    >
      <Card>
        <div className="flex justify-between mb-4">
          <Input
            placeholder="Search staff..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={handleSearch}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddStaffModal}>
            Add Staff Member
          </Button>
        </div>
        <Table
          dataSource={filteredStaffs}
          columns={columns}
          rowKey={(record) => record.staff.id}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Edit Staff Modal */}
      <Modal
        title="Edit Staff Member"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={700}
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
        </Form>
      </Modal>

      {/* Add Staff Modal */}
      <Modal
        title="Add Staff Member"
        open={addStaffModalVisible}
        onOk={handleAddStaffOk}
        onCancel={() => setAddStaffModalVisible(false)}
        confirmLoading={registerLoading}
        okText="Add Staff"
        width={800}
      >
        <Form
          form={addStaffForm}
          layout="vertical"
          initialValues={{
            canManageCapacity: false,
            canApproveAppointments: false,
            canViewReports: false,
          }}
        >
          <Tabs 
            defaultActiveKey="1"
            items={[
              {
                key: '1',
                label: 'Staff Information',
                children: (
                  <>
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
                        name="password"
                        label="Password"
                        rules={[
                          { required: true, message: 'Please input a password!' },
                          { min: 8, message: 'Password must be at least 8 characters long' }
                        ]}
                      >
                        <Input.Password />
                      </Form.Item>
                      <Form.Item
                        name="confirmPassword"
                        label="Confirm Password"
                        dependencies={['password']}
                        rules={[
                          { required: true, message: 'Please confirm the password!' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error('The two passwords do not match!'));
                            },
                          }),
                        ]}
                      >
                        <Input.Password />
                      </Form.Item>
                    </div>

                    <Form.Item
                      name="phoneNumber"
                      label="Phone Number"
                    >
                      <Input />
                    </Form.Item>
                  </>
                )
              },
              {
                key: '2',
                label: 'Location Assignment',
                children: (
                  <>
                    <Form.Item
                      name="locationId"
                      label="Assign to Location"
                      rules={[{ required: true, message: 'Please select a location!' }]}
                    >
                      <Select loading={locationsLoading}>
                        {locations.map(location => (
                          <Option key={location.id} value={location.id}>{location.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <div className="grid grid-cols-3 gap-4">
                      <Form.Item
                        name="canManageCapacity"
                        valuePropName="checked"
                        label="Can Manage Capacity"
                      >
                        <Select>
                          <Option value={true}>Yes</Option>
                          <Option value={false}>No</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        name="canApproveAppointments"
                        valuePropName="checked"
                        label="Can Approve Appointments"
                      >
                        <Select>
                          <Option value={true}>Yes</Option>
                          <Option value={false}>No</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        name="canViewReports"
                        valuePropName="checked"
                        label="Can View Reports"
                      >
                        <Select>
                          <Option value={true}>Yes</Option>
                          <Option value={false}>No</Option>
                        </Select>
                      </Form.Item>
                    </div>

                    <Form.Item
                      name="notes"
                      label="Notes"
                    >
                      <Input.TextArea rows={4} />
                    </Form.Item>
                  </>
                )
              }
            ]}
          />
        </Form>
      </Modal>

      {/* Staff Details Modal */}
      <Modal
        title="Staff Member Details"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="back" onClick={() => setDetailsVisible(false)}>
            Close
          </Button>,
          <Button key="edit" type="primary" onClick={() => {
            setDetailsVisible(false);
            handleEdit(selectedStaff);
          }}>
            Edit
          </Button>,
        ]}
        width={800}
      >
        {selectedStaff && (
          <Tabs 
            defaultActiveKey="1"
            items={[
              {
                key: '1',
                label: 'Personal Information',
                children: (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-500 mb-1">Full Name</p>
                      <p className="font-medium">{selectedStaff.staff.firstName} {selectedStaff.staff.lastName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Username</p>
                      <p className="font-medium">{selectedStaff.staff.userName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Email</p>
                      <p className="font-medium">{selectedStaff.staff.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Phone Number</p>
                      <p className="font-medium">{selectedStaff.staff.phoneNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Role</p>
                      <p className="font-medium">{selectedStaff.staff.roleName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Status</p>
                      <p className="font-medium">
                        {selectedStaff.staff.isActivated !== undefined ? (
                          <Tag color={selectedStaff.staff.isActivated ? 'success' : 'error'}>
                            {selectedStaff.staff.isActivated ? 'Active' : 'Inactive'}
                          </Tag>
                        ) : (
                          '-'
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Created Date</p>
                      <p className="font-medium">{selectedStaff.staff.createdTime ? dayjs(selectedStaff.staff.createdTime).format('YYYY-MM-DD') : '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Last Login</p>
                      <p className="font-medium">{selectedStaff.staff.lastLogin ? dayjs(selectedStaff.staff.lastLogin).format('YYYY-MM-DD HH:mm') : 'Never'}</p>
                    </div>
                  </div>
                )
              },
              {
                key: '2',
                label: 'Assigned Locations',
                children: (
                  <>
                    {selectedStaff.locations.length > 0 ? (
                      <Collapse defaultActiveKey={['0']} accordion>
                        {selectedStaff.locations.map((location: any, index: number) => (
                          <Panel header={location.locationName} key={index}>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-gray-500 mb-1">Location ID</p>
                                <p className="font-medium">{location.locationId}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Role</p>
                                <p className="font-medium">{location.role}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Assigned Date</p>
                                <p className="font-medium">{dayjs(location.assignedDate).format('YYYY-MM-DD')}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Status</p>
                                <p className="font-medium">
                                  {location.isActive ? 
                                    <Tag icon={<CheckOutlined />} color="success">Active</Tag> : 
                                    <Tag icon={<CloseOutlined />} color="error">Inactive</Tag>
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <p className="text-gray-500 mb-1">Permissions</p>
                              <div className="flex gap-2 mt-1">
                                <Tag color={location.canManageCapacity ? 'green' : 'default'}>
                                  {location.canManageCapacity ? 'Can Manage Capacity' : 'Cannot Manage Capacity'}
                                </Tag>
                                <Tag color={location.canApproveAppointments ? 'green' : 'default'}>
                                  {location.canApproveAppointments ? 'Can Approve Appointments' : 'Cannot Approve Appointments'}
                                </Tag>
                                <Tag color={location.canViewReports ? 'green' : 'default'}>
                                  {location.canViewReports ? 'Can View Reports' : 'Cannot View Reports'}
                                </Tag>
                              </div>
                            </div>
                            {location.notes && (
                              <div className="mt-4">
                                <p className="text-gray-500 mb-1">Notes</p>
                                <p>{location.notes}</p>
                              </div>
                            )}
                          </Panel>
                        ))}
                      </Collapse>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No locations assigned to this staff member
                      </div>
                    )}
                  </>
                )
              }
            ]}
          />
        )}
      </Modal>
    </AdminLayout>
  );
}
