'use client';

import { ReactNode } from 'react';
import ProtectedRoute from './ProtectedRoute';

interface DonorProtectedRouteProps {
    children: ReactNode;
}

// Renamed to MemberProtectedRoute but keeping the file name for compatibility
const DonorProtectedRoute = ({ children }: DonorProtectedRouteProps) => {
    return (
        <ProtectedRoute allowedRoles={['Member']}>
            {children}
        </ProtectedRoute>
    );
};

export default DonorProtectedRoute; 