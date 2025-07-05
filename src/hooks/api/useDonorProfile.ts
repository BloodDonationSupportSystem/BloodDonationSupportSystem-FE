import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as donorProfileService from '@/services/api/donorProfileService';
import { DonorProfileUpdateRequest, DonorProfile, EligibilityResponse, DonorProfilesQueryParams } from '@/services/api/donorProfileService';
import { useAuth } from '@/context/AuthContext';

interface UseDonorProfileReturn {
  profile: DonorProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (data: DonorProfileUpdateRequest) => Promise<boolean>;
  isUpdating: boolean;
  eligibility: EligibilityResponse | null;
  isCheckingEligibility: boolean;
  checkEligibility: () => Promise<EligibilityResponse | null>;
}

export function useDonorProfile(): UseDonorProfileReturn {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

  const fetchDonorProfile = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await donorProfileService.getDonorProfile(user.id);

      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        // Check if it's a 404 error (profile not found)
        if (response.statusCode === 404) {
          // For 404, we just set profile to null but don't set an error
          setProfile(null);
        } else {
          setError(response.message || 'Failed to load profile');
        }
      }
    } catch (err: unknown) {
      console.error('Error fetching profile:', err);
      // Check if it's an Axios error with a 404 status
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        // For 404, we just set profile to null but don't set an error
        setProfile(null);
      } else {
        setError('An error occurred while fetching your profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: DonorProfileUpdateRequest): Promise<boolean> => {
    if (!profile?.id) return false;

    setIsUpdating(true);

    try {
      const response = await donorProfileService.updateDonorProfile(profile.id, data);

      if (response.success) {
        // Refetch the profile to get updated data
        await fetchDonorProfile();
        return true;
      } else {
        setError(response.message || 'Failed to update profile');
        return false;
      }
    } catch (err: unknown) {
      console.error('Error updating profile:', err);
      setError('An error occurred while updating your profile');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const checkEligibility = async (): Promise<EligibilityResponse | null> => {
    if (!user?.id) return null;

    setIsCheckingEligibility(true);

    try {
      const response = await donorProfileService.checkEligibility(user.id);

      if (response.success && response.data) {
        setEligibility(response.data);
        return response.data;
      } else {
        setError(response.message || 'Failed to check eligibility');
        return null;
      }
    } catch (err: unknown) {
      console.error('Error checking eligibility:', err);
      setError('An error occurred while checking your eligibility');
      return null;
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  useEffect(() => {
    fetchDonorProfile();
  }, [user?.id]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchDonorProfile,
    updateProfile,
    isUpdating,
    eligibility,
    isCheckingEligibility,
    checkEligibility
  };
}

interface UseAllDonorsReturn {
  donors: DonorProfile[];
  filteredDonors: DonorProfile[];
  isLoading: boolean;
  error: string | null;
  fetchDonors: () => Promise<void>;
  filterDonorsByBloodGroup: (bloodGroupId: string) => Promise<void>;
  resetFilter: () => void;
}

export function useAllDonors(): UseAllDonorsReturn {
  const [donors, setDonors] = useState<DonorProfile[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<DonorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDonors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await donorProfileService.getAllDonorProfiles();

      if (response.success && response.data) {
        setDonors(response.data);
        setFilteredDonors(response.data);
      } else {
        setError(response.message || 'Failed to load donor profiles');
      }
    } catch (err: unknown) {
      console.error('Error fetching donor profiles:', err);
      setError('An error occurred while fetching donor profiles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterDonorsByBloodGroup = useCallback(async (bloodGroupId: string) => {
    if (!bloodGroupId) {
      setFilteredDonors(donors);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await donorProfileService.getDonorProfilesByBloodGroup(bloodGroupId);

      if (response.success && response.data) {
        setFilteredDonors(response.data);
      } else {
        setError(response.message || 'Failed to filter donors by blood group');
        // Keep the current filtered list if there's an error
      }
    } catch (err: unknown) {
      console.error('Error filtering donors by blood group:', err);
      setError('An error occurred while filtering donors');
    } finally {
      setIsLoading(false);
    }
  }, [donors]);

  const resetFilter = useCallback(() => {
    setFilteredDonors(donors);
  }, [donors]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  return {
    donors,
    filteredDonors,
    isLoading,
    error,
    fetchDonors,
    filterDonorsByBloodGroup,
    resetFilter
  };
}

interface PaginatedDonorsResult {
  donors: DonorProfile[];
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
  fetchDonors: (params?: DonorProfilesQueryParams) => Promise<void>;
}

export function usePaginatedDonors(initialParams?: DonorProfilesQueryParams): PaginatedDonorsResult {
  const [donors, setDonors] = useState<DonorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: initialParams?.pageNumber || 1,
    pageSize: initialParams?.pageSize || 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchDonors = useCallback(async (params?: DonorProfilesQueryParams) => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams: DonorProfilesQueryParams = {
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
        ...initialParams,
        ...params
      };

      // Update current page if specifically requested in params
      if (params?.pageNumber) {
        setPagination(prev => ({
          ...prev,
          current: params.pageNumber || prev.current
        }));
      }

      console.log('Fetching donors with params:', queryParams);

      const response = await donorProfileService.getDonorProfilesPaginated(queryParams);

      if (response.success && response.data) {
        setDonors(response.data);
        setPagination({
          current: response.pageNumber || 1,
          pageSize: response.pageSize || 10,
          total: response.totalCount || 0,
          totalPages: response.totalPages || 0,
          hasNext: response.hasNextPage || false,
          hasPrev: response.hasPreviousPage || false
        });
      } else {
        setError(response.message || 'Failed to load donor profiles');
      }
    } catch (err) {
      console.error('Error fetching paginated donor profiles:', err);
      setError('An error occurred while fetching donor profiles');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.current, pagination.pageSize, initialParams]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  return {
    donors,
    isLoading,
    error,
    pagination,
    fetchDonors
  };
} 