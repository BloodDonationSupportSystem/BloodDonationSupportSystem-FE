import apiClient from './apiConfig';
import axios from 'axios';

// Types
export interface BloodGroup {
  id: string;
  groupName: string;
  description: string;
}

export interface BloodGroupsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
  data: BloodGroup[];
  count: number;
}

/**
 * Fetches all blood groups
 */
export const getBloodGroups = async (): Promise<BloodGroupsResponse> => {
  try {
    const response = await apiClient.get<BloodGroupsResponse>('/BloodGroups');
    console.log('Blood groups API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching blood groups:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as BloodGroupsResponse;
    }
    throw error;
  }
};

/**
 * Fetches a single blood group by ID
 */
export const getBloodGroupById = async (id: string): Promise<BloodGroupsResponse> => {
  try {
    const response = await apiClient.get<BloodGroupsResponse>(`/BloodGroups/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as BloodGroupsResponse;
    }
    throw error;
  }
}; 