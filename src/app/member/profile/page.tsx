'use client';

import React, { useState } from 'react';
import { 
  Typography, Card, Row, Col, Descriptions, Tag, Spin, Alert, Button, Divider, Statistic,
  Modal, Form, DatePicker, Radio, Input, Select, Switch, App
} from 'antd';
import { useAuth } from '@/context/AuthContext';
import { useDonorProfile } from '@/hooks/api/useDonorProfile';
import { useBloodGroups } from '@/hooks/api/useBloodGroups';
import { EditOutlined, HeartOutlined, CalendarOutlined, EnvironmentOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { DonorProfileUpdateRequest } from '@/services/api/donorProfileService';
import dayjs from 'dayjs';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, isLoading, error, refetch, updateProfile, isUpdating } = useDonorProfile();
  const { data: bloodGroups, isLoading: isLoadingBloodGroups } = useBloodGroups();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Format date to display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return dayjs(dateString).format('MMMM D, YYYY');
  };

  // Calculate days until next donation is available
  const getDaysUntilNextDonation = () => {
    if (!profile?.nextAvailableDonationDate) return 0;
    
    const today = dayjs();
    const nextDate = dayjs(profile.nextAvailableDonationDate);
    const days = nextDate.diff(today, 'day');
    
    return Math.max(0, days);
  };

  // Handle edit button click
  const handleEditClick = () => {
    // Initialize form with current profile data
    form.setFieldsValue({
      dateOfBirth: profile?.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
      gender: profile?.gender,
      lastDonationDate: profile?.lastDonationDate ? dayjs(profile.lastDonationDate) : null,
      healthStatus: profile?.healthStatus,
      lastHealthCheckDate: profile?.lastHealthCheckDate ? dayjs(profile.lastHealthCheckDate) : null,
      totalDonations: profile?.totalDonations,
      address: profile?.address,
      latitude: profile?.latitude,
      longitude: profile?.longitude,
      bloodGroupId: profile?.bloodGroupId,
      nextAvailableDonationDate: profile?.nextAvailableDonationDate ? dayjs(profile.nextAvailableDonationDate) : null,
      isAvailableForEmergency: profile?.isAvailableForEmergency,
      preferredDonationTime: profile?.preferredDonationTime,
    });
    
    setIsEditModalVisible(true);
  };

  // Handle form submission
  const handleFormSubmit = async (values: any) => {
    const formattedValues: DonorProfileUpdateRequest = {
      dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD'),
      gender: values.gender,
      lastDonationDate: values.lastDonationDate?.format('YYYY-MM-DD') || null,
      healthStatus: values.healthStatus,
      lastHealthCheckDate: values.lastHealthCheckDate?.format('YYYY-MM-DD') || null,
      totalDonations: values.totalDonations,
      address: values.address,
      latitude: values.latitude,
      longitude: values.longitude,
      bloodGroupId: values.bloodGroupId,
      nextAvailableDonationDate: values.nextAvailableDonationDate?.format('YYYY-MM-DD') || null,
      isAvailableForEmergency: values.isAvailableForEmergency,
      preferredDonationTime: values.preferredDonationTime,
    };

    const success = await updateProfile(formattedValues);
    
    if (success) {
      setIsEditModalVisible(false);
    }
  };

  // Calculate next donation date based on last donation date
  const calculateNextDonationDate = (lastDonationDate: dayjs.Dayjs) => {
    // 56 days (8 weeks) is the standard waiting period between whole blood donations
    const nextDate = lastDonationDate.add(56, 'day');
    form.setFieldsValue({ nextAvailableDonationDate: nextDate });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" type="primary" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!profile) {
    return (
      <Alert
        message="Profile not found"
        description="You don't have a donor profile yet. Would you like to create one?"
        type="info"
        showIcon
        action={
          <Link href="/profile-creation">
            <Button size="small" type="primary">
              Create Profile
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <App>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <Title level={2}>My Donor Profile</Title>
            <Paragraph className="text-gray-500 mb-0">
              Your blood donation information and status
            </Paragraph>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={handleEditClick}
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card variant="outlined" className="h-full bg-red-50">
            <Statistic
              title="Blood Type"
              value={profile.bloodGroupName}
              valueStyle={{ color: '#cf1322' }}
              prefix={<HeartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="outlined" className="h-full">
            <Statistic
              title="Total Donations"
              value={profile.totalDonations}
              valueStyle={{ color: '#3f8600' }}
              prefix={<HeartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="outlined" className="h-full">
            <Statistic
              title="Last Donation"
              value={profile.lastDonationDate ? formatDate(profile.lastDonationDate) : 'No donations yet'}
              valueStyle={{ fontSize: '14px' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="outlined" className="h-full">
            <Statistic
              title="Next Available In"
              value={getDaysUntilNextDonation()}
              suffix="days"
              valueStyle={{ color: getDaysUntilNextDonation() === 0 ? '#3f8600' : '#cf1322' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Personal Information */}
      <Card title="Personal Information" className="mb-8" variant="outlined">
        <Descriptions layout="vertical" column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Name">
            {user?.firstName} {user?.lastName}
          </Descriptions.Item>
          <Descriptions.Item label="Date of Birth">
            {formatDate(profile.dateOfBirth)}
          </Descriptions.Item>
          <Descriptions.Item label="Gender">
            {profile.gender ? 'Male' : 'Female'}
          </Descriptions.Item>
          <Descriptions.Item label="Blood Group">
            <Tag color="red">{profile.bloodGroupName}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Emergency Availability">
            {profile.isAvailableForEmergency ? (
              <Tag color="green">Available</Tag>
            ) : (
              <Tag color="orange">Not Available</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Preferred Donation Time">
            {profile.preferredDonationTime}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Health Information */}
      <Card title="Health Information" className="mb-8" variant="outlined">
        <Descriptions layout="vertical" column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Health Status">
            <Tag color={profile.healthStatus === 'Healthy' ? 'green' : 'orange'}>
              {profile.healthStatus}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Last Health Check">
            {formatDate(profile.lastHealthCheckDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Total Donations">
            {profile.totalDonations}
          </Descriptions.Item>
          <Descriptions.Item label="Last Donation Date">
            {formatDate(profile.lastDonationDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Next Available Date">
            {formatDate(profile.nextAvailableDonationDate)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Location Information */}
      <Card title="Location Information" variant="outlined">
        <Descriptions layout="vertical" column={{ xs: 1, sm: 2, md: 2 }}>
          <Descriptions.Item label="Address" span={2}>
            <div className="flex items-start">
              <EnvironmentOutlined className="mt-1 mr-2 text-red-500" />
              <span>{profile.address}</span>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Coordinates">
            Lat: {profile.latitude}, Lng: {profile.longitude}
          </Descriptions.Item>
        </Descriptions>
        
        <Divider />
        
        <div className="text-right">
          <Link href="/member/nearby-search">
            <Button type="primary" ghost icon={<EnvironmentOutlined />}>
              Find Nearby Donors/Recipients
            </Button>
          </Link>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        title="Edit Donor Profile"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{
            dateOfBirth: profile?.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
            gender: profile?.gender,
            lastDonationDate: profile?.lastDonationDate ? dayjs(profile.lastDonationDate) : null,
            healthStatus: profile?.healthStatus,
            lastHealthCheckDate: profile?.lastHealthCheckDate ? dayjs(profile.lastHealthCheckDate) : null,
            totalDonations: profile?.totalDonations,
            address: profile?.address,
            latitude: profile?.latitude,
            longitude: profile?.longitude,
            bloodGroupId: profile?.bloodGroupId,
            nextAvailableDonationDate: profile?.nextAvailableDonationDate ? dayjs(profile.nextAvailableDonationDate) : null,
            isAvailableForEmergency: profile?.isAvailableForEmergency,
            preferredDonationTime: profile?.preferredDonationTime,
          }}
        >
          <div className="mb-6">
            <Title level={5}>Personal Information</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Date of Birth"
                  name="dateOfBirth"
                  rules={[{ required: true, message: 'Please select your date of birth' }]}
                >
                  <DatePicker 
                    className="w-full" 
                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Gender"
                  name="gender"
                  rules={[{ required: true, message: 'Please select your gender' }]}
                >
                  <Radio.Group>
                    <Radio value={true}>Male</Radio>
                    <Radio value={false}>Female</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Blood Group"
                  name="bloodGroupId"
                  rules={[{ required: true, message: 'Please select your blood group' }]}
                >
                  <Select placeholder="Select your blood group" loading={isLoadingBloodGroups}>
                    {bloodGroups?.map((group) => (
                      <Option key={group.id} value={group.id}>
                        {group.groupName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Preferred Donation Time"
                  name="preferredDonationTime"
                  rules={[{ required: true, message: 'Please select your preferred donation time' }]}
                >
                  <Select placeholder="Select your preferred time">
                    <Option value="Morning">Morning</Option>
                    <Option value="Afternoon">Afternoon</Option>
                    <Option value="Evening">Evening</Option>
                    <Option value="Anytime">Anytime</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="mb-6">
            <Title level={5}>Health Information</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Health Status"
                  name="healthStatus"
                  rules={[{ required: true, message: 'Please enter your health status' }]}
                >
                  <Select placeholder="Select your health status">
                    <Option value="Healthy">Healthy</Option>
                    <Option value="Minor Issues">Minor Issues</Option>
                    <Option value="Under Medication">Under Medication</Option>
                    <Option value="Recovering">Recovering</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Last Health Check"
                  name="lastHealthCheckDate"
                >
                  <DatePicker 
                    className="w-full" 
                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Total Donations"
                  name="totalDonations"
                  rules={[{ required: true, message: 'Please enter your total donations' }]}
                >
                  <Input type="number" min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Last Donation Date"
                  name="lastDonationDate"
                >
                  <DatePicker 
                    className="w-full" 
                    onChange={(date) => date && calculateNextDonationDate(date)}
                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Next Available Date"
                  name="nextAvailableDonationDate"
                >
                  <DatePicker 
                    className="w-full" 
                    disabled={true}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Available for Emergency Donations"
                  name="isAvailableForEmergency"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="mb-6">
            <Title level={5}>Location Information</Title>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Address"
                  name="address"
                  rules={[{ required: true, message: 'Please enter your address' }]}
                >
                  <TextArea rows={2} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Latitude"
                  name="latitude"
                  rules={[{ required: true, message: 'Please enter latitude' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Longitude"
                  name="longitude"
                  rules={[{ required: true, message: 'Please enter longitude' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              onClick={() => setIsEditModalVisible(false)}
              icon={<CloseOutlined />}
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isUpdating}
              icon={<SaveOutlined />}
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </App>
  );
} 