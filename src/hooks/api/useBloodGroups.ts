import { useState, useEffect } from 'react';
import { bloodGroupsService, BloodGroup } from '@/services/api';

interface UseBloodGroupsReturn {
  bloodGroups: BloodGroup[];
  isLoading: boolean;
  error: string | null;
  fetchBloodGroups: () => Promise<void>;
}

export function useBloodGroups(): UseBloodGroupsReturn {
  const [bloodGroups, setBloodGroups] = useState<BloodGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBloodGroups = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await bloodGroupsService.getBloodGroups();
      
      if (response.success && response.data) {
        setBloodGroups(response.data);
      } else {
        setError(response.message || 'Failed to load blood groups');
      }
    } catch (err) {
      console.error('Error fetching blood groups:', err);
      setError('An error occurred while fetching blood groups');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBloodGroups();
  }, []);

  return {
    bloodGroups,
    isLoading,
    error,
    fetchBloodGroups
  };
} 