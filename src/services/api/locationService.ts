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
  address: string;
  latitude: string;
  longitude: string;
  isActive: boolean;
  description: string;
  contactPhone: string;
  contactEmail: string;
  createdTime: string;
  lastUpdatedTime: string;
  capacities: Capacity[];
  staffAssignments: StaffAssignment[];
  operatingHours: OperatingHour[];
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

// API functions
export const getAllLocations = async (): Promise<LocationsResponse> => {
  try {
    const response = await apiClient.get('/Locations');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as LocationsResponse;
    }
    throw error;
  }
};

export const getLocationById = async (locationId: string): Promise<ApiResponse<Location>> => {
  try {
    const response = await apiClient.get(`/Locations/${locationId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<Location>;
    }
    throw error;
  }
}; 