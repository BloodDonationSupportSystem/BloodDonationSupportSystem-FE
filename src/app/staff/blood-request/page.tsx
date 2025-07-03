'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Typography, Tabs, Spin, Empty, Alert, message, notification, Select } from 'antd';
import { useBloodRequests } from '@/hooks/api/useBloodRequests';
import EmergencyRequestList from '../../../components/Staff/BloodRequest/EmergencyRequestList';
import RegularRequestList from '../../../components/Staff/BloodRequest/RegularRequestList';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '@/context/AuthContext';
import { useLocations } from '@/hooks/api/useLocations';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

export default function BloodRequestPage() {
    const [activeTab, setActiveTab] = useState('emergency');
    const { user, isLoggedIn } = useAuth();
    const signalRConnection = useRef<signalR.HubConnection | null>(null);
    const [newEmergencyRequest, setNewEmergencyRequest] = useState<boolean>(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

    // Get locations for filtering
    const {
        locations,
        isLoading: loadingLocations
    } = useLocations();

    // Get user's assigned location from profile if available
    useEffect(() => {
        if (user) {
            // Check if user has a location property (added by the backend)
            const userWithLocation = user as any; // Type assertion for potential extended user properties
            if (userWithLocation && userWithLocation.locationId) {
                setSelectedLocationId(userWithLocation.locationId);
                console.log("Staff location set from user profile:", userWithLocation.locationId);
            }
        }
    }, [user]);

    // Fetch emergency blood requests with location filter
    const {
        bloodRequests: emergencyRequests,
        loading: emergencyLoading,
        error: emergencyError,
        pagination: emergencyPagination,
        fetchBloodRequests: fetchEmergencyRequests,
    } = useBloodRequests({
        isEmergency: true,
        isActive: true,
        locationId: selectedLocationId || undefined
    });

    // Fetch regular blood requests with location filter
    const {
        bloodRequests: regularRequests,
        loading: regularLoading,
        error: regularError,
        pagination: regularPagination,
        fetchBloodRequests: fetchRegularRequests,
    } = useBloodRequests({
        isEmergency: false,
        locationId: selectedLocationId || undefined
    });

    // Initialize audio element
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
                console.log("SignalR connection established successfully!");

                // Listen for new emergency requests
                connection.on("NewEmergencyRequest", (request) => {
                    console.log("New emergency request received:", request);

                    // Only process notifications for the selected location or all locations
                    if (!selectedLocationId || request.locationId === selectedLocationId) {
                        setNewEmergencyRequest(true);

                        // Play emergency alert sound
                        playEmergencyAlert();

                        // Close any existing emergency notifications first
                        notification.destroy('emergencyNotification');

                        // Show notification with a consistent key
                        // notification.error({
                        //     message: 'New Emergency Blood Request',
                        //     description: `Patient ${request.patientName} needs ${request.quantityUnits} units of ${request.bloodGroupName} blood urgently!`,
                        //     duration: 0, // Don't auto-dismiss
                        //     placement: 'topRight',
                        //     key: 'emergencyNotification', // Use a consistent key to prevent multiple notifications
                        //     onClick: () => {
                        //         setActiveTab('emergency');
                        //         fetchEmergencyRequests();
                        //         notification.destroy('emergencyNotification');
                        //     }
                        // });

                        // If already on emergency tab, refresh the data
                        if (activeTab === 'emergency') {
                            fetchEmergencyRequests();
                        }
                    }
                });

                // Listen for dashboard updates
                connection.on("UpdateEmergencyDashboard", () => {
                    console.log("Emergency dashboard update notification received");

                    // If on emergency tab, refresh the data
                    if (activeTab === 'emergency') {
                        fetchEmergencyRequests();
                    } else {
                        setNewEmergencyRequest(true);

                        // Only show a message if there's no active emergency notification
                        if (!document.querySelector('.ant-notification-notice')) {
                            message.info('Emergency requests have been updated');
                        }
                    }
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
            // Also destroy any lingering notifications
            notification.destroy('emergencyNotification');
        };
    }, [isLoggedIn, selectedLocationId]);

    // Handle tab change
    const handleTabChange = (key: string) => {
        setActiveTab(key);

        // If switching to emergency tab and there are new notifications, refresh and clear notification state
        if (key === 'emergency' && newEmergencyRequest) {
            fetchEmergencyRequests();
            setNewEmergencyRequest(false);
        }
    };

    // Handle location change
    const handleLocationChange = (locationId: string | null) => {
        setSelectedLocationId(locationId);

        // Refresh data with new location filter
        if (activeTab === 'emergency') {
            fetchEmergencyRequests({ locationId: locationId || undefined });
        } else {
            fetchRegularRequests({ locationId: locationId || undefined });
        }
    };

    // Refresh data
    const refreshData = () => {
        if (activeTab === 'emergency') {
            fetchEmergencyRequests();
            setNewEmergencyRequest(false);
        } else {
            fetchRegularRequests();
        }
    };

    // Render error state
    if (emergencyError && regularError) {
        return (
            <div className="p-6">
                <Alert
                    message="Error Loading Blood Requests"
                    description="There was an error loading the blood requests. Please try again later."
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <Title level={2} className="text-red-600 mb-4 md:mb-0">Blood Request Management</Title>

                <div className="w-full md:w-64">
                    {/* <Select
                        placeholder="Filter by location"
                        loading={loadingLocations}
                        value={selectedLocationId}
                        onChange={handleLocationChange}
                        style={{ width: '100%' }}
                        allowClear
                    >
                        {locations.map(location => (
                            <Option key={location.id} value={location.id}>
                                {location.name}
                            </Option>
                        ))}
                    </Select> */}
                    {selectedLocationId && (
                        <div className="text-xs text-gray-500 mt-1">
                            Showing requests for selected location only
                        </div>
                    )}
                </div>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                className="mb-6"
            >
                <TabPane
                    tab={
                        <span className="text-red-600 font-medium">
                            {newEmergencyRequest ? '🔴' : '🚨'} Emergency Requests
                            {emergencyRequests.length > 0 && (
                                <span className={`ml-2 ${newEmergencyRequest ? 'bg-red-500 text-white animate-pulse' : 'bg-red-100 text-red-800'} px-2 py-0.5 rounded-full text-xs`}>
                                    {emergencyRequests.length}
                                </span>
                            )}
                        </span>
                    }
                    key="emergency"
                >
                    {emergencyLoading ? (
                        <div className="flex justify-center py-12">
                            <Spin size="large" tip="Loading emergency requests..." />
                        </div>
                    ) : emergencyRequests.length === 0 ? (
                        <Empty
                            description={
                                selectedLocationId
                                    ? "No emergency blood requests found for this location"
                                    : "No emergency blood requests found"
                            }
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    ) : (
                        <EmergencyRequestList
                            requests={emergencyRequests}
                            pagination={emergencyPagination}
                            onRefresh={refreshData}
                            onPageChange={(page: number) => fetchEmergencyRequests({
                                pageNumber: page,
                                locationId: selectedLocationId || undefined
                            })}
                        />
                    )}
                </TabPane>

                <TabPane
                    tab={
                        <span className="font-medium">
                            📋 Regular Requests
                            {regularRequests.length > 0 && (
                                <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                                    {regularRequests.length}
                                </span>
                            )}
                        </span>
                    }
                    key="regular"
                >
                    {regularLoading ? (
                        <div className="flex justify-center py-12">
                            <Spin size="large" tip="Loading regular requests..." />
                        </div>
                    ) : regularRequests.length === 0 ? (
                        <Empty
                            description={
                                selectedLocationId
                                    ? "No regular blood requests found for this location"
                                    : "No regular blood requests found"
                            }
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    ) : (
                        <RegularRequestList
                            requests={regularRequests}
                            pagination={regularPagination}
                            onRefresh={refreshData}
                            onPageChange={(page: number) => fetchRegularRequests({
                                pageNumber: page,
                                locationId: selectedLocationId || undefined
                            })}
                        />
                    )}
                </TabPane>
            </Tabs>
        </div>
    );
} 