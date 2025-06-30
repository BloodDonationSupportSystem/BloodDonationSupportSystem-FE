import { useState, useEffect, useCallback } from 'react';
import { locationService } from '@/services/api';
import { 
  Location, 
  Capacity, 
  CreateCapacityRequest, 
  UpdateCapacityRequest,
  CreateMultipleCapacitiesRequest,
  getAllLocations,
  getLocationById,
  getLocationCapacities
} from '@/services/api/locationService';
import { message } from 'antd';

// Interface for location with distance
export interface LocationWithDistance extends Location {
  distance?: number; // Distance in kilometers
}

// Function to calculate distance between two points using Haversine formula
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return parseFloat(distance.toFixed(2)); // Round to 2 decimal places
}

interface UseLocationsReturn {
  locations: LocationWithDistance[];
  isLoading: boolean;
  error: string | null;
  fetchLocations: () => Promise<void>;
  getLocationById: (id: string) => LocationWithDistance | undefined;
  sortLocationsByDistance: (userLat: number, userLng: number) => void;
  userCoordinates: { latitude: number | null, longitude: number | null };
  isGettingUserLocation: boolean;
  getUserLocation: () => Promise<void>;
  getLocationCapacities: (locationId: string) => Promise<Capacity[] | null>;
}

export function useLocations(): UseLocationsReturn {
  const [locations, setLocations] = useState<LocationWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCoordinates, setUserCoordinates] = useState<{
    latitude: number | null,
    longitude: number | null
  }>({
    latitude: null,
    longitude: null
  });
  const [isGettingUserLocation, setIsGettingUserLocation] = useState(false);

  const getUserLocation = async (): Promise<void> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    try {
      setIsGettingUserLocation(true);
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      setUserCoordinates({ latitude, longitude });

      // Update locations with distance information
      setLocations(prevLocations => 
        prevLocations.map(location => ({
          ...location,
          distance: calculateDistance(
            latitude,
            longitude,
            parseFloat(location.latitude || '0'),
            parseFloat(location.longitude || '0')
          )
        }))
        // Sort by distance
        .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
      );
    } catch (error) {
      console.error('Error getting user location:', error);
      setError('Unable to retrieve your location');
    } finally {
      setIsGettingUserLocation(false);
    }
  };

  const sortLocationsByDistance = useCallback((userLat: number, userLng: number) => {
    const locationsWithDistance = locations.map(location => {
      const lat = parseFloat(location.latitude);
      const lng = parseFloat(location.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        return { ...location, distance: Infinity };
      }
      
      const distance = calculateDistance(userLat, userLng, lat, lng);
      return { ...location, distance };
    });

    // Sort by distance (ascending)
    const sortedLocations = [...locationsWithDistance].sort((a, b) => {
      return (a.distance || Infinity) - (b.distance || Infinity);
    });

    setLocations(sortedLocations);
  }, [locations]);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getAllLocations();
      
      if (response.success && response.data) {
        const fetchedLocations = response.data as LocationWithDistance[];
        
        // If we have user coordinates, calculate distances
        if (userCoordinates.latitude && userCoordinates.longitude) {
          const locationsWithDistance = fetchedLocations.map(location => {
            const lat = parseFloat(location.latitude);
            const lng = parseFloat(location.longitude);
            
            if (isNaN(lat) || isNaN(lng)) {
              return { ...location, distance: Infinity };
            }
            
            const distance = calculateDistance(
              userCoordinates.latitude!, 
              userCoordinates.longitude!, 
              lat, 
              lng
            );
            return { ...location, distance };
          });
          
          // Sort by distance (ascending)
          const sortedLocations = [...locationsWithDistance].sort((a, b) => {
            return (a.distance || Infinity) - (b.distance || Infinity);
          });
          
          setLocations(sortedLocations);
        } else {
          setLocations(fetchedLocations);
        }
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

  const getLocationById = (id: string): LocationWithDistance | undefined => {
    return locations.find(location => location.id === id);
  };

  const findLocationById = (id: string): Location | undefined => {
    return locations.find(location => location.id === id);
  };
  
  const fetchLocationById = async (locationId: string): Promise<Location | null> => {
    try {
      const response = await getLocationById(locationId);
      
      // Cast response to expected API response type
      const apiResponse = response as unknown as {
        success: boolean;
        message: string;
        data: Location;
      };
      
      if (apiResponse && apiResponse.success && apiResponse.data) {
        return apiResponse.data;
      } else {
        setError((apiResponse?.message || 'Failed to load location details'));
        return null;
      }
    } catch (err) {
      console.error('Error fetching location details:', err);
      setError('An error occurred while fetching location details');
      return null;
    }
  };

  const fetchLocationCapacities = async (locationId: string): Promise<Capacity[] | null> => {
    try {
      const response = await getLocationCapacities(locationId);
      
      // Cast response to expected API response type
      const apiResponse = response as unknown as {
        success: boolean;
        message: string;
        data: Capacity[];
      };
      
      if (apiResponse && apiResponse.success && apiResponse.data) {
        return apiResponse.data;
      } else {
        setError(apiResponse?.message || 'Failed to load location capacities');
        return null;
      }
    } catch (err) {
      console.error('Error fetching location capacities:', err);
      setError('An error occurred while fetching location capacities');
      return null;
    }
  };

  // Fetch locations on mount
  useEffect(() => {
    fetchLocations();
    // Try to get user's location
    getUserLocation();
  }, []);

  return {
    locations,
    isLoading,
    error,
    fetchLocations,
    getLocationById,
    sortLocationsByDistance,
    userCoordinates,
    isGettingUserLocation,
    getUserLocation,
    getLocationCapacities: useCallback(fetchLocationCapacities, [])
  };
}

