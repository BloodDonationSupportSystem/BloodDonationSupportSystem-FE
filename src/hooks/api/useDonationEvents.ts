import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import * as donationEventService from '@/services/api/donationEventService';
import { DonationEvent, DonationEventsParams } from '@/services/api/donationEventService';

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
}

export function useDonationEvents(initialParams?: DonationEventsParams): UseDonationEventsReturn {
  const { user } = useAuth();
  const [events, setEvents] = useState<DonationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const fetchDonationEvents = async (queryParams?: DonationEventsParams) => {
    if (!user?.id) {
      setIsLoading(false);
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

  useEffect(() => {
    fetchDonationEvents();
  }, [user?.id]);

  return {
    events,
    isLoading,
    error,
    pagination,
    refetch: fetchDonationEvents
  };
} 