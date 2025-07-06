import { useState, useEffect } from 'react';
import { dashboardService, StaffDashboardData } from '@/services/api';

interface UseStaffDashboardResult {
    dashboardData: StaffDashboardData | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing staff dashboard data
 * @returns Dashboard data, loading state, error state, and refetch function
 */
export function useStaffDashboard(): UseStaffDashboardResult {
    const [dashboardData, setDashboardData] = useState<StaffDashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await dashboardService.getStaffDashboard();
            if (response.success) {
                setDashboardData(response.data);
            } else {
                setError(response.message || 'Failed to fetch dashboard data');
            }
        } catch (err) {
            console.error('Error fetching staff dashboard data:', err);
            setError('An error occurred while fetching dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch only
    useEffect(() => {
        fetchDashboardData();
        // No dependencies to prevent re-fetching
    }, []);

    return {
        dashboardData,
        loading,
        error,
        refetch: fetchDashboardData
    };
}

export default useStaffDashboard; 