'use client';

import React from 'react';
import { ConfigProvider } from 'antd';

const theme = {
  token: {
    colorPrimary: '#dc2626', // red-600
    colorLink: '#dc2626',
    borderRadius: 6,
  },
  components: {
    Button: {
      colorPrimary: '#dc2626',
      algorithm: true,
    },
  },
};

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider theme={theme}>
      {children}
    </ConfigProvider>
  );
} 