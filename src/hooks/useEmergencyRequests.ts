import { useState, useEffect } from 'react';
import { getBloodRequests, BloodRequestDetail } from '@/services/api/bloodRequestService';

interface UseEmergencyRequestsResult {
    emergencyRequests: BloodRequestDetail[];
    loading: boolean;
    error: string | null;
    refetchEmergencyRequests: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing emergency requests data
 * @returns Emergency requests data, loading state, error state, and refetch function
 */
export function useEmergencyRequests(): UseEmergencyRequestsResult {
    const [emergencyRequests, setEmergencyRequests] = useState<BloodRequestDetail[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEmergencyRequests = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getBloodRequests({
                isEmergency: true,
                isActive: true,
                pageSize: 10 // Limit to 10 most recent emergency requests
            });

            if (response.success) {
                setEmergencyRequests(response.data || []);
            } else {
                setError(response.message || 'Failed to fetch emergency requests');
            }
        } catch (err) {
            console.error('Error fetching emergency requests:', err);
            setError('An error occurred while fetching emergency requests');
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch only
    useEffect(() => {
        fetchEmergencyRequests();
    }, []);

    return {
        emergencyRequests,
        loading,
        error,
        refetchEmergencyRequests: fetchEmergencyRequests
    };
}

export default useEmergencyRequests; 