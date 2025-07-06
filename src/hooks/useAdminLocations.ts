import { useState } from 'react';
import {
    Location,
    getAllLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
    CreateLocationRequest,
    UpdateLocationRequest,
    LocationsResponse
} from '@/services/api/locationService';
import { App } from 'antd';

interface LocationsQueryParams {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    isActive?: boolean;
}

export const useAdminLocations = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(10);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

    const { message } = App.useApp();

    const fetchLocations = async (params?: LocationsQueryParams) => {
        setLoading(true);
        setError(null);

        try {
            // In a real implementation, you would pass these parameters to your API
            // For now, we'll just call getAllLocations without parameters
            const response = await getAllLocations();

            if (response.success) {
                setLocations(response.data);
                setTotalCount(response.count);

                // Update pagination info
                if (params?.pageNumber) setPageNumber(params.pageNumber);
                if (params?.pageSize) setPageSize(params.pageSize);

                // Calculate total pages
                const calculatedTotalPages = Math.ceil(response.count / (params?.pageSize || pageSize));
                setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
            } else {
                setError(response.message || 'Failed to fetch locations');
                message.error(response.message || 'Failed to fetch locations');
            }
        } catch (err) {
            console.error('Error fetching locations:', err);
            setError('An error occurred while fetching locations');
            message.error('An error occurred while fetching locations');
        } finally {
            setLoading(false);
        }
    };

    const fetchLocationById = async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await getLocationById(id);

            if (response.success) {
                setSelectedLocation(response.data);
                return response.data;
            } else {
                setError(response.message || 'Failed to fetch location');
                message.error(response.message || 'Failed to fetch location');
                return null;
            }
        } catch (err) {
            console.error('Error fetching location:', err);
            setError('An error occurred while fetching the location');
            message.error('An error occurred while fetching the location');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const addLocation = async (locationData: CreateLocationRequest) => {
        setLoading(true);
        setError(null);

        try {
            const response = await createLocation(locationData);

            if (response.success) {
                message.success('Location created successfully');
                // Refresh the locations list
                await fetchLocations({ pageNumber, pageSize });
                return true;
            } else {
                setError(response.message || 'Failed to create location');
                message.error(response.message || 'Failed to create location');
                return false;
            }
        } catch (err) {
            console.error('Error creating location:', err);
            setError('An error occurred while creating the location');
            message.error('An error occurred while creating the location');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const editLocation = async (id: string, locationData: UpdateLocationRequest) => {
        setLoading(true);
        setError(null);

        try {
            const response = await updateLocation(id, locationData);

            if (response.success) {
                message.success('Location updated successfully');
                // Refresh the locations list
                await fetchLocations({ pageNumber, pageSize });
                return true;
            } else {
                setError(response.message || 'Failed to update location');
                message.error(response.message || 'Failed to update location');
                return false;
            }
        } catch (err) {
            console.error('Error updating location:', err);
            setError('An error occurred while updating the location');
            message.error('An error occurred while updating the location');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const removeLocation = async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await deleteLocation(id);

            if (response.success) {
                message.success('Location deleted successfully');
                // Refresh the locations list
                await fetchLocations({ pageNumber, pageSize });
                return true;
            } else {
                setError(response.message || 'Failed to delete location');
                message.error(response.message || 'Failed to delete location');
                return false;
            }
        } catch (err) {
            console.error('Error deleting location:', err);
            setError('An error occurred while deleting the location');
            message.error('An error occurred while deleting the location');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        locations,
        loading,
        error,
        totalCount,
        pageSize,
        pageNumber,
        totalPages,
        selectedLocation,
        fetchLocations,
        fetchLocationById,
        createLocation: addLocation,
        updateLocation: editLocation,
        deleteLocation: removeLocation,
    };
}; 