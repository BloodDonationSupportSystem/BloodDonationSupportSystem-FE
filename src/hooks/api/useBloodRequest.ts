import { useState } from 'react';
import { message } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Dayjs } from 'dayjs';
import { createBloodRequest, createEmergencyBloodRequest } from '@/services/api/bloodRequestService';
import { BloodRequest, EmergencyBloodRequest } from '@/services/api/bloodRequestService';

// Regular blood request form values
export interface BloodRequestFormValues {
    patientName: string;
    contactInfo: string;
    bloodGroupId: string;
    componentTypeId: string;
    quantityUnits: number;
    neededByDate: Dayjs;
    locationId: string;
    address: string;
    latitude?: string;
    longitude?: string;
    medicalNotes?: string;
}

// Emergency blood request form values
export interface EmergencyRequestFormValues {
    patientName: string;
    contactInfo: string;
    urgencyLevel: 'Critical' | 'High' | 'Medium';
    hospitalName: string;
    bloodGroupId: string;
    componentTypeId: string;
    quantityUnits: number;
    locationId: string;
    address: string;
    latitude?: string;
    longitude?: string;
    medicalNotes: string;
}

// Hook for regular blood requests
export function useRegularBloodRequest() {
    const { user, isLoggedIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const submitRequest = async (values: BloodRequestFormValues): Promise<boolean> => {
        if (!isLoggedIn) {
            message.error('Vui lòng đăng nhập để gửi yêu cầu máu');
            router.push('/login');
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('Regular blood request - Preparing API payload:', values);

            // Convert form values to the expected API request format
            const requestData = {
                quantityUnits: values.quantityUnits,
                status: "Pending",
                isEmergency: false,
                neededByDate: values.neededByDate ? values.neededByDate.toISOString() : new Date().toISOString(),
                requestedBy: user?.id || '',
                patientName: values.patientName || '',
                contactInfo: values.contactInfo || '',
                bloodGroupId: values.bloodGroupId,
                componentTypeId: values.componentTypeId,
                locationId: values.locationId,
                address: values.address || '',
                latitude: values.latitude || '',
                longitude: values.longitude || '',
                medicalNotes: values.medicalNotes || '',
                urgencyLevel: "Medium"
            };

            console.log('Regular blood request - Final API payload:', requestData);
            console.log('Urgency level in regular request:', requestData.urgencyLevel);

            const response = await createBloodRequest(requestData);
            console.log('Regular blood request - API response:', response);

            if (response.success) {
                message.success('Yêu cầu máu đã được gửi thành công');
                return true;
            } else {
                console.error('API error:', response);
                const errorMsg = response.error ?
                    (response.error instanceof Error ? response.error.message : 'Unknown error') :
                    'Không thể gửi yêu cầu máu';
                setError(errorMsg);
                message.error('Failed to submit blood request: ' + errorMsg);
                return false;
            }
        } catch (err) {
            console.error('Lỗi khi gửi yêu cầu máu:', err);
            setError('Không thể gửi yêu cầu máu. Vui lòng thử lại.');
            message.error('An error occurred while submitting the request.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, isLoggedIn, submitRequest };
}

// Hook for emergency blood requests
export function useEmergencyBloodRequest() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitRequest = async (values: EmergencyRequestFormValues): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            console.log('Emergency blood request - Preparing API payload:', values);
            console.log('Urgency level from form:', values.urgencyLevel);

            // Make sure urgency level is one of the expected values
            let urgencyLevel = values.urgencyLevel;
            if (!urgencyLevel) {
                console.warn('No urgency level provided, setting to Medium');
                urgencyLevel = 'Medium';
            } else if (urgencyLevel !== 'Critical' && urgencyLevel !== 'High' && urgencyLevel !== 'Medium') {
                console.warn('Invalid urgency level:', urgencyLevel, 'defaulting to Medium');
                urgencyLevel = 'Medium';
            }

            // Convert form values to the expected API request format
            const requestData = {
                quantityUnits: values.quantityUnits,
                status: "Pending",
                isEmergency: true,
                neededByDate: new Date().toISOString(),
                requestedBy: '',
                patientName: values.patientName,
                urgencyLevel: urgencyLevel, // Ensure urgency level is set
                contactInfo: values.contactInfo,
                hospitalName: values.hospitalName || '',
                bloodGroupId: values.bloodGroupId,
                componentTypeId: values.componentTypeId,
                locationId: values.locationId,
                address: values.address || '',
                latitude: values.latitude || '',
                longitude: values.longitude || '',
                medicalNotes: values.medicalNotes || ''
            };

            console.log('Emergency blood request - Final API payload:', requestData);
            console.log('Urgency level in final payload:', requestData.urgencyLevel);

            const response = await createEmergencyBloodRequest(requestData);
            console.log('Emergency blood request - API response:', response);

            if (response.success) {
                message.success('Yêu cầu máu khẩn cấp đã được gửi thành công');
                return true;
            } else {
                console.error('API error:', response);
                const errorMsg = response.error ?
                    (response.error instanceof Error ? response.error.message : 'Unknown error') :
                    'Không thể gửi yêu cầu máu khẩn cấp';
                setError(errorMsg);
                message.error('Failed to submit emergency request: ' + errorMsg);
                return false;
            }
        } catch (err) {
            console.error('Lỗi khi gửi yêu cầu máu khẩn cấp:', err);
            setError('Không thể gửi yêu cầu máu khẩn cấp. Vui lòng thử lại.');
            message.error('An error occurred while submitting the emergency request.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, submitRequest };
} 