// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5222';

// Blood groups
export const BLOOD_GROUPS = [
    { id: 'a-positive', name: 'A+' },
    { id: 'a-negative', name: 'A-' },
    { id: 'b-positive', name: 'B+' },
    { id: 'b-negative', name: 'B-' },
    { id: 'ab-positive', name: 'AB+' },
    { id: 'ab-negative', name: 'AB-' },
    { id: 'o-positive', name: 'O+' },
    { id: 'o-negative', name: 'O-' },
];

// Blood component types
export const COMPONENT_TYPES = [
    { id: 'whole-blood', name: 'Whole Blood' },
    { id: 'red-blood-cells', name: 'Red Blood Cells' },
    { id: 'platelets', name: 'Platelets' },
    { id: 'plasma', name: 'Plasma' },
];

// Medical facilities
export const MEDICAL_FACILITIES = [
    { id: 'facility-1', name: 'Central Hospital' },
    { id: 'facility-2', name: 'City Medical Center' },
    { id: 'facility-3', name: 'Regional Blood Bank' },
];

// Blood request status
export const BLOOD_REQUEST_STATUS = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    FULFILLED: 'Fulfilled',
    COMPLETED: 'Picked Up',
    CANCELLED: 'Cancelled',
    EXPIRED: 'Expired',
    FAILED: 'Failed',
};

// Donation event status
export const DONATION_EVENT_STATUS = {
    CREATED: 'Created',
    DONOR_ASSIGNED: 'DonorAssigned',
    SCHEDULED: 'Scheduled',
    CHECKED_IN: 'CheckedIn',
    HEALTH_CHECK_PASSED: 'HealthCheckPassed',
    HEALTH_CHECK_FAILED: 'HealthCheckFailed',
    IN_PROGRESS: 'InProgress',
    COMPLETED: 'Completed',
    COMPLETED_FROM_INVENTORY: 'CompletedFromInventory',
    INCOMPLETE: 'Incomplete',
    CANCELLED: 'Cancelled',
    FAILED: 'Failed',
};

// Urgency levels
export const URGENCY_LEVELS = [
    { id: 'Critical', name: 'Critical' },
    { id: 'High', name: 'High' },
    { id: 'Medium', name: 'Medium' },
]; 