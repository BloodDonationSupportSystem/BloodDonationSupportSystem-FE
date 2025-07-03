import axios from 'axios';
import apiClient from './apiConfig';

// Regular blood request
export interface BloodRequest {
    quantityUnits: number;
    status: string;
    isEmergency: boolean;
    neededByDate: string;
    requestedBy: string;
    patientName?: string;
    contactInfo?: string;
    bloodGroupId: string;
    componentTypeId: string;
    locationId: string;
    address: string;
    hospitalName?: string;
    latitude?: string;
    longitude?: string;
    medicalNotes?: string;
    urgencyLevel: string;
}

// Emergency blood request
export interface EmergencyBloodRequest {
    patientName: string;
    urgencyLevel: 'Critical' | 'High' | 'Medium';
    contactInfo: string;
    hospitalName: string;
    quantityUnits: number;
    bloodGroupId: string;
    componentTypeId: string;
    address: string;
    latitude: string;
    longitude: string;
    medicalNotes: string;
    status?: string;
    isEmergency?: boolean;
    neededByDate?: string;
    requestedBy?: string;
    locationId?: string;
}

// Blood request detail response from API
export interface BloodRequestDetail {
    id: string;
    quantityUnits: number;
    requestDate: string;
    status: string;
    isEmergency: boolean;
    neededByDate: string;
    requestedBy: string;
    requesterName: string;
    patientName: string;
    urgencyLevel: string;
    contactInfo: string;
    hospitalName: string;
    bloodGroupId: string;
    bloodGroupName: string;
    componentTypeId: string;
    componentTypeName: string;
    locationId: string;
    locationName: string;
    address: string;
    latitude: string;
    longitude: string;
    distanceKm: number;
    medicalNotes: string;
    isActive: boolean;
    createdTime: string;
    lastUpdatedTime: string;
}

// API response type
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    statusCode?: number;
    errors?: string[];
    data?: T;
    count?: number;
}

// Inventory item
export interface InventoryItem {
    id: number;
    bloodGroupName: string;
    componentTypeName: string;
    quantityUnits: number;
    expirationDate: string;
    daysUntilExpiration: number;
}

// Inventory check response
export interface InventoryCheckResponse {
    requestId: string;
    requestedUnits: number;
    availableUnits: number;
    hasSufficientInventory: boolean;
    inventoryItems: InventoryItem[];
}

// Paginated response
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    count: number;
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

// Query parameters for fetching blood requests
export interface BloodRequestQueryParams {
    status?: string;
    urgencyLevel?: string;
    isEmergency?: boolean;
    bloodGroupId?: string;
    componentTypeId?: string;
    locationId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortAscending?: boolean;
    isActive?: boolean;
    latitude?: string;
    longitude?: string;
    radiusKm?: number;
    pageNumber?: number;
    pageSize?: number;
}

// Create a regular blood request
export const createBloodRequest = async (requestData: BloodRequest) => {
    try {
        // Ensure urgencyLevel is provided, default to Medium for regular requests
        if (!requestData.urgencyLevel) {
            console.warn('No urgency level provided for regular request. Setting to Medium.');
            requestData.urgencyLevel = 'Medium';
        }

        // Validate the urgency level
        const validUrgencyLevels = ['Critical', 'High', 'Medium'];
        if (!validUrgencyLevels.includes(requestData.urgencyLevel)) {
            console.warn(`Invalid urgency level: ${requestData.urgencyLevel}. Using Medium as default.`);
            requestData.urgencyLevel = 'Medium';
        }

        console.log('Sending regular request to API:', JSON.stringify(requestData, null, 2));
        console.log('Urgency level in final regular request:', requestData.urgencyLevel);

        const response = await apiClient.post('/BloodRequests', requestData);
        console.log('API response for regular request:', response.data);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error('Error creating blood request:', error);
        if (axios.isAxiosError(error)) {
            console.error('API error details:', error.response?.data);
            if (error.response?.status === 400) {
                console.error('Bad request details:', error.response.data);
            }
        }
        return {
            success: false,
            error,
        };
    }
};

