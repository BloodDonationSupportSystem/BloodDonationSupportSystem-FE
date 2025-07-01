'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Typography, Form, Select, DatePicker, Button, Card, Spin, Alert, Radio, Input, InputNumber, Checkbox, Space, Divider, Steps } from 'antd';
import { 
  UserOutlined, 
  EnvironmentOutlined, 
  PhoneOutlined,
  CalendarOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  SendOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function EmergencyRequestPage() {
  const [form] = Form.useForm();
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

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
      console.log('Submitted emergency request:', values);
      
      // Simulate API call
      setTimeout(() => {
        setSuccess(true);
        setSubmitting(false);
      }, 1500);
    } catch (err) {
      setError('Failed to submit emergency request. Please try again or contact support directly.');
      setSubmitting(false);
    }
  };

  // Define step interface with requiredFields
  interface Step {
    title: string;
    content: React.ReactNode;
    requiredFields?: string[];
  }

  const steps: Step[] = [
    {
      title: 'Patient Information',
      content: (
        <>
          <Paragraph className="mb-4">
            Please provide details about the patient who needs blood.
          </Paragraph>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="patientName"
              label="Patient Name"
              rules={[{ required: true, message: 'Please enter patient name' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Full name" />
            </Form.Item>
            
            <Form.Item
              name="patientAge"
              label="Patient Age"
              rules={[{ required: true, message: 'Please enter patient age' }]}
            >
              <InputNumber min={0} max={120} style={{ width: '100%' }} placeholder="Age" />
            </Form.Item>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="patientGender"
              label="Patient Gender"
              rules={[{ required: true, message: 'Please select patient gender' }]}
            >
              <Radio.Group>
                <Radio value="male">Male</Radio>
                <Radio value="female">Female</Radio>
                <Radio value="other">Other</Radio>
              </Radio.Group>
            </Form.Item>
            
            <Form.Item
              name="bloodType"
              label="Required Blood Type"
              rules={[{ required: true, message: 'Please select required blood type' }]}
            >
              <Select placeholder="Select blood type">
                {bloodTypes.map(type => (
                  <Option key={type} value={type}>{type}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item
            name="medicalCondition"
            label="Medical Condition"
            rules={[{ required: true, message: 'Please describe the medical condition' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="Briefly describe the patient's medical condition and why blood is needed"
            />
          </Form.Item>
          
          <Form.Item
            name="urgencyLevel"
            label="Urgency Level"
            rules={[{ required: true, message: 'Please select urgency level' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="critical">
                  <Text strong className="text-red-600">Critical (Needed within hours)</Text>
                </Radio>
                <Radio value="urgent">
                  <Text strong className="text-orange-500">Urgent (Needed within 24 hours)</Text>
                </Radio>
                <Radio value="scheduled">
                  <Text strong className="text-blue-500">Scheduled (Needed for planned procedure)</Text>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Medical Facility',
      content: (
        <>
          <Paragraph className="mb-4">
            Please provide details about where the blood is needed.
          </Paragraph>
          
          <Form.Item
            name="hospitalName"
            label="Hospital/Medical Facility Name"
            rules={[{ required: true, message: 'Please enter hospital name' }]}
          >
            <Input prefix={<MedicineBoxOutlined />} placeholder="Name of the hospital or medical facility" />
          </Form.Item>
          
          <Form.Item
            name="hospitalAddress"
            label="Hospital Address"
            rules={[{ required: true, message: 'Please enter hospital address' }]}
          >
            <TextArea 
              rows={2} 
              placeholder="Full address of the hospital"
            />
          </Form.Item>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="hospitalCity"
              label="City"
              rules={[{ required: true, message: 'Please enter city' }]}
            >
              <Input placeholder="City" />
            </Form.Item>
            
            <Form.Item
              name="hospitalDistrict"
              label="District"
              rules={[{ required: true, message: 'Please enter district' }]}
            >
              <Input placeholder="District" />
            </Form.Item>
          </div>
          
          <Form.Item
            name="neededBy"
            label="Blood Needed By"
            rules={[{ required: true, message: 'Please select when blood is needed' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD" 
              disabledDate={(current) => current && current < dayjs().endOf('day')}
              placeholder="Select date when blood is needed"
            />
          </Form.Item>
          
          <Form.Item
            name="unitsNeeded"
            label="Units of Blood Needed"
            rules={[{ required: true, message: 'Please enter number of units needed' }]}
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} placeholder="Number of units" />
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Contact Information',
      content: (
        <>
          <Paragraph className="mb-4">
            Please provide contact information for this emergency request.
          </Paragraph>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="contactName"
              label="Contact Person Name"
              initialValue={user?.firstName + ' ' + user?.lastName}
              rules={[{ required: true, message: 'Please enter contact name' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Full name" />
            </Form.Item>
            
            <Form.Item
              name="relationship"
              label="Relationship to Patient"
              rules={[{ required: true, message: 'Please select relationship' }]}
            >
              <Select placeholder="Select relationship">
                <Option value="self">Self</Option>
                <Option value="family">Family Member</Option>
                <Option value="friend">Friend</Option>
                <Option value="medical">Medical Professional</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="contactPhone"
              label="Contact Phone Number"
              initialValue={user?.phoneNumber}
              rules={[{ required: true, message: 'Please enter contact phone number' }]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Phone number" />
            </Form.Item>
            
            <Form.Item
              name="contactEmail"
              label="Contact Email"
              initialValue={user?.email}
              rules={[
                { required: true, message: 'Please enter contact email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input type="email" placeholder="Email address" />
            </Form.Item>
          </div>
          
          <Form.Item
            name="additionalInformation"
            label="Additional Information"
          >
            <TextArea 
              rows={3} 
              placeholder="Any additional information that might be helpful for potential donors"
            />
          </Form.Item>
          
          <Form.Item 
            name="sendNotifications" 
            valuePropName="checked"
            initialValue={true}
          >
            <Checkbox>Send notifications to nearby donors with matching blood type</Checkbox>
          </Form.Item>
          
          <Form.Item 
            name="agreement" 
            valuePropName="checked"
            rules={[
              { 
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('You must agree to the terms')),
              },
            ]}
          >
            <Checkbox>
              I confirm that this is a genuine emergency blood request and all information provided is accurate.
              I understand that misuse of the emergency system may result in account suspension.
            </Checkbox>
          </Form.Item>
        </>
      ),
    },
  ];

  const next = async () => {
    try {
      // Validate fields in the current step before going to the next step
      await form.validateFields(steps[currentStep].requiredFields);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  // Add required fields for each step for validation
  steps[0].requiredFields = ['patientName', 'patientAge', 'patientGender', 'bloodType', 'medicalCondition', 'urgencyLevel'];
  steps[1].requiredFields = ['hospitalName', 'hospitalAddress', 'hospitalCity', 'hospitalDistrict', 'neededBy', 'unitsNeeded'];
  steps[2].requiredFields = ['contactName', 'relationship', 'contactPhone', 'contactEmail', 'agreement'];

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

  // Show success message after submission
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card className="shadow-md text-center p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <HeartOutlined className="text-red-600 text-3xl" />
              </div>
            </div>
            
            <Title level={2} className="text-green-600 mb-4">Emergency Request Submitted</Title>
            
            <Paragraph className="text-lg mb-6">
              Your emergency blood request has been successfully submitted.
              We are notifying potential donors in your area and our medical facility partners.
            </Paragraph>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
              <Title level={4} className="text-blue-700 mb-2">What happens next?</Title>
              <ul className="list-disc pl-5 text-blue-600">
                <li>Your request is now visible to nearby donors with matching blood types</li>
                <li>Medical facilities in your area have been notified</li>
                <li>You'll receive notifications as donors respond to your request</li>
                <li>Our support team will follow up with you shortly to confirm details</li>
              </ul>
            </div>
            
            <div className="flex justify-center gap-4">
              {/* <Button size="large" onClick={() => router.push('/member/dashboard')}>
                Go to Dashboard
              </Button> */}
              <Button type="primary" size="large" className="bg-red-600 hover:bg-red-700">
                View Request Status
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <Title level={2} className="text-red-600">Emergency Blood Request</Title>
          <Paragraph className="text-gray-500">
            Submit an emergency request to connect with potential donors and medical facilities
          </Paragraph>
        </div>

        <Card className="shadow-md">
          {error && <Alert message={error} type="error" showIcon className="mb-6" />}
          
          <div className="mb-8">
            <Steps current={currentStep}>
              {steps.map(item => (
                <Step key={item.title} title={item.title} />
              ))}
            </Steps>
          </div>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark
          >
            <div className="py-4">
              {steps[currentStep].content}
            </div>
            
            <Divider />
            
            <div className="flex justify-between">
              {currentStep > 0 && (
                <Button onClick={prev} size="large">
                  Previous
                </Button>
              )}
              
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={next} size="large" className="bg-blue-600 hover:bg-blue-700 ml-auto">
                  Next
                </Button>
              )}
              
              {currentStep === steps.length - 1 && (
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={submitting}
                  size="large"
                  icon={<SendOutlined />}
                  className="bg-red-600 hover:bg-red-700 ml-auto"
                >
                  Submit Emergency Request
                </Button>
              )}
            </div>
          </Form>
        </Card>
        
        <div className="mt-6 text-center">
          <Text type="secondary">
            For immediate assistance, please call our emergency hotline: <Text strong>1900-8888</Text>
          </Text>
        </div>
      </div>
    </div>
  );
} 