'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import StaffLayout from '@/components/Layout/StaffLayout';
import DonationWorkflow from '@/components/DonationWorkflow';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Card,
    Alert,
    Button,
    Space,
    Spin,
    Empty,
    Descriptions,
    Typography,
    Tag,
    message
} from 'antd';
import {
    ArrowLeftOutlined,
    UserOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { useDonationEvents } from '@/hooks/api/useDonationEvents';
import { useStaffById } from '@/hooks/api/useUsers';
import { DonationEvent } from '@/services/api/donationEventService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function DonationWorkflowPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const appointmentId = searchParams ? searchParams.get('appointmentId') || '' : '';
    const { user } = useAuth();

    // State
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [workflowCompleted, setWorkflowCompleted] = useState<boolean>(false);
    const [completedEvent, setCompletedEvent] = useState<DonationEvent | null>(null);

    // Get staff details
    const { staff, loading: staffLoading } = useStaffById(user?.id || '');

    // Initialize donation events hook
    const { getDonationEventById } = useDonationEvents();

    // Handle workflow completion
    const handleWorkflowFinish = (event: DonationEvent) => {
        setWorkflowCompleted(true);
        setCompletedEvent(event);
        message.success('Donation workflow completed successfully');
    };

    // Handle cancel and return to appointments
    const handleCancel = () => {
        router.push('/staff/appointments');
    };

    // Render completion summary
    const renderCompletionSummary = () => {
        if (!completedEvent) return null;

        return (
            <Card className="max-w-4xl mx-auto">
                <Title level={3} className="text-center mb-6">
                    Donation Process {completedEvent.status}
                </Title>

                <Alert
                    message={
                        completedEvent.status === 'Completed'
                            ? 'Donation Successfully Completed'
                            : completedEvent.status === 'HealthCheckFailed'
                                ? 'Donor Failed Health Check'
                                : 'Donation Process Incomplete'
                    }
                    description={
                        completedEvent.status === 'Completed'
                            ? 'The blood donation has been successfully completed and recorded. The collected blood has been added to inventory.'
                            : completedEvent.status === 'HealthCheckFailed'
                                ? 'The donor did not pass the health check requirements and was unable to donate.'
                                : 'The donation process was incomplete due to a complication or other issue.'
                    }
                    type={
                        completedEvent.status === 'Completed'
                            ? 'success'
                            : completedEvent.status === 'HealthCheckFailed'
                                ? 'warning'
                                : 'error'
                    }
                    showIcon
                    className="mb-6"
                />

                <Descriptions title="Donation Details" bordered layout="vertical">
                    <Descriptions.Item label="Donor Name" span={3}>
                        <div className="flex items-center">
                            <UserOutlined className="mr-2" />
                            {completedEvent.donorName}
                        </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Blood Group" span={1}>
                        <Tag color="red">{completedEvent.bloodGroupName}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Component Type" span={1}>
                        <Tag color="blue">{completedEvent.componentTypeName}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Status" span={1}>
                        <Tag
                            color={
                                completedEvent.status === 'Completed'
                                    ? 'green'
                                    : completedEvent.status === 'HealthCheckFailed'
                                        ? 'orange'
                                        : 'red'
                            }
                        >
                            {completedEvent.status}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Location" span={1.5}>
                        <div className="flex items-center">
                            <EnvironmentOutlined className="mr-2" />
                            {completedEvent.locationName}
                        </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Date" span={1.5}>
                        <div className="flex items-center">
                            <CalendarOutlined className="mr-2" />
                            {dayjs(completedEvent.collectedAt).format('MMMM D, YYYY')}
                        </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Quantity" span={3}>
                        {completedEvent.quantityUnits} unit(s)
                    </Descriptions.Item>
                </Descriptions>

                <div className="mt-6 flex justify-center">
                    <Space>
                        <Button onClick={handleCancel}>
                            Return to Appointments
                        </Button>
                        <Button type="primary" onClick={() => router.push('/staff')}>
                            Go to Dashboard
                        </Button>
                    </Space>
                </div>
            </Card>
        );
    };

    // Render main content
    const renderContent = () => {
        if (loading || staffLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" tip="Loading..." />
                </div>
            );
        }

        if (error) {
            return (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={handleCancel}>
                            Go Back
                        </Button>
                    }
                />
            );
        }

        if (!appointmentId) {
            return (
                <Empty
                    description="No appointment ID provided"
                    className="my-12"
                >
                    <Button type="primary" onClick={handleCancel}>
                        Go to Appointments
                    </Button>
                </Empty>
            );
        }

        if (workflowCompleted) {
            return renderCompletionSummary();
        }

        return (
            <>
                <div className="mb-4">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={handleCancel}
                    >
                        Back to Appointments
                    </Button>
                </div>

                <DonationWorkflow
                    appointmentId={appointmentId}
                    onFinish={handleWorkflowFinish}
                    onCancel={handleCancel}
                />
            </>
        );
    };

    // Initialize component
    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <StaffLayout
            title="Donation Workflow"
            breadcrumbItems={[
                { title: 'Appointments', href: '/staff/appointments' },
                { title: 'Donation Workflow' }
            ]}
        >
            <div className="px-4 py-6">
                {renderContent()}
            </div>
        </StaffLayout>
    );
} 