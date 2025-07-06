'use client';

import { ReactNode, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, isLoggedIn, checkAccess, redirectBasedOnRole } = useAuth();
  const pathname = usePathname() || '';
  const router = useRouter();

  // Check access rights when route changes
  useEffect(() => {
    if (isLoggedIn && user && pathname) {
      // Skip access check for login and public routes
      if (pathname === '/login' || pathname === '/' || pathname === '/register' || pathname === '/forgot-password') {
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