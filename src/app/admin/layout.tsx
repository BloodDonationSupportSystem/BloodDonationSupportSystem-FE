'use client';

import React from 'react';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import AdminSidebar, { AdminSidebarProvider, useAdminSidebar } from '@/components/Layout/AdminSidebar';
import { Layout } from 'antd';

const { Content } = Layout;

// Content wrapper that adjusts based on sidebar state
function ContentWrapper({ children }: { children: React.ReactNode }) {
  const { collapsed } = useAdminSidebar();

  return (
    <Content
      style={{
        marginLeft: collapsed ? '80px' : '260px',
        transition: 'margin-left 0.2s',
        minHeight: '100vh',
        background: '#fff',
        padding: 0
      }}
    >
      {children}
    </Content>
  );
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtectedRoute>
      <AdminSidebarProvider>
        <Layout style={{ minHeight: '100vh' }}>
          <AdminSidebar />
          <ContentWrapper>
            {children}
          </ContentWrapper>
        </Layout>
      </AdminSidebarProvider>
    </AdminProtectedRoute>
  );
} 