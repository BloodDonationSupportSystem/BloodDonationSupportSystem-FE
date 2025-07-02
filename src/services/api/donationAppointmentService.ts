import apiClient from './apiConfig';
import axios from 'axios';

// Types
export interface TimeSlot {
  date: string;
  timeSlot: string;
  locationId: string;
  availableSlots: number;
  isAvailable: boolean;
}

export interface AvailableTimeSlot {
  date: string;
  locationId: string;
  locations: {
    id: string;
    name: string;
    address: string;
    timeSlots: TimeSlot[];
  }[];
}

export interface DonationAppointmentRequest {
  preferredDate: string;
  preferredTimeSlot: string;
  locationId: string;
  bloodGroupId?: string;
  componentTypeId?: string;
  notes?: string;
  isUrgent?: boolean;
}

export interface PendingAppointment {
  id: string;
  status: string;
  preferredDate: string;
  preferredTimeSlot: string;
  locationName: string;
  notes: string;
}

export interface AvailableTimeSlotResponse {
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
  data: AvailableTimeSlot[];
  count: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
  data: T;
  count: number;
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export interface DonationAppointment {
  id: string;
  donorId: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  preferredDate: string;
  preferredTimeSlot: string;
  locationId: string;
  locationName: string;
  locationAddress: string;
  bloodGroupId: string;
  bloodGroupName: string;
  componentTypeId: string;
  componentTypeName: string;
  requestType: string;
  initiatedByUserId: string;
  initiatedByUserName: string;
  status: string;
  notes: string;
  rejectionReason: string;
  reviewedByUserId: string;
  reviewedByUserName: string;
  reviewedAt: string;
  confirmedDate: string;
  confirmedTimeSlot: string;
  confirmedLocationId: string;
  confirmedLocationName: string;
  donorAccepted: boolean;
  donorResponseAt: string;
  donorResponseNotes: string;
  workflowId: string;
  isUrgent: boolean;
  priority: number;
  createdTime: string;
  lastUpdatedTime: string;
  expiresAt: string;
  checkInTime: string;
  completedTime: string;
  cancelledTime: string;
}

export type DonationAppointmentRequestResponse = ApiResponse<{ id: string }>;

// Interface for staff assignment request
export interface StaffAssignmentRequest {
  donorId: string;
  preferredDate: string;
  preferredTimeSlot: string;
  locationId: string;
  bloodGroupId?: string;
  componentTypeId?: string;
  notes?: string;
  isUrgent?: boolean;
  priority?: number;
  autoExpireHours?: number;
}

export interface AppointmentHistoryQueryParams {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  isUrgent?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// API functions
export const getAvailableTimeSlots = async (
  locationId: string,
  startDate: string,
  days: number = 1
): Promise<AvailableTimeSlotResponse> => {
  try {
    console.log(`Fetching time slots for location ${locationId}, date ${startDate}, days ${days}`);
    const response = await apiClient.get(
      `/DonationAppointmentRequests/available-timeslots/${locationId}?startDate=${startDate}&days=${days}`
    );
    console.log('Time slots API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching time slots:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as AvailableTimeSlotResponse;
    }
    throw error;
  }
};

export const createDonationAppointmentRequest = async (
  requestData: DonationAppointmentRequest
): Promise<DonationAppointmentRequestResponse> => {
  try {
    console.log('Sending donation request to API:', JSON.stringify(requestData, null, 2));

    // Remove undefined fields from the request
    const cleanedData = Object.fromEntries(
      Object.entries(requestData).filter(([_, value]) => value !== undefined)
    );

    const response = await apiClient.post('/DonationAppointmentRequests/donor-request', cleanedData);
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating donation request:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error response data:', error.response.data);
      return error.response.data as DonationAppointmentRequestResponse;
    }
    throw error;
  }
};

/**
 * Creates a staff-initiated appointment assignment for a donor
 */
export const createStaffAssignment = async (
  requestData: StaffAssignmentRequest
): Promise<DonationAppointmentRequestResponse> => {
  try {
    console.log('Sending staff assignment request to API:', JSON.stringify(requestData, null, 2));

    // Remove undefined fields from the request
    const cleanedData = Object.fromEntries(
      Object.entries(requestData).filter(([_, value]) => value !== undefined)
    );

    const response = await apiClient.post('/DonationAppointmentRequests/staff-assignment', cleanedData);
    console.log('Staff assignment API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating staff assignment:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error response data:', error.response.data);
      return error.response.data as DonationAppointmentRequestResponse;
    }
    throw error;
  }
};

/**
 * Gets donation appointment history for a donor
 */
export const getDonorAppointmentHistory = async (
  donorId: string,
  params: AppointmentHistoryQueryParams = {}
): Promise<ApiResponse<DonationAppointment[]>> => {
  try {
    // Build query string
    const queryParams = new URLSearchParams();

    if (params.pageNumber !== undefined) {
      queryParams.append('PageNumber', params.pageNumber.toString());
    }

    if (params.pageSize !== undefined) {
      queryParams.append('PageSize', params.pageSize.toString());
    }

    if (params.status) {
      queryParams.append('Status', params.status);
    }

    if (params.startDate) {
      queryParams.append('StartDate', params.startDate);
    }

    if (params.endDate) {
      queryParams.append('EndDate', params.endDate);
    }

    if (params.isUrgent !== undefined) {
      queryParams.append('IsUrgent', params.isUrgent.toString());
    }

    if (params.sortBy) {
      queryParams.append('SortBy', params.sortBy);
    }

    if (params.sortDirection) {
      queryParams.append('SortDirection', params.sortDirection);
    }

    // Add DonorId parameter (this is the donorProfileId, not userId)
    queryParams.append('DonorId', donorId);

    const queryString = queryParams.toString();
    const url = `/DonationAppointmentRequests${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<ApiResponse<DonationAppointment[]>>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching donor appointment history:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<DonationAppointment[]>;
    }
    throw error;
  }
}; 