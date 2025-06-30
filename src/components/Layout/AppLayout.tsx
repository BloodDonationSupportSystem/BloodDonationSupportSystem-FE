'use client';

import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user } = useAuth();
  const pathname = usePathname() || '';
  
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