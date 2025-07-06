'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Spin, Alert, Button, Card } from 'antd';
import { hasAccessToRoute } from '@/utils/roleBasedAccess';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[]; // Array of roles that can access this route
}

const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const { isLoggedIn, loading, user, redirectBasedOnRole, checkAccess } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn && pathname) {
        // Store the current path to redirect back after login
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('redirectAfterLogin', pathname);
        }
        router.push('/login');
        return;
      }

      // First check if user has the appropriate role if roles are specified
      if (isLoggedIn && user && allowedRoles.length > 0) {
        const hasRoleAccess = allowedRoles.includes(user.roleName);

        if (!hasRoleAccess) {
          // Redirect to appropriate dashboard based on role
          redirectBasedOnRole();
          return;
        }
      }

      // Then check if the user has access to the current path
      if (isLoggedIn && user && pathname) {
        // Use hasAccessToRoute directly from utils instead of checkAccess
        const hasRouteAccess = user ? hasAccessToRoute(user, pathname) : false;

        if (!hasRouteAccess) {
          redirectBasedOnRole();
        }
      }
    }
  }, [isLoggedIn, loading, pathname, router, user, allowedRoles, redirectBasedOnRole, checkAccess]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" fullscreen />
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

  // Check for role access if roles are specified
  if (allowedRoles.length > 0 && user) {
    const hasAccess = allowedRoles.includes(user.roleName);

    if (!hasAccess) {
      return (
        <div className="container mx-auto p-4">
          <Card className="max-w-xl mx-auto">
            <div className="text-center space-y-6 py-8">
              <Alert
                message="Access Denied"
                description={`You don't have permission to access this page. This area is restricted to ${allowedRoles.join(', ')} users.`}
                type="error"
                showIcon
                className="mb-6"
              />
              <div className="space-y-4">
                <p className="text-gray-600">
                  You'll be redirected to your dashboard shortly.
                </p>
                <Button
                  type="primary"
                  onClick={() => redirectBasedOnRole()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 