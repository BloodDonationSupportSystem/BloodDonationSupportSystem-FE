'use client';

import React, { useState } from 'react';
import { Typography, Card, Row, Col, Button, Form, Input, Select, Alert, Divider } from 'antd';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  EnvironmentOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  ClockCircleOutlined,
  SendOutlined,
  TeamOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: 'general',
      message: ''
    }
  });

  const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      // In a real app, you would call an API here
      console.log('Form submitted:', data);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSuccess(true);
      toast.success('Your message has been sent successfully. We will contact you soon!');
      reset();
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to send your message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Title level={1} className="text-red-600">Contact Us</Title>
          <Paragraph className="text-gray-600 text-lg max-w-3xl mx-auto">
            Have questions about blood donation or need more information about our services?
            We're here to help. Reach out to us through any of the channels below.
          </Paragraph>
        </div>

        <Row gutter={[32, 32]}>
          {/* Contact Information */}
          <Col xs={24} lg={10}>
            <Card className="h-full shadow-sm">
              <Title level={3} className="text-red-600 mb-6">Get In Touch</Title>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-red-100 p-3 rounded-full mr-4">
                    <EnvironmentOutlined className="text-red-600 text-xl" />
                  </div>
                  <div>
                    <Text strong className="text-lg block">Visit Us</Text>
                    <Paragraph className="text-gray-600 mb-0">
                      123 Blood Donation Street<br />
                      Medical District, City 10000<br />
                      Vietnam
                    </Paragraph>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-red-100 p-3 rounded-full mr-4">
                    <PhoneOutlined className="text-red-600 text-xl" />
                  </div>
                  <div>
                    <Text strong className="text-lg block">Call Us</Text>
                    <Paragraph className="text-gray-600 mb-0">
                      Main Office: (123) 456-7890<br />
                      Donor Support: (123) 456-7891<br />
                      Emergency: (123) 456-7892
                    </Paragraph>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-red-100 p-3 rounded-full mr-4">
                    <MailOutlined className="text-red-600 text-xl" />
                  </div>
                  <div>
                    <Text strong className="text-lg block">Email Us</Text>
                    <Paragraph className="text-gray-600 mb-0">
                      General Inquiries: info@blooddonation.com<br />
                      Donor Support: donors@blooddonation.com<br />
                      Media: media@blooddonation.com
                    </Paragraph>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-red-100 p-3 rounded-full mr-4">
                    <ClockCircleOutlined className="text-red-600 text-xl" />
                  </div>
                  <div>
                    <Text strong className="text-lg block">Opening Hours</Text>
                    <Paragraph className="text-gray-600 mb-0">
                      Monday - Friday: 8:00 AM - 8:00 PM<br />
                      Saturday: 9:00 AM - 5:00 PM<br />
                      Sunday: 10:00 AM - 2:00 PM
                    </Paragraph>
                  </div>
                </div>
              </div>
              
              <Divider />
              
              <Title level={4} className="flex items-center">
                <TeamOutlined className="mr-2" /> Follow Us
              </Title>
              <div className="flex space-x-4 mt-4">
                {['facebook', 'twitter', 'instagram', 'youtube'].map((social) => (
                  <a 
                    key={social}
                    href={`https://${social}.com/blooddonation`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-gray-200 hover:bg-red-500 text-gray-700 hover:text-white p-2 rounded-full transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" clipRule="evenodd" />
                    </svg>
                  </a>
                ))}
              </div>
            </Card>
          </Col>

          {/* Contact Form */}
          <Col xs={24} lg={14}>
            <Card className="shadow-sm">
              <Title level={3} className="text-red-600 mb-6 flex items-center">
                <SendOutlined className="mr-2" /> Send Us a Message
              </Title>
              
              {isSuccess && (
                <Alert
                  message="Message Sent Successfully"
                  description="Thank you for contacting us. We will get back to you as soon as possible."
                  type="success"
                  showIcon
                  className="mb-6"
                />
              )}
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">Send Us a Message</h3>
                
                {isSuccess && (
                  <Alert
                    message="Message Sent!"
                    description="Thank you for your message. We will get back to you soon."
                    type="success"
                    showIcon
                    className="mb-4"
                  />
                )}
                
                <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="name"
                      control={control}
                      rules={{ required: 'Name is required' }}
                      render={({ field }) => (
                        <Input 
                          {...field}
                          id="name"
                          placeholder="Your name"
                          className={`w-full ${errors.name ? 'border-red-500' : ''}`}
                        />
                      )}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <Controller
                          name="email"
                          control={control}
                          rules={{ 
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address'
                            } 
                          }}
                          render={({ field }) => (
                            <Input 
                              {...field}
                              id="email"
                              placeholder="Your email address"
                              className={`w-full ${errors.email ? 'border-red-500' : ''}`}
                            />
                          )}
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                      </div>
                    </Col>
                    
                    <Col xs={24} md={12}>
                      <div className="mb-4">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <Controller
                          name="phone"
                          control={control}
                          render={({ field }) => (
                            <Input 
                              {...field}
                              id="phone"
                              placeholder="Your phone number"
                            />
                          )}
                        />
                      </div>
                    </Col>
                  </Row>
                  
                  <div className="mb-4">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="subject"
                      control={control}
                      rules={{ required: 'Subject is required' }}
                      render={({ field }) => (
                        <Select 
                          {...field}
                          id="subject"
                          placeholder="Select a subject"
                          className={`w-full ${errors.subject ? 'border-red-500' : ''}`}
                        >
                          <Option value="general">General Inquiry</Option>
                          <Option value="donation">Blood Donation</Option>
                          <Option value="request">Blood Request</Option>
                          <Option value="volunteer">Volunteering</Option>
                          <Option value="feedback">Feedback</Option>
                          <Option value="other">Other</Option>
                        </Select>
                      )}
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="message"
                      control={control}
                      rules={{ required: 'Message is required' }}
                      render={({ field }) => (
                        <TextArea 
                          {...field}
                          id="message"
                          rows={4}
                          placeholder="Your message"
                          className={`w-full ${errors.message ? 'border-red-500' : ''}`}
                        />
                      )}
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    className="w-full bg-red-600 hover:bg-red-700"
                    icon={<SendOutlined />}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Send Message
                  </Button>
                </Form>
              </div>
            </Card>
          </Col>
        </Row>

        {/* FAQ Section */}
        <div className="mt-16">
          <Title level={2} className="text-center mb-8 flex items-center justify-center">
            <QuestionCircleOutlined className="mr-2" /> Frequently Asked Questions
          </Title>
          
          <Row gutter={[24, 24]}>
            {[
              {
                question: 'How often can I donate blood?',
                answer: 'Most healthy adults can donate whole blood every 56 days (8 weeks). Platelet donations can be made more frequently, as often as every 7 days, up to 24 times a year.'
              },
              {
                question: 'What are the requirements to donate blood?',
                answer: 'Generally, donors must be at least 17 years old, weigh at least 50kg, and be in good health. Specific eligibility criteria may vary based on local regulations and medical history.'
              },
              {
                question: 'How long does the donation process take?',
                answer: 'The entire process takes about one hour, which includes registration, a mini-physical, the actual donation (which takes about 10 minutes), and refreshments afterward.'
              },
              {
                question: 'Is donating blood safe?',
                answer: 'Yes, donating blood is very safe. All equipment is sterile and used only once. Our trained professionals follow strict protocols to ensure your safety throughout the process.'
              },
              {
                question: 'Do I need to make an appointment to donate blood?',
                answer: 'While we accept walk-ins, appointments are recommended to minimize wait times. You can schedule an appointment through our website, mobile app, or by calling our donor support line.'
              },
              {
                question: 'Can I donate if I have a medical condition?',
                answer: 'It depends on the condition. Some medical conditions may temporarily or permanently disqualify you from donating. We encourage you to contact us to discuss your specific situation.'
              }
            ].map((faq, index) => (
              <Col xs={24} md={12} key={index}>
                <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                  <Title level={4} className="text-red-600">{faq.question}</Title>
                  <Paragraph className="text-gray-600">{faq.answer}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Map Section */}
        {/* <div className="mt-16">
          <Title level={3} className="text-center mb-6">Find Us</Title>
          <Card className="shadow-sm">
            <div className="bg-gray-300 h-96 w-full flex items-center justify-center">
              <div className="text-center p-8">
                <EnvironmentOutlined className="text-4xl text-red-600 mb-4" />
                <Title level={4}>Interactive Map</Title>
                <Paragraph>
                  An interactive map would be embedded here in a production environment.
                  It would show the location of our blood donation center.
                </Paragraph>
              </div>
            </div>
          </Card>
        </div> */}
      </div>
    </div>
  );
} 