'use client';

import '@ant-design/v5-patch-for-react-19';
import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { store } from '@/store';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import 'react-toastify/dist/ReactToastify.css';
import ThemeProvider from '@/theme/ThemeProvider';
import { App } from 'antd';

// Create a client
const queryClient = new QueryClient();

// Component to ensure scroll position is reset when navigating
const ScrollToTop = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top when path changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return <>{children}</>;
};

// This component will handle automatic redirects based on user role
const RoleBasedRedirect = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only check on the home page and only after loading is complete
    if (!loading && isLoggedIn && pathname === '/') {
      // Redirect based on role
      if (user) {
        switch (user.roleName) {
          case 'Admin':
            router.push('/admin');
            break;
          case 'Staff':
            router.push('/staff');
            break;
          default:
            // Leave on homepage for other roles or no role
            break;
        }
      }
    }
  }, [isLoggedIn, loading, user, pathname, router]);

  return <>{children}</>;
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App>
          <AuthProvider>
            <ThemeProvider>
              <ScrollToTop>
                <RoleBasedRedirect>
                  {children}
                  <ToastContainer position="top-right" autoClose={5000} />
                </RoleBasedRedirect>
              </ScrollToTop>
            </ThemeProvider>
          </AuthProvider>
        </App>
      </QueryClientProvider>
    </Provider>
  );
} 