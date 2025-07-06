import { useState, useEffect } from 'react';
import { dashboardService, DashboardData } from '@/services/api';

interface UseMemberDashboardResult {
    dashboardData: DashboardData | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing member dashboard data
 * @returns Dashboard data, loading state, error state, and refetch function
 */
export function useMemberDashboard(): UseMemberDashboardResult {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await dashboardService.getMemberDashboard();
            if (response.success) {
                setDashboardData(response.data);
            } else {
                setError(response.message || 'Failed to fetch dashboard data');
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('An error occurred while fetching dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return {
        dashboardData,
        loading,
        error,
        refetch: fetchDashboardData
    };
}

export default useMemberDashboard; 