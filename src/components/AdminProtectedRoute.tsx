'use client';

import { ReactNode } from 'react';
import ProtectedRoute from './ProtectedRoute';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      {children}
    </ProtectedRoute>
  );
};

export default AdminProtectedRoute; 