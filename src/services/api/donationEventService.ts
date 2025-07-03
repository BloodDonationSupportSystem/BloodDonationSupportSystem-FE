import apiClient from './apiConfig';
import axios from 'axios';

// Types
export interface DonationEvent {
  id: string;
  donorId: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  requestId: string;
  requestType: string;
  bloodGroupId: string;
  bloodGroupName: string;
  componentTypeId: string;
  componentTypeName: string;
  locationId: string;
  locationName: string;
  locationAddress?: string;
  staffId?: string;
  staffName?: string;
  inventoryId?: number;
  status: string;
  statusDescription?: string;
  appointmentDate?: string;
  appointmentLocation?: string;
  appointmentConfirmed?: boolean;
  checkInTime?: string;
  bloodPressure?: string;
  temperature?: number;
  hemoglobinLevel?: number;
  weight?: number;
  height?: number;
  medicalNotes?: string;
  rejectionReason?: string;
  donationStartTime?: string;
  complicationType?: string;
  complicationDetails?: string;
  actionTaken?: string;
  isUsable?: boolean;
  donationDate?: string;
  donationLocation?: string;
  quantityDonated?: number;
  quantityUnits: number;
  collectedAt: string;
  notes?: string;
  createdTime: string;
  lastUpdatedTime: string;
  completedTime?: string;
  deletedTime?: string;
  isActive?: boolean;
}

export interface DonationEventsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
  data: DonationEvent[];
  count: number;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface DonationEventsParams {
  donorId?: string;
  bloodGroupId?: string;
  componentTypeId?: string;
  locationId?: string;
  status?: string;
  requestType?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortAscending?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

// API Response interface
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
  data: T;
}

// Check-in request and response interfaces
export interface CheckInRequest {
  appointmentId: string;
  checkInTime: string;
  notes?: string;
}

// Health check request interface
export interface HealthCheckRequest {
  donationEventId: string;
  bloodPressure: string;
  temperature: number;
  hemoglobinLevel: number;
  weight: number;
  height: number;
  isEligible: boolean;
  medicalNotes?: string;
  verifiedBloodGroupId?: string;
  rejectionReason?: string;
}

// Start donation request interface
export interface StartDonationRequest {
  donationEventId: string;
  notes?: string;
}

// Complete donation request interface
export interface CompleteDonationRequest {
  donationEventId: string;
  donationDate: string;
  quantityDonated: number;
  quantityUnits: number;
  notes?: string;
}

// Complication request interface
export interface ComplicationRequest {
  donationEventId: string;
  complicationType: string;
  description: string;
  collectedAmount?: number;
  isUsable: boolean;
  actionTaken: string;
}

// Walk-in donor info interface
export interface WalkInDonorInfo {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  bloodGroupId: string;
  dateOfBirth?: string;
  address?: string;
  lastDonationDate?: string;
}

// Walk-in donation request interface
export interface WalkInDonationRequest {
  donorInfo: WalkInDonorInfo;
  locationId: string;
  staffId: string;
  componentTypeId: string;
  notes?: string;
}

// Create donation event from blood request
export interface CreateDonationEventRequest {
  requestId: string;
  locationId: string;
  notes?: string;
  checkInventoryFirst: boolean;
}

// API functions
export const getDonationEvents = async (params: DonationEventsParams): Promise<DonationEventsResponse> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/donationEvents?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as DonationEventsResponse;
    }
    throw error;
  }
};

// 1. Check-in donor for donation
export const checkInDonor = async (request: CheckInRequest): Promise<ApiResponse<DonationEvent>> => {
  try {
    const response = await apiClient.post('/DonationEvents/check-in', request);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<DonationEvent>;
    }
    throw error;
  }
};

// 2. Perform health check for donation
export const performHealthCheck = async (request: HealthCheckRequest): Promise<ApiResponse<DonationEvent>> => {
  try {
    // Build URL and log for debugging
    const url = `/DonationEvents/health-check`;

    // Validate required fields
    if (!request.donationEventId) {
      console.error('Missing required donationEventId for health check');
      return {
        success: false,
        message: 'Missing required donation event ID',
        statusCode: 400,
        errors: ['donationEventId is required'],
        data: {} as DonationEvent
      };
    }

    if (!request.verifiedBloodGroupId) {
      console.error('Missing required verifiedBloodGroupId for health check');
      return {
        success: false,
        message: 'Missing verified blood group ID',
        statusCode: 400,
        errors: ['verifiedBloodGroupId is required'],
        data: {} as DonationEvent
      };
    }

    // Format request correctly - API expects request body as is, no need for wrapper
    const formattedRequest = {
      donationEventId: request.donationEventId,
      bloodPressure: request.bloodPressure,
      temperature: request.temperature,
      hemoglobinLevel: request.hemoglobinLevel,
      weight: request.weight,
      height: request.height,
      isEligible: request.isEligible,
      medicalNotes: request.medicalNotes,
      verifiedBloodGroupId: request.verifiedBloodGroupId,
      rejectionReason: request.rejectionReason
    };

    console.log('Health check API URL:', url);
    console.log('Health check request body:', JSON.stringify(formattedRequest, null, 2));

    // Log the full API URL for debugging
    console.log('Full API URL:', apiClient.defaults.baseURL + url);

    // Log the request headers
    console.log('Request headers:', apiClient.defaults.headers);

    try {
      const response = await apiClient.post(url, formattedRequest);
      console.log('Health check raw response:', response);
      return response.data;
    } catch (error) {
      console.error('Health check API error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        console.error('Error config:', {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        });

        if (error.response) {
          return error.response.data as ApiResponse<DonationEvent>;
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Health check outer error:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Health check error response:', error.response.data);
      return error.response.data as ApiResponse<DonationEvent>;
    }
    throw error;
  }
};

// 3. Start donation process
export const startDonation = async (request: StartDonationRequest): Promise<ApiResponse<DonationEvent>> => {
  try {
    const url = `/DonationEvents/start`;
    console.log('Start donation API URL:', url);
    console.log('Start donation request body:', request);

    const response = await apiClient.post(url, request);
    console.log('Start donation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error starting donation:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Start donation error response:', error.response.data);
      return error.response.data as ApiResponse<DonationEvent>;
    }
    throw error;
  }
};

// 4a. Complete donation process
export const completeDonation = async (request: CompleteDonationRequest): Promise<ApiResponse<DonationEvent>> => {
  try {
    const url = `/DonationEvents/complete`;
    console.log('Complete donation API URL:', url);
    console.log('Complete donation request body:', request);

    const response = await apiClient.post(url, request);
    console.log('Complete donation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error completing donation:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Complete donation error response:', error.response.data);
      return error.response.data as ApiResponse<DonationEvent>;
    }
    throw error;
  }
};

