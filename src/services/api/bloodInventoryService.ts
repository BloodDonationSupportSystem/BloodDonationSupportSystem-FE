import apiClient from './apiConfig';
import axios from 'axios';

// Types
export interface BloodInventory {
    id: number;
    quantityUnits: number;
    expirationDate: string;
    status: string;
    inventorySource: string;
    bloodGroupId: string;
    bloodGroupName: string;
    componentTypeId: string;
    componentTypeName: string;
    donationEventId: string;
    donorName: string;
    donationEvent?: {
        id: string;
        donorId: string;
        donorName: string;
        donorPhone: string;
        donationDate: string;
        quantityDonated: number;
        quantityUnits: number;
        isUsable: boolean;
        locationId: string;
        locationName: string;
        createdTime: string;
        completedTime: string;
    };
}

export interface BloodInventoryResponse {
    success: boolean;
    message: string;
    statusCode: number;
    errors: string[];
    data: BloodInventory[];
    count: number;
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface BloodInventoryParams {
    status?: string;
    bloodGroupId?: string;
    componentTypeId?: string;
    expirationStartDate?: string;
    expirationEndDate?: string;
    isExpired?: boolean;
    isExpiringSoon?: boolean;
    sortBy?: string;
    sortAscending?: boolean;
    pageNumber?: number;
    pageSize?: number;
}

// API functions
export const getBloodInventories = async (params: BloodInventoryParams): Promise<BloodInventoryResponse> => {
    try {
        // Build query parameters
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, String(value));
            }
        });

        const response = await apiClient.get(`/BloodInventories?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return error.response.data as BloodInventoryResponse;
        }
        throw error;
    }
};

export const getBloodInventoryById = async (id: number): Promise<BloodInventory> => {
    try {
        const response = await apiClient.get(`/BloodInventories/${id}`);
        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error('Error fetching blood inventory:', error.response.data);
        }
        throw error;
    }
}; 