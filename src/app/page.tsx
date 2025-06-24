'use client';

import React from 'react';
import { Layout, Typography, Button, Card, Row, Col, Carousel, Statistic } from 'antd';
import { 
  HeartFilled, 
  ScheduleOutlined, 
  TeamOutlined, 
  MedicineBoxOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

export default function HomePage() {
  return (
    <Layout className="min-h-screen">
      <Header />
      <Content>
        <div className="min-h-screen bg-gray-50">
          {/* Hero Section */}
          <div className="bg-red-50 py-16">
            <div className="container mx-auto px-4 md:px-8">
              <Row gutter={[32, 32]} align="middle">
                <Col xs={24} md={12}>
                  <div className="space-y-6">
                    <Title level={1} className="text-red-600 mb-0">
                      Donate Blood, Save Lives
                    </Title>
                    <Paragraph className="text-lg text-gray-700">
                      Your donation can make a difference in someone's life. Join our community of donors and help save lives today.
                    </Paragraph>
                    <div className="flex flex-wrap gap-4">
                      <Button type="primary" size="large" className="bg-red-600 hover:bg-red-700">
                        Donate Now
                      </Button>
                      <Button size="large">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <img 
                    src="/img/banner/banner.jpg" 
                    alt="Blood Donation" 
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </Col>
              </Row>
            </div>
          </div>

          {/* Stats Section */}
          <div className="py-16 bg-white">
            <div className="container mx-auto px-4 md:px-8">
              <Title level={2} className="text-center mb-12">Making a Difference Together</Title>
              <Row gutter={[32, 32]}>
                <Col xs={24} sm={12} md={6}>
                  <Card className="text-center h-full shadow-sm hover:shadow-md transition-shadow">
                    <Statistic 
                      title="Lives Saved" 
                      value={10000} 
                      prefix={<HeartFilled className="text-red-500" />} 
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card className="text-center h-full shadow-sm hover:shadow-md transition-shadow">
                    <Statistic 
                      title="Donations" 
                      value={25000} 
                      prefix={<MedicineBoxOutlined className="text-red-500" />} 
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card className="text-center h-full shadow-sm hover:shadow-md transition-shadow">
                    <Statistic 
                      title="Donors" 
                      value={15000} 
                      prefix={<TeamOutlined className="text-red-500" />} 
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card className="text-center h-full shadow-sm hover:shadow-md transition-shadow">
                    <Statistic 
                      title="Blood Drives" 
                      value={500} 
                      prefix={<ScheduleOutlined className="text-red-500" />} 
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          </div>

          {/* Why Donate Section */}
          <div className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 md:px-8">
              <Title level={2} className="text-center mb-12">Why Donate Blood?</Title>
              <Row gutter={[32, 32]}>
                <Col xs={24} md={8}>
                  <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-center mb-4">
                      <HeartFilled className="text-5xl text-red-500" />
                    </div>
                    <Title level={4} className="text-center">Save Lives</Title>
                    <Paragraph className="text-center">
                      Your blood donation can save up to 3 lives. Blood is needed every 2 seconds for emergencies.
                    </Paragraph>
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-center mb-4">
                      <MedicineBoxOutlined className="text-5xl text-red-500" />
                    </div>
                    <Title level={4} className="text-center">Health Benefits</Title>
                    <Paragraph className="text-center">
                      Regular blood donation reduces the risk of heart disease and helps in maintaining good health.
                    </Paragraph>
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-center mb-4">
                      <TeamOutlined className="text-5xl text-red-500" />
                    </div>
                    <Title level={4} className="text-center">Community Impact</Title>
                    <Paragraph className="text-center">
                      Be part of a community that helps others in need. Your contribution makes a real difference.
                    </Paragraph>
                  </Card>
                </Col>
              </Row>
            </div>
          </div>

          {/* Upcoming Blood Drives */}
          <div className="py-16 bg-white">
            <div className="container mx-auto px-4 md:px-8">
              <div className="flex justify-between items-center mb-12">
                <Title level={2} className="mb-0">Upcoming Blood Drives</Title>
                <Button type="link" className="text-red-600 flex items-center">
                  View All <ArrowRightOutlined />
                </Button>
              </div>
              <Row gutter={[32, 32]}>
                {[1, 2, 3].map((item) => (
                  <Col xs={24} md={8} key={item}>
                    <Card 
                      hoverable 
                      className="shadow-sm hover:shadow-md transition-shadow"
                      cover={<img alt={`Blood Drive ${item}`} src={`/img/banner/event-${item}.jpg`} className="h-48 object-cover" />}
                    >
                      <div className="mb-2">
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                          {new Date(2023, 6 + item, 10 + item).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <Title level={4}>Community Blood Drive #{item}</Title>
                      <Paragraph className="text-gray-600 mb-4">
                        Join us for our community blood drive. Every donation counts!
                      </Paragraph>
                      <div className="flex items-center text-gray-500">
                        <ScheduleOutlined className="mr-2" />
                        <span>9:00 AM - 5:00 PM</span>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </div>

          {/* Testimonials */}
          <div className="py-16 bg-red-50">
            <div className="container mx-auto px-4 md:px-8">
              <Title level={2} className="text-center mb-12">Donor Testimonials</Title>
              <Carousel autoplay className="pb-12">
                {[1, 2, 3].map((item) => (
                  <div key={item}>
                    <div className="bg-white p-8 rounded-lg shadow-sm mx-4 md:mx-16 text-center">
                      <div className="mb-6">
                        <img 
                          src={`/img/testmonial/person-${item}.jpg`} 
                          alt={`Donor ${item}`}
                          className="w-20 h-20 rounded-full mx-auto object-cover"
                        />
                      </div>
                      <Paragraph className="text-lg italic mb-6">
                        "Donating blood has been one of the most rewarding experiences of my life. 
                        Knowing that my small act can save someone's life gives me immense satisfaction."
                      </Paragraph>
                      <Title level={5} className="mb-0">John Doe</Title>
                      <Paragraph className="text-gray-500">Regular Donor</Paragraph>
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-16 bg-red-600 text-white">
            <div className="container mx-auto px-4 md:px-8 text-center">
              <Title level={2} className="text-white mb-6">Ready to Make a Difference?</Title>
              <Paragraph className="text-lg mb-8 max-w-2xl mx-auto">
                Your blood donation can be the lifeline for someone in need. Schedule your donation today and be a hero.
              </Paragraph>
              <Button size="large" className="bg-white text-red-600 hover:bg-gray-100">
                Schedule a Donation
              </Button>
            </div>
          </div>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
} 