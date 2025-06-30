import apiClient from './apiConfig';
import axios from 'axios';

// Types
export interface TimeSlot {
  timeSlot: string;
  availableCapacity: number;
  totalCapacity: number;
  isAvailable: boolean;
}

export interface AvailableTimeSlot {
  locationId: string;
  locationName: string;
  date: string;
  availableSlots: TimeSlot[];
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

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
  data: T;
  count: number;
}

export type AvailableTimeSlotResponse = ApiResponse<AvailableTimeSlot[]>;
export type DonationAppointmentRequestResponse = ApiResponse<{id: string}>;

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