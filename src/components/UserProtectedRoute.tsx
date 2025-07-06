'use client';

import { ReactNode } from 'react';
import ProtectedRoute from './ProtectedRoute';

interface UserProtectedRouteProps {
    children: ReactNode;
}

const UserProtectedRoute = ({ children }: UserProtectedRouteProps) => {
    return (
        <ProtectedRoute allowedRoles={['User']}>
            {children}
        </ProtectedRoute>
    );
};

export default UserProtectedRoute; 