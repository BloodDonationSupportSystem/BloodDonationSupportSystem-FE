'use client';

import React from 'react';
import { ConfigProvider } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';

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
    <StyleProvider hashPriority="high">
      <ConfigProvider theme={theme}>
        {children}
      </ConfigProvider>
    </StyleProvider>
  );
} 