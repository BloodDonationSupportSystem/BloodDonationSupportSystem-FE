'use client';

import React, { useState } from 'react';
import { Tabs, Spin, Alert } from 'antd';
import EmergencyRequestsTab from './EmergencyRequestsTab';
import RegularRequestsTab from './RegularRequestsTab';
import { useStaffBloodRequest } from '@/hooks/api/useStaffBloodRequest';

export default function BloodRequestManagement() {
    const [activeKey, setActiveKey] = useState('emergency');
    const {
        loading,
        error,
        regularRequests,
        emergencyRequests,
        checkInventoryForRequest,
        createDonationEventFromInventory,
        createDonationEventNeedingDonor,
        refreshRequests
    } = useStaffBloodRequest();

    // Handle tab change
    const handleTabChange = (key: string) => {
        setActiveKey(key);
    };

    // Display loading or error states
    if (loading && !regularRequests.length && !emergencyRequests.length) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" tip="Loading blood requests..." />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Error Loading Blood Requests"
                description={error}
                type="error"
                showIcon
            />
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <Tabs
                activeKey={activeKey}
                onChange={handleTabChange}
                items={[
                    {
                        key: 'emergency',
                        label: (
                            <span className="text-red-600">
                                🚨 Emergency Requests
                                {emergencyRequests.length > 0 && (
                                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                        {emergencyRequests.length}
                                    </span>
                                )}
                            </span>
                        ),
                        children: (
                            <EmergencyRequestsTab
                                requests={emergencyRequests}
                                loading={loading}
                                checkInventory={checkInventoryForRequest}
                                createFromInventory={createDonationEventFromInventory}
                                createNeedingDonor={createDonationEventNeedingDonor}
                                refreshRequests={refreshRequests}
                            />
                        ),
                    },
                    {
                        key: 'regular',
                        label: (
                            <span>
                                📋 Regular Requests
                                {regularRequests.length > 0 && (
                                    <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                        {regularRequests.length}
                                    </span>
                                )}
                            </span>
                        ),
                        children: (
                            <RegularRequestsTab
                                requests={regularRequests}
                                loading={loading}
                                checkInventory={checkInventoryForRequest}
                                createFromInventory={createDonationEventFromInventory}
                                createNeedingDonor={createDonationEventNeedingDonor}
                                refreshRequests={refreshRequests}
                            />
                        ),
                    },
                ]}
            />
        </div>
    );
} 