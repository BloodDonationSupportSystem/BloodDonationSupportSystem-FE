'use client';

import React from 'react';
import { Typography, Card, Row, Col, Divider, Timeline, Image } from 'antd';
import { 
  HeartFilled, 
  TeamOutlined, 
  SafetyCertificateOutlined, 
  ClockCircleOutlined,
  MedicineBoxOutlined,
  BulbOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Title level={1} className="text-red-600">About Our Medical Facility</Title>
          <Paragraph className="text-gray-600 text-lg max-w-3xl mx-auto">
            Dedicated to saving lives through safe and effective blood donation services since 2010.
            We connect donors with recipients and ensure a steady supply of blood for those in need.
          </Paragraph>
        </div>

        {/* Mission and Vision */}
        <Row gutter={[32, 32]}>
          <Col xs={24} md={12}>
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
              <Title level={3} className="text-red-600 flex items-center">
                <HeartFilled className="mr-2" /> Our Mission
              </Title>
              <Paragraph className="text-gray-600">
                To ensure that everyone who needs blood can receive it promptly and safely.
                We strive to maintain adequate blood supplies, educate the public about
                the importance of blood donation, and provide excellent care to both donors
                and recipients.
              </Paragraph>
              <ul className="mt-4 space-y-2">
                {[
                  'Ensure blood availability for all patients',
                  'Promote voluntary blood donation',
                  'Maintain highest safety standards',
                  'Educate communities about blood donation',
                  'Support medical research'
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleOutlined className="text-green-500 mr-2 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
              <Title level={3} className="text-red-600 flex items-center">
                <BulbOutlined className="mr-2" /> Our Vision
              </Title>
              <Paragraph className="text-gray-600">
                To be the leading blood donation center known for innovation, reliability,
                and community engagement. We envision a world where no one dies due to lack
                of blood availability, and where donation is a regular practice in everyone's life.
              </Paragraph>
              <div className="mt-4 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <Title level={5} className="text-red-600 m-0">Our Commitment</Title>
                <Paragraph className="text-gray-600 mb-0">
                  Every day, we work to create a future where blood shortages are eliminated,
                  and where blood donation is seen as a civic responsibility and a way to give
                  back to the community.
                </Paragraph>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Our Values */}
        <Title level={2} className="text-center mt-16 mb-8">Our Core Values</Title>
        <Row gutter={[24, 24]} className="mb-16">
          {[
            {
              icon: <SafetyCertificateOutlined className="text-4xl text-red-500" />,
              title: 'Safety',
              description: 'We maintain rigorous standards to ensure the safety of donors and recipients.'
            },
            {
              icon: <TeamOutlined className="text-4xl text-red-500" />,
              title: 'Community',
              description: 'We believe in building strong relationships with our donors, patients, and community partners.'
            },
            {
              icon: <MedicineBoxOutlined className="text-4xl text-red-500" />,
              title: 'Quality Care',
              description: 'We provide excellent care and support to both donors and recipients throughout the process.'
            },
            {
              icon: <ClockCircleOutlined className="text-4xl text-red-500" />,
              title: 'Reliability',
              description: 'We ensure that blood is available when and where it is needed most.'
            }
          ].map((value, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card className="text-center h-full shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{value.icon}</div>
                <Title level={4}>{value.title}</Title>
                <Paragraph className="text-gray-600">{value.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Our History */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <Title level={2} className="text-center mb-8">Our History</Title>
          <Timeline
            mode="alternate"
            items={[
              {
                color: 'red',
                children: (
                  <div>
                    <Title level={4}>2010: Foundation</Title>
                    <Paragraph>
                      Our medical facility was established with a mission to address the growing need for blood donation services in the community.
                    </Paragraph>
                  </div>
                ),
              },
              {
                color: 'red',
                children: (
                  <div>
                    <Title level={4}>2013: Expansion</Title>
                    <Paragraph>
                      We expanded our services to include mobile blood drives and began partnerships with local hospitals.
                    </Paragraph>
                  </div>
                ),
              },
              {
                color: 'red',
                children: (
                  <div>
                    <Title level={4}>2016: Technology Integration</Title>
                    <Paragraph>
                      Launched our first digital platform to connect donors with recipients and streamline the donation process.
                    </Paragraph>
                  </div>
                ),
              },
              {
                color: 'red',
                children: (
                  <div>
                    <Title level={4}>2020: Pandemic Response</Title>
                    <Paragraph>
                      Implemented enhanced safety protocols and virtual consultations to ensure continued blood supply during COVID-19.
                    </Paragraph>
                  </div>
                ),
              },
              {
                color: 'red',
                children: (
                  <div>
                    <Title level={4}>2023: New Blood Support System</Title>
                    <Paragraph>
                      Launched our comprehensive Blood Donation Support System to improve donor experience and recipient matching.
                    </Paragraph>
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* Our Team */}
        <Title level={2} className="text-center mb-8">Our Leadership Team</Title>
        <Row gutter={[24, 24]} className="mb-16">
          {[
            {
              name: 'Dr. Minh Nguyen',
              title: 'Medical Director',
              image: '/img/testmonial/people-1.jpg',
              bio: 'With over 20 years of experience in hematology, Dr. Nguyen oversees all medical aspects of our donation center.'
            },
            {
              name: 'Linh Tran',
              title: 'Operations Manager',
              image: '/img/testmonial/people-2.jpg',
              bio: 'Linh ensures the smooth day-to-day operations of our facility and coordinates our mobile blood drives.'
            },
            {
              name: 'Thanh Pham',
              title: 'Community Outreach Director',
              image: '/img/testmonial/people-3.jpg',
              bio: 'Thanh builds partnerships with schools, businesses, and community organizations to promote blood donation.'
            }
          ].map((member, index) => (
            <Col xs={24} md={8} key={index}>
              <Card className="text-center h-full shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={120}
                    height={120}
                    className="rounded-full object-cover"
                    preview={false}
                  />
                </div>
                <Title level={4} className="mb-0">{member.name}</Title>
                <Text type="secondary" className="block mb-2">{member.title}</Text>
                <Paragraph className="text-gray-600">{member.bio}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Call to Action */}
        <Card className="bg-red-50 text-center p-8 mb-8">
          <Title level={3} className="text-red-600">Join Our Life-Saving Mission</Title>
          <Paragraph className="text-lg mb-4">
            Every donation can save up to three lives. Become a donor today!
          </Paragraph>
          <div className="flex justify-center gap-4">
            <a href="/donate" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded">
              Donate Now
            </a>
            <a href="/contact" className="bg-white hover:bg-gray-100 text-red-600 font-bold py-2 px-6 rounded border border-red-600">
              Contact Us
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
} 