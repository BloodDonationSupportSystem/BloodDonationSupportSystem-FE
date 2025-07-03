import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import {
    getBloodRequests,
    BloodRequestDetail,
    BloodRequestQueryParams,
    PaginatedResponse
} from '@/services/api/bloodRequestService';

interface UseBloodRequestsReturn {
    bloodRequests: BloodRequestDetail[];
    loading: boolean;
    error: string | null;
    pagination: {
        current: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
    fetchBloodRequests: (params?: BloodRequestQueryParams) => Promise<void>;
    setParams: (newParams: Partial<BloodRequestQueryParams>) => void;
}

/**
 * Hook for fetching and managing blood requests
 * 
 * @param initialParams - Initial query parameters for fetching blood requests
 * @returns Blood requests data, loading state, error, pagination, and fetch function
 */
export function useBloodRequests(
    initialParams: BloodRequestQueryParams = {}
): UseBloodRequestsReturn {
    const [bloodRequests, setBloodRequests] = useState<BloodRequestDetail[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [params, setParams] = useState<BloodRequestQueryParams>(initialParams);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
    });

    const fetchBloodRequests = useCallback(async (customParams?: BloodRequestQueryParams) => {
        setLoading(true);
        setError(null);

        try {
            // Use custom params if provided, otherwise use state params
            const queryParams: BloodRequestQueryParams = {
                ...params,
                ...customParams,
            };

            // Ensure pagination parameters are included
            if (!queryParams.pageNumber) {
                queryParams.pageNumber = pagination.current;
            }

            if (!queryParams.pageSize) {
                queryParams.pageSize = pagination.pageSize;
            }

            const response: PaginatedResponse<BloodRequestDetail> = await getBloodRequests(queryParams);

            if (response.success) {
                setBloodRequests(response.data);
                setPagination({
                    current: response.pageNumber,
                    pageSize: response.pageSize,
                    total: response.totalCount,
                    totalPages: response.totalPages,
                    hasNext: response.hasNextPage,
                    hasPrevious: response.hasPreviousPage,
                });
            } else {
                throw new Error(response.message || 'Failed to fetch blood requests');
            }
        } catch (err) {
            console.error('Error fetching blood requests:', err);
            setError('Failed to load blood requests. Please try again.');
            message.error('Failed to load blood requests');
        } finally {
            setLoading(false);
        }
    }, [params, pagination.current, pagination.pageSize]);

    // Update params function that merges new params with existing ones
    const updateParams = useCallback((newParams: Partial<BloodRequestQueryParams>) => {
        setParams(prevParams => ({
            ...prevParams,
            ...newParams,
        }));
    }, []);

    // Fetch blood requests when params change
    useEffect(() => {
        fetchBloodRequests();
    }, [params, fetchBloodRequests]);

    return {
        bloodRequests,
        loading,
        error,
        pagination,
        fetchBloodRequests,
        setParams: updateParams,
    };
} 