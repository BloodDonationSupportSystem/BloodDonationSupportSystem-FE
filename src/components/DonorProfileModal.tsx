import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Button, Card, Row, Col, Divider } from 'antd';
import { DonorProfile } from '@/services/api/donorProfileService';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getDonorProfile } from '@/services/api/donorProfileService';

interface DonorProfileModalProps {
    open: boolean;
    onClose: () => void;
    donorId: string;
}

const DonorProfileModal: React.FC<DonorProfileModalProps> = ({ open, onClose, donorId }) => {
    const [profile, setProfile] = useState<DonorProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && donorId) {
            fetchDonorProfile(donorId);
        }
    }, [open, donorId]);

    const fetchDonorProfile = async (id: string) => {
        setLoading(true);
        try {
            const response = await getDonorProfile(id);
            if (response.success && response.data) {
                setProfile(response.data);
            }
        } catch (error) {
            console.error('Error fetching donor profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!profile) return null;

    // Format dates with Vietnam timezone (+7)
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'Chưa có thông tin';
        return dayjs(dateString).add(7, 'hour').format('DD/MM/YYYY HH:mm:ss');
    };

    return (
        <Modal
            title="Thông tin người hiến máu"
            open={open}
            onCancel={onClose}
            footer={null}
            width={900}
            centered
        >
            <Card className="mb-4">
                <Row gutter={24}>
                    <Col span={4}>
                        <div className="flex justify-center items-center h-full">
                            <div className="w-20 h-20 rounded-full bg-red-100 flex justify-center items-center text-3xl text-red-500">
                                {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : <UserOutlined />}
                            </div>
                        </div>
                    </Col>
                    <Col span={20}>
                        <h2 className="text-xl font-bold">{profile.firstName} {profile.lastName}</h2>
                        <p className="text-gray-500">{profile.email}</p>
                        <p className="text-gray-500">{profile.phoneNumber}</p>
                        <div className="mt-2">
                            <Tag color="red">{profile.bloodGroupName}</Tag>
                            {profile.isEligible && <Tag color="green">Đủ điều kiện hiến máu</Tag>}
                            {!profile.isEligible && <Tag color="orange">Chưa đủ điều kiện hiến máu</Tag>}
                            {profile.isAvailableForEmergency && <Tag color="blue">Sẵn sàng hiến máu khẩn cấp</Tag>}
                        </div>
                    </Col>
                </Row>
            </Card>

            <Card title="Lịch sử hiến máu" className="mb-4">
                <Row gutter={16}>
                    <Col span={8}>
                        <Card bordered={false} className="text-center">
                            <p className="text-gray-500">Tổng số lần hiến máu</p>
                            <p className="text-2xl font-bold text-red-500">{profile.totalDonations || 0}</p>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card bordered={false} className="text-center">
                            <p className="text-gray-500">Lần hiến máu gần nhất</p>
                            <p className="text-sm font-medium">{formatDate(profile.lastDonationDate)}</p>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card bordered={false} className="text-center">
                            <p className="text-gray-500">Lần hiến máu tiếp theo</p>
                            <p className="text-sm font-medium">{formatDate(profile.nextEligibleDonationDate || profile.nextAvailableDonationDate)}</p>
                        </Card>
                    </Col>
                </Row>

                <Divider />

                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Địa chỉ">{profile.address || 'Chưa cập nhật'}</Descriptions.Item>
                    <Descriptions.Item label="Ngày sinh">{profile.dateOfBirth ? dayjs(profile.dateOfBirth).format('DD/MM/YYYY') : 'Chưa cập nhật'}</Descriptions.Item>
                    <Descriptions.Item label="Giới tính">{profile.gender ? 'Nam' : 'Nữ'}</Descriptions.Item>
                    <Descriptions.Item label="Tình trạng sức khỏe">{profile.healthStatus || 'Chưa cập nhật'}</Descriptions.Item>
                    <Descriptions.Item label="Kiểm tra sức khỏe gần nhất">
                        {profile.lastHealthCheckDate ? dayjs(profile.lastHealthCheckDate).format('DD/MM/YYYY') : 'Chưa cập nhật'}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <div className="flex justify-end">
                <Button onClick={onClose}>Đóng</Button>
            </div>
        </Modal>
    );
};

export default DonorProfileModal; 