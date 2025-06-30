import apiClient from './apiConfig';
import axios from 'axios';

// Types
export interface User {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  lastLogin: string;
  roleId: string;
  roleName: string;
  isEmailVerified: boolean;
  isActivated: boolean;
  createdTime: string;
}

export interface StaffLocation {
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

export interface Staff {
  staff: User;
  locations: StaffLocation[];
}

export interface UsersResponse {
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
  data: User[];
  count: number;
}

export interface StaffsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
  data: Staff[];
  count: number;
}

export interface StaffResponse {
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
  data: Staff;
  count: number;
}

/**
 * Fetches all members
 */
export const getMembers = async (): Promise<UsersResponse> => {
  try {
    const response = await apiClient.get<UsersResponse>('/Users/members');
    console.log('Members API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching members:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as UsersResponse;
    }
    throw new Error("Failed to fetch members");
  }
};

/**
 * Fetches all staff members
 */
export const getStaffs = async (): Promise<StaffsResponse> => {
  try {
    const response = await apiClient.get<StaffsResponse>('/Users/staffs');
    console.log('Staffs API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching staffs:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as StaffsResponse;
    }
    throw new Error("Failed to fetch staffs");
  }
};

/**
 * Gets staff details by ID
 */
export const getStaffById = async (id: string): Promise<StaffResponse> => {
  try {
    const response = await apiClient.get<StaffResponse>(`/Users/staff/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching staff details:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as StaffResponse;
    }
    throw new Error(`Failed to fetch staff with ID: ${id}`);
  }
};

/**
 * Gets user details by ID
 */
export const getUserById = async (id: string): Promise<UsersResponse> => {
  try {
    const response = await apiClient.get<UsersResponse>(`/Users/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as UsersResponse;
    }
    throw new Error(`Failed to fetch user with ID: ${id}`);
  }
};

export interface RegisterStaffWithLocationRequest {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  locationId: string;
  locationRole: 'LocationManager' | 'Staff' | 'Technician';
  canManageCapacity: boolean;
  canApproveAppointments: boolean;
  canViewReports: boolean;
  notes: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
  data: any;
}

/**
 * Registers a new staff member with location
 */
export const registerStaffWithLocation = async (data: RegisterStaffWithLocationRequest): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>('/Auth/register-staff-with-location', data);
    return response.data;
  } catch (error) {
    console.error('Error registering staff:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as RegisterResponse;
    }
    throw new Error("Failed to register staff member");
  }
};

/**
 * Activates or deactivates a user
 */
export const activateUser = async (id: string, isActivated: boolean): Promise<ApiResponse> => {
  try {
    // Convert to a proper boolean to ensure true/false rather than other truthy/falsy values
    const boolActivated = isActivated === true; 
    
    console.log('Activation endpoint:', `/Users/${id}/activation?isActivated=${boolActivated}`);
    console.log('Activation value type:', typeof boolActivated);
    
    const response = await apiClient.patch<ApiResponse>(
      `/Users/${id}/activation`, 
      {}, // Empty body
      { params: { isActivated: boolActivated } } // Pass as query parameter
    );
    
    console.log('Activation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating user activation status:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error response:', error.response.data);
      return error.response.data as ApiResponse;
    }
    throw new Error("Failed to update user activation status");
  }
};

export interface ApiResponse {
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
  data: any;
} 