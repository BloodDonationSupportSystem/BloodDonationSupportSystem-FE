import { useState, useEffect } from 'react';
import { locationService, Location } from '@/services/api';

interface UseLocationsReturn {
  locations: Location[];
  isLoading: boolean;
  error: string | null;
  fetchLocations: () => Promise<void>;
  getLocationById: (id: string) => Location | undefined;
}

export function useLocations(): UseLocationsReturn {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await locationService.getAllLocations();
      
      if (response.success && response.data) {
        setLocations(response.data);
      } else {
        setError(response.message || 'Failed to load locations');
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('An error occurred while fetching locations');
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationById = (id: string): Location | undefined => {
    return locations.find(location => location.id === id);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return {
    locations,
    isLoading,
    error,
    fetchLocations,
    getLocationById
  };
} 