// Create an emergency blood request (public)
export const createEmergencyBloodRequest = async (requestData: EmergencyBloodRequest) => {
    try {
        // Ensure urgencyLevel is one of the allowed values
        const validUrgencyLevels = ['Critical', 'High', 'Medium'];
        if (!requestData.urgencyLevel) {
            console.warn('No urgency level provided in request. Setting to Medium.');
            requestData.urgencyLevel = 'Medium';
        } else if (!validUrgencyLevels.includes(requestData.urgencyLevel)) {
            console.warn(`Invalid urgency level: ${requestData.urgencyLevel}. Using Medium as default.`);
            requestData.urgencyLevel = 'Medium';
        }

        // Ensure isEmergency is true for emergency requests
        requestData.isEmergency = true;

        // Ensure we have a status
        if (!requestData.status) {
            requestData.status = 'Pending';
        }

        console.log('Sending emergency request to API:', JSON.stringify(requestData, null, 2));
        console.log('Urgency level in final API request:', requestData.urgencyLevel);

        const response = await apiClient.post('/BloodRequests/public', requestData);
        console.log('API response for emergency request:', response.data);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error('Error creating emergency blood request:', error);
        if (axios.isAxiosError(error)) {
            console.error('API error details:', error.response?.data);
            if (error.response?.status === 400) {
                console.error('Bad request details:', error.response.data);
            }
        }
        return {
            success: false,
            error,
        };
    }
};

// Get blood requests with filtering and pagination
export const getBloodRequests = async (params: BloodRequestQueryParams = {}): Promise<PaginatedResponse<BloodRequestDetail>> => {
    try {
        // Build query parameters
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, String(value));
            }
        });

        const response = await apiClient.get<PaginatedResponse<BloodRequestDetail>>(
            `/BloodRequests?${queryParams.toString()}`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching blood requests:', error);
        throw error;
    }
};

// Get emergency blood requests
export const getEmergencyBloodRequests = async (onlyActive: boolean = true) => {
    try {
        const response = await apiClient.get(`/BloodRequests/emergency?onlyActive=${onlyActive}`);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error('Error fetching emergency blood requests:', error);
        return {
            success: false,
            error,
        };
    }
};

// Get blood request by ID
export const getBloodRequestById = async (requestId: string): Promise<ApiResponse<BloodRequestDetail>> => {
    try {
        const response = await apiClient.get<ApiResponse<BloodRequestDetail>>(
            `/BloodRequests/${requestId}`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching blood request details:', error);
        throw error;
    }
};

// Check inventory for a blood request
export const checkInventory = async (requestId: string) => {
    try {
        const response = await apiClient.get(`/BloodRequests/${requestId}/inventory-check`);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error('Error checking inventory for blood request:', error);
        return {
            success: false,
            error,
        };
    }
};

// Fulfill blood request from inventory
export const fulfillFromInventory = async (requestId: string) => {
    try {
        console.log(`Fulfilling blood request ${requestId} from inventory`);
        const response = await apiClient.post(`/BloodRequests/${requestId}/fulfill-from-inventory`);
        console.log('Fulfill from inventory response:', response.data);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error('Error fulfilling blood request from inventory:', error);
        if (axios.isAxiosError(error)) {
            console.error('API error details:', error.response?.data);
        }
        return {
            success: false,
            error,
        };
    }
};

// Get blood requests for a specific user
export const getUserBloodRequests = async (userId: string): Promise<ApiResponse<BloodRequestDetail[]>> => {
    try {
        const response = await apiClient.get<ApiResponse<BloodRequestDetail[]>>(`/BloodRequests/user/${userId}`);
        console.log('User blood requests response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching user blood requests:', error);
        throw error;
    }
};

// Update blood request status
export interface UpdateStatusRequest {
    status: string;
    notes?: string;
    isActive?: boolean;
}

export const updateRequestStatus = async (requestId: string, statusData: UpdateStatusRequest): Promise<ApiResponse<any>> => {
    try {
        console.log(`Updating blood request ${requestId} status:`, statusData);
        const response = await apiClient.put<ApiResponse<any>>(`/BloodRequests/${requestId}/status`, statusData);
        console.log('Update status response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error updating blood request status:', error);
        throw error;
    }
}; 