import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import * as donationEventService from '@/services/api/donationEventService';
import {
  DonationEvent,
  DonationEventsParams,
  CheckInRequest,
  HealthCheckRequest,
  StartDonationRequest,
  CompleteDonationRequest,
  ComplicationRequest,
  ApiResponse
} from '@/services/api/donationEventService';
import { message } from 'antd';

interface UseDonationEventsReturn {
  events: DonationEvent[];
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
  refetch: (params?: DonationEventsParams) => Promise<void>;
  // Add new donation workflow functions
  currentEvent: DonationEvent | null;
  setCurrentEvent: (event: DonationEvent | null) => void;
  isProcessing: boolean;
  checkInDonor: (request: CheckInRequest) => Promise<DonationEvent | null>;
  performHealthCheck: (request: HealthCheckRequest) => Promise<DonationEvent | null>;
  startDonation: (request: StartDonationRequest) => Promise<DonationEvent | null>;
  completeDonation: (request: CompleteDonationRequest) => Promise<DonationEvent | null>;
  recordComplication: (request: ComplicationRequest) => Promise<DonationEvent | null>;
  getDonationEventById: (eventId: string) => Promise<DonationEvent | null>;
  findDonationEventByAppointmentId: (appointmentId: string) => Promise<DonationEvent | null>;
}

