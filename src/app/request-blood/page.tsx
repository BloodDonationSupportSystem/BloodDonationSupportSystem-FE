'use client';

import React, { useState } from 'react';
import { Tabs, Typography, Card, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import RegularBloodRequestForm from '@/components/BloodRequest/RegularBloodRequestForm';
import EmergencyBloodRequestForm from '@/components/BloodRequest/EmergencyBloodRequestForm';
import styles from './page.module.css';

const { Title } = Typography;
const { TabPane } = Tabs;

export default function RequestBloodPage() {
    const [activeTab, setActiveTab] = useState('regular');

    const handleTabChange = (key: string) => {
        setActiveTab(key);
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <Breadcrumb className="mb-6">
                <Breadcrumb.Item>
                    <Link href="/">
                        <HomeOutlined /> Home
                    </Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>Request Blood</Breadcrumb.Item>
            </Breadcrumb>

            <div className="text-center mb-8">
                <Title level={2} className="text-red-600">Request Blood</Title>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Fill out the form below to request blood. For emergency requests, please use the Emergency tab.
                </p>
            </div>

            <Card className="shadow-md">
                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    type="card"
                    className={styles.bloodRequestTabs}
                    items={[
                        {
                            key: 'regular',
                            label: <span className={styles.regularTab}>Regular Request</span>,
                            children: <RegularBloodRequestForm />
                        },
                        {
                            key: 'emergency',
                            label: <span className={styles.emergencyTab}>Emergency Request</span>,
                            children: <EmergencyBloodRequestForm />
                        }
                    ]}
                />
            </Card>
        </div>
    );
} 