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
  latitude: string;
  longitude: string;
  userId: string;
  userName: string;
  bloodGroupId: string;
  bloodGroupName: string;
  createdTime: string;
  lastUpdatedTime: string;
  nextAvailableDonationDate: string | null;
  isAvailableForEmergency: boolean;
  preferredDonationTime: string;
  distanceKm: number;
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
  dateOfBirth: string | null | undefined;
  gender: boolean;
  lastDonationDate: string | null | undefined;
  healthStatus: string;
  lastHealthCheckDate: string | null | undefined;
  totalDonations: number;
  address: string;
  latitude: string;
  longitude: string;
  userId: string;
  bloodGroupId: string;
  nextAvailableDonationDate: string | null | undefined;
  isAvailableForEmergency: boolean;
  preferredDonationTime: string;
}

export interface DonorProfileUpdateRequest {
  dateOfBirth: string | null | undefined;
  gender: boolean;
  lastDonationDate: string | null | undefined;
  healthStatus: string;
  lastHealthCheckDate: string | null | undefined;
  totalDonations: number;
  address: string;
  latitude: string;
  longitude: string;
  bloodGroupId: string;
  nextAvailableDonationDate: string | null | undefined;
  isAvailableForEmergency: boolean;
  preferredDonationTime: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
  data: T;
  count: number;
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

export const getDonorProfile = async (userId: string): Promise<ApiResponse> => {
  try {
    const response = await apiClient.get(`/donorProfiles/user/${userId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse;
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