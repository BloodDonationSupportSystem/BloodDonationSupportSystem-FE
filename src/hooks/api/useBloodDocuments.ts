import { useQuery } from '@tanstack/react-query';
import * as documentsService from '@/services/api/documentsService';
import { toast } from 'react-toastify';

/**
 * React Query hook for fetching blood documents (both blood types and component types)
 * @returns Query result with blood documents data
 */
export function useBloodDocuments() {
  return useQuery({
    queryKey: ['bloodDocuments'],
    queryFn: async () => {
      try {
        const response = await documentsService.getAllDocuments();
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch documents');
        }
      } catch (error) {
        console.error('Error fetching blood documents:', error);
        throw error;
      }
    },
  });
} 