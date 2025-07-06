import React from 'react';
import { Alert, Button } from 'antd';
import Link from 'next/link';
import { useStaffNotificationContext } from '@/context/StaffNotificationContext';
import { useEmergencyRequests } from '@/hooks/useEmergencyRequests';

/**
 * Component hiển thị thông báo khẩn cấp khi có yêu cầu máu khẩn cấp mới
 */
const EmergencyAlert: React.FC = () => {
    const { emergencyAlert, setEmergencyAlert, setNewEmergencyRequest, resetNotificationCount } = useStaffNotificationContext();
    const { refetchEmergencyRequests } = useEmergencyRequests();

    if (!emergencyAlert.visible) {
        return null;
    }

    const handleViewRequests = () => {
        // Cập nhật dữ liệu và ẩn thông báo
        refetchEmergencyRequests();
        setEmergencyAlert(prev => ({ ...prev, visible: false }));
        setNewEmergencyRequest(false);
        resetNotificationCount();
    };

    return (
        <Alert
            message={<span className="text-lg font-bold">New Emergency Blood Request</span>}
            description={`Patient ${emergencyAlert.patientName} needs ${emergencyAlert.units} units of ${emergencyAlert.bloodType} blood urgently!`}
            type="error"
            showIcon
            closable
            className="mb-6"
            onClose={() => setEmergencyAlert(prev => ({ ...prev, visible: false }))}
            action={
                <Link href="/staff/blood-request">
                    <Button size="small" danger onClick={handleViewRequests}>
                        View Requests
                    </Button>
                </Link>
            }
        />
    );
};

export default EmergencyAlert; 