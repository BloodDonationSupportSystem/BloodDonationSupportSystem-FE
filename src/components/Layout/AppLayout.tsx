'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '@/context/AuthContext';
import { isPublicRoute } from '@/utils/roleBasedAccess';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, isLoggedIn, checkAccess, redirectBasedOnRole } = useAuth();
  const pathname = usePathname() || '';
  const router = useRouter();

  // Check access rights when route changes
  useEffect(() => {
    if (isLoggedIn && user && pathname) {
      // Skip access check for login, public routes, and member routes for members
      if (isPublicRoute(pathname)) {
        return;
      }

      const hasAccess = checkAccess(pathname);
      if (!hasAccess) {
        redirectBasedOnRole();
      }
    }
  }, [pathname, isLoggedIn, user, checkAccess, redirectBasedOnRole]);

  // Check if current path is admin or staff route
  const isAdminRoute = pathname.startsWith('/admin');
  const isStaffRoute = pathname.startsWith('/staff');

  // Don't show header and footer for admin and staff routes
  if (isAdminRoute || isStaffRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default AppLayout; 