import { useQuery } from '@tanstack/react-query';
import * as bloodGroupsService from '@/services/api/bloodGroupsService';
import { toast } from 'react-toastify';

/**
 * React Query hook for fetching blood groups
 * @returns Query result with blood groups data
 */
export function useBloodGroups() {
  return useQuery({
    queryKey: ['bloodGroups'],
    queryFn: async () => {
      try {
        const response = await bloodGroupsService.getBloodGroups();
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch blood groups');
        }
      } catch (error) {
        console.error('Error fetching blood groups:', error);
        throw error;
      }
    },
  });
} 