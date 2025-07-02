'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  LoginResponse,
  login as loginService,
  getUser,
  isAuthenticated,
  logout as logoutService,
  setupAuthInterceptor
} from '@/services/api/authService';

export interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  logout: () => void;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<LoginResponse>;
  redirectBasedOnRole: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  loading: true,
  logout: () => { },
  isLoading: true,
  login: async () => ({
    success: false,
    message: 'Login function not implemented',
    statusCode: 500,
    errors: ['Login function not implemented'],
    data: {
      accessToken: '',
      refreshToken: '',
      expiration: '',
      user: {} as User
    },
    count: 0
  }),
  redirectBasedOnRole: () => { }
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isBrowser, setIsBrowser] = useState(false);
  const router = useRouter();

  // Check if we're in the browser
  useEffect(() => {
    setIsBrowser(true);
    setupAuthInterceptor();
  }, []);

  // Check authentication status on initial load - only run on client
  useEffect(() => {
    if (isBrowser) {
      if (isAuthenticated()) {
        const userData = getUser();
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
      setLoading(false);
    }
  }, [isBrowser]);

  const logout = () => {
    if (isBrowser) {
      logoutService();
      setUser(null);
      setIsLoggedIn(false);
      router.push('/login');
    }
  };

  const login = async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await loginService({ userName: username, password });
      if (response.success) {
        setUser(response.data.user);
        setIsLoggedIn(true);

        // Only access localStorage on the client
        if (isBrowser) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          localStorage.setItem('tokenExpiration', response.data.expiration);
        }
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      const errorResponse: LoginResponse = {
        success: false,
        message: 'An error occurred during login',
        statusCode: 500,
        errors: ['Login failed'],
        data: {
          accessToken: '',
          refreshToken: '',
          expiration: '',
          user: {} as User
        },
        count: 0
      };
      return errorResponse;
    }
  };

  const redirectBasedOnRole = () => {
    if (!user) return;

    switch (user.roleName) {
      case 'Admin':
        router.push('/admin');
        break;
      case 'Staff':
        router.push('/staff');
        break;
      default:
        router.push('/');
        break;
    }
  };

  const value = {
    user,
    isLoggedIn,
    loading,
    logout,
    isLoading: loading,
    login,
    redirectBasedOnRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 