import { useState, useCallback } from 'react';
import * as donationAppointmentService from '@/services/api/donationAppointmentService';
import {
  DonationAppointmentRequest,
  AvailableTimeSlot,
  StaffAssignmentRequest,
  AppointmentHistoryQueryParams,
  DonationAppointment
} from '@/services/api/donationAppointmentService';
import { format } from 'date-fns';

interface UseDonationAppointmentReturn {
  availableTimeSlots: AvailableTimeSlot[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
  fetchAvailableTimeSlots: (locationId: string, date: Date, days?: number) => Promise<void>;
  submitDonationRequest: (request: DonationAppointmentRequest) => Promise<boolean>;
  submitStaffAssignment: (request: StaffAssignmentRequest) => Promise<boolean>;
}

export function useDonationAppointment(): UseDonationAppointmentReturn {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<AvailableTimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAvailableTimeSlots = async (locationId: string, date: Date, days: number = 1): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const formattedDate = format(date, 'yyyy-MM-dd');
      const response = await donationAppointmentService.getAvailableTimeSlots(locationId, formattedDate, days);

      if (response.success && response.data) {
        setAvailableTimeSlots(response.data);
      } else {
        setError(response.message || 'Failed to load available time slots');
      }
    } catch (err) {
      console.error('Error fetching available time slots:', err);
      setError('An error occurred while fetching available time slots');
    } finally {
      setIsLoading(false);
    }
  };

  const submitDonationRequest = async (request: DonationAppointmentRequest): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const response = await donationAppointmentService.createDonationAppointmentRequest(request);

      if (response.success) {
        setSuccessMessage('Your donation appointment request has been submitted successfully!');
        return true;
      } else {
        setError(response.message || 'Failed to submit donation request');
        return false;
      }
    } catch (err) {
      console.error('Error submitting donation request:', err);
      setError('An error occurred while submitting your donation request');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitStaffAssignment = async (request: StaffAssignmentRequest): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const response = await donationAppointmentService.createStaffAssignment(request);

      if (response.success) {
        setSuccessMessage('Donor assignment has been submitted successfully!');
        return true;
      } else {
        setError(response.message || 'Failed to assign donor');
        return false;
      }
    } catch (err) {
      console.error('Error assigning donor:', err);
      setError('An error occurred while assigning the donor');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    availableTimeSlots,
    isLoading,
    isSubmitting,
    error,
    successMessage,
    fetchAvailableTimeSlots,
    submitDonationRequest,
    submitStaffAssignment
  };
}

interface UseDonorAppointmentHistoryResult {
  appointments: DonationAppointment[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  fetchAppointmentHistory: (donorId: string, params?: AppointmentHistoryQueryParams) => Promise<void>;
}

export function useDonorAppointmentHistory(
  initialParams?: AppointmentHistoryQueryParams
): UseDonorAppointmentHistoryResult {
  const [appointments, setAppointments] = useState<DonationAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: initialParams?.pageNumber || 1,
    pageSize: initialParams?.pageSize || 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Store initialParams in a ref to avoid dependency issues
  const initialParamsRef = useCallback(() => initialParams, []);

  const fetchAppointmentHistory = useCallback(async (
    donorId: string,
    params?: AppointmentHistoryQueryParams
  ) => {
    if (!donorId) {
      setError('Donor ID is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const queryParams: AppointmentHistoryQueryParams = {
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
        ...initialParamsRef(),
        ...params
      };

      const response = await donationAppointmentService.getDonorAppointmentHistory(donorId, queryParams);

      if (response.success && response.data) {
        setAppointments(response.data);
        setPagination({
          current: response.pageNumber || 1,
          pageSize: response.pageSize || 10,
          total: response.totalCount || 0,
          totalPages: response.totalPages || 0,
          hasNext: response.hasNextPage || false,
          hasPrev: response.hasPreviousPage || false
        });
      } else {
        setError(response.message || 'Failed to load appointment history');
      }
    } catch (err) {
      console.error('Error fetching appointment history:', err);
      setError('An error occurred while fetching appointment history');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.current, pagination.pageSize, initialParamsRef]);

  return {
    appointments,
    isLoading,
    error,
    pagination,
    fetchAppointmentHistory
  };
} 