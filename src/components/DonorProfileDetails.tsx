import React from 'react';
import { Modal, Descriptions, Tag, Button, Card, Row, Col, Divider, Typography } from 'antd';
import { DonorProfile } from '@/services/api/donorProfileService';
import { UserOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface DonorProfileDetailsProps {
    visible: boolean;
    onClose: () => void;
    donor: DonorProfile | null;
}

const DonorProfileDetails: React.FC<DonorProfileDetailsProps> = ({
    visible,
    onClose,
    donor,
}) => {
    if (!donor) {
        return null;
    }

    const formatDate = (dateString?: string | null) => {
        return dateString ? dayjs(dateString).format('YYYY-MM-DD') : '-';
    };

    const getEligibilityStatus = () => {
        if (donor.isEligible === null) {
            return <Tag color="default">Unknown</Tag>;
        }
        return donor.isEligible ?
            <Tag color="green">Eligible</Tag> :
            <Tag color="volcano">Ineligible</Tag>;
    };

    const fullName = `${donor.firstName || ''} ${donor.lastName || ''}`.trim();

    return (
        <Modal
            title="Donor Profile"
            open={visible}
            onCancel={onClose}
            footer={<Button onClick={onClose}>Close</Button>}
            width={800}
        >
            <Card className="mb-4">
                <Row gutter={24}>
                    <Col span={4}>
                        <div className="flex justify-center items-center h-full">
                            <div className="w-20 h-20 rounded-full bg-blue-100 flex justify-center items-center text-3xl text-blue-500">
                                {fullName ? fullName.charAt(0).toUpperCase() : <UserOutlined />}
                            </div>
                        </div>
                    </Col>
                    <Col span={20}>
                        <Title level={4}>{fullName || 'Unnamed Donor'}</Title>
                        <div className="flex flex-wrap gap-3 mb-2">
                            <Tag color="red">{donor.bloodGroupName || 'Unknown Blood Type'}</Tag>
                            {getEligibilityStatus()}
                            {donor.isAvailableForEmergency && (
                                <Tag color="blue">Available for Emergency</Tag>
                            )}
                        </div>
                        <div className="text-gray-500 flex flex-wrap gap-6">
                            {donor.email && (
                                <span className="flex items-center gap-1">
                                    <MailOutlined /> {donor.email}
                                </span>
                            )}
                            {donor.phoneNumber && (
                                <span className="flex items-center gap-1">
                                    <PhoneOutlined /> {donor.phoneNumber}
                                </span>
                            )}
                            {donor.address && (
                                <span className="flex items-center gap-1">
                                    <EnvironmentOutlined /> {donor.address}
                                </span>
                            )}
                        </div>
                    </Col>
                </Row>
            </Card>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Personal Information" className="mb-4">
                        <Descriptions layout="vertical" column={1} size="small" bordered>
                            <Descriptions.Item label="User ID">{donor.userId || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Username">{donor.userName || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Date of Birth">
                                <div className="flex items-center gap-1">
                                    <CalendarOutlined /> {formatDate(donor.dateOfBirth)}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Gender">
                                {donor.gender ? 'Male' : 'Female'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Preferred Donation Time">
                                {donor.preferredDonationTime || '-'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                <Col span={12}>
                    <Card title="Donation Information" className="mb-4">
                        <Descriptions layout="vertical" column={1} size="small" bordered>
                            <Descriptions.Item label="Total Donations">
                                <div className="font-bold text-lg">{donor.totalDonations || 0}</div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Last Donation Date">
                                {formatDate(donor.lastDonationDate)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Next Eligible Donation Date">
                                {formatDate(donor.nextAvailableDonationDate)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Blood Group">
                                <Tag color="red">{donor.bloodGroupName || 'Unknown'}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Donor Type">
                                {donor.donationType || 'Regular Donor'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
            </Row>

            <Card title="Health Information">
                <Descriptions layout="vertical" column={2} size="small" bordered>
                    <Descriptions.Item label="Health Status">
                        {donor.healthStatus || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Health Check">
                        {formatDate(donor.lastHealthCheckDate)}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Divider />

            <div className="text-gray-500 text-sm">
                <div>Profile created: {formatDate(donor.createdTime)}</div>
                <div>Last updated: {formatDate(donor.lastUpdatedTime)}</div>
            </div>
        </Modal>
    );
};

export default DonorProfileDetails; 