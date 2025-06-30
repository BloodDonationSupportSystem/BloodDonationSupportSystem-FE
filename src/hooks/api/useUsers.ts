import { useCallback, useEffect, useState } from "react";
import * as userService from "@/services/api/userService";
import { User, Staff, RegisterStaffWithLocationRequest, RegisterResponse, ApiResponse } from "@/services/api/userService";

export function useMembers() {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getMembers();
      if (response.success) {
        setMembers(response.data);
        setCount(response.count);
      } else {
        setError(response.message || "Failed to fetch members");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching members");
      console.error("Error fetching members:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    loading,
    error,
    count,
    refresh: fetchMembers
  };
}

export function useStaffs() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const fetchStaffs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getStaffs();
      if (response.success) {
        setStaffs(response.data);
        setCount(response.count);
      } else {
        setError(response.message || "Failed to fetch staffs");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching staffs");
      console.error("Error fetching staffs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  return {
    staffs,
    loading,
    error,
    count,
    refresh: fetchStaffs
  };
}

export function useStaffById(userId: string) {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaffById = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getStaffById(userId);
      
      if (response.success) {
        setStaff(response.data);
      } else {
        setError(response.message || "Failed to fetch staff details");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching staff details");
      console.error("Error fetching staff details:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStaffById();
  }, [fetchStaffById]);

  return {
    staff,
    loading,
    error,
    refresh: fetchStaffById
  };
}

export function useRegisterStaff() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const registerStaff = async (data: RegisterStaffWithLocationRequest) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await userService.registerStaffWithLocation(data);
      
      if (response.success) {
        setSuccess(true);
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.errors?.join(', ') || response.message || 'Failed to register staff';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while registering staff';
      setError(errorMessage);
      console.error("Error registering staff:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    registerStaff,
    loading,
    error,
    success
  };
}

export function useActivateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activateUser = async (userId: string, isActivated: boolean) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userService.activateUser(userId, isActivated);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.errors?.join(', ') || response.message || 'Failed to update activation status';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while updating activation status';
      setError(errorMessage);
      console.error("Error updating activation status:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    activateUser,
    loading,
    error
  };
} 