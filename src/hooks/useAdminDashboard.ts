import { useState, useEffect } from 'react';
import { dashboardService, AdminDashboardData } from '@/services/api';

interface UseAdminDashboardResult {
    dashboardData: AdminDashboardData | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing admin dashboard data
 * @returns Dashboard data, loading state, error state, and refetch function
 */
export function useAdminDashboard(): UseAdminDashboardResult {
    const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await dashboardService.getAdminDashboard();
            if (response.success) {
                setDashboardData(response.data);
            } else {
                setError(response.message || 'Failed to fetch dashboard data');
            }
        } catch (err) {
            console.error('Error fetching admin dashboard data:', err);
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

export default useAdminDashboard; 