export function useDonationEvents(initialParams?: DonationEventsParams): UseDonationEventsReturn {
  const { user } = useAuth();
  const [events, setEvents] = useState<DonationEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<DonationEventsParams>(initialParams || {
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'createdTime',
    sortAscending: false
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  // State for donation workflow
  const [currentEvent, setCurrentEvent] = useState<DonationEvent | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fetchDonationEvents = async (queryParams?: DonationEventsParams) => {
    if (!user?.id) {
      console.log('No user ID available');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Merge the default donorId with any provided parameters
      const mergedParams = {
        ...params,
        ...(queryParams || {}),
        donorId: queryParams?.donorId || params.donorId || user.id
      };

      // Save the new params for future refetches
      if (queryParams) {
        setParams(mergedParams);
      }

      const response = await donationEventService.getDonationEvents(mergedParams);

      if (response.success && Array.isArray(response.data)) {
        setEvents(response.data);
        setPagination({
          current: response.pageNumber || 1,
          pageSize: response.pageSize || 10,
          total: response.totalCount || 0,
          totalPages: response.totalPages || 0,
          hasNext: response.hasNextPage || false,
          hasPrev: response.hasPreviousPage || false
        });
      } else {
        setError(response.message || 'Failed to fetch donation events');
      }
    } catch (err) {
      console.error('Error fetching donation events:', err);
      setError('An error occurred while fetching donation events');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle API responses
  const handleApiResponse = <T extends DonationEvent>(
    response: ApiResponse<T>,
    successMessage: string,
    errorPrefix: string
  ): T | null => {
    if (response.success && response.data) {
      message.success(successMessage);
      return response.data;
    } else {
      const errorMessage = response.message || `${errorPrefix} failed`;
      message.error(errorMessage);
      setError(errorMessage);
      return null;
    }
  };

  // 1. Check-in donor
  const checkInDonor = async (request: CheckInRequest): Promise<DonationEvent | null> => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await donationEventService.checkInDonor(request);
      const event = handleApiResponse(
        response,
        'Donor checked in successfully',
        'Check-in'
      );

      if (event) {
        setCurrentEvent(event);
        // Refresh event list
        fetchDonationEvents();
      }

      return event;
    } catch (err) {
      console.error('Error checking in donor:', err);
      const errorMessage = 'An error occurred while checking in the donor';
      message.error(errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Perform health check
  const performHealthCheck = async (request: HealthCheckRequest): Promise<DonationEvent | null> => {
    try {
      setIsProcessing(true);
      setError(null);

      console.log('Performing health check with request:', {
        donationEventId: request.donationEventId,
        bloodPressure: request.bloodPressure,
        temperature: request.temperature,
        hemoglobinLevel: request.hemoglobinLevel,
        weight: request.weight,
        height: request.height,
        isEligible: request.isEligible,
        verifiedBloodGroupId: request.verifiedBloodGroupId,
        rejectionReason: request.rejectionReason
      });

      const response = await donationEventService.performHealthCheck(request);
      console.log('Health check API response:', response);

      const event = handleApiResponse(
        response,
        request.isEligible ? 'Health check passed' : 'Health check failed',
        'Health check'
      );

      if (event) {
        setCurrentEvent(event);
        // Refresh event list
        fetchDonationEvents();
      }

      return event;
    } catch (err) {
      console.error('Error performing health check:', err);
      const errorMessage = 'An error occurred during health check';
      message.error(errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Start donation
  const startDonationProcess = async (request: StartDonationRequest): Promise<DonationEvent | null> => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await donationEventService.startDonation(request);
      const event = handleApiResponse(
        response,
        'Donation process started',
        'Starting donation'
      );

      if (event) {
        setCurrentEvent(event);
        // Refresh event list
        fetchDonationEvents();
      }

      return event;
    } catch (err) {
      console.error('Error starting donation:', err);
      const errorMessage = 'An error occurred while starting the donation';
      message.error(errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // 4a. Complete donation
  const completeDonationProcess = async (request: CompleteDonationRequest): Promise<DonationEvent | null> => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await donationEventService.completeDonation(request);
      const event = handleApiResponse(
        response,
        'Donation completed successfully',
        'Completing donation'
      );

      if (event) {
        setCurrentEvent(event);
        // Refresh event list
        fetchDonationEvents();
      }

      return event;
    } catch (err) {
      console.error('Error completing donation:', err);
      const errorMessage = 'An error occurred while completing the donation';
      message.error(errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // 4b. Record complication
  const recordDonationComplication = async (request: ComplicationRequest): Promise<DonationEvent | null> => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await donationEventService.recordComplication(request);
      const event = handleApiResponse(
        response,
        'Complication recorded',
        'Recording complication'
      );

      if (event) {
        setCurrentEvent(event);
        // Refresh event list
        fetchDonationEvents();
      }

      return event;
    } catch (err) {
      console.error('Error recording complication:', err);
      const errorMessage = 'An error occurred while recording the complication';
      message.error(errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Get donation event by ID
  const getDonationEventById = async (eventId: string): Promise<DonationEvent | null> => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await donationEventService.getDonationEventById(eventId);

      if (response.success && response.data) {
        setCurrentEvent(response.data);
        return response.data;
      } else {
        const errorMessage = response.message || 'Failed to fetch donation event';
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      console.error('Error fetching donation event:', err);
      const errorMessage = 'An error occurred while fetching the donation event';
      setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Find donation event by appointment ID
  const findDonationEventByAppointmentId = async (appointmentId: string): Promise<DonationEvent | null> => {
    try {
      setIsProcessing(true);
      setError(null);

      console.log('Finding donation event by appointment ID:', appointmentId);

      const response = await donationEventService.findDonationEventByAppointmentId(appointmentId);
      console.log('Find donation event API response:', response);

      if (response.success && response.data) {
        console.log('Found donation event:', response.data);
        setCurrentEvent(response.data);
        return response.data;
      } else {
        const errorMessage = response.message || 'Failed to fetch donation event';
        console.error('API returned error:', errorMessage);
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      console.error('Error fetching donation event:', err);
      const errorMessage = 'An error occurred while fetching the donation event';
      setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchDonationEvents();
  }, [user?.id]);

  return {
    events,
    isLoading,
    error,
    pagination,
    refetch: fetchDonationEvents,
    currentEvent,
    setCurrentEvent,
    isProcessing,
    checkInDonor,
    performHealthCheck,
    startDonation: startDonationProcess,
    completeDonation: completeDonationProcess,
    recordComplication: recordDonationComplication,
    getDonationEventById,
    findDonationEventByAppointmentId
  };
} 