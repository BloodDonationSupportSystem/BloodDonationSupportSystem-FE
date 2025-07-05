'use client';

import React, { useState } from 'react';
import { Tabs, Spin, Alert } from 'antd';
import EmergencyRequestsTab from './EmergencyRequestsTab';
import RegularRequestsTab from './RegularRequestsTab';
import { useStaffBloodRequest } from '@/hooks/api/useStaffBloodRequest';
import { useAuth } from '@/context/AuthContext';
import { fulfillFromInventory } from '@/services/api/bloodRequestService';

export default function BloodRequestManagement() {
    const { user } = useAuth();
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

    // Wrapper for createFromInventory that includes fulfillFromInventory call
    const handleCreateFromInventory = async (requestId: string, locationId: string, notes?: string, staffId?: string) => {
        if (!staffId && user?.id) {
            staffId = user.id;
        }

        try {
            // First call the fulfillFromInventory API
            const fulfillResponse = await fulfillFromInventory(requestId, staffId || '', notes);

            if (!fulfillResponse.success) {
                throw new Error('Failed to fulfill from inventory');
            }

            // Then create the donation event
            return await createDonationEventFromInventory(requestId, locationId, notes);
        } catch (error) {
            console.error('Error in handleCreateFromInventory:', error);
            return false;
        }
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
        <Tabs activeKey={activeKey} onChange={handleTabChange} type="card">
            <Tabs.TabPane tab="Emergency Requests" key="emergency">
                <EmergencyRequestsTab
                    requests={emergencyRequests}
                    loading={loading}
                    checkInventory={checkInventoryForRequest}
                    createFromInventory={handleCreateFromInventory}
                    createNeedingDonor={createDonationEventNeedingDonor}
                    refreshRequests={refreshRequests}
                />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Regular Requests" key="regular">
                <RegularRequestsTab
                    requests={regularRequests}
                    loading={loading}
                    checkInventory={checkInventoryForRequest}
                    createFromInventory={handleCreateFromInventory}
                    createNeedingDonor={createDonationEventNeedingDonor}
                    refreshRequests={refreshRequests}
                />
            </Tabs.TabPane>
        </Tabs>
    );
} 