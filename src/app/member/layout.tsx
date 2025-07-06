'use client';

import React, { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Layout, Breadcrumb } from 'antd';
import { usePathname } from 'next/navigation';
import MemberSidebar from '@/components/Layout/MemberSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { hasAccessToRoute } from '@/utils/roleBasedAccess';

const { Content } = Layout;

export default function MemberLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname() || '';

  // Generate breadcrumb items based on the current path
  const breadcrumbItems = useMemo(() => {
    const pathSegments = pathname.split('/').filter(Boolean);

    const items = [
      {
        title: 'Home',
        href: '/',
      },
    ];

    let breadcrumbPath = '';

    pathSegments.forEach((segment, index) => {
      breadcrumbPath += `/${segment}`;

      // Format segment for display (capitalize, replace hyphens with spaces)
      const formattedSegment = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Add segment to breadcrumb
      items.push({
        title: formattedSegment,
        href: breadcrumbPath,
      });
    });

    return items;
  }, [pathname]);

  return (
    <ProtectedRoute allowedRoles={['Member', 'Donor']}>
      <Layout className="min-h-screen">
        <MemberSidebar />
        <Layout className="site-layout">
          <Content className="bg-gray-50 p-6 overflow-auto">
            <div className="container mx-auto max-w-6xl">
              <Breadcrumb
                items={breadcrumbItems}
                className="mb-6 bg-white p-3 rounded shadow-sm"
              />
              <div className="bg-white p-6 rounded-lg shadow-sm">
                {children}
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    </ProtectedRoute>
  );
} 