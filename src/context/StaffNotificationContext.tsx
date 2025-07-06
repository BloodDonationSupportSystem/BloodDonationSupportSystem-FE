import React, { createContext, useContext, ReactNode } from 'react';
import { useStaffNotifications } from '@/hooks/useStaffNotifications';

// Định nghĩa kiểu dữ liệu cho context
interface StaffNotificationContextType {
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

// Tạo context
const StaffNotificationContext = createContext<StaffNotificationContextType | undefined>(undefined);

// Provider component
export function StaffNotificationProvider({ children }: { children: ReactNode }) {
    const notificationState = useStaffNotifications();

    return (
        <StaffNotificationContext.Provider value={notificationState}>
            {children}
        </StaffNotificationContext.Provider>
    );
}

// Hook để sử dụng context
export function useStaffNotificationContext() {
    const context = useContext(StaffNotificationContext);
    if (context === undefined) {
        throw new Error('useStaffNotificationContext must be used within a StaffNotificationProvider');
    }
    return context;
} 