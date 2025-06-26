import apiClient from './apiConfig';
import axios from 'axios';

// Types
export interface ComponentType {
  id: string;
  name: string;
  shelfLifeDays: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
  data: T;
  count: number;
}

export type ComponentTypesResponse = ApiResponse<ComponentType[]>;

// API functions
export const getAllComponentTypes = async (): Promise<ComponentTypesResponse> => {
  try {
    const response = await apiClient.get('/ComponentTypes');
    console.log('Component Types API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching component types:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ComponentTypesResponse;
    }
    throw error;
  }
};

export const getComponentTypeById = async (id: string): Promise<ApiResponse<ComponentType>> => {
  try {
    const response = await apiClient.get(`/ComponentTypes/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<ComponentType>;
    }
    throw error;
  }
}; 