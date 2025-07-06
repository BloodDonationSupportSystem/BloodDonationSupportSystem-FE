'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';

export default function StaffPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/staff/dashboard');
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <Spin size="large" tip="Redirecting to dashboard..." />
    </div>
  );
} 