// 4b. Record complication during donation
export const recordComplication = async (request: ComplicationRequest): Promise<ApiResponse<DonationEvent>> => {
  try {
    const url = `/DonationEvents/complication`;
    console.log('Record complication API URL:', url);
    console.log('Record complication request body:', request);

    const response = await apiClient.post(url, request);
    console.log('Record complication response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error recording complication:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Record complication error response:', error.response.data);
      return error.response.data as ApiResponse<DonationEvent>;
    }
    throw error;
  }
};

// Get a single donation event by ID
export const getDonationEventById = async (eventId: string): Promise<ApiResponse<DonationEvent>> => {
  try {
    const response = await apiClient.get(`/DonationEvents/${eventId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<DonationEvent>;
    }
    throw error;
  }
};

// Find donation event by appointment ID
export const findDonationEventByAppointmentId = async (appointmentId: string): Promise<ApiResponse<DonationEvent>> => {
  try {
    // Use the correct endpoint for finding donation event by appointment ID
    const url = `/DonationEvents/appointment/${appointmentId}`;
    console.log('Finding donation event by appointment ID at:', url);

    const response = await apiClient.get(url);
    console.log('Find donation event by appointment response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error finding donation event by appointment ID:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('API error response:', error.response.data);
      return error.response.data as ApiResponse<DonationEvent>;
    }
    throw error;
  }
};

// Create a walk-in donation
export const createWalkInDonation = async (data: WalkInDonationRequest): Promise<ApiResponse<DonationEvent>> => {
  try {
    const response = await apiClient.post('/DonationEvents/walk-in', data);
    return response.data;
  } catch (error) {
    console.error('Error creating walk-in donation:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Walk-in donation error response:', error.response.data);
      return error.response.data as ApiResponse<DonationEvent>;
    }
    throw error;
  }
};

// Submit health check results
export const submitHealthCheck = async (data: HealthCheckRequest): Promise<ApiResponse<DonationEvent>> => {
  try {
    const response = await apiClient.post(`/DonationEvents/${data.donationEventId}/health-check`, data);
    return response.data;
  } catch (error) {
    console.error('Error submitting health check:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Health check error response:', error.response.data);
      return error.response.data as ApiResponse<DonationEvent>;
    }
    throw error;
  }
};

// Start donation process
export const startDonationProcess = async (data: StartDonationRequest): Promise<ApiResponse<DonationEvent>> => {
  try {
    const response = await apiClient.post(`/DonationEvents/${data.donationEventId}/start-donation`, data);
    return response.data;
  } catch (error) {
    console.error('Error starting donation:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Start donation error response:', error.response.data);
      return error.response.data as ApiResponse<DonationEvent>;
    }
    throw error;
  }
};

// Complete donation
export const completeDonationProcess = async (data: CompleteDonationRequest): Promise<ApiResponse<DonationEvent>> => {
  try {
    const response = await apiClient.post(`/DonationEvents/${data.donationEventId}/complete`, data);
    return response.data;
  } catch (error) {
    console.error('Error completing donation:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Complete donation error response:', error.response.data);
      return error.response.data as ApiResponse<DonationEvent>;
    }
    throw error;
  }
};

// Record complication
export const recordComplicationProcess = async (data: ComplicationRequest): Promise<ApiResponse<DonationEvent>> => {
  try {
    const response = await apiClient.post(`/DonationEvents/${data.donationEventId}/complications`, data);
    return response.data;
  } catch (error) {
    console.error('Error recording complication:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Record complication error response:', error.response.data);
      return error.response.data as ApiResponse<DonationEvent>;
    }
    throw error;
  }
};

// Create donation event from blood request
export const createDonationEvent = async (request: CreateDonationEventRequest): Promise<ApiResponse<DonationEvent>> => {
  try {
    const response = await apiClient.post('/DonationEvents', request);
    return response.data;
  } catch (error) {
    console.error('Error creating donation event:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<DonationEvent>;
    }
    throw error;
  }
}; 