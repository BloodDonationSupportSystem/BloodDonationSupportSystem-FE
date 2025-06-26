'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Spin, Alert, Button, Card } from 'antd';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isLoggedIn && pathname) {
      // Store the current path to redirect back after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', pathname);
      }
    }
  }, [isLoggedIn, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto p-4">
        <Card className="max-w-xl mx-auto">
          <div className="text-center space-y-6 py-8">
            <Alert
              message="Authentication Required"
              description="You need to be logged in to access this page."
              type="info"
              showIcon
              className="mb-6"
            />
            <div className="space-y-4">
              <p className="text-gray-600">
                Please log in to your account to access blood donation services.
              </p>
              <div className="space-x-4">
                <Button 
                  type="primary" 
                  onClick={() => router.push('/login')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Log In
                </Button>
                <Button onClick={() => router.push('/register')}>
                  Register
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 