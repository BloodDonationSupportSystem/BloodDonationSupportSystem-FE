'use client';

import React from 'react';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import AdminSidebar from '@/components/Layout/AdminSidebar';
import { Layout } from 'antd';

const { Content } = Layout;

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtectedRoute>
      <Layout style={{ minHeight: '100vh' }}>
        <AdminSidebar />
        {children}
      </Layout>
    </AdminProtectedRoute>
  );
} 