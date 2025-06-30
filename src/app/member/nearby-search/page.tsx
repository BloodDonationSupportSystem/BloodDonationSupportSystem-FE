'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Typography, Card, Spin, Tabs, Form, Select, InputNumber, Button, List, Avatar, Tag, Empty, Alert, Radio } from 'antd';
import { SearchOutlined, UserOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;


// Mock data for donors and recipients
const mockDonors = [
  {
    id: 1,
    name: 'John Doe',
    bloodType: 'A+',
    distance: 2.1,
    lastDonation: '2023-10-15',
    phoneNumber: '+8412345678',
    email: 'john.doe@example.com',
    address: '123 Main St, District 1, HCMC',
  },
  {
    id: 2,
    name: 'Jane Smith',
    bloodType: 'O-',
    distance: 3.5,
    lastDonation: '2023-11-05',
    phoneNumber: '+8498765432',
    email: 'jane.smith@example.com',
    address: '456 Park Ave, District 2, HCMC',
  },
  {
    id: 3,
    name: 'Robert Johnson',
    bloodType: 'B+',
    distance: 4.8,
    lastDonation: '2023-09-20',
    phoneNumber: '+8476543210',
    email: 'robert.johnson@example.com',
    address: '789 Oak St, District 3, HCMC',
  },
];

const mockRecipients = [
  {
    id: 1,
    name: 'Alice Brown',
    bloodType: 'AB+',
    distance: 1.8,
    urgency: 'high',
    neededBy: '2023-12-20',
    phoneNumber: '+8423456789',
    email: 'alice.brown@example.com',
    address: '321 Pine St, District 7, HCMC',
    notes: 'Scheduled for surgery',
  },
  {
    id: 2,
    name: 'Tom Wilson',
    bloodType: 'O+',
    distance: 5.2,
    urgency: 'medium',
    neededBy: '2023-12-25',
    phoneNumber: '+8487654321',
    email: 'tom.wilson@example.com',
    address: '654 Maple Ave, District 5, HCMC',
    notes: 'Regular transfusion patient',
  },
  {
    id: 3,
    name: 'Emily Davis',
    bloodType: 'A-',
    distance: 7.9,
    urgency: 'low',
    neededBy: '2024-01-10',
    phoneNumber: '+8410987654',
    email: 'emily.davis@example.com',
    address: '987 Cedar Rd, District 4, HCMC',
    notes: 'Preparing for scheduled procedure',
  },
];

// Blood types
const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function NearbySearchPage() {
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const [searchType, setSearchType] = useState('donors');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [form] = Form.useForm();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);

  const onFinish = (values: any) => {
    console.log('Search Values:', values);
    
    // Simulate API call with mock data
    setTimeout(() => {
      if (searchType === 'donors') {
        // Filter mock donors based on search criteria
        const filteredDonors = mockDonors.filter(donor => {
          if (values.bloodType && donor.bloodType !== values.bloodType) {
            return false;
          }
          if (values.maxDistance && donor.distance > values.maxDistance) {
            return false;
          }
          return true;
        });
        setSearchResults(filteredDonors);
      } else {
        // Filter mock recipients based on search criteria
        const filteredRecipients = mockRecipients.filter(recipient => {
          if (values.bloodType && recipient.bloodType !== values.bloodType) {
            return false;
          }
          if (values.maxDistance && recipient.distance > values.maxDistance) {
            return false;
          }
          if (values.urgency && values.urgency !== 'all' && recipient.urgency !== values.urgency) {
            return false;
          }
          return true;
        });
        setSearchResults(filteredRecipients);
      }
      setSearchPerformed(true);
    }, 500);
  };

  const renderDonorsList = () => {
    if (!searchPerformed) {
      return null;
    }

    if (searchResults.length === 0) {
      return (
        <Empty 
          description="No donors found matching your criteria" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      );
    }

    return (
      <List
        itemLayout="vertical"
        dataSource={searchResults}
        renderItem={(donor) => (
          <List.Item
            key={donor.id}
            actions={[
              <Button key="contact" type="primary" size="small" className="bg-red-600 hover:bg-red-700">
                Contact
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} size={48} />}
              title={
                <div className="flex items-center">
                  <span className="mr-2">{donor.name}</span>
                  <Tag color="red">{donor.bloodType}</Tag>
                  <Tag color="blue">{donor.distance.toFixed(1)} km away</Tag>
                </div>
              }
              description={
                <div>
                  <div className="flex items-center mt-1">
                    <EnvironmentOutlined className="mr-2 text-gray-500" />
                    <Text type="secondary">{donor.address}</Text>
                  </div>
                  <div className="flex items-center mt-1">
                    <PhoneOutlined className="mr-2 text-gray-500" />
                    <Text type="secondary">{donor.phoneNumber}</Text>
                  </div>
                  <div className="flex items-center mt-1">
                    <MailOutlined className="mr-2 text-gray-500" />
                    <Text type="secondary">{donor.email}</Text>
                  </div>
                </div>
              }
            />
            <div className="mt-2">
              <Text>Last donation: {donor.lastDonation}</Text>
            </div>
          </List.Item>
        )}
      />
    );
  };

  const renderRecipientsList = () => {
    if (!searchPerformed) {
      return null;
    }

    if (searchResults.length === 0) {
      return (
        <Empty 
          description="No recipients found matching your criteria" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      );
    }

    return (
      <List
        itemLayout="vertical"
        dataSource={searchResults}
        renderItem={(recipient) => (
          <List.Item
            key={recipient.id}
            actions={[
              <Button key="help" type="primary" size="small" className="bg-red-600 hover:bg-red-700">
                Offer Help
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} size={48} />}
              title={
                <div className="flex items-center">
                  <span className="mr-2">{recipient.name}</span>
                  <Tag color="red">{recipient.bloodType}</Tag>
                  <Tag color="blue">{recipient.distance.toFixed(1)} km away</Tag>
                  {recipient.urgency === 'high' && (
                    <Tag color="red">Urgent</Tag>
                  )}
                  {recipient.urgency === 'medium' && (
                    <Tag color="orange">Medium Urgency</Tag>
                  )}
                  {recipient.urgency === 'low' && (
                    <Tag color="green">Low Urgency</Tag>
                  )}
                </div>
              }
              description={
                <div>
                  <div className="flex items-center mt-1">
                    <EnvironmentOutlined className="mr-2 text-gray-500" />
                    <Text type="secondary">{recipient.address}</Text>
                  </div>
                  <div className="flex items-center mt-1">
                    <PhoneOutlined className="mr-2 text-gray-500" />
                    <Text type="secondary">{recipient.phoneNumber}</Text>
                  </div>
                  <div className="flex items-center mt-1">
                    <MailOutlined className="mr-2 text-gray-500" />
                    <Text type="secondary">{recipient.email}</Text>
                  </div>
                </div>
              }
            />
            <div className="mt-2">
              <Text>Needed by: {recipient.neededBy}</Text>
              <div className="mt-1">
                <Text type="secondary">Notes: {recipient.notes}</Text>
              </div>
            </div>
          </List.Item>
        )}
      />
    );
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
          <Title level={2}>Find Nearby Blood Donors & Recipients</Title>
          <Paragraph className="text-gray-500">
            Search for blood donors or recipients in your vicinity based on blood type and distance
          </Paragraph>
        </div>

        <Card className="shadow-md mb-8">
          <Tabs 
            defaultActiveKey="donors" 
            onChange={(key) => {
              setSearchType(key);
              setSearchResults([]);
              setSearchPerformed(false);
              form.resetFields();
            }}
            items={[
              {
                key: 'donors',
                label: 'Find Donors',
                children: (
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ maxDistance: 10 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Form.Item
                        name="bloodType"
                        label="Blood Type"
                      >
                        <Select placeholder="Select blood type">
                          {bloodTypes.map(type => (
                            <Option key={type} value={type}>{type}</Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name="maxDistance"
                        label="Maximum Distance (km)"
                        rules={[{ required: true, message: 'Please enter maximum distance' }]}
                      >
                        <InputNumber min={1} max={100} style={{ width: '100%' }} />
                      </Form.Item>

                      <Form.Item label=" " className="flex items-end">
                        <Button 
                          type="primary" 
                          htmlType="submit"
                          icon={<SearchOutlined />}
                          className="bg-red-600 hover:bg-red-700 w-full"
                        >
                          Search Donors
                        </Button>
                      </Form.Item>
                    </div>
                  </Form>
                )
              },
              {
                key: 'recipients',
                label: 'Find Recipients',
                children: (
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ maxDistance: 10, urgency: 'all' }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Form.Item
                        name="bloodType"
                        label="Blood Type"
                      >
                        <Select placeholder="Select blood type">
                          {bloodTypes.map(type => (
                            <Option key={type} value={type}>{type}</Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name="maxDistance"
                        label="Maximum Distance (km)"
                        rules={[{ required: true, message: 'Please enter maximum distance' }]}
                      >
                        <InputNumber min={1} max={100} style={{ width: '100%' }} />
                      </Form.Item>

                      <Form.Item
                        name="urgency"
                        label="Urgency Level"
                      >
                        <Select>
                          <Option value="all">All Levels</Option>
                          <Option value="high">High</Option>
                          <Option value="medium">Medium</Option>
                          <Option value="low">Low</Option>
                        </Select>
                      </Form.Item>

                      <Form.Item label=" " className="flex items-end">
                        <Button 
                          type="primary" 
                          htmlType="submit"
                          icon={<SearchOutlined />}
                          className="bg-red-600 hover:bg-red-700 w-full"
                        >
                          Search Recipients
                        </Button>
                      </Form.Item>
                    </div>
                  </Form>
                )
              }
            ]}
          />
        </Card>

        {searchType === 'donors' ? (
          <Card className="shadow-md">
            <Title level={4} className="mb-4">Donors Near You</Title>
            {renderDonorsList()}
          </Card>
        ) : (
          <Card className="shadow-md">
            <Title level={4} className="mb-4">Recipients Near You</Title>
            {renderRecipientsList()}
          </Card>
        )}

        <Alert
          className="mt-8"
          message="Privacy Notice"
          description="Contact information is only visible to registered and verified users. Please respect the privacy of donors and recipients and use contact information only for blood donation purposes."
          type="info"
          showIcon
        />
      </div>
    </div>
  );
} 