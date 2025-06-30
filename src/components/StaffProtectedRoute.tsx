'use client';

import { ReactNode } from 'react';
import ProtectedRoute from './ProtectedRoute';

interface StaffProtectedRouteProps {
  children: ReactNode;
}

const StaffProtectedRoute = ({ children }: StaffProtectedRouteProps) => {
  return (
    <ProtectedRoute allowedRoles={['Staff', 'Admin']}>
      {children}
    </ProtectedRoute>
  );
};

export default StaffProtectedRoute; 