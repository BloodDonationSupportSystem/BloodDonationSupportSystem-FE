import axios from 'axios';

const API_URL = 'http://localhost:5222/api/Auth';

// Types
export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface User {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  lastLogin: string;
  roleId: string;
  roleName: string;
  isEmailVerified: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
  data?: any;
  count: number;
}

export interface LoginResponse extends AuthResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    expiration: string;
    user: User;
  };
}

export interface RegisterResponse extends AuthResponse {
  data: User;
}

// API functions
export const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as AuthResponse;
    }
    throw error;
  }
};

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as AuthResponse;
    }
    throw error;
  }
};

// Save and retrieve auth tokens
export const saveAuthTokens = (accessToken: string, refreshToken: string, expiration: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('tokenExpiration', expiration);
};

export const saveUserData = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const getUser = (): User | null => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;
  
  const expiration = localStorage.getItem('tokenExpiration');
  if (!expiration) return false;
  
  return new Date(expiration) > new Date();
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiration');
  localStorage.removeItem('user');
};

// Initialize axios interceptors for auth
export const setupAuthInterceptor = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}; 