import { useState, useEffect, useMemo } from 'react';
import {
    BloodInventory,
    BloodInventoryParams,
    getBloodInventories
} from '@/services/api/bloodInventoryService';

interface UseBloodInventoryReturn {
    inventories: BloodInventory[];
    isLoading: boolean;
    error: string | null;
    pagination: {
        current: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
    fetchInventories: (params?: BloodInventoryParams) => Promise<void>;
    inventorySummary: {
        totalUnits: number;
        expiringCount: number;
        expiredCount: number;
        availableCount: number;
        usedCount: number;
        dispatchedCount: number;
        bloodTypeCount: number;
        byBloodGroup: Record<string, number>;
        byComponentType: Record<string, number>;
        byStatus: Record<string, number>;
    };
}

export function useBloodInventory(initialParams?: BloodInventoryParams): UseBloodInventoryReturn {
    const [inventories, setInventories] = useState<BloodInventory[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [params, setParams] = useState<BloodInventoryParams>(initialParams || {
        pageNumber: 1,
        pageSize: 50,
        sortBy: 'expirationDate',
        sortAscending: true
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 50,
        total: 0,
        totalPages: 0
    });

    const fetchInventories = async (queryParams?: BloodInventoryParams) => {
        try {
            setIsLoading(true);
            setError(null);

            // Merge the default params with any provided parameters
            const mergedParams = {
                ...params,
                ...(queryParams || {})
            };

            // Save the new params for future refetches
            if (queryParams) {
                setParams(mergedParams);
            }

            const response = await getBloodInventories(mergedParams);

            if (response.success && Array.isArray(response.data)) {
                setInventories(response.data);
                setPagination({
                    current: response.pageNumber || 1,
                    pageSize: response.pageSize || 50,
                    total: response.totalCount || 0,
                    totalPages: response.totalPages || 0
                });
            } else {
                setError(response.message || 'Failed to fetch blood inventories');
            }
        } catch (err) {
            console.error('Error fetching blood inventories:', err);
            setError('An error occurred while fetching blood inventories');
        } finally {
            setIsLoading(false);
        }
    };

    // Check if a blood unit is expiring soon (within 7 days)
    const isExpiringSoon = (expirationDate: string) => {
        const today = new Date();
        const expDate = new Date(expirationDate);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
    };

    // Check if a blood unit is expired
    const isExpired = (expirationDate: string) => {
        const today = new Date();
        const expDate = new Date(expirationDate);
        return expDate < today;
    };

    // Calculate summary data from the inventories
    const inventorySummary = useMemo(() => {
        const byBloodGroup: Record<string, number> = {};
        const byComponentType: Record<string, number> = {};
        const byStatus: Record<string, number> = {};
        let expiringCount = 0;
        let expiredCount = 0;
        let availableCount = 0;
        let usedCount = 0;
        let dispatchedCount = 0;
        let totalUnits = 0;

        inventories.forEach(item => {
            // Count by blood group
            const bloodGroup = item.bloodGroupName || 'Unknown';
            if (!byBloodGroup[bloodGroup]) {
                byBloodGroup[bloodGroup] = 0;
            }
            byBloodGroup[bloodGroup] += item.quantityUnits;

            // Count by component type
            const componentType = item.componentTypeName || 'Unknown';
            if (!byComponentType[componentType]) {
                byComponentType[componentType] = 0;
            }
            byComponentType[componentType] += item.quantityUnits;

            // Count by status
            const status = item.status || 'Unknown';
            if (!byStatus[status]) {
                byStatus[status] = 0;
            }
            byStatus[status] += item.quantityUnits;

            // Count by specific statuses
            if (status.toLowerCase() === 'available') {
                availableCount += item.quantityUnits;
            } else if (status.toLowerCase() === 'used') {
                usedCount += item.quantityUnits;
            } else if (status.toLowerCase() === 'dispatched') {
                dispatchedCount += item.quantityUnits;
            }

            // Count expiring and expired
            if (isExpired(item.expirationDate)) {
                expiredCount += item.quantityUnits;
            } else if (isExpiringSoon(item.expirationDate)) {
                expiringCount += item.quantityUnits;
            }

            // Total units
            totalUnits += item.quantityUnits;
        });

        return {
            totalUnits,
            expiringCount,
            expiredCount,
            availableCount,
            usedCount,
            dispatchedCount,
            bloodTypeCount: Object.keys(byBloodGroup).length,
            byBloodGroup,
            byComponentType,
            byStatus
        };
    }, [inventories]);

    useEffect(() => {
        fetchInventories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        inventories,
        isLoading,
        error,
        pagination,
        fetchInventories,
        inventorySummary
    };
} 