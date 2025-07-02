import apiClient from './apiConfig';
import axios from 'axios';

// Types
export interface DonorProfile {
  id: string;
  dateOfBirth: string;
  gender: boolean;
  lastDonationDate: string | null;
  healthStatus: string;
  lastHealthCheckDate: string | null;
  totalDonations: number;
  address: string;
  latitude: string | null;
  longitude: string | null;
  userId: string;
  userName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  bloodGroupId: string | null;
  bloodGroupName: string | null;
  createdTime: string;
  lastUpdatedTime: string | null;
  nextAvailableDonationDate: string | null;
  nextEligibleDonationDate: string | null;
  isAvailableForEmergency: boolean;
  preferredDonationTime: string | null;
  distanceKm: number;
  isEligible: boolean;
  donationType: string | null;
}

export interface PendingAppointment {
  id: string;
  status: string;
  preferredDate: string;
  preferredTimeSlot: string;
  locationName: string;
  notes: string;
}

export interface EligibilityResponse {
  isEligible: boolean;
  message: string;
  nextAvailableDonationDate: string | null;
  pendingAppointment: PendingAppointment | null;
}

export interface DonorProfileRequest {
  dateOfBirth: string;
  gender: boolean;
  lastDonationDate?: string | null;
  healthStatus: string;
  lastHealthCheckDate?: string | null;
  totalDonations?: number;
  address: string;
  latitude?: string;
  longitude?: string;
  userId: string;
  bloodGroupId: string;
  nextAvailableDonationDate?: string | null;
  isAvailableForEmergency?: boolean;
  preferredDonationTime?: string;
  donationType?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface DonorProfileUpdateRequest extends DonorProfileRequest {
  // Any additional fields specific to updates
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

export interface DonorProfilesQueryParams {
  pageNumber?: number;
  pageSize?: number;
  bloodGroupName?: string;
  isEligible?: boolean;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  isAvailableForEmergency?: boolean;
  latitude?: string;
  longitude?: string;
  radiusKm?: number;
}

// API functions
export const createDonorProfile = async (profileData: DonorProfileRequest): Promise<ApiResponse> => {
  try {
    const response = await apiClient.post('/donorProfiles', profileData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse;
    }
    throw error;
  }
};

export const updateDonorProfile = async (profileId: string, profileData: DonorProfileUpdateRequest): Promise<ApiResponse> => {
  try {
    const response = await apiClient.put(`/donorProfiles/${profileId}`, profileData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse;
    }
    throw error;
  }
};

export const getDonorProfile = async (userId: string): Promise<ApiResponse<DonorProfile>> => {
  try {
    const response = await apiClient.get<ApiResponse<DonorProfile>>(`/DonorProfiles/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching donor profile:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<DonorProfile>;
    }
    throw error;
  }
};

export const checkEligibility = async (userId: string): Promise<ApiResponse<EligibilityResponse>> => {
  try {
    console.log(`Checking eligibility for user ${userId}`);
    const response = await apiClient.get(`/DonorProfiles/check-eligibility/${userId}`);
    console.log('Eligibility API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error checking eligibility:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<EligibilityResponse>;
    }
    throw error;
  }
};

/**
 * Gets all donor profiles
 */
export const getAllDonorProfiles = async (): Promise<ApiResponse<DonorProfile[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<DonorProfile[]>>('/DonorProfiles/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all donor profiles:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<DonorProfile[]>;
    }
    throw error;
  }
};

/**
 * Gets donor profiles with pagination and filtering
 */
export const getDonorProfilesPaginated = async (params: DonorProfilesQueryParams): Promise<ApiResponse<DonorProfile[]>> => {
  try {
    // Build query string
    const queryParams = new URLSearchParams();

    if (params.pageNumber !== undefined) {
      queryParams.append('PageNumber', params.pageNumber.toString());
    }

    if (params.pageSize !== undefined) {
      queryParams.append('PageSize', params.pageSize.toString());
    }

    if (params.bloodGroupName) {
      queryParams.append('BloodGroup', params.bloodGroupName);
      console.log('Added blood group filter:', params.bloodGroupName);
    }

    if (params.isEligible !== undefined) {
      queryParams.append('IsEligible', params.isEligible.toString());
    }

    if (params.searchTerm) {
      queryParams.append('SearchTerm', params.searchTerm);
    }

    if (params.sortBy) {
      queryParams.append('SortBy', params.sortBy);
    }

    if (params.sortDirection) {
      queryParams.append('SortDirection', params.sortDirection);
    }

    if (params.isAvailableForEmergency !== undefined) {
      queryParams.append('IsAvailableForEmergency', params.isAvailableForEmergency.toString());
    }

    if (params.latitude) {
      queryParams.append('Latitude', params.latitude);
    }

    if (params.longitude) {
      queryParams.append('Longitude', params.longitude);
    }

    if (params.radiusKm) {
      queryParams.append('RadiusKm', params.radiusKm.toString());
    }

    const queryString = queryParams.toString();
    const url = `/DonorProfiles${queryString ? `?${queryString}` : ''}`;

    console.log('Full API URL:', apiClient.defaults.baseURL + url);

    const response = await apiClient.get<ApiResponse<DonorProfile[]>>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching paginated donor profiles:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<DonorProfile[]>;
    }
    throw error;
  }
};

/**
 * Gets donor profiles by blood group
 */
export const getDonorProfilesByBloodGroup = async (bloodGroupId: string): Promise<ApiResponse<DonorProfile[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<DonorProfile[]>>(`/DonorProfiles/bloodgroup/${bloodGroupId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching donor profiles by blood group:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<DonorProfile[]>;
    }
    throw error;
  }
};

/**
 * Checks if the current authenticated user has a donor profile
 */
export const checkCurrentUserHasProfile = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get<ApiResponse<boolean>>('/DonorProfiles/current/exists');
    return response.data.success && response.data.data;
  } catch (error) {
    console.error('Error checking if user has profile:', error);
    return false;
  }
}; 