interface UseLocationCapacitiesReturn {
  capacities: Capacity[];
  isLoading: boolean;
  error: string | null;
  fetchCapacities: (locationId: string) => Promise<Capacity[]>;
  createCapacity: (locationId: string, data: CreateCapacityRequest) => Promise<boolean>;
  createMultipleCapacities: (locationId: string, data: CreateMultipleCapacitiesRequest) => Promise<boolean>;
  updateCapacity: (locationId: string, capacityId: string, data: UpdateCapacityRequest) => Promise<boolean>;
  deleteCapacity: (locationId: string, capacityId: string) => Promise<boolean>;
}

export function useLocationCapacities(): UseLocationCapacitiesReturn {
  const [capacities, setCapacities] = useState<Capacity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCapacities = useCallback(async (locationId: string): Promise<Capacity[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await locationService.getLocationCapacities(locationId);
      
      if (response.success && response.data) {
        setCapacities(response.data);
        return response.data;
      } else {
        setError(response.message || 'Failed to load capacities');
        return [];
      }
    } catch (err) {
      console.error('Error fetching capacities:', err);
      setError('An error occurred while fetching capacities');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCapacity = async (locationId: string, data: CreateCapacityRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await locationService.createLocationCapacity(locationId, data);
      
      if (response.success) {
        // Refresh capacities after successful creation
        await fetchCapacities(locationId);
        return true;
      } else {
        setError(response.message || 'Failed to create capacity');
        return false;
      }
    } catch (err) {
      console.error('Error creating capacity:', err);
      setError('An error occurred while creating capacity');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createMultipleCapacities = async (locationId: string, data: CreateMultipleCapacitiesRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await locationService.createMultipleLocationCapacities(locationId, data);
      
      if (response.success) {
        // Refresh capacities after successful creation
        await fetchCapacities(locationId);
        return true;
      } else {
        setError(response.message || 'Failed to create multiple capacities');
        return false;
      }
    } catch (err) {
      console.error('Error creating multiple capacities:', err);
      setError('An error occurred while creating multiple capacities');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCapacity = async (locationId: string, capacityId: string, data: UpdateCapacityRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await locationService.updateLocationCapacity(locationId, capacityId, data);
      
      if (response.success) {
        // Refresh capacities after successful update
        await fetchCapacities(locationId);
        return true;
      } else {
        setError(response.message || 'Failed to update capacity');
        return false;
      }
    } catch (err) {
      console.error('Error updating capacity:', err);
      setError('An error occurred while updating capacity');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCapacity = async (locationId: string, capacityId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await locationService.deleteLocationCapacity(locationId, capacityId);
      
      if (response.success) {
        // Refresh capacities after successful deletion
        await fetchCapacities(locationId);
        return true;
      } else {
        setError(response.message || 'Failed to delete capacity');
        return false;
      }
    } catch (err) {
      console.error('Error deleting capacity:', err);
      setError('An error occurred while deleting capacity');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    capacities,
    isLoading,
    error,
    fetchCapacities,
    createCapacity,
    createMultipleCapacities,
    updateCapacity,
    deleteCapacity
  };
} 