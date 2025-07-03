import { useState, useEffect } from 'react';
import { message } from 'antd';
import {
    getBloodRequests,
    getEmergencyBloodRequests,
    checkInventory
} from '@/services/api/bloodRequestService';
import { createDonationEvent } from '@/services/api/donationEventService';

export interface BloodRequestDetail {
    id: string;
    patientName: string;
    urgencyLevel?: 'Critical' | 'High' | 'Medium';
    contactInfo: string;
    hospitalName?: string;
    quantityUnits: number;
    bloodGroupId: string;
    bloodGroupName: string;
    componentTypeId: string;
    componentTypeName: string;
    locationId: string;
    locationName: string;
    address: string;
    latitude?: string;
    longitude?: string;
    medicalNotes?: string;
    status: string;
    isEmergency: boolean;
    neededByDate: string;
    requestedBy: string;
    requestedByName?: string;
    createdAt: string;
    updatedAt: string;
}

interface InventoryCheckResult {
    available: boolean;
    availableUnits: number;
    inventoryIds: string[];
}

export function useStaffBloodRequest() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [regularRequests, setRegularRequests] = useState<BloodRequestDetail[]>([]);
    const [emergencyRequests, setEmergencyRequests] = useState<BloodRequestDetail[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Load all blood requests
    useEffect(() => {
        const fetchBloodRequests = async () => {
            setLoading(true);
            setError(null);

            try {
                // Get regular requests
                const regularResponse = await getBloodRequests(undefined, false);
                if (regularResponse.success) {
                    setRegularRequests(regularResponse.data);
                } else {
                    throw new Error('Failed to fetch regular blood requests');
                }

                // Get emergency requests
                const emergencyResponse = await getEmergencyBloodRequests(true);
                if (emergencyResponse.success) {
                    setEmergencyRequests(emergencyResponse.data);
                } else {
                    throw new Error('Failed to fetch emergency blood requests');
                }
            } catch (err) {
                console.error('Error fetching blood requests:', err);
                setError('Failed to load blood requests. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchBloodRequests();
    }, [refreshTrigger]);

    // Check inventory for a blood request
    const checkInventoryForRequest = async (requestId: string): Promise<InventoryCheckResult | null> => {
        setLoading(true);
        try {
            const response = await checkInventory(requestId);
            if (!response.success) {
                throw new Error('Failed to check inventory');
            }
            return response.data;
        } catch (err) {
            console.error('Error checking inventory:', err);
            message.error('Failed to check inventory');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Create donation event from inventory
    const createDonationEventFromInventory = async (requestId: string, locationId: string, notes?: string) => {
        setLoading(true);
        try {
            const response = await createDonationEvent({
                requestId,
                locationId,
                notes: notes || 'Fulfilled from inventory',
                checkInventoryFirst: true
            });

            if (!response.success) {
                throw new Error('Failed to create donation event');
            }

            message.success('Blood request fulfilled from inventory');
            refreshRequests();
            return true;
        } catch (err) {
            console.error('Error creating donation event:', err);
            message.error('Failed to create donation event from inventory');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Create donation event that needs donor
    const createDonationEventNeedingDonor = async (requestId: string, locationId: string, notes?: string) => {
        setLoading(true);
        try {
            const response = await createDonationEvent({
                requestId,
                locationId,
                notes: notes || 'Need to find donor',
                checkInventoryFirst: false
            });

            if (!response.success) {
                throw new Error('Failed to create donation event');
            }

            message.success('Donation event created. Please assign a donor.');
            refreshRequests();
            return response.data;
        } catch (err) {
            console.error('Error creating donation event:', err);
            message.error('Failed to create donation event');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Helper to refresh requests
    const refreshRequests = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return {
        loading,
        error,
        regularRequests,
        emergencyRequests,
        checkInventoryForRequest,
        createDonationEventFromInventory,
        createDonationEventNeedingDonor,
        refreshRequests
    };
} 