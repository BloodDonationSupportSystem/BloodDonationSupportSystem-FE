'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  User, 
  getUser, 
  isAuthenticated, 
  logout as logoutService,
  setupAuthInterceptor
} from '@/services/api/authService';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  loading: true,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Setup auth interceptor
  useEffect(() => {
    setupAuthInterceptor();
  }, []);

  // Check authentication status on initial load and when pathname changes
  useEffect(() => {
    const checkAuth = () => {
      setLoading(true);
      if (isAuthenticated()) {
        const userData = getUser();
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, [pathname]);

  const logout = () => {
    logoutService();
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    isLoggedIn: !!user,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 