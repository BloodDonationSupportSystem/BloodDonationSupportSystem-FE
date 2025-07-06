import { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '@/context/AuthContext';
import { message, notification } from 'antd';

interface EmergencyRequest {
    id?: string;
    patientName?: string;
    bloodType?: string;
    bloodGroupName?: string;
    units?: number;
    quantityUnits?: number;
    urgencyLevel?: string;
    hospitalName?: string;
}

interface UseStaffNotificationsResult {
    newEmergencyRequest: boolean;
    setNewEmergencyRequest: React.Dispatch<React.SetStateAction<boolean>>;
    emergencyAlert: {
        visible: boolean;
        patientName: string;
        units: number;
        bloodType: string;
    };
    setEmergencyAlert: React.Dispatch<React.SetStateAction<{
        visible: boolean;
        patientName: string;
        units: number;
        bloodType: string;
    }>>;
    playEmergencyAlert: () => void;
    notificationCount: number;
    resetNotificationCount: () => void;
}

/**
 * Hook for handling staff notifications across all staff pages
 * Manages SignalR connection and emergency alerts
 */
export function useStaffNotifications(): UseStaffNotificationsResult {
    const { isLoggedIn } = useAuth();
    const signalRConnection = useRef<signalR.HubConnection | null>(null);
    const [newEmergencyRequest, setNewEmergencyRequest] = useState<boolean>(false);
    const [notificationCount, setNotificationCount] = useState<number>(0);
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
                console.log("Staff notifications SignalR connection established successfully!");

                // Listen for new emergency requests
                connection.on("NewEmergencyRequest", (request: EmergencyRequest) => {
                    console.log("New emergency request received in staff notifications:", request);

                    // Set flag to show indicator
                    setNewEmergencyRequest(true);

                    // Increase notification count
                    setNotificationCount(prev => prev + 1);

                    // Play emergency alert sound
                    playEmergencyAlert();

                    // Update emergency alert state
                    setEmergencyAlert({
                        visible: true,
                        patientName: request.patientName || 'Unknown',
                        units: request.quantityUnits || request.units || 0,
                        bloodType: request.bloodGroupName || request.bloodType || 'Unknown',
                    });

                    // Show notification
                    // notification.error({
                    //     message: 'New Emergency Blood Request',
                    //     description: `Patient ${request.patientName || 'Unknown'} needs ${request.quantityUnits || request.units || 0} units of ${request.bloodGroupName || request.bloodType || 'Unknown'} blood urgently!`,
                    //     placement: 'topRight',
                    //     duration: 0, // Keep it visible until manually closed
                    // });
                });

                // Listen for dashboard updates
                connection.on("UpdateEmergencyDashboard", () => {
                    console.log("Emergency dashboard update notification received");
                    setNewEmergencyRequest(true);
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
    }, [isLoggedIn]);

    const resetNotificationCount = () => {
        setNotificationCount(0);
    };

    return {
        newEmergencyRequest,
        setNewEmergencyRequest,
        emergencyAlert,
        setEmergencyAlert,
        playEmergencyAlert,
        notificationCount,
        resetNotificationCount
    };
}

export default useStaffNotifications; 