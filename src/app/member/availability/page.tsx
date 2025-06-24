'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Typography, Card, Spin, Form, Switch, Select, TimePicker, Checkbox, Button, Row, Col, Alert, Divider, Tag, Calendar, Badge, Radio, Input, Space } from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined,
  SaveOutlined,
  BellOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  MailOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import type { RadioChangeEvent } from 'antd';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { RangePicker } = TimePicker;

export default function AvailabilitySettingsPage() {
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const [form] = Form.useForm();
  const [emergencyAvailability, setEmergencyAvailability] = useState(true);
  const [preferredDays, setPreferredDays] = useState<string[]>(['monday', 'wednesday', 'friday']);
  const [availabilityPattern, setAvailabilityPattern] = useState<string>('weekly');
  const [updatedSuccessfully, setUpdatedSuccessfully] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);

  // Mock user availability data
  const mockUserAvailability = {
    emergencyAvailable: true,
    emergencyRange: 25, // km
    preferredDays: ['monday', 'wednesday', 'friday'],
    preferredTimeRanges: {
      monday: ['09:00-12:00', '14:00-17:00'],
      wednesday: ['09:00-12:00'],
      friday: ['14:00-17:00'],
    },
    availabilityPattern: 'weekly', // weekly, monthly, custom
    nextAvailableDate: '2023-12-20', // Based on last donation
    notificationPreferences: {
      sms: true,
      email: true,
      push: true,
      remindBefore: 2, // days
    },
    availabilityNotes: 'Prefer morning donations. Can make exceptions for emergencies.',
  };

  // Set initial form values
  useEffect(() => {
    if (mockUserAvailability) {
      form.setFieldsValue({
        emergencyAvailable: mockUserAvailability.emergencyAvailable,
        emergencyRange: mockUserAvailability.emergencyRange,
        preferredDays: mockUserAvailability.preferredDays,
        availabilityPattern: mockUserAvailability.availabilityPattern,
        mondayTime1: mockUserAvailability.preferredTimeRanges.monday?.[0] ? 
          [
            dayjs(mockUserAvailability.preferredTimeRanges.monday[0].split('-')[0], 'HH:mm'),
            dayjs(mockUserAvailability.preferredTimeRanges.monday[0].split('-')[1], 'HH:mm')
          ] : null,
        mondayTime2: mockUserAvailability.preferredTimeRanges.monday?.[1] ? 
          [
            dayjs(mockUserAvailability.preferredTimeRanges.monday[1].split('-')[0], 'HH:mm'),
            dayjs(mockUserAvailability.preferredTimeRanges.monday[1].split('-')[1], 'HH:mm')
          ] : null,
        wednesdayTime1: mockUserAvailability.preferredTimeRanges.wednesday?.[0] ? 
          [
            dayjs(mockUserAvailability.preferredTimeRanges.wednesday[0].split('-')[0], 'HH:mm'),
            dayjs(mockUserAvailability.preferredTimeRanges.wednesday[0].split('-')[1], 'HH:mm')
          ] : null,
        fridayTime1: mockUserAvailability.preferredTimeRanges.friday?.[0] ? 
          [
            dayjs(mockUserAvailability.preferredTimeRanges.friday[0].split('-')[0], 'HH:mm'),
            dayjs(mockUserAvailability.preferredTimeRanges.friday[0].split('-')[1], 'HH:mm')
          ] : null,
        notificationSms: mockUserAvailability.notificationPreferences.sms,
        notificationEmail: mockUserAvailability.notificationPreferences.email,
        notificationPush: mockUserAvailability.notificationPreferences.push,
        remindBefore: mockUserAvailability.notificationPreferences.remindBefore,
        availabilityNotes: mockUserAvailability.availabilityNotes,
      });
      
      setEmergencyAvailability(mockUserAvailability.emergencyAvailable);
      setPreferredDays(mockUserAvailability.preferredDays);
      setAvailabilityPattern(mockUserAvailability.availabilityPattern);
    }
  }, [form]);

  const onFinish = (values: any) => {
    console.log('Form values:', values);
    
    // Here you would make an API call to update the user's availability settings
    
    // Show success message
    setUpdatedSuccessfully(true);
    setTimeout(() => {
      setUpdatedSuccessfully(false);
    }, 3000);
  };

  const handleEmergencyChange = (checked: boolean) => {
    setEmergencyAvailability(checked);
  };

  const handleDaysChange = (days: string[]) => {
    setPreferredDays(days);
  };

  const handlePatternChange = (e: RadioChangeEvent) => {
    setAvailabilityPattern(e.target.value);
  };

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayValues = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Mock data for next eligibility
  const nextEligibleDate = dayjs('2023-12-20');
  const isEligible = dayjs().isAfter(nextEligibleDate);
  const daysToEligible = nextEligibleDate.diff(dayjs(), 'day');

  const dateCellRender = (value: Dayjs) => {
    // Mark preferred days
    const day = value.format('dddd').toLowerCase();
    const isPreferred = preferredDays.includes(day);
    
    // Mark next eligible date
    const isEligibleDate = value.format('YYYY-MM-DD') === nextEligibleDate.format('YYYY-MM-DD');
    
    if (isEligibleDate) {
      return (
        <div className="ant-picker-cell-inner">
          <Badge color="green" text="Eligible" />
        </div>
      );
    }
    
    if (isPreferred) {
      return (
        <div className="ant-picker-cell-inner">
          <Badge color="blue" text="Preferred" />
        </div>
      );
    }
    
    return null;
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
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <Title level={2}>Availability Settings</Title>
          <Paragraph className="text-gray-500">
            Manage when you're available for blood donations and set your preferences
          </Paragraph>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card className="shadow-md">
              {updatedSuccessfully && (
                <Alert 
                  message="Settings Updated Successfully" 
                  type="success" 
                  showIcon 
                  className="mb-6"
                />
              )}
              
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
              >
                <Title level={4}>
                  <CalendarOutlined className="mr-2" />
                  General Availability
                </Title>
                
                <Form.Item
                  name="availabilityPattern"
                  label="How often would you like to donate?"
                >
                  <Radio.Group onChange={handlePatternChange} className="w-full">
                    <Row gutter={[16, 16]}>
                      <Col span={8}>
                        <Card
                          className={`cursor-pointer hover:shadow-md transition-shadow ${availabilityPattern === 'weekly' ? 'border-blue-500' : ''}`}
                          bodyStyle={{ padding: '12px' }}
                        >
                          <Radio value="weekly" className="w-full">
                            <div className="ml-2">
                              <Text strong>Weekly</Text>
                              <div className="text-gray-500 text-sm">Set specific days each week</div>
                            </div>
                          </Radio>
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card
                          className={`cursor-pointer hover:shadow-md transition-shadow ${availabilityPattern === 'monthly' ? 'border-blue-500' : ''}`}
                          bodyStyle={{ padding: '12px' }}
                        >
                          <Radio value="monthly" className="w-full">
                            <div className="ml-2">
                              <Text strong>Monthly</Text>
                              <div className="text-gray-500 text-sm">Set days each month</div>
                            </div>
                          </Radio>
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card
                          className={`cursor-pointer hover:shadow-md transition-shadow ${availabilityPattern === 'custom' ? 'border-blue-500' : ''}`}
                          bodyStyle={{ padding: '12px' }}
                        >
                          <Radio value="custom" className="w-full">
                            <div className="ml-2">
                              <Text strong>Custom</Text>
                              <div className="text-gray-500 text-sm">Select specific dates</div>
                            </div>
                          </Radio>
                        </Card>
                      </Col>
                    </Row>
                  </Radio.Group>
                </Form.Item>

                {availabilityPattern === 'weekly' && (
                  <>
                    <Form.Item
                      name="preferredDays"
                      label="Which days are you typically available for donations?"
                      rules={[{ required: true, message: 'Please select at least one day' }]}
                    >
                      <Checkbox.Group 
                        options={dayNames.map((day, index) => ({ label: day, value: dayValues[index] }))} 
                        onChange={handleDaysChange as any}
                        className="grid grid-cols-2 md:grid-cols-4 gap-2"
                      />
                    </Form.Item>

                    <Divider />

                    {preferredDays.includes('monday') && (
                      <div className="mb-4">
                        <Text strong>Monday Time Ranges:</Text>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <Form.Item name="mondayTime1" label="Time Range 1">
                            <RangePicker 
                              format="HH:mm" 
                              minuteStep={15} 
                              placeholder={['Start Time', 'End Time']}
                              className="w-full"
                            />
                          </Form.Item>
                          <Form.Item name="mondayTime2" label="Time Range 2 (Optional)">
                            <RangePicker 
                              format="HH:mm" 
                              minuteStep={15} 
                              placeholder={['Start Time', 'End Time']}
                              className="w-full"
                            />
                          </Form.Item>
                        </div>
                      </div>
                    )}

                    {preferredDays.includes('wednesday') && (
                      <div className="mb-4">
                        <Text strong>Wednesday Time Ranges:</Text>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <Form.Item name="wednesdayTime1" label="Time Range 1">
                            <RangePicker 
                              format="HH:mm" 
                              minuteStep={15} 
                              placeholder={['Start Time', 'End Time']}
                              className="w-full"
                            />
                          </Form.Item>
                          <Form.Item name="wednesdayTime2" label="Time Range 2 (Optional)">
                            <RangePicker 
                              format="HH:mm" 
                              minuteStep={15} 
                              placeholder={['Start Time', 'End Time']}
                              className="w-full"
                            />
                          </Form.Item>
                        </div>
                      </div>
                    )}

                    {preferredDays.includes('friday') && (
                      <div className="mb-4">
                        <Text strong>Friday Time Ranges:</Text>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <Form.Item name="fridayTime1" label="Time Range 1">
                            <RangePicker 
                              format="HH:mm" 
                              minuteStep={15} 
                              placeholder={['Start Time', 'End Time']}
                              className="w-full"
                            />
                          </Form.Item>
                          <Form.Item name="fridayTime2" label="Time Range 2 (Optional)">
                            <RangePicker 
                              format="HH:mm" 
                              minuteStep={15} 
                              placeholder={['Start Time', 'End Time']}
                              className="w-full"
                            />
                          </Form.Item>
                        </div>
                      </div>
                    )}

                    {/* Similar time range pickers for other selected days */}
                  </>
                )}

                {availabilityPattern === 'monthly' && (
                  <div className="mb-4">
                    <Form.Item
                      name="monthlyDays"
                      label="Which days of the month are you typically available?"
                    >
                      <Select
                        mode="multiple"
                        placeholder="Select days"
                        className="w-full"
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                          <Option key={day} value={day}>{day}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      name="monthlyTimeRange"
                      label="What time are you usually available?"
                    >
                      <RangePicker 
                        format="HH:mm" 
                        minuteStep={15} 
                        placeholder={['Start Time', 'End Time']}
                        className="w-full"
                      />
                    </Form.Item>
                  </div>
                )}

                {availabilityPattern === 'custom' && (
                  <div className="mb-4">
                    <Text>Please select specific dates from the calendar in the sidebar.</Text>
                  </div>
                )}

                <Divider />

                <Title level={4}>
                  <BellOutlined className="mr-2" />
                  Emergency Availability
                </Title>
                
                <Form.Item
                  name="emergencyAvailable"
                  valuePropName="checked"
                >
                  <Switch 
                    onChange={handleEmergencyChange} 
                    checkedChildren="Available" 
                    unCheckedChildren="Unavailable"
                  />
                  <span className="ml-2">I'm available for emergency donation requests</span>
                </Form.Item>
                
                {emergencyAvailability && (
                  <Form.Item
                    name="emergencyRange"
                    label="Maximum distance you're willing to travel for emergency donations (km)"
                  >
                    <Select className="w-full">
                      <Option value={5}>5 km</Option>
                      <Option value={10}>10 km</Option>
                      <Option value={25}>25 km</Option>
                      <Option value={50}>50 km</Option>
                      <Option value={100}>100 km</Option>
                    </Select>
                  </Form.Item>
                )}

                <Divider />

                <Title level={4}>
                  <BellOutlined className="mr-2" />
                  Notification Preferences
                </Title>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Form.Item
                    name="notificationSms"
                    valuePropName="checked"
                    className="mb-0"
                  >
                    <Checkbox>
                      <Space>
                        <PhoneOutlined className="mr-1" /> SMS Notifications
                      </Space>
                    </Checkbox>
                  </Form.Item>
                  
                  <Form.Item
                    name="notificationEmail"
                    valuePropName="checked"
                    className="mb-0"
                  >
                    <Checkbox>
                      <Space>
                        <MailOutlined className="mr-1" /> Email Notifications
                      </Space>
                    </Checkbox>
                  </Form.Item>
                  
                  <Form.Item
                    name="notificationPush"
                    valuePropName="checked"
                    className="mb-0"
                  >
                    <Checkbox>
                      <Space>
                        <BellOutlined className="mr-1" /> Push Notifications
                      </Space>
                    </Checkbox>
                  </Form.Item>
                </div>
                
                <Form.Item
                  name="remindBefore"
                  label="Remind me before my appointment"
                  className="mt-4"
                >
                  <Select>
                    <Option value={1}>1 day before</Option>
                    <Option value={2}>2 days before</Option>
                    <Option value={3}>3 days before</Option>
                    <Option value={7}>1 week before</Option>
                  </Select>
                </Form.Item>

                <Divider />
                
                <Form.Item
                  name="availabilityNotes"
                  label="Additional Notes"
                >
                  <Input.TextArea 
                    rows={3} 
                    placeholder="Any additional information about your availability"
                  />
                </Form.Item>
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />}
                    className="bg-red-600 hover:bg-red-700"
                    size="large"
                  >
                    Save Availability Settings
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          
          <Col xs={24} lg={8}>
            <Card className="shadow-md mb-6">
              <Title level={4}>
                <CalendarOutlined className="mr-2" />
                Availability Calendar
              </Title>
              <Calendar 
                fullscreen={false} 
                dateCellRender={dateCellRender}
              />
            </Card>
            
            <Card 
              className={`shadow-md ${isEligible ? 'bg-green-50' : 'bg-yellow-50'}`}
            >
              <Title level={4}>
                <ClockCircleOutlined className="mr-2" />
                Next Eligible Donation Date
              </Title>
              
              <div className="text-center my-4">
                <Tag 
                  color={isEligible ? 'green' : 'orange'} 
                  icon={isEligible ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                  className="text-lg px-3 py-1"
                >
                  {isEligible ? 'Eligible Now!' : `Eligible in ${daysToEligible} days`}
                </Tag>
                <div className="mt-2">
                  {nextEligibleDate.format('MMMM D, YYYY')}
                </div>
              </div>
              
              <Alert
                type="info"
                showIcon
                icon={<QuestionCircleOutlined />}
                message="Why this date?"
                description="Based on your last donation (Whole Blood on October 1, 2023), you need to wait 56 days before your next donation. Your next eligible date is automatically calculated."
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
} 