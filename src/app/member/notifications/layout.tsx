'use client';

import React from 'react';
import { App } from 'antd';

export default function NotificationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <App>
            {children}
        </App>
    );
} 