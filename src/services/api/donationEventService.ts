import apiClient from './apiConfig';
import axios from 'axios';

// Types
export interface DonationEvent {
  id: string;
  quantityUnits: number;
  status: string;
  collectedAt: string;
  createdTime: string;
  lastUpdatedTime: string;
  donorId: string;
  donorName: string;
  bloodGroupId: string;
  bloodGroupName: string;
  componentTypeId: string;
  componentTypeName: string;
  locationId: string;
  locationName: string;
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
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortAscending?: boolean;
  pageNumber?: number;
  pageSize?: number;
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