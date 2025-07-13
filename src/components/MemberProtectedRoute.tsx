'use client';

import { ReactNode } from 'react';
import ProtectedRoute from './ProtectedRoute';

interface MemberProtectedRouteProps {
    children: ReactNode;
}

/**
 * Protected route component for Member users
 * This component should be used for all member routes
 */
const MemberProtectedRoute = ({ children }: MemberProtectedRouteProps) => {
    return (
        <ProtectedRoute allowedRoles={['Member']}>
            {children}
        </ProtectedRoute>
    );
};

export default MemberProtectedRoute; 