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

// Define blood group type
interface BloodGroup {
  id: string;
  groupName: string;
  description?: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, isLoading, error, refetch, updateProfile, isUpdating } = useDonorProfile();
  const { bloodGroups, isLoading: isLoadingBloodGroups } = useBloodGroups();
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
      firstName: profile?.firstName || user?.firstName,
      lastName: profile?.lastName || user?.lastName,
      email: profile?.email || user?.email,
      phoneNumber: profile?.phoneNumber || user?.phoneNumber,
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
      donationType: profile?.donationType || 'WholeBlood',
    });
    
    setIsEditModalVisible(true);
  };

  // Handle form submission
  const handleFormSubmit = async (values: any) => {
    const formattedValues: DonorProfileUpdateRequest = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phoneNumber: values.phoneNumber,
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
      donationType: values.donationType || 'WholeBlood',
      userId: user?.id || '',
    };

    const success = await updateProfile(formattedValues);
    
    if (success) {
      setIsEditModalVisible(false);
    }
  };

  // Calculate next donation date based on last donation date and donation type
  const calculateNextDonationDate = (lastDonationDate: dayjs.Dayjs, donationType: string) => {
    let waitingPeriod = 0; // days
    const gender = form.getFieldValue('gender');
    
    // Calculate waiting period based on donation type and gender
    switch(donationType) {
      case 'WholeBlood':
        waitingPeriod = gender ? 90 : 120; // Male: 3 months, Female: 4 months
        break;
      case 'Platelets':
        waitingPeriod = 14; // 2 weeks
        break;
      case 'Plasma':
        waitingPeriod = 28; // 4 weeks
        break;
      case 'RedCells':
      case 'DoubleRedCells':
        waitingPeriod = 112; // 16 weeks
        break;
      default:
        waitingPeriod = 90; // Default to 3 months
    }
    
    // Calculate and set the suggested next available date
    const nextDate = lastDonationDate.add(waitingPeriod, 'day');
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
              value={profile.bloodGroupName || 'Unknown'}
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
          <Descriptions.Item label="First Name">
            {profile.firstName}
          </Descriptions.Item>
          <Descriptions.Item label="Last Name">
            {profile.lastName}
          </Descriptions.Item>
          <Descriptions.Item label="Username">
            {profile.userName}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {profile.email}
          </Descriptions.Item>
          <Descriptions.Item label="Phone Number">
            {profile.phoneNumber}
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
          <Descriptions.Item label="Donation Type">
            {profile.donationType || 'Whole Blood'}
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
            firstName: profile?.firstName || user?.firstName,
            lastName: profile?.lastName || user?.lastName,
            email: profile?.email || user?.email,
            phoneNumber: profile?.phoneNumber || user?.phoneNumber,
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
            donationType: 'WholeBlood', // Default donation type
          }}
        >
          <div className="mb-6">
            <Title level={5}>Personal Information</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[{ required: true, message: 'Please enter your first name' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[{ required: true, message: 'Please enter your last name' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Phone Number"
                  name="phoneNumber"
                  rules={[{ required: true, message: 'Please enter your phone number' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
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
                    {bloodGroups?.map((group: BloodGroup) => (
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
                    onChange={(date) => {
                      if (date) {
                        const donationType = form.getFieldValue('donationType') || 'WholeBlood';
                        calculateNextDonationDate(date, donationType);
                      }
                    }}
                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Donation Type"
                  name="donationType"
                >
                  <Select
                    placeholder="Select donation type"
                    onChange={(value) => {
                      const lastDonationDate = form.getFieldValue('lastDonationDate');
                      if (lastDonationDate) {
                        calculateNextDonationDate(lastDonationDate, value);
                      }
                    }}
                  >
                    <Option value="WholeBlood">Whole Blood</Option>
                    <Option value="Platelets">Platelets</Option>
                    <Option value="Plasma">Plasma</Option>
                    <Option value="RedCells">Red Blood Cells</Option>
                    <Option value="DoubleRedCells">Double Red Blood Cells</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Next Available Date"
                  name="nextAvailableDonationDate"
                  help={
                    <div className="text-xs text-blue-500 mt-1">
                      Waiting periods: Whole Blood (M: 3mo, F: 4mo), Platelets (2wks), Plasma (4wks), Red Cells (16wks)
                    </div>
                  }
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