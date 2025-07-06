'use client';

import { ComponentType, FC } from 'react';
import ProtectedRoute from './ProtectedRoute';

// HOC to wrap any component that requires specific role access
export default function withRoleAccess<P extends object>(
    Component: ComponentType<P>,
    allowedRoles: string[]
): FC<P> {
    return function WithRoleAccessComponent(props: P) {
        return (
            <ProtectedRoute allowedRoles={allowedRoles}>
                <Component {...props} />
            </ProtectedRoute>
        );
    };
} 