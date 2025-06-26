'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Layout, Spin, Breadcrumb } from 'antd';
import { useEffect } from 'react';
import MemberSidebar from '@/components/Layout/MemberSidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeOutlined } from '@ant-design/icons';

const { Content } = Layout;

export default function MemberLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);

  // Generate breadcrumb items based on the current path
  const generateBreadcrumb = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    
    const breadcrumbItems = [
      {
        title: <Link href="/"><HomeOutlined /></Link>,
      }
    ];

    let breadcrumbPath = '';
    
    pathSegments.forEach((segment, index) => {
      breadcrumbPath += `/${segment}`;
      
      // Format the segment for display (capitalize and replace hyphens with spaces)
      const formattedSegment = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbItems.push({
        title: index === pathSegments.length - 1 ? 
          <span>{formattedSegment}</span> : 
          <Link href={breadcrumbPath}>{formattedSegment}</Link>,
      });
    });
    
    return breadcrumbItems;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // If not logged in (and redirecting), don't render the content
  if (!isLoggedIn) {
    return null;
  }

  return (
    <Layout className="min-h-screen">
      <MemberSidebar />
      <Layout className="site-layout">
        <Content className="bg-gray-50 p-6">
          <div className="container mx-auto max-w-6xl">
            <Breadcrumb 
              items={generateBreadcrumb()}
              className="mb-6 bg-white p-3 rounded shadow-sm"
            />
            <div className="bg-white p-6 rounded-lg shadow-sm">
              {children}
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
} 