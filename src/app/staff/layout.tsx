'use client';

import React from 'react';
import StaffProtectedRoute from '@/components/StaffProtectedRoute';
import StaffSidebar, { SidebarProvider, useSidebar } from '@/components/Layout/StaffSidebar';
import { Layout } from 'antd';
import { StaffNotificationProvider } from '@/context/StaffNotificationContext';
import EmergencyAlert from '@/components/Staff/EmergencyAlert';

const { Content } = Layout;

// Content wrapper that adjusts based on sidebar state
function ContentWrapper({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <Content
      style={{
        marginLeft: collapsed ? '80px' : '260px',
        transition: 'margin-left 0.2s',
        minHeight: '100vh',
        background: '#fff'
      }}
    >
      <div className="p-6">
        <EmergencyAlert />
        {children}
      </div>
    </Content>
  );
}

export default function StaffRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StaffProtectedRoute>
      <SidebarProvider>
        <StaffNotificationProvider>
          <Layout style={{ minHeight: '100vh' }}>
            <StaffSidebar />
            <ContentWrapper>
              {children}
            </ContentWrapper>
          </Layout>
        </StaffNotificationProvider>
      </SidebarProvider>
    </StaffProtectedRoute>
  );
} 