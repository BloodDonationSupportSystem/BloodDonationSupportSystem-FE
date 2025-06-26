import { useState, useEffect } from 'react';
import * as donorProfileService from '@/services/api/donorProfileService';
import { DonorProfileUpdateRequest, DonorProfile, EligibilityResponse } from '@/services/api/donorProfileService';
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
        setError(response.message || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('An error occurred while fetching your profile');
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
    } catch (err) {
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
    } catch (err) {
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