'use client';

import { ReactNode } from 'react';
import ProtectedRoute from './ProtectedRoute';

interface DonorProtectedRouteProps {
    children: ReactNode;
}

const DonorProtectedRoute = ({ children }: DonorProtectedRouteProps) => {
    return (
        <ProtectedRoute allowedRoles={['Donor']}>
            {children}
        </ProtectedRoute>
    );
};

export default DonorProtectedRoute; 