'use client';

import React from 'react';
import { Typography, Card, Row, Col, Button } from 'antd';
import { HeartOutlined, CalendarOutlined, EnvironmentOutlined, EditOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;

/**
 * Component to display a prompt for users to create a donor profile
 * Used across multiple pages that require a donor profile
 */
const DonorProfileRequired: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="bg-white p-8 rounded-lg shadow-sm">
                    <div className="text-center mb-8">
                        <HeartOutlined className="text-5xl text-red-500 mb-4" />
                        <Title level={2}>Welcome to Blood Donation Support System</Title>
                        <Paragraph className="text-gray-500 text-lg">
                            You don't have a donor profile yet. Creating a profile will allow you to:
                        </Paragraph>
                    </div>

                    <Row gutter={[16, 16]} className="mb-8">
                        <Col xs={24} sm={12}>
                            <Card className="h-full">
                                <div className="flex items-start">
                                    <HeartOutlined className="text-red-500 text-xl mr-3 mt-1" />
                                    <div>
                                        <Text strong className="text-base">Donate Blood</Text>
                                        <Paragraph className="text-gray-500 mb-0">
                                            Register as a blood donor and help save lives
                                        </Paragraph>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Card className="h-full">
                                <div className="flex items-start">
                                    <CalendarOutlined className="text-red-500 text-xl mr-3 mt-1" />
                                    <div>
                                        <Text strong className="text-base">Schedule Donations</Text>
                                        <Paragraph className="text-gray-500 mb-0">
                                            Set your preferred donation times and availability
                                        </Paragraph>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Card className="h-full">
                                <div className="flex items-start">
                                    <EnvironmentOutlined className="text-red-500 text-xl mr-3 mt-1" />
                                    <div>
                                        <Text strong className="text-base">Find Nearby Requests</Text>
                                        <Paragraph className="text-gray-500 mb-0">
                                            Help people in need of blood near your location
                                        </Paragraph>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Card className="h-full">
                                <div className="flex items-start">
                                    <EditOutlined className="text-red-500 text-xl mr-3 mt-1" />
                                    <div>
                                        <Text strong className="text-base">Track Donations</Text>
                                        <Paragraph className="text-gray-500 mb-0">
                                            Keep a record of your donation history and impact
                                        </Paragraph>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <div className="text-center">
                        <Link href="/profile-creation">
                            <Button
                                type="primary"
                                size="large"
                                icon={<HeartOutlined />}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Create Donor Profile
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonorProfileRequired; 