'use client';

import React from 'react';
import { Layout } from 'antd';
import Header from './Header';
import Footer from './Footer';
import { usePathname } from 'next/navigation';

const { Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  
  // Kiểm tra nếu đang ở trang login hoặc register
  const isAuthPage = pathname === '/login' || pathname === '/register';
  
  // Nếu đang ở trang login hoặc register, chỉ hiển thị nội dung
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  // Ngược lại, hiển thị đầy đủ layout với Header và Footer
  return (
    <Layout className="min-h-screen flex flex-col">
      <Header />
      <Content className="flex-grow">
        {children}
      </Content>
      <Footer />
    </Layout>
  );
} 