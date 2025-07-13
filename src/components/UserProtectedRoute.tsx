'use client';

import { ReactNode } from 'react';
import ProtectedRoute from './ProtectedRoute';

interface UserProtectedRouteProps {
    children: ReactNode;
}

// Renamed to MemberProtectedRoute but keeping the file name for compatibility
const UserProtectedRoute = ({ children }: UserProtectedRouteProps) => {
    return (
        <ProtectedRoute allowedRoles={['Member']}>
            {children}
        </ProtectedRoute>
    );
};

export default UserProtectedRoute; 