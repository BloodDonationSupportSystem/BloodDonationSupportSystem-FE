'use client';

import '@ant-design/v5-patch-for-react-19';
import React from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { store } from '@/store';
import { AuthProvider } from '@/context/AuthContext';
import 'react-toastify/dist/ReactToastify.css';

// Create a client
const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <ToastContainer position="top-right" autoClose={5000} />
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
} 