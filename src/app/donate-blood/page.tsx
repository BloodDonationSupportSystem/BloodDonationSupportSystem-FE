'use client';

import React, { useState } from 'react';
import { Typography, Button, Steps, Card, Row, Col, Divider, Alert, Spin } from 'antd';
import { 
  CalendarOutlined, 
  ScheduleOutlined, 
  MedicineBoxOutlined, 
  HeartOutlined, 
  CheckCircleOutlined,
  UserOutlined,
  RightOutlined
} from '@ant-design/icons';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { checkCurrentUserHasProfile } from '@/services/api/donorProfileService';
import { toast } from 'react-toastify';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

export default function DonateBloodPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);

  const donationSteps = [
    {
      title: 'Registration',
      description: 'Complete a brief health questionnaire',
      icon: <UserOutlined />
    },
    {
      title: 'Health Screening',
      description: 'Quick physical check including blood pressure, pulse, and hemoglobin levels',
      icon: <MedicineBoxOutlined />
    },
    {
      title: 'Donation',
      description: 'The donation itself takes only 8-10 minutes',
      icon: <HeartOutlined />
    },
    {
      title: 'Recovery',
      description: 'Rest and enjoy refreshments for 10-15 minutes',
      icon: <ScheduleOutlined />
    },
    {
      title: 'All Done!',
      description: "You've just helped save lives!",
      icon: <CheckCircleOutlined />
    }
  ];

  const handleScheduleDonation = async () => {
    if (!isLoggedIn) {
      toast.info('Please log in to schedule a donation');
      router.push('/login?redirect=/donate-blood');
      return;
    }

    try {
      setIsCheckingProfile(true);
      const hasProfile = await checkCurrentUserHasProfile();
      
      if (hasProfile) {
        router.push('/member/donate-blood');
      } else {
        toast.info('You need to create a donor profile first');
        router.push('/profile-creation');
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsCheckingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto">
        {/* Hero Section */}
        <div className="relative mb-16 rounded-xl overflow-hidden">
          <div className="h-96 w-full relative">
            <Image 
              src="/img/banner/banner.jpg"
              alt="Blood Donation" 
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 to-red-500/50 flex items-center">
              <div className="px-8 md:px-16 max-w-3xl">
                <Title className="text-white mb-6">
                  Your Blood Donation Can Save Lives
                </Title>
                <Paragraph className="text-white text-lg mb-8">
                  Every donation can help save up to three lives. The donation process is safe, 
                  simple, and takes only about an hour of your time.
                </Paragraph>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={handleScheduleDonation}
                  loading={isCheckingProfile}
                  className="bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
                >
                  Schedule a Donation <RightOutlined />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Why Donate Section */}
        {/* <div className="mb-16">
          <Title level={2} className="text-center mb-12">Why Donate Blood?</Title>
          <Row gutter={[24, 24]} className="justify-center">
            <Col xs={24} md={8}>
              <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 text-2xl">
                    <HeartOutlined />
                  </div>
                </div>
                <Title level={4} className="text-center">Save Lives</Title>
                <Paragraph className="text-center">
                  One donation can save up to three lives. Blood is essential for surgeries, 
                  cancer treatments, chronic illnesses, and traumatic injuries.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 text-2xl">
                    <MedicineBoxOutlined />
                  </div>
                </div>
                <Title level={4} className="text-center">Health Benefits</Title>
                <Paragraph className="text-center">
                  Regular blood donation can reduce the risk of heart attacks and cancer. 
                  It also helps in reducing the iron levels in the body.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 text-2xl">
                    <ScheduleOutlined />
                  </div>
                </div>
                <Title level={4} className="text-center">Quick & Easy</Title>
                <Paragraph className="text-center">
                  The donation process takes less than an hour from start to finish. 
                  The actual blood draw only takes about 8-10 minutes.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div> */}

        {/* Donation Process Section */}
        <div className="mb-16 bg-white p-8 rounded-xl shadow-sm">
          <Title level={2} className="text-center mb-12">The Donation Process</Title>
          <Steps 
            current={-1} 
            direction="vertical"
            className="max-w-3xl mx-auto"
            items={donationSteps.map((step, index) => ({
              title: step.title,
              description: step.description,
              icon: step.icon
            }))}
          />
        </div>

        {/* Eligibility Section */}
        <div className="mb-16">
          <Title level={2} className="text-center mb-8">Basic Eligibility Requirements</Title>
          <Row gutter={[24, 24]} className="justify-center">
            <Col xs={24} md={20} lg={16}>
              <Card className="shadow-sm">
                <ul className="list-disc pl-6 space-y-3">
                  <li>Be at least 18 years old</li>
                  <li>Weigh at least 50 kg</li>
                  <li>Be in good general health</li>
                  <li>Have not donated blood in the last 56 days (whole blood)</li>
                  <li>Have not had any recent surgeries or medical procedures</li>
                  <li>Not currently taking antibiotics</li>
                  <li>Not pregnant or have not given birth in the last 6 months</li>
                </ul>
                <Divider />
                <Alert
                  message="Note"
                  description="The complete eligibility criteria will be assessed during your health screening. Some medications, travel history, or medical conditions may affect eligibility."
                  type="info"
                  showIcon
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-16">
          <Title level={2} className="mb-6">Ready to Make a Difference?</Title>
          <Paragraph className="text-lg mb-8 max-w-2xl mx-auto">
            Your donation can be the lifeline someone is desperately waiting for. 
            Schedule your appointment today and be a hero to someone in need.
          </Paragraph>
          <Button 
            type="primary" 
            size="large"
            onClick={handleScheduleDonation}
            loading={isCheckingProfile}
            className="bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
          >
            Schedule Your Donation Now
          </Button>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <Title level={2} className="text-center mb-8">Frequently Asked Questions</Title>
          <Row gutter={[24, 24]} className="justify-center">
            <Col xs={24} md={20} lg={16}>
              <Card className="shadow-sm">
                <div className="space-y-6">
                  <div>
                    <Title level={4}>How often can I donate blood?</Title>
                    <Paragraph>
                      You can donate whole blood every 56 days (8 weeks). If you donate platelets, 
                      you can donate more frequently, as often as every 7 days up to 24 times a year.
                    </Paragraph>
                  </div>
                  <Divider />
                  <div>
                    <Title level={4}>Does donating blood hurt?</Title>
                    <Paragraph>
                      Most donors report only a brief pinch when the needle is inserted. 
                      The actual donation process is usually painless.
                    </Paragraph>
                  </div>
                  <Divider />
                  <div>
                    <Title level={4}>How long does the donation process take?</Title>
                    <Paragraph>
                      The entire process takes about an hour, which includes registration, 
                      health screening, the donation itself (8-10 minutes), and recovery time.
                    </Paragraph>
                  </div>
                  <Divider />
                  <div>
                    <Title level={4}>Is it safe to donate blood during the COVID-19 pandemic?</Title>
                    <Paragraph>
                      Yes, blood donation centers follow strict safety protocols. 
                      Staff members wear appropriate protective equipment, donation beds are 
                      sanitized between donors, and social distancing measures are in place.
                    </Paragraph>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
} 