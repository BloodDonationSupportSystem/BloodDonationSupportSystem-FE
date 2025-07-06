import apiClient from './apiConfig';
import axios from 'axios';

// Types
export interface OperatingHour {
  id: string;
  locationId: string;
  dayOfWeek: number;
  dayOfWeekName: string;
  morningStartTime: string;
  morningEndTime: string;
  afternoonStartTime: string;
  afternoonEndTime: string;
  eveningStartTime: string;
  eveningEndTime: string;
  isClosed: boolean;
  isActive: boolean;
  notes: string;
}

export interface Capacity {
  id: string;
  locationId: string;
  locationName: string;
  timeSlot: string;
  totalCapacity: number;
  dayOfWeek: number;
  effectiveDate: string;
  expiryDate: string;
  isActive: boolean;
  notes: string;
  createdTime: string;
  lastUpdatedTime: string;
}

export interface CreateCapacityRequest {
  locationId: string;
  timeSlot: string;
  totalCapacity: number;
  dayOfWeek: number;
  effectiveDate: string;
  expiryDate: string;
  notes: string;
  isActive: boolean;
}

export interface CreateMultipleCapacitiesRequest {
  locationId: string;
  totalCapacity: number;
  startDayOfWeek: number;
  endDayOfWeek: number;
  effectiveDate: string;
  expiryDate: string;
  notes: string;
  isActive: boolean;
}

export interface UpdateCapacityRequest {
  timeSlot: string;
  totalCapacity: number;
  dayOfWeek: number;
  effectiveDate: string;
  expiryDate: string;
  notes: string;
  isActive: boolean;
}

export interface StaffAssignment {
  id: string;
  locationId: string;
  locationName: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  canManageCapacity: boolean;
  canApproveAppointments: boolean;
  canViewReports: boolean;
  assignedDate: string;
  unassignedDate: string;
  isActive: boolean;
  notes: string;
  createdTime: string;
  lastUpdatedTime: string;
}

export interface Location {
  id: string;
  name: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  isActive: boolean;
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
  createdTime?: string;
  lastUpdatedTime?: string;
  capacities?: LocationCapacity[];
  staffAssignments?: StaffAssignment[];
  operatingHours: OperatingHour[];
}

export interface LocationCapacity {
  id: string;
  locationId: string;
  locationName?: string;
  timeSlot: string;
  totalCapacity: number;
  dayOfWeek: number;
  effectiveDate?: string;
  expiryDate?: string;
  isActive: boolean;
  notes?: string;
  createdTime?: string;
  lastUpdatedTime?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
  data: T;
  count: number;
}

export type LocationsResponse = ApiResponse<Location[]>;

export interface LocationResponse {
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
  data: Location;
}

// API functions
export const getAllLocations = async (): Promise<LocationsResponse> => {
  try {
    const response = await apiClient.get('/Locations');
    return response.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as LocationsResponse;
    }
    throw error;
  }
};

export const getLocationById = async (id: string): Promise<LocationResponse> => {
  try {
    const response = await apiClient.get(`/Locations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching location:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as LocationResponse;
    }
    throw error;
  }
};

export const getUserLocations = async (userId: string): Promise<LocationsResponse> => {
  try {
    const response = await apiClient.get(`/Locations/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user locations:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as LocationsResponse;
    }
    throw error;
  }
};

// Get all capacities for a location
export const getLocationCapacities = async (locationId: string): Promise<ApiResponse<Capacity[]>> => {
  try {
    const response = await apiClient.get(`/Locations/${locationId}/capacities`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<Capacity[]>;
    }
    throw error;
  }
};

// Create a new capacity for a location
export const createLocationCapacity = async (
  locationId: string,
  data: CreateCapacityRequest
): Promise<ApiResponse<Capacity>> => {
  try {
    const response = await apiClient.post(`/Locations/${locationId}/capacities`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<Capacity>;
    }
    throw error;
  }
};

// Update an existing capacity
export const updateLocationCapacity = async (
  locationId: string,
  capacityId: string,
  data: UpdateCapacityRequest
): Promise<ApiResponse<Capacity>> => {
  try {
    const response = await apiClient.put(`/Locations/${locationId}/capacities/${capacityId}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<Capacity>;
    }
    throw error;
  }
};

// Delete a capacity
export const deleteLocationCapacity = async (
  locationId: string,
  capacityId: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.delete(`/Locations/${locationId}/capacities/${capacityId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<any>;
    }
    throw error;
  }
};

// Create multiple capacities for a location
export const createMultipleLocationCapacities = async (
  locationId: string,
  data: CreateMultipleCapacitiesRequest
): Promise<ApiResponse<Capacity[]>> => {
  try {
    const response = await apiClient.post(`/Locations/${locationId}/capacities/bulk`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<Capacity[]>;
    }
    throw error;
  }
};

// Create a new location
export interface CreateLocationRequest {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  description: string;
  contactPhone: string;
  contactEmail: string;
  isActive: boolean;
}

export const createLocation = async (data: CreateLocationRequest): Promise<LocationResponse> => {
  try {
    const response = await apiClient.post('/Locations', data);
    return response.data;
  } catch (error) {
    console.error('Error creating location:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as LocationResponse;
    }
    throw error;
  }
};

// Update an existing location
export interface UpdateLocationRequest {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  description: string;
  contactPhone: string;
  contactEmail: string;
  isActive: boolean;
}

export const updateLocation = async (id: string, data: UpdateLocationRequest): Promise<LocationResponse> => {
  try {
    const response = await apiClient.put(`/Locations/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating location:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as LocationResponse;
    }
    throw error;
  }
};

// Delete a location
export const deleteLocation = async (id: string): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.delete(`/Locations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting location:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<any>;
    }
    throw error;
  }
}; 