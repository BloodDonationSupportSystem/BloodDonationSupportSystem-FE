'use client';

import React from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Button, Spin, Alert, Empty, Tag, Progress, Tabs } from 'antd';
import {
    UserOutlined,
    HeartOutlined,
    CalendarOutlined,
    TeamOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    BarChartOutlined,
    LineChartOutlined,
    DashboardOutlined
} from '@ant-design/icons';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useAdminDashboard } from '@/hooks';
import Link from 'next/link';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Title as ChartTitle, PointElement, LineElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(
    ArcElement,
    ChartTooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    ChartTitle,
    PointElement,
    LineElement
);

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function AdminDashboardPage() {
    const { dashboardData, loading, error } = useAdminDashboard();

    if (loading) {
        return (
            <AdminLayout title="Dashboard" breadcrumbItems={[]}>
                <div className="flex justify-center items-center h-screen">
                    <Spin size="large" tip="Loading dashboard..." />
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout title="Dashboard" breadcrumbItems={[]}>
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    className="m-8"
                />
            </AdminLayout>
        );
    }

    if (!dashboardData) {
        return (
            <AdminLayout title="Dashboard" breadcrumbItems={[]}>
                <Empty
                    description="No dashboard data available"
                    className="m-8"
                />
            </AdminLayout>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'critical':
            case 'urgent':
            case 'low':
                return '#f5222d';
            case 'warning':
            case 'medium':
            case 'pending':
                return '#fa8c16';
            case 'normal':
            case 'optimal':
            case 'completed':
            case 'confirmed':
                return '#52c41a';
            default:
                return '#1890ff';
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency.toLowerCase()) {
            case 'high':
                return 'red';
            case 'medium':
                return 'orange';
            case 'low':
                return 'green';
            default:
                return 'blue';
        }
    };

    // Prepare data for user roles chart
    const prepareUserRolesData = () => {
        const labels = Object.keys(dashboardData.userStats.usersByRole);
        const data = labels.map(key => dashboardData.userStats.usersByRole[key]);

        const backgroundColors = [
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
        ];

        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: backgroundColors.slice(0, labels.length),
                    borderColor: backgroundColors.map(color => color.replace('0.7', '1')).slice(0, labels.length),
                    borderWidth: 1,
                }
            ]
        };
    };

    // Prepare inventory data
    const prepareInventoryData = () => {
        const labels = dashboardData.inventoryStats.currentInventory.map(
            item => `${item.bloodGroupName} (${item.componentTypeName})`
        );
        const availableData = dashboardData.inventoryStats.currentInventory.map(
            item => item.availableQuantity
        );
        const recommendedData = dashboardData.inventoryStats.currentInventory.map(
            item => item.minimumRecommended
        );
        const optimalData = dashboardData.inventoryStats.currentInventory.map(
            item => item.optimalQuantity
        );

        return {
            labels,
            datasets: [
                {
                    label: 'Available',
                    data: availableData,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Minimum Recommended',
                    data: recommendedData,
                    backgroundColor: 'rgba(255, 206, 86, 0.7)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Optimal',
                    data: optimalData,
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                }
            ]
        };
    };

    // Prepare performance metrics data
    const preparePerformanceData = () => {
        const metrics = dashboardData.performanceMetrics;
        const labels = [
            'Avg Request Response (min)',
            'Avg Emergency Response (min)',
            'Donor Recruitment Rate (%)',
            'Donor Retention Rate (%)',
            'Inventory Turnover Rate',
            'Waste Reduction Rate (%)',
            'Avg Appointment Wait (min)'
        ];
        const data = [
            metrics.averageRequestResponseTime,
            metrics.averageEmergencyResponseTime,
            metrics.donorRecruitmentRate,
            metrics.donorRetentionRate,
            metrics.inventoryTurnoverRate,
            metrics.wasteReductionRate,
            metrics.averageAppointmentWaitTime
        ];

        return {
            labels,
            datasets: [
                {
                    label: 'Performance Metrics',
                    data,
                    backgroundColor: 'rgba(153, 102, 255, 0.7)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1,
                }
            ]
        };
    };

    return (
        <AdminLayout title="Admin Dashboard" breadcrumbItems={[]}>
            {/* Key Stats */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Users"
                            value={dashboardData.systemStats.totalUsers}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Donors"
                            value={dashboardData.systemStats.totalDonors}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Donations"
                            value={dashboardData.systemStats.totalDonations}
                            prefix={<HeartOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Blood Requests"
                            value={dashboardData.systemStats.totalBloodRequests}
                            prefix={<FileTextOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Second row stats */}
            <Row gutter={[16, 16]} className="mt-4">
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Volume Collected (ml)"
                            value={dashboardData.systemStats.totalVolumeCollected}
                            precision={0}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Lives Saved"
                            value={dashboardData.systemStats.totalLivesSaved}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Request Fulfillment Rate"
                            value={dashboardData.systemStats.requestFulfillmentRate}
                            suffix="%"
                            precision={1}
                        />
                        <Progress
                            percent={dashboardData.systemStats.requestFulfillmentRate}
                            status={dashboardData.systemStats.requestFulfillmentRate > 90 ? "success" : "active"}
                            strokeColor={dashboardData.systemStats.requestFulfillmentRate > 90 ? "#52c41a" :
                                dashboardData.systemStats.requestFulfillmentRate > 70 ? "#1890ff" : "#fa8c16"}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Avg Response Time (min)"
                            value={dashboardData.systemStats.averageResponseTime}
                            precision={1}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts and tables */}
            <Row gutter={[16, 16]} className="mt-4">
                <Col xs={24} md={12}>
                    <Card title="User Distribution by Role" className="h-full">
                        <div style={{ height: '300px' }}>
                            <Doughnut
                                data={prepareUserRolesData()}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'right',
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="mt-4">
                            <Text type="secondary">
                                New users in last 30 days: <strong>{dashboardData.userStats.newUsersLast30Days}</strong>
                            </Text>
                            <br />
                            <Text type="secondary">
                                Active users in last 30 days: <strong>{dashboardData.userStats.activeUsersLast30Days}</strong>
                            </Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="Blood Inventory Status" className="h-full">
                        <div style={{ height: '300px' }}>
                            <Bar
                                data={prepareInventoryData()}
                                options={{
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="mt-4">
                            <Text type="secondary">
                                Items expiring in 7 days: <strong>{dashboardData.inventoryStats.expiringItems7Days}</strong>
                            </Text>
                            <br />
                            <Text type="secondary">
                                Items expiring in 30 days: <strong>{dashboardData.inventoryStats.expiringItems30Days}</strong>
                            </Text>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} className="mt-4">
                <Col xs={24} md={12}>
                    <Card title="Performance Metrics" className="h-full">
                        <div style={{ height: '300px' }}>
                            <Bar
                                data={preparePerformanceData()}
                                options={{
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    }
                                }}
                            />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="Donation Statistics" className="h-full">
                        <div className="p-4">
                            <Title level={5}>Period: {dashboardData.donationStats.timePeriod}</Title>
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Statistic
                                        title="Total Donations"
                                        value={dashboardData.donationStats.totalDonations}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="Volume Collected (ml)"
                                        value={dashboardData.donationStats.totalVolumeCollected}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="First Time Donors"
                                        value={dashboardData.donationStats.firstTimeDonors}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="Repeat Donors"
                                        value={dashboardData.donationStats.repeatDonors}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Emergency Requests */}
            {dashboardData.activeEmergencyRequests.length > 0 && (
                <Card title="Active Emergency Requests" className="mt-4">
                    <Table
                        dataSource={dashboardData.activeEmergencyRequests}
                        rowKey="id"
                        pagination={false}
                        columns={[
                            {
                                title: 'Patient',
                                dataIndex: 'patientName',
                                key: 'patientName',
                            },
                            {
                                title: 'Blood Type',
                                dataIndex: 'bloodGroupName',
                                key: 'bloodGroupName',
                                render: (text, record) => `${text} (${record.componentTypeName})`
                            },
                            {
                                title: 'Units',
                                dataIndex: 'quantityUnits',
                                key: 'quantityUnits',
                            },
                            {
                                title: 'Hospital',
                                dataIndex: 'hospitalName',
                                key: 'hospitalName',
                            },
                            {
                                title: 'Urgency',
                                dataIndex: 'urgencyLevel',
                                key: 'urgencyLevel',
                                render: (text) => (
                                    <Tag color={getUrgencyColor(text)}>{text}</Tag>
                                )
                            },
                            {
                                title: 'Status',
                                dataIndex: 'status',
                                key: 'status',
                                render: (text) => (
                                    <Tag color={getStatusColor(text)}>{text}</Tag>
                                )
                            },
                            {
                                title: 'Request Date',
                                dataIndex: 'requestDate',
                                key: 'requestDate',
                                render: (text) => new Date(text).toLocaleDateString()
                            },
                            // {
                            //     title: 'Actions',
                            //     key: 'actions',
                            //     render: (_, record) => (
                            //         <Link href={`/admin/blood-requests/${record.id}`}>
                            //             <Button type="link" size="small">View Details</Button>
                            //         </Link>
                            //     )
                            // }
                        ]}
                    />
                </Card>
            )}
        </AdminLayout>
    );
} 