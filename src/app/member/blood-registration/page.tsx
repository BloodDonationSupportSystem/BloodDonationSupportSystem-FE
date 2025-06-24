'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Typography, Form, Select, DatePicker, Button, Card, Spin, Alert, Radio, Input } from 'antd';
import { CalendarOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodRegistrationPage() {
  const [form] = Form.useForm();
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);

  const onFinish = async (values: any) => {
    setSubmitting(true);
    setError('');
    
    try {
      console.log('Submitted values:', values);
      // Here you would make an API call to save the blood donation registration
      // const response = await registerBloodDonation(values);
      
      // Simulate API call success
      setTimeout(() => {
        setSuccess('Your blood donation registration has been successfully submitted!');
        setSubmitting(false);
        form.resetFields();
      }, 1000);
    } catch (err) {
      setError('Failed to register blood donation. Please try again.');
      setSubmitting(false);
    }
  };

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
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <Title level={2}>Blood Donation Registration</Title>
          <Paragraph className="text-gray-500">
            Register your blood type and schedule a time for donation
          </Paragraph>
        </div>

        <Card className="shadow-md">
          {error && <Alert message={error} type="error" showIcon className="mb-4" />}
          {success && <Alert message={success} type="success" showIcon className="mb-4" />}

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phoneNumber: user.phoneNumber,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Please enter your first name' }]}
              >
                <Input prefix={<UserOutlined />} disabled />
              </Form.Item>

              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Please enter your last name' }]}
              >
                <Input prefix={<UserOutlined />} disabled />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input disabled />
              </Form.Item>

              <Form.Item
                name="phoneNumber"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter your phone number' }]}
              >
                <Input disabled />
              </Form.Item>
            </div>

            <Form.Item
              name="bloodType"
              label="Blood Type"
              rules={[{ required: true, message: 'Please select your blood type' }]}
            >
              <Select placeholder="Select your blood type">
                {bloodTypes.map(type => (
                  <Option key={type} value={type}>{type}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item 
              name="hasDisease" 
              label="Do you have any chronic disease or condition?"
              rules={[{ required: true, message: 'Please select an option' }]}
            >
              <Radio.Group>
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="lastDonationDate"
              label="Last Donation Date (if any)"
            >
              <DatePicker 
                style={{ width: '100%' }} 
                format="YYYY-MM-DD" 
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>

            <Form.Item
              name="availabilityDate"
              label="When are you available to donate?"
              rules={[{ required: true, message: 'Please select when you are available' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                format="YYYY-MM-DD" 
                disabledDate={(current) => current && current < dayjs().endOf('day')}
              />
            </Form.Item>

            <Form.Item
              name="preferredTimeSlot"
              label="Preferred Time Slot"
              rules={[{ required: true, message: 'Please select your preferred time slot' }]}
            >
              <Select placeholder="Select preferred time">
                <Option value="morning">Morning (8:00 AM - 12:00 PM)</Option>
                <Option value="afternoon">Afternoon (12:00 PM - 4:00 PM)</Option>
                <Option value="evening">Evening (4:00 PM - 8:00 PM)</Option>
              </Select>
            </Form.Item>

            <Form.Item className="text-center mt-6">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
                size="large"
                className="bg-red-600 hover:bg-red-700 w-full md:w-auto"
              >
                Register for Blood Donation
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
} 