'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Statistic, Button, List, Tag, Badge, Progress, Spin, Empty, Alert, Tabs, Table, notification, message } from 'antd';
import {
    HeartOutlined,
    CalendarOutlined,
    TeamOutlined,
    MedicineBoxOutlined,
    EnvironmentOutlined,
    BellOutlined,
    ClockCircleOutlined,
    AlertOutlined,
    CheckCircleOutlined,
    FireOutlined,
    WarningOutlined,
    BarChartOutlined,
    LineChartOutlined,
    DashboardOutlined,
    UserOutlined,
    PlusOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';
import { useStaffDashboard } from '@/hooks';
import { useEmergencyRequests } from '@/hooks/useEmergencyRequests';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Title as ChartTitle, PointElement, LineElement } from 'chart.js';
import StaffLayout from '@/components/Layout/StaffLayout';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '@/context/AuthContext';

// Register dayjs plugins
dayjs.extend(relativeTime);

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

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

export default function StaffDashboardPage() {
    const { dashboardData, loading, error, refetch } = useStaffDashboard();
    const { emergencyRequests, loading: loadingEmergency, error: errorEmergency, refetchEmergencyRequests } = useEmergencyRequests();
    const { isLoggedIn } = useAuth();
    const signalRConnection = useRef<signalR.HubConnection | null>(null);
    const [newEmergencyRequest, setNewEmergencyRequest] = useState<boolean>(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [emergencyAlert, setEmergencyAlert] = useState<{
        visible: boolean;
        patientName: string;
        units: number;
        bloodType: string;
    }>({
        visible: false,
        patientName: '',
        units: 0,
        bloodType: ''
    });

    // Initialize audio element for emergency alerts
    useEffect(() => {
        // Create audio element for emergency alert sound
        audioRef.current = new Audio('/assets/sounds/emergency-alert.mp3');
        audioRef.current.preload = 'auto';

        return () => {
            // Cleanup audio on unmount
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Function to play emergency alert sound
    const playEmergencyAlert = () => {
        if (audioRef.current) {
            // Reset audio to beginning if it's already playing
            audioRef.current.pause();
            audioRef.current.currentTime = 0;

            // Play the sound
            audioRef.current.play().catch(error => {
                console.error('Error playing emergency alert sound:', error);
            });
        }
    };

    // Function to handle refresh
    const handleRefresh = async () => {
        await refetchEmergencyRequests();
        setNewEmergencyRequest(false);
        setEmergencyAlert(prev => ({ ...prev, visible: false }));
    };

    // Initialize SignalR connection
    useEffect(() => {
        if (!isLoggedIn) return;

        const setupSignalR = async () => {
            try {
                // Get token from localStorage
                const token = localStorage.getItem('accessToken');

                if (!token) {
                    console.error("No authentication token found for SignalR connection");
                    return;
                }

                // Create SignalR connection
                const connection = new signalR.HubConnectionBuilder()
                    .withUrl("http://localhost:5222/notificationHub", {
                        accessTokenFactory: () => token,
                        skipNegotiation: false,
                        transport: signalR.HttpTransportType.WebSockets
                    })
                    .configureLogging(signalR.LogLevel.Information)
                    .withAutomaticReconnect()
                    .build();

                // Start connection
                await connection.start();
                console.log("SignalR connection established successfully in dashboard!");

                // Listen for new emergency requests
                connection.on("NewEmergencyRequest", (request) => {
                    console.log("New emergency request received in dashboard:", request);

                    // Set flag to show indicator
                    setNewEmergencyRequest(true);

                    // Play emergency alert sound
                    playEmergencyAlert();

                    // Update emergency alert state
                    setEmergencyAlert({
                        visible: true,
                        patientName: request.patientName || 'Test',
                        units: request.units || 2,
                        bloodType: request.bloodType || 'undefined',
                    });

                    // Automatically refresh only emergency requests
                    refetchEmergencyRequests();
                });

                // Listen for dashboard updates
                connection.on("UpdateEmergencyDashboard", () => {
                    console.log("Emergency dashboard update notification received");
                    setNewEmergencyRequest(true);

                    // Automatically refresh only emergency requests
                    refetchEmergencyRequests();
                });

                // Store connection reference
                signalRConnection.current = connection;
            } catch (err) {
                console.error("Error establishing SignalR connection:", err);
                message.error('Failed to connect to real-time notification service');
            }
        };

        setupSignalR();

        // Cleanup on unmount
        return () => {
            if (signalRConnection.current) {
                console.log("Stopping SignalR connection...");
                signalRConnection.current.stop()
                    .then(() => console.log("SignalR connection stopped"))
                    .catch(err => console.error("Error stopping SignalR connection:", err));
            }
        };
    }, [isLoggedIn]); // Remove refetch from dependencies

    if (loading) {
        return (
            <StaffLayout title="Dashboard" breadcrumbItems={[]}>
                <div className="flex justify-center items-center h-screen">
                    <Spin size="large" tip="Loading dashboard..." />
                </div>
            </StaffLayout>
        );
    }

    if (error) {
        return (
            <StaffLayout title="Dashboard" breadcrumbItems={[]}>
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    className="m-8"
                />
            </StaffLayout>
        );
    }

    if (!dashboardData) {
        return (
            <StaffLayout title="Dashboard" breadcrumbItems={[]}>
                <Empty
                    description="No dashboard data available"
                    className="m-8"
                />
            </StaffLayout>
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

    // Prepare data for blood inventory chart
    const prepareInventoryData = () => {
        const bloodGroups = Array.from(new Set(dashboardData.inventorySummary.map(item => item.bloodGroupName)));
        const componentTypes = Array.from(new Set(dashboardData.inventorySummary.map(item => item.componentTypeName)));

        const datasets = componentTypes.map((componentType, index) => {
            const data = bloodGroups.map(bloodGroup => {
                const inventoryItem = dashboardData.inventorySummary.find(
                    item => item.bloodGroupName === bloodGroup && item.componentTypeName === componentType
                );
                return inventoryItem ? inventoryItem.availabilityPercentage : 0;
            });

            const colors = [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
            ];

            return {
                label: componentType,
                data,
                backgroundColor: colors[index % colors.length],
                borderColor: colors[index % colors.length].replace('0.7', '1'),
                borderWidth: 1,
            };
        });

        return {
            labels: bloodGroups,
            datasets,
        };
    };

    // Prepare data for donation trends chart
    const prepareTrendData = () => {
        const labels = Object.keys(dashboardData.trends.donationTrend);

        return {
            labels,
            datasets: [
                {
                    label: 'Donations',
                    data: labels.map(key => dashboardData.trends.donationTrend[key]),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    tension: 0.1,
                },
                {
                    label: 'Requests',
                    data: labels.map(key => dashboardData.trends.requestTrend[key]),
                    borderColor: 'rgb(53, 162, 235)',
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    tension: 0.1,
                },
                {
                    label: 'Emergency Requests',
                    data: labels.map(key => dashboardData.trends.emergencyTrend[key]),
                    borderColor: 'rgb(255, 159, 64)',
                    backgroundColor: 'rgba(255, 159, 64, 0.5)',
                    tension: 0.1,
                }
            ]
        };
    };

    // Prepare data for request status chart
    const prepareRequestStatusData = () => {
        const labels = Object.keys(dashboardData.requestStatusCounts);
        const data = labels.map(key => dashboardData.requestStatusCounts[key]);

        const backgroundColors = [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
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

    return (
        <StaffLayout title="Dashboard" breadcrumbItems={[]}>
            {/* Emergency Alert */}
            {emergencyAlert.visible && (
                <Alert
                    message={<span className="text-lg font-bold">New Emergency Blood Request</span>}
                    description={`Patient ${emergencyAlert.patientName} needs ${emergencyAlert.units} units of ${emergencyAlert.bloodType} blood urgently!`}
                    type="error"
                    showIcon
                    closable
                    className="mb-6"
                    onClose={() => setEmergencyAlert(prev => ({ ...prev, visible: false }))}
                    action={
                        <Button size="small" danger onClick={() => {
                            setEmergencyAlert(prev => ({ ...prev, visible: false }));
                            handleRefresh();
                        }}>
                            View Requests
                        </Button>
                    }
                />
            )}

            {/* Today's Overview */}
            <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24}>
                    <div className="bg-gradient-to-r from-red-500 to-red-700 rounded-lg p-6 shadow-lg">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                                <Title level={2} className="text-white m-0">Today's Overview</Title>
                                <Paragraph className="text-white opacity-90 mb-0">
                                    {dayjs().format('dddd, MMMM D, YYYY')}
                                </Paragraph>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Stats Cards */}
            <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24} sm={12} md={6}>
                    <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-lg">Donations Today</span>}
                            value={dashboardData.todayActivity.donationsToday}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<HeartOutlined />}
                        />
                        <div className="mt-2 text-gray-500">
                            <span>Total volume: </span>
                            <span className="font-semibold">{dashboardData.todayActivity.totalVolumeCollectedToday} mL</span>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-lg">New Requests</span>}
                            value={dashboardData.todayActivity.newRequestsToday}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<AlertOutlined />}
                        />
                        <div className="mt-2 text-gray-500">
                            <span>Emergency: </span>
                            <span className="font-semibold text-red-500">{dashboardData.todayActivity.emergencyRequestsToday}</span>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-lg">Fulfilled Requests</span>}
                            value={dashboardData.todayActivity.fulfilledRequestsToday}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<CheckCircleOutlined />}
                        />
                        <div className="mt-2 text-gray-500">
                            <span>Success rate: </span>
                            <span className="font-semibold">
                                {dashboardData.todayActivity.newRequestsToday > 0
                                    ? Math.round((dashboardData.todayActivity.fulfilledRequestsToday / dashboardData.todayActivity.newRequestsToday) * 100)
                                    : 0}%
                            </span>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-lg">New Donors</span>}
                            value={dashboardData.todayActivity.newDonorsToday}
                            valueStyle={{ color: '#722ed1' }}
                            prefix={<UserOutlined />}
                        />
                        <div className="mt-2 text-gray-500">
                            <span>Total donors: </span>
                            <span className="font-semibold">
                                {dashboardData.availableEmergencyDonors ? dashboardData.availableEmergencyDonors.length : 0}
                            </span>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Critical Inventory and Emergency Requests */}
            <Row gutter={[16, 16]} className="mb-8">
                {/* Emergency Requests */}
                <Col xs={24}>
                    <Card
                        title={
                            <div className="flex items-center justify-between">
                                <span className="font-bold flex items-center">
                                    <AlertOutlined className="mr-2 text-red-500" />
                                    Emergency Blood Requests
                                    {newEmergencyRequest && <Badge status="error" className="ml-2" />}
                                </span>
                                <Button
                                    type="primary"
                                    onClick={handleRefresh}
                                >
                                    Refresh
                                </Button>
                            </div>
                        }
                    >
                        {loadingEmergency ? (
                            <div className="flex justify-center items-center py-8">
                                <Spin tip="Loading emergency requests..." />
                            </div>
                        ) : errorEmergency ? (
                            <Alert
                                message="Error"
                                description={errorEmergency}
                                type="error"
                                showIcon
                            />
                        ) : emergencyRequests && emergencyRequests.length > 0 ? (
                            <List
                                dataSource={[...emergencyRequests].sort((a, b) =>
                                    new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
                                )}
                                renderItem={item => (
                                    <List.Item
                                        actions={[
                                            // <Link key="view" href={`/staff/blood-request/${item.id}`}>
                                            //     <Button type="link">View</Button>
                                            // </Link>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={
                                                <div className="flex items-center">
                                                    <Tag color="red" className="mr-2">{item.bloodGroupName}</Tag>
                                                    <Text strong>{item.patientName}</Text>
                                                    <Tag color={getUrgencyColor(item.urgencyLevel)} className="ml-2">{item.urgencyLevel}</Tag>
                                                </div>
                                            }
                                            description={
                                                <div>
                                                    <div className="flex items-center text-gray-500">
                                                        <EnvironmentOutlined className="mr-1" /> {item.hospitalName}
                                                    </div>
                                                    <div className="flex items-center mt-1">
                                                        <MedicineBoxOutlined className="mr-1" /> {item.componentTypeName} ({item.quantityUnits} units)
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">{dayjs(item.requestDate).fromNow()}</div>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="No emergency requests" />
                        )}
                        <div className="mt-4 text-center">
                            <Link href="/staff/blood-request">
                                <Button type="primary" danger>View All Requests</Button>
                            </Link>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Inventory Summary */}
            <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24}>
                    <Card
                        title={<span className="font-bold flex items-center"><BarChartOutlined className="mr-2" /> Blood Inventory Summary</span>}
                        className="h-full"
                    >
                        <div style={{ height: '350px' }}>
                            <Bar
                                data={prepareInventoryData()}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            title: {
                                                display: true,
                                                text: 'Availability (%)'
                                            },
                                            max: 100
                                        },
                                        x: {
                                            title: {
                                                display: true,
                                                text: 'Blood Groups'
                                            }
                                        }
                                    },
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                        },
                                        title: {
                                            display: true,
                                            text: 'Blood Inventory by Component Type'
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {dashboardData.inventorySummary.slice(0, 3).map((item, index) => (
                                <Card key={index} size="small" className="bg-gray-50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <Tag color="blue">{item.bloodGroupName}</Tag>
                                            <Text strong>{item.componentTypeName}</Text>
                                        </div>
                                        <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
                                    </div>
                                    <div className="mt-2">
                                        <Progress
                                            percent={item.availabilityPercentage}
                                            status={
                                                item.availabilityPercentage < 30 ? "exception" :
                                                    item.availabilityPercentage < 60 ? "normal" : "success"
                                            }
                                        />
                                        <div className="flex justify-between text-xs">
                                            <Text>Available: {item.availableQuantity} units</Text>
                                            <Text>Optimal: {item.optimalQuantity} units</Text>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                        <div className="mt-4 text-center">
                            <Link href="/staff/inventory">
                                <Button>View Complete Inventory</Button>
                            </Link>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Upcoming Appointments and Recent Donations */}
            <Row gutter={[16, 16]} className="mb-8">
                {/* Upcoming Appointments */}
                <Col xs={24} lg={12}>
                    <Card
                        title={<span className="font-bold flex items-center"><CalendarOutlined className="mr-2" /> Upcoming Appointments</span>}
                        className="h-full"
                    >
                        {dashboardData.upcomingAppointments && dashboardData.upcomingAppointments.length > 0 ? (
                            <List
                                dataSource={dashboardData.upcomingAppointments.slice(0, 5)}
                                renderItem={item => (
                                    <List.Item
                                        actions={[
                                            <Link key="view" href={`/staff/appointments/${item.id}`}>
                                                <Button type="link">View</Button>
                                            </Link>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={
                                                <div className="flex items-center">
                                                    <Text strong>{item.donorName}</Text>
                                                    <Tag color="blue" className="ml-2">{item.bloodGroupName}</Tag>
                                                    {item.isUrgent && <Tag color="red" className="ml-1">Urgent</Tag>}
                                                </div>
                                            }
                                            description={
                                                <div>
                                                    <div className="flex items-center">
                                                        <CalendarOutlined className="mr-1" />
                                                        {dayjs(item.confirmedDate || item.preferredDate).format('MMM D, YYYY')} at {item.confirmedTimeSlot || item.preferredTimeSlot}
                                                    </div>
                                                    <div className="flex items-center mt-1">
                                                        <EnvironmentOutlined className="mr-1" />
                                                        {item.confirmedLocationName || item.locationName}
                                                    </div>
                                                    <div className="flex items-center mt-1">
                                                        <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="No upcoming appointments" />
                        )}
                        <div className="mt-4 text-center">
                            <Link href="/staff/appointments">
                                <Button>View All Appointments</Button>
                            </Link>
                        </div>
                    </Card>
                </Col>

                {/* Recent Donations */}
                <Col xs={24} lg={12}>
                    <Card
                        title={<span className="font-bold flex items-center"><HeartOutlined className="mr-2" /> Recent Donations</span>}
                        className="h-full"
                    >
                        {dashboardData.recentDonations && dashboardData.recentDonations.length > 0 ? (
                            <List
                                dataSource={dashboardData.recentDonations.slice(0, 5)}
                                renderItem={item => (
                                    <List.Item
                                        actions={[
                                            <Link key="view" href={`/staff/donation-workflow/${item.id}`}>
                                                <Button type="link">Details</Button>
                                            </Link>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={
                                                <div className="flex items-center">
                                                    <Text strong>{item.donorName}</Text>
                                                    <Tag color="blue" className="ml-2">{item.bloodGroupName}</Tag>
                                                </div>
                                            }
                                            description={
                                                <div>
                                                    <div className="flex items-center">
                                                        <CalendarOutlined className="mr-1" />
                                                        {dayjs(item.donationDate).format('MMM D, YYYY')}
                                                    </div>
                                                    <div className="flex items-center mt-1">
                                                        <MedicineBoxOutlined className="mr-1" />
                                                        {item.componentTypeName} ({item.quantityDonated} mL)
                                                    </div>
                                                    <div className="flex items-center mt-1">
                                                        <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="No recent donations" />
                        )}
                        <div className="mt-4 text-center">
                            <Link href="/staff/donation-workflow">
                                <Button>View All Donations</Button>
                            </Link>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Trends and Statistics */}
            <Row gutter={[16, 16]} className="mb-8">
                {/* Donation and Request Trends */}
                <Col xs={24} lg={16}>
                    <Card
                        title={<span className="font-bold flex items-center"><LineChartOutlined className="mr-2" /> Donation & Request Trends</span>}
                        className="h-full"
                    >
                        <div style={{ height: '350px' }}>
                            <Line
                                data={prepareTrendData()}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            title: {
                                                display: true,
                                                text: 'Count'
                                            }
                                        },
                                        x: {
                                            title: {
                                                display: true,
                                                text: 'Date'
                                            }
                                        }
                                    },
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                        }
                                    }
                                }}
                            />
                        </div>
                    </Card>
                </Col>

                {/* Request Status Distribution */}
                <Col xs={24} lg={8}>
                    <Card
                        title={<span className="font-bold flex items-center"><DashboardOutlined className="mr-2" /> Request Status</span>}
                        className="h-full"
                    >
                        <div style={{ height: '350px' }} className="flex items-center justify-center">
                            <Doughnut
                                data={prepareRequestStatusData()}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'right',
                                        }
                                    }
                                }}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Expiring Inventory and Available Emergency Donors */}
            <Row gutter={[16, 16]} className="mb-8">
                {/* Expiring Inventory */}
                <Col xs={24} lg={12}>
                    <Card
                        title={<span className="font-bold flex items-center"><ClockCircleOutlined className="mr-2 text-orange-500" /> Expiring Inventory</span>}
                        className="h-full"
                    >
                        {dashboardData.expiringInventory && dashboardData.expiringInventory.length > 0 ? (
                            <Table
                                dataSource={dashboardData.expiringInventory}
                                rowKey="id"
                                pagination={false}
                                size="small"
                                columns={[
                                    {
                                        title: 'Blood Type',
                                        dataIndex: 'bloodGroupName',
                                        key: 'bloodGroupName',
                                        render: (text) => <Tag color="blue">{text}</Tag>
                                    },
                                    {
                                        title: 'Component',
                                        dataIndex: 'componentTypeName',
                                        key: 'componentTypeName',
                                    },
                                    {
                                        title: 'Units',
                                        dataIndex: 'quantityUnits',
                                        key: 'quantityUnits',
                                    },
                                    {
                                        title: 'Expires',
                                        dataIndex: 'expirationDate',
                                        key: 'expirationDate',
                                        render: (date) => (
                                            <span className={dayjs(date).diff(dayjs(), 'day') <= 3 ? 'text-red-500' : ''}>
                                                {dayjs(date).format('MMM D, YYYY')}
                                            </span>
                                        )
                                    },
                                    {
                                        title: 'Status',
                                        dataIndex: 'status',
                                        key: 'status',
                                        render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>
                                    }
                                ]}
                            />
                        ) : (
                            <Empty description="No expiring inventory" />
                        )}
                        <div className="mt-4 text-center">
                            <Link href="/staff/inventory">
                                <Button>View All Inventory</Button>
                            </Link>
                        </div>
                    </Card>
                </Col>

                {/* Available Emergency Donors */}
                <Col xs={24} lg={12}>
                    <Card
                        title={<span className="font-bold flex items-center"><TeamOutlined className="mr-2 text-red-500" /> Available Emergency Donors</span>}
                        className="h-full"
                    >
                        {dashboardData.availableEmergencyDonors && dashboardData.availableEmergencyDonors.length > 0 ? (
                            <List
                                dataSource={dashboardData.availableEmergencyDonors.slice(0, 5)}
                                renderItem={item => (
                                    <List.Item
                                        actions={[
                                            // <Link key="contact" href={`/staff/donors/${item.id}`}>
                                            //     <Button type="link">Contact</Button>
                                            // </Link>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={
                                                <div className="flex items-center">
                                                    <Text strong>{item.firstName} {item.lastName}</Text>
                                                    <Tag color="red" className="ml-2">{item.bloodGroupName}</Tag>
                                                </div>
                                            }
                                            description={
                                                <div>
                                                    <div className="flex items-center">
                                                        <UserOutlined className="mr-1" />
                                                        {item.phoneNumber} | {item.email}
                                                    </div>
                                                    <div className="flex items-center mt-1">
                                                        <EnvironmentOutlined className="mr-1" />
                                                        {item.address} {item.distanceKm !== null && item.distanceKm !== undefined ? `(${item.distanceKm.toFixed(1)} km)` : ''}
                                                    </div>
                                                    <div className="flex items-center mt-1">
                                                        <Text type="secondary">Last donation: {item.lastDonationDate ? dayjs(item.lastDonationDate).format('MMM D, YYYY') : 'Never'}</Text>
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="No emergency donors available" />
                        )}
                        <div className="mt-4 text-center">
                            <Link href="/staff/donors">
                                <Button>View All Donors</Button>
                            </Link>
                        </div>
                    </Card>
                </Col>
            </Row>
        </StaffLayout>
    );
} 