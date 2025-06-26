'use client';

import { ComponentType, FC } from 'react';
import ProtectedRoute from './ProtectedRoute';

// HOC to wrap any component that requires authentication
export default function withAuth<P extends object>(Component: ComponentType<P>): FC<P> {
  return function WithAuthComponent(props: P) {
    return (
      <ProtectedRoute>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
} 