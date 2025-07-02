import axios from 'axios';

// Helper to check if we're in a browser environment
const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:5222/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Make sure query params are preserved as-is without transforming case
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });
    return searchParams.toString();
  }
});

// Request interceptor for adding auth token
if (isBrowser()) {
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for handling common errors
  apiClient.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle common errors here (e.g., 401 Unauthorized, 403 Forbidden)
      if (error.response) {
        const { status } = error.response;

        if (status === 401) {
          // Handle unauthorized access
          // For example, redirect to login page
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }

      return Promise.reject(error);
    }
  );
}

export default apiClient; 