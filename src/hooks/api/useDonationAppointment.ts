import { useState } from 'react';
import { donationAppointmentService, DonationAppointmentRequest, AvailableTimeSlot, StaffAssignmentRequest } from '@/services/api';
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