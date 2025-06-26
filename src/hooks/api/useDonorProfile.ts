import { useState, useEffect } from 'react';
import * as donorProfileService from '@/services/api/donorProfileService';
import { DonorProfileUpdateRequest, DonorProfile } from '@/services/api/donorProfileService';
import { useAuth } from '@/context/AuthContext';

interface UseDonorProfileReturn {
  profile: DonorProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (data: DonorProfileUpdateRequest) => Promise<boolean>;
  isUpdating: boolean;
}

export function useDonorProfile(): UseDonorProfileReturn {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchDonorProfile();
  }, [user?.id]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchDonorProfile,
    updateProfile,
    isUpdating
  };
} 