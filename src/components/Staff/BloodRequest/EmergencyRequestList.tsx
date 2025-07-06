'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Badge, Space, Modal, Typography, Card, Divider, Alert, message, Spin, List, Avatar, Input, Descriptions, Form, DatePicker, Select, Radio, Steps } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, WarningOutlined, PhoneOutlined, InfoCircleOutlined, UserOutlined, SearchOutlined, EnvironmentOutlined, CloseCircleOutlined, LeftOutlined, RightOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { BloodRequestDetail, checkInventory, fulfillFromInventory, InventoryCheckResponse, updateRequestStatus } from '@/services/api/bloodRequestService';
import { getNearbyEmergencyDonors, DonorProfile } from '@/services/api/donorProfileService';
import { StaffAssignmentRequest, AvailableTimeSlot } from '@/services/api/donationAppointmentService';
import * as donationAppointmentService from '@/services/api/donationAppointmentService';
import { useAuth } from '@/context/AuthContext';
import HtmlContent from '@/components/Common/HtmlContent';
import { useLocationCapacities } from '@/hooks/api/useLocations';
import { Capacity } from '@/services/api/locationService';

// Configure dayjs plugins
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh'); // Set Vietnam timezone

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

interface EmergencyRequestListProps {
    requests: BloodRequestDetail[];
    pagination: {
        current: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
    onRefresh: () => void;
    onPageChange: (page: number) => void;
}

// Maps urgency levels to colors
const urgencyColors: Record<string, string> = {
    Critical: 'red',
    High: 'orange',
    Medium: 'gold',
};

// Define status colors
const statusColors: Record<string, string> = {
    'Pending': 'gold',
    'Processing': 'blue',
    'Fulfilled': 'cyan',
    'PickedUp': 'green',
    'Cancelled': 'red',
    'Expired': 'gray',
    'Failed': 'volcano'
};

// Define types for time slots
type TimeSlotValue = 'Morning' | 'Afternoon' | 'Evening';
type TimeSlotOption = { label: string; value: TimeSlotValue };
type HourSlot = { label: string; startHour: number; endHour: number };
type HourSlots = Record<TimeSlotValue, HourSlot[]>;

export default function EmergencyRequestList({
    requests,
    pagination,
    onRefresh,
    onPageChange
}: EmergencyRequestListProps) {
    const { user } = useAuth();
    const [selectedRequest, setSelectedRequest] = useState<BloodRequestDetail | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [processModalVisible, setProcessModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [inventoryChecking, setInventoryChecking] = useState(false);
    const [inventoryData, setInventoryData] = useState<InventoryCheckResponse | null>(null);

    // New state for donor search
    const [donorSearchModalVisible, setDonorSearchModalVisible] = useState(false);
    const [searchingDonors, setSearchingDonors] = useState(false);
    const [nearbyDonors, setNearbyDonors] = useState<DonorProfile[]>([]);
    const [selectedDonors, setSelectedDonors] = useState<DonorProfile[]>([]);
    const [radiusKm, setRadiusKm] = useState<number>(50);
    const [assigningDonors, setAssigningDonors] = useState(false);

    // New state for status update
    const [statusUpdateModalVisible, setStatusUpdateModalVisible] = useState(false);
    const [statusUpdateNotes, setStatusUpdateNotes] = useState('');
    const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
    const [statusToUpdate, setStatusToUpdate] = useState<'PickedUp' | 'Cancelled' | null>(null);

    // Week navigation for schedule view
    const [currentWeekStart, setCurrentWeekStart] = useState<dayjs.Dayjs>(dayjs().startOf('week'));
    const [selectedHourSlot, setSelectedHourSlot] = useState<{ startHour: number, endHour: number } | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [selectedCapacity, setSelectedCapacity] = useState<Capacity | null>(null);
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
    const [loadingTimeSlots, setLoadingTimeSlots] = useState<boolean>(false);

    // Use the location capacities hook
    const {
        capacities,
        isLoading: loadingCapacities,
        fetchCapacities,
    } = useLocationCapacities();

    // Time slots configuration
    const timeSlotOptions: TimeSlotOption[] = [
        { label: 'Morning (7AM-11AM)', value: 'Morning' },
        { label: 'Afternoon (1PM-5PM)', value: 'Afternoon' },
        { label: 'Evening (6PM-7PM)', value: 'Evening' }
    ];

    // Hour slots with start and end times
    const hourSlots: HourSlots = {
        Morning: [
            { label: '7AM - 8AM', startHour: 7, endHour: 8 },
            { label: '8AM - 9AM', startHour: 8, endHour: 9 },
            { label: '9AM - 10AM', startHour: 9, endHour: 10 },
            { label: '10AM - 11AM', startHour: 10, endHour: 11 }
        ],
        Afternoon: [
            { label: '1PM - 2PM', startHour: 13, endHour: 14 },
            { label: '2PM - 3PM', startHour: 14, endHour: 15 },
            { label: '3PM - 4PM', startHour: 15, endHour: 16 },
            { label: '4PM - 5PM', startHour: 16, endHour: 17 }
        ],
        Evening: [
            { label: '6PM - 7PM', startHour: 18, endHour: 19 }
        ]
    };

    // Generate dates for the current week
    const weekDates = React.useMemo(() => {
        // Filter out Sunday (day 0) as the facility doesn't operate on Sundays
        return [1, 2, 3, 4, 5, 6].map(dayValue => {
            const date = currentWeekStart.clone().add(dayValue, 'day');
            return {
                label: ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayValue],
                value: dayValue,
                date,
                dateString: date.format('MMM D, YYYY')
            };
        });
    }, [currentWeekStart]);

    // Navigation functions for week view
    const navigateToPreviousWeek = () => {
        const newWeekStart = currentWeekStart.clone().subtract(1, 'week');
        setCurrentWeekStart(newWeekStart);

        // If we have a selected request, fetch capacities for the new week
        if (selectedRequest) {
            fetchAvailableTimeSlots(selectedRequest.locationId, newWeekStart.toDate());
        }
    };

    const navigateToNextWeek = () => {
        const newWeekStart = currentWeekStart.clone().add(1, 'week');
        setCurrentWeekStart(newWeekStart);

        // If we have a selected request, fetch capacities for the new week
        if (selectedRequest) {
            fetchAvailableTimeSlots(selectedRequest.locationId, newWeekStart.toDate());
        }
    };

    const navigateToCurrentWeek = () => {
        const newWeekStart = dayjs().startOf('week');
        setCurrentWeekStart(newWeekStart);

        // If we have a selected request, fetch capacities for the current week
        if (selectedRequest) {
            fetchAvailableTimeSlots(selectedRequest.locationId, newWeekStart.toDate());
        }
    };

    // Function to check if a date is in the past
    const isDateInPast = (date: dayjs.Dayjs): boolean => {
        const now = dayjs();
        return date.isBefore(now);
    };

    // Function to select a time slot
    const handleSelectTimeSlot = (day: dayjs.Dayjs, timeSlotValue: TimeSlotValue, hourSlot: HourSlot, isAvailable: boolean) => {
        if (!isAvailable) return;

        setSelectedAppointmentDate(day);
        setSelectedAppointmentTimeSlot(timeSlotValue);
        setSelectedHourSlot(hourSlot);
        setSelectedDay(day.day());
    };

    // Handle processing a request
    const handleProcessRequest = async (request: BloodRequestDetail) => {
        setSelectedRequest(request);
        setProcessModalVisible(true);

        // Reset inventory data
        setInventoryData(null);

        // Check inventory
        await checkInventoryForRequest(request.id);
    };

    // Check inventory for a blood request
    const checkInventoryForRequest = async (requestId: string) => {
        setInventoryChecking(true);
        try {
            const response = await checkInventory(requestId);
            if (response.success && response.data) {
                console.log('Inventory check response:', response.data);
                setInventoryData(response.data.data);
            } else {
                message.error('Failed to check inventory');
                console.error('Inventory check failed:', response);
            }
        } catch (error) {
            console.error('Error checking inventory:', error);
            message.error('Failed to check inventory');
        } finally {
            setInventoryChecking(false);
        }
    };

    // Handle viewing request details
    const handleViewDetails = (request: BloodRequestDetail) => {
        setSelectedRequest(request);
        setDetailModalVisible(true);
    };

    // Process with inventory
    const handleProcessWithInventory = async () => {
        if (!selectedRequest || !user?.id) return;

        setLoading(true);

        try {
            // Call the API to fulfill the request from inventory
            const response = await fulfillFromInventory(
                selectedRequest.id,
                user.id,
                `Emergency request processed by ${user.firstName} ${user.lastName}`
            );

            if (response.success) {
                message.success('Emergency request processed with inventory successfully');
                setProcessModalVisible(false);
                onRefresh(); // Refresh the list to show updated status
            } else {
                message.error('Failed to process request with inventory');
                console.error('Failed to process with inventory:', response);
            }
        } catch (error) {
            console.error('Error processing with inventory:', error);
            message.error('An error occurred while processing the request');
        } finally {
            setLoading(false);
        }
    };

    // Process with donor search
    const handleProcessWithDonorSearch = async () => {
        if (!selectedRequest) return;

        setDonorSearchModalVisible(true);
        await searchForNearbyDonors(selectedRequest);
    };

    // Search for nearby donors
    const searchForNearbyDonors = async (request: BloodRequestDetail) => {
        setSearchingDonors(true);
        setNearbyDonors([]);
        setSelectedDonors([]);

        try {
            const response = await getNearbyEmergencyDonors(
                request.latitude,
                request.longitude,
                request.bloodGroupId,
                radiusKm,
                true // forEmergency
            );

            if (response.success && response.data) {
                setNearbyDonors(response.data);
                console.log('Found nearby donors:', response.data.length);
            } else {
                message.warning('No eligible donors found in the area');
                console.error('Failed to find donors:', response.message);
            }
        } catch (error) {
            console.error('Error searching for donors:', error);
            message.error('Failed to search for donors');
        } finally {
            setSearchingDonors(false);
        }
    };

    // Toggle donor selection
    const toggleDonorSelection = (donor: DonorProfile) => {
        if (selectedDonors.some(d => d.id === donor.id)) {
            setSelectedDonors(selectedDonors.filter(d => d.id !== donor.id));
        } else {
            setSelectedDonors([...selectedDonors, donor]);
        }
    };

    // State for appointment scheduling
    const [currentAssignmentStep, setCurrentAssignmentStep] = useState<number>(1);
    const [selectedAppointmentDate, setSelectedAppointmentDate] = useState<dayjs.Dayjs>(dayjs().add(1, 'day'));
    const [selectedAppointmentTimeSlot, setSelectedAppointmentTimeSlot] = useState<TimeSlotValue>('Morning');
    const [availableTimeSlots, setAvailableTimeSlots] = useState<any[]>([]);
    const [assignmentForm] = Form.useForm();

    // Handle assignment step change
    const handleAssignmentStepChange = (step: number) => {
        if (step === 2 && selectedRequest) {
            // When moving to step 2 (date selection), fetch capacities
            fetchAvailableTimeSlots(selectedRequest.locationId, currentWeekStart.toDate());
        }

        setCurrentAssignmentStep(step);
    };

    // Handle next step in assignment wizard
    const handleNextStep = () => {
        if (currentAssignmentStep === 1) {
            if (!selectedDonors || selectedDonors.length === 0) {
                message.error('Please select at least one donor');
                return;
            }
            handleAssignmentStepChange(2);
        } else if (currentAssignmentStep === 2) {
            if (!selectedCapacity || !selectedDate || !selectedTimeSlot) {
                message.error('Please select a time slot');
                return;
            }
            handleAssignmentStepChange(3);
        } else if (currentAssignmentStep === 3) {
            handleSubmitAssignment();
        }
    };

    // Handle previous step in assignment wizard
    const handlePrevAssignmentStep = () => {
        if (currentAssignmentStep > 1) {
            setCurrentAssignmentStep(currentAssignmentStep - 1);
        }
    };

    // Assign selected donors
    const assignSelectedDonors = async () => {
        if (!selectedRequest || selectedDonors.length === 0) {
            message.warning('Please select at least one donor');
            return;
        }

        if (!selectedAppointmentDate || !selectedAppointmentTimeSlot) {
            message.error('Please select a date and time slot');
            return;
        }

        setAssigningDonors(true);
        let successCount = 0;
        let failCount = 0;

        try {
            // Format the date with the selected time
            let preferredDate = selectedAppointmentDate.format('YYYY-MM-DD');

            if (selectedHourSlot) {
                // Create a date with the selected hour
                preferredDate = selectedAppointmentDate.hour(selectedHourSlot.startHour).format('YYYY-MM-DD[T]HH:00:00');
            }

            // Create appointment requests for each selected donor
            for (const donor of selectedDonors) {
                const appointmentRequest: StaffAssignmentRequest = {
                    donorId: donor.userId,
                    preferredDate: preferredDate,
                    preferredTimeSlot: selectedAppointmentTimeSlot,
                    locationId: selectedRequest.locationId,
                    bloodGroupId: donor.bloodGroupId || selectedRequest.bloodGroupId,
                    componentTypeId: selectedRequest.componentTypeId,
                    notes: `Emergency request for patient: ${selectedRequest.patientName}. Blood request ID: ${selectedRequest.id}`,
                    isUrgent: true,
                    priority: 3, // High priority
                    relatedBloodRequestId: selectedRequest.id, // Link to the blood request
                    autoExpireHours: 24 // Expire after 24 hours if no response
                };

                try {
                    const response = await donationAppointmentService.createStaffAssignment(appointmentRequest);
                    if (response.success) {
                        successCount++;
                    } else {
                        failCount++;
                        console.error('Failed to create appointment for donor:', donor.userName, response.message);
                    }
                } catch (error) {
                    failCount++;
                    console.error('Error creating appointment for donor:', donor.userName, error);
                }
            }

            if (successCount > 0) {
                // Update the blood request status to Processing
                const updateResponse = await updateRequestStatus(selectedRequest.id, {
                    status: 'Processing',
                    notes: `Donors have been identified and appointment requests sent to ${successCount} donors`
                });

                if (updateResponse.success) {
                    message.success(`Successfully sent appointment requests to ${successCount} donors`);
                    setDonorSearchModalVisible(false);
                    setCurrentAssignmentStep(1); // Reset step
                    onRefresh(); // Refresh the list to show updated status
                } else {
                    message.warning('Appointments created but failed to update request status');
                }
            } else {
                message.error('Failed to create any appointment requests');
            }
        } catch (error) {
            console.error('Error assigning donors:', error);
            message.error('Failed to assign donors');
        } finally {
            setAssigningDonors(false);
        }
    };

    // Mark request as fulfilled
    const markRequestAsFulfilled = async () => {
        if (!selectedRequest) return;

        setLoading(true);
        try {
            const response = await updateRequestStatus(selectedRequest.id, {
                status: 'Fulfilled',
                notes: 'Required blood units collected from donors'
            });

            if (response.success) {
                message.success('Blood request marked as fulfilled');
                setDonorSearchModalVisible(false);
                onRefresh(); // Refresh the list
            } else {
                message.error('Failed to update request status');
            }
        } catch (error) {
            console.error('Error updating request status:', error);
            message.error('Failed to update request status');
        } finally {
            setLoading(false);
        }
    };

    // Handle showing status update modal
    const showStatusUpdateModal = (request: BloodRequestDetail, status: 'PickedUp' | 'Cancelled') => {
        setSelectedRequest(request);
        setStatusToUpdate(status);
        setStatusUpdateModalVisible(true);
    };

    // Handle updating request status to PickedUp or Cancelled
    const handleUpdateStatus = async () => {
        if (!selectedRequest || !statusToUpdate) return;

        setStatusUpdateLoading(true);
        try {
            const response = await updateRequestStatus(selectedRequest.id, {
                status: statusToUpdate,
                notes: statusUpdateNotes || `Emergency request ${statusToUpdate.toLowerCase()} by staff`,
                isActive: statusToUpdate === 'Cancelled' ? false : true,
                isPickedUp: statusToUpdate === 'PickedUp' ? true : false,
                pickupNotes: statusToUpdate === 'PickedUp' ? statusUpdateNotes : undefined
            });

            if (response.success) {
                message.success(`Emergency request marked as ${statusToUpdate.toLowerCase()}`);
                setStatusUpdateModalVisible(false);
                setStatusUpdateNotes('');
                onRefresh(); // Refresh the list
            } else {
                message.error(`Failed to update request status to ${statusToUpdate}`);
            }
        } catch (error) {
            console.error('Error updating request status:', error);
            message.error('Failed to update request status');
        } finally {
            setStatusUpdateLoading(false);
        }
    };

    // Group capacities by day of week, time slot, and hour for display
    const groupedCapacities = React.useMemo(() => {
        if (!capacities || capacities.length === 0) return {};

        const grouped: Record<number, Record<string, Record<string, Capacity>>> = {};

        // Get the range of dates for the current week view
        const weekStartDate = currentWeekStart.startOf('day');
        const weekEndDate = currentWeekStart.clone().add(6, 'day').endOf('day');

        capacities.forEach(capacity => {
            try {
                // Extract hour information from effectiveDate and expiryDate
                // Use dayjs without tz() to avoid timezone issues
                const effectiveDate = dayjs(capacity.effectiveDate);
                const expiryDate = dayjs(capacity.expiryDate);
                const startHour = effectiveDate.hour();
                const endHour = expiryDate.hour();

                // Check if this capacity is relevant for the current week view
                const capacityEffectiveDate = effectiveDate.startOf('day');
                const capacityExpiryDate = expiryDate.endOf('day');

                // Skip if the capacity doesn't apply to the current week view
                if (capacityExpiryDate.isBefore(weekStartDate) || capacityEffectiveDate.isAfter(weekEndDate)) {
                    return;
                }

                // Create a key for the hour slot
                const hourKey = `${startHour}-${endHour}`;

                // Use the day of week from the capacity
                const capacityDayOfWeek = capacity.dayOfWeek;

                if (!grouped[capacityDayOfWeek]) {
                    grouped[capacityDayOfWeek] = {};
                }

                if (!grouped[capacityDayOfWeek][capacity.timeSlot]) {
                    grouped[capacityDayOfWeek][capacity.timeSlot] = {};
                }

                grouped[capacityDayOfWeek][capacity.timeSlot][hourKey] = capacity;
            } catch (error) {
                console.error('Error processing capacity:', error, capacity);
            }
        });

        return grouped;
    }, [capacities, currentWeekStart]);

    // Function to handle selecting a capacity
    const handleSelectCapacity = (capacity: Capacity, hourSlot: { startHour: number, endHour: number }, day: number) => {
        if (!capacity) return;

        // Find the date for the selected day
        const selectedDayDate = weekDates.find(d => d.value === day)?.date || dayjs();

        // Set the selected date and time slot
        setSelectedDate(selectedDayDate);
        setSelectedTimeSlot(capacity.timeSlot);
        setSelectedHourSlot(hourSlot);
        setSelectedDay(day);
        setSelectedCapacity(capacity);
    };

    // Fetch available time slots for a location and date
    const fetchAvailableTimeSlots = async (locationId: string, date: Date) => {
        try {
            console.log(`Fetching capacities for location ${locationId}`);
            setLoadingTimeSlots(true);

            // Use fetchCapacities from the hook instead of getAvailableTimeSlots
            const capacitiesData = await fetchCapacities(locationId);

            if (capacitiesData && capacitiesData.length > 0) {
                console.log('Fetched capacities:', capacitiesData);
                // No need to set capacities as it's provided by the hook
            } else {
                message.warning('No available time slots found for this location');
            }
        } catch (error) {
            console.error('Error fetching capacities:', error);
            message.error('Failed to fetch available time slots');
        } finally {
            setLoadingTimeSlots(false);
        }
    };

    // Fetch capacities when the selected request changes or when the current week changes
    useEffect(() => {
        if (selectedRequest && currentAssignmentStep === 2) {
            fetchAvailableTimeSlots(selectedRequest.locationId, currentWeekStart.toDate());
        }
    }, [selectedRequest, currentAssignmentStep, currentWeekStart]);

    // Handle submitting the donor assignment
    const handleSubmitAssignment = async () => {
        try {
            if (!selectedRequest || !selectedDate || !selectedTimeSlot || !selectedHourSlot || selectedDonors.length === 0) {
                message.error('Missing required information for assignment');
                return;
            }

            setAssigningDonors(true);

            // Format the date with the selected hour
            const preferredDate = selectedDate.hour(selectedHourSlot.startHour).format('YYYY-MM-DD[T]HH:00:00');

            // Create assignments for each selected donor
            const assignmentPromises = selectedDonors.map(donor => {
                const requestData: StaffAssignmentRequest = {
                    donorId: donor.userId,
                    preferredDate: preferredDate,
                    preferredTimeSlot: selectedTimeSlot,
                    locationId: selectedRequest.locationId,
                    bloodGroupId: donor.bloodGroupId || selectedRequest.bloodGroupId,
                    componentTypeId: selectedRequest.componentTypeId || undefined,
                    notes: `Emergency request assignment for request ID: ${selectedRequest.id}`,
                    isUrgent: true,
                    priority: 3, // High priority for emergency
                    relatedBloodRequestId: selectedRequest.id, // Link to the blood request
                    autoExpireHours: 24 // Auto expire after 24 hours
                };

                return donationAppointmentService.createStaffAssignment(requestData);
            });

            // Wait for all assignments to complete
            const results = await Promise.all(assignmentPromises);

            // Check if all assignments were successful
            const allSuccessful = results.every(result => result.success);

            if (allSuccessful) {
                message.success(`Successfully assigned ${selectedDonors.length} donor(s) to the emergency request`);

                // Update the request status to "In Progress"
                await updateRequestStatus(selectedRequest.id, {
                    status: 'In Progress',
                    notes: `Assigned ${selectedDonors.length} donor(s) to this request`
                });

                // Close the modal and refresh the data
                setProcessModalVisible(false);
                if (onRefresh) onRefresh();
            } else {
                message.error('Some donor assignments failed. Please try again.');
            }
        } catch (error) {
            console.error('Error assigning donors:', error);
            message.error('Failed to assign donors to the emergency request');
        } finally {
            setAssigningDonors(false);
        }
    };

    const columns = [
        {
            title: 'Urgency',
            dataIndex: 'urgencyLevel',
            key: 'urgencyLevel',
            render: (urgency: string) => (
                <Tag color={urgencyColors[urgency] || 'default'} className="text-xs px-2 py-1">
                    {urgency}
                </Tag>
            ),
        },
        {
            title: 'Patient',
            dataIndex: 'patientName',
            key: 'patientName',
            render: (text: string, record: BloodRequestDetail) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div className="text-xs text-gray-500">{record.contactInfo}</div>
                </div>
            ),
        },
        {
            title: 'Blood Info',
            key: 'bloodInfo',
            render: (_: any, record: BloodRequestDetail) => (
                <div>
                    <div className="font-medium">{record.bloodGroupName}</div>
                    <div className="text-xs text-gray-500">{record.componentTypeName}</div>
                    <div className="text-xs font-bold">{record.quantityUnits} unit(s)</div>
                </div>
            ),
        },
        {
            title: 'Hospital',
            dataIndex: 'hospitalName',
            key: 'hospitalName',
            render: (text: string, record: BloodRequestDetail) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[150px]" title={record.address}>
                        {record.address}
                    </div>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: BloodRequestDetail) => (
                <div>
                    <Tag color={statusColors[status] || 'default'}>
                        {status}
                    </Tag>
                    <div className="text-xs text-gray-500 mt-1">
                        {dayjs(record.createdTime).fromNow()}
                    </div>
                </div>
            ),
            filters: [
                { text: 'Pending', value: 'Pending' },
                { text: 'Processing', value: 'Processing' },
                { text: 'Fulfilled', value: 'Fulfilled' },
                { text: 'PickedUp', value: 'PickedUp' },
                { text: 'Cancelled', value: 'Cancelled' },
                { text: 'Expired', value: 'Expired' },
                { text: 'Failed', value: 'Failed' }
            ],
            onFilter: (value: any, record: BloodRequestDetail) => record.status === value,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: BloodRequestDetail) => (
                <Space size="small">
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => handleViewDetails(record)}
                    >
                        Details
                    </Button>

                    {record.status === 'Pending' && (
                        <Button
                            type="primary"
                            danger
                            size="small"
                            onClick={() => handleProcessRequest(record)}
                        >
                            Process Now
                        </Button>
                    )}

                    {record.status === 'Fulfilled' && (
                        <>
                            <Button
                                type="primary"
                                size="small"
                                icon={<CheckOutlined />}
                                onClick={() => showStatusUpdateModal(record, 'PickedUp')}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                Pick Up
                            </Button>
                            <Button
                                type="primary"
                                danger
                                size="small"
                                onClick={() => showStatusUpdateModal(record, 'Cancelled')}
                            >
                                Cancel
                            </Button>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="mb-4">
                <Alert
                    message="Emergency Blood Requests"
                    description="These are urgent blood requests that need immediate attention. Process them as quickly as possible."
                    type="warning"
                    showIcon
                />
            </div>

            <Table
                columns={columns}
                dataSource={requests}
                rowKey="id"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    onChange: onPageChange,
                    showSizeChanger: false,
                }}
            />

            {/* Details Modal */}
            <Modal
                title={
                    <div className="flex items-center text-red-600">
                        <WarningOutlined className="mr-2" />
                        Emergency Request Details
                    </div>
                }
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setDetailModalVisible(false)}>
                        Close
                    </Button>,
                    selectedRequest?.status === 'Pending' && (
                        <Button
                            key="process"
                            type="primary"
                            danger
                            onClick={() => {
                                setDetailModalVisible(false);
                                handleProcessRequest(selectedRequest);
                            }}
                        >
                            Process Now
                        </Button>
                    ),
                ]}
                width={700}
            >
                {selectedRequest && (
                    <div className="p-4">
                        <div className="mb-4">
                            <Alert
                                message={
                                    <span className="flex items-center">
                                        <Tag color={urgencyColors[selectedRequest.urgencyLevel as keyof typeof urgencyColors]}>
                                            {selectedRequest.urgencyLevel}
                                        </Tag>
                                        <span className="ml-2">Emergency Blood Request</span>
                                    </span>
                                }
                                description={`Patient: ${selectedRequest.patientName}`}
                                type="error"
                                showIcon
                            />
                        </div>

                        <Card className="mb-4">
                            <Descriptions title="Request Details" bordered column={2}>
                                <Descriptions.Item label="Blood Group">{selectedRequest.bloodGroupName}</Descriptions.Item>
                                <Descriptions.Item label="Component">{selectedRequest.componentTypeName}</Descriptions.Item>
                                <Descriptions.Item label="Quantity">{selectedRequest.quantityUnits} unit(s)</Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    <Tag color={statusColors[selectedRequest.status]}>{selectedRequest.status}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Hospital">{selectedRequest.hospitalName}</Descriptions.Item>
                                <Descriptions.Item label="Contact">{selectedRequest.contactInfo}</Descriptions.Item>
                                <Descriptions.Item label="Address" span={2}>{selectedRequest.address}</Descriptions.Item>
                                {selectedRequest.medicalNotes && (
                                    <Descriptions.Item label="Medical Notes" span={2}>
                                        <HtmlContent content={selectedRequest.medicalNotes} />
                                    </Descriptions.Item>
                                )}
                                {selectedRequest.fulfilledDate && (
                                    <Descriptions.Item label="Fulfilled Date">{dayjs(selectedRequest.fulfilledDate).format('MMM D, YYYY HH:mm')}</Descriptions.Item>
                                )}
                                {selectedRequest.fulfilledByStaffName && (
                                    <Descriptions.Item label="Fulfilled By">{selectedRequest.fulfilledByStaffName}</Descriptions.Item>
                                )}
                                {selectedRequest.isPickedUp !== undefined && (
                                    <Descriptions.Item label="Picked Up">
                                        {selectedRequest.isPickedUp ?
                                            <Tag color="green">Yes</Tag> :
                                            <Tag color="orange">No</Tag>
                                        }
                                    </Descriptions.Item>
                                )}
                                {selectedRequest.pickupDate && (
                                    <Descriptions.Item label="Pickup Date">{dayjs(selectedRequest.pickupDate).format('MMM D, YYYY HH:mm')}</Descriptions.Item>
                                )}
                                {selectedRequest.pickupNotes && (
                                    <Descriptions.Item label="Pickup Notes" span={2}>{selectedRequest.pickupNotes}</Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>
                    </div>
                )}
            </Modal>

            {/* Process Modal */}
            <Modal
                title={
                    <div className="flex items-center text-red-600">
                        <WarningOutlined className="mr-2" />
                        Process Emergency Request
                    </div>
                }
                open={processModalVisible}
                onCancel={() => setProcessModalVisible(false)}
                footer={null}
                width={700}
            >
                {loading ? (
                    <div className="text-center py-8">
                        <Spin size="large" />
                        <div className="mt-4">Processing request...</div>
                    </div>
                ) : (
                    selectedRequest && (
                        <div className="p-2">
                            <Alert
                                message="Emergency Request Processing"
                                description="This is an emergency blood request. Choose how you want to process it."
                                type="warning"
                                showIcon
                                className="mb-4"
                            />

                            <Card className="mb-4 bg-gray-50">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Text type="secondary">Patient:</Text>
                                        <div className="font-medium">{selectedRequest.patientName}</div>
                                    </div>
                                    <div>
                                        <Text type="secondary">Blood Type Needed:</Text>
                                        <div className="font-medium">{selectedRequest.bloodGroupName} ({selectedRequest.componentTypeName})</div>
                                    </div>
                                    <div>
                                        <Text type="secondary">Quantity:</Text>
                                        <div className="font-medium">{selectedRequest.quantityUnits} unit(s)</div>
                                    </div>
                                    <div>
                                        <Text type="secondary">Hospital:</Text>
                                        <div className="font-medium">{selectedRequest.hospitalName}</div>
                                    </div>
                                </div>
                            </Card>

                            {/* Inventory Check Results */}
                            {inventoryChecking ? (
                                <div className="text-center py-4">
                                    <Spin size="small" />
                                    <div className="mt-2">Checking inventory...</div>
                                </div>
                            ) : inventoryData ? (
                                <div className="mb-4">
                                    <Alert
                                        message={
                                            inventoryData.hasSufficientInventory
                                                ? "Sufficient Inventory Available"
                                                : "Insufficient Inventory"
                                        }
                                        description={
                                            <div>
                                                <p>
                                                    Requested: <strong>{inventoryData.requestedUnits} units</strong> |
                                                    Available: <strong>{inventoryData.availableUnits} units</strong>
                                                </p>
                                                {!inventoryData.hasSufficientInventory && (
                                                    <p className="text-red-500 mt-1">
                                                        Not enough inventory available. Consider searching for donors.
                                                    </p>
                                                )}
                                            </div>
                                        }
                                        type={inventoryData.hasSufficientInventory ? "success" : "error"}
                                        showIcon
                                    />
                                </div>
                            ) : null}

                            <Divider />

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <Card
                                    title="Process with Inventory"
                                    className={`text-center transition-shadow cursor-pointer ${inventoryData && !inventoryData.hasSufficientInventory
                                        ? 'opacity-50 border-gray-200'
                                        : 'hover:shadow-md border-blue-200'
                                        }`}
                                    onClick={() => {
                                        if (!inventoryData || inventoryData.hasSufficientInventory) {
                                            handleProcessWithInventory();
                                        }
                                    }}
                                >
                                    <p>Check if blood is available in inventory and fulfill the request immediately.</p>
                                    <Button
                                        type="primary"
                                        className="mt-4"
                                        disabled={!!(inventoryData && !inventoryData.hasSufficientInventory)}
                                        loading={inventoryChecking}
                                    >
                                        {inventoryChecking ? 'Checking...' : 'Process with Inventory'}
                                    </Button>
                                </Card>

                                <Card
                                    title="Find Donors"
                                    className="text-center hover:shadow-md transition-shadow cursor-pointer border-red-200"
                                    onClick={handleProcessWithDonorSearch}
                                >
                                    <p>Search for nearby donors and create an emergency donation event.</p>
                                    <Button type="primary" danger className="mt-4">
                                        Search for Donors
                                    </Button>
                                </Card>
                            </div>
                        </div>
                    )
                )}
            </Modal>

            {/* Donor Search Modal */}
            <Modal
                title={
                    <div className="flex items-center">
                        <SearchOutlined className="mr-2 text-blue-600" />
                        Search for Emergency Donors
                    </div>
                }
                open={donorSearchModalVisible}
                onCancel={() => {
                    setDonorSearchModalVisible(false);
                    setCurrentAssignmentStep(1); // Reset step when closing
                }}
                width={800}
                footer={null}
            >
                {selectedRequest && (
                    <div className="mb-4">
                        <Alert
                            message={`Emergency Blood Request for ${selectedRequest.patientName}`}
                            description={
                                <div>
                                    <p><strong>Blood Group:</strong> {selectedRequest.bloodGroupName}</p>
                                    <p><strong>Component Type:</strong> {selectedRequest.componentTypeName}</p>
                                    <p><strong>Units Required:</strong> {selectedRequest.quantityUnits}</p>
                                    <p><strong>Hospital:</strong> {selectedRequest.hospitalName}</p>
                                </div>
                            }
                            type="error"
                            showIcon
                        />
                    </div>
                )}

                {/* Steps indicator */}
                <Steps current={currentAssignmentStep - 1} className="mb-8">
                    <Step title="Find Donors" description="Search for eligible donors" />
                    <Step title="Schedule" description="Select date and time" />
                    <Step title="Confirm" description="Review and assign" />
                </Steps>

                {/* Step 1: Find Donors */}
                {currentAssignmentStep === 1 && (
                    <>
                        <div className="mb-4">
                            <div className="flex items-center justify-between">
                                <div className="font-medium">Search Radius (km):</div>
                                <div>
                                    <Space>
                                        <Button
                                            size="small"
                                            onClick={() => setRadiusKm(Math.max(10, radiusKm - 10))}
                                            disabled={radiusKm <= 10}
                                        >
                                            -
                                        </Button>
                                        <span className="mx-2">{radiusKm} km</span>
                                        <Button
                                            size="small"
                                            onClick={() => setRadiusKm(Math.min(100, radiusKm + 10))}
                                            disabled={radiusKm >= 100}
                                        >
                                            +
                                        </Button>
                                    </Space>
                                </div>
                            </div>
                        </div>

                        {searchingDonors ? (
                            <div className="text-center py-10">
                                <Spin size="large" />
                                <div className="mt-4">Searching for nearby donors...</div>
                            </div>
                        ) : nearbyDonors.length === 0 ? (
                            <div className="text-center py-10">
                                <div className="text-gray-500">No eligible donors found within {radiusKm} km</div>
                                <Button
                                    type="primary"
                                    className="mt-4"
                                    onClick={() => selectedRequest && searchForNearbyDonors(selectedRequest)}
                                >
                                    Try Again
                                </Button>
                            </div>
                        ) : (
                            <div>
                                <div className="mb-4 flex justify-between items-center">
                                    <div className="font-medium">Found {nearbyDonors.length} eligible donor(s)</div>
                                    <div>
                                        <Button
                                            size="small"
                                            type={selectedDonors.length === nearbyDonors.length ? "primary" : "default"}
                                            onClick={() => {
                                                if (selectedDonors.length === nearbyDonors.length) {
                                                    setSelectedDonors([]);
                                                } else {
                                                    setSelectedDonors([...nearbyDonors]);
                                                }
                                            }}
                                        >
                                            {selectedDonors.length === nearbyDonors.length ? "Deselect All" : "Select All"}
                                        </Button>
                                    </div>
                                </div>

                                <List
                                    itemLayout="horizontal"
                                    dataSource={nearbyDonors}
                                    renderItem={donor => (
                                        <List.Item
                                            key={donor.id}
                                            className={`cursor-pointer transition-all border-l-4 ${selectedDonors.some(d => d.id === donor.id)
                                                ? 'border-red-600 bg-red-50'
                                                : 'border-transparent hover:bg-gray-50'
                                                }`}
                                            onClick={() => toggleDonorSelection(donor)}
                                        >
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar icon={<UserOutlined />} className="bg-red-500" />
                                                }
                                                title={
                                                    <div className="flex justify-between">
                                                        <span>{donor.firstName} {donor.lastName}</span>
                                                        <Tag color="red">{donor.bloodGroupName}</Tag>
                                                    </div>
                                                }
                                                description={
                                                    <div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div><PhoneOutlined className="mr-1" /> {donor.phoneNumber}</div>
                                                            <div><EnvironmentOutlined className="mr-1" /> {donor.distanceKm.toFixed(1)} km away</div>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            Last donation: {donor.lastDonationDate ? dayjs(donor.lastDonationDate).format('MMM D, YYYY') : 'Never'}
                                                        </div>
                                                    </div>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            </div>
                        )}
                    </>
                )}

                {/* Step 2: Schedule */}
                {currentAssignmentStep === 2 && (
                    <Form form={assignmentForm} layout="vertical">
                        <div className="mb-4">
                            <div className="flex items-center">
                                <div className="text-xl font-medium">Select Date and Time</div>
                            </div>
                            <p className="text-gray-500 mb-4">
                                Choose an available time slot for the donation appointment
                            </p>

                            {selectedRequest && (
                                <Alert
                                    message="Location Information"
                                    description={(
                                        <div>
                                            <p>
                                                <strong>Location:</strong> {selectedRequest.locationName}
                                            </p>
                                            <p className="text-gray-500 text-sm mt-1">
                                                Appointments will be created at this location.
                                            </p>
                                        </div>
                                    )}
                                    type="info"
                                    showIcon
                                    className="mb-4"
                                />
                            )}

                            {/* Week Navigation */}
                            <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow-sm">
                                <Button
                                    icon={<LeftOutlined />}
                                    onClick={navigateToPreviousWeek}
                                >
                                    Previous Week
                                </Button>
                                <div className="text-center">
                                    <h3 className="font-medium">
                                        {currentWeekStart.format('MMM D')} - {currentWeekStart.clone().add(6, 'day').format('MMM D, YYYY')}
                                    </h3>
                                    <Button type="link" onClick={navigateToCurrentWeek}>
                                        Go to Current Week
                                    </Button>
                                </div>
                                <Button
                                    icon={<RightOutlined />}
                                    onClick={navigateToNextWeek}
                                >
                                    Next Week
                                </Button>
                            </div>

                            {loadingCapacities ? (
                                <div className="flex justify-center items-center h-64">
                                    <Spin tip="Loading available time slots..." />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border p-3 w-32">Time / Day</th>
                                                {weekDates.map(day => (
                                                    <th key={day.value} className="border p-3 text-center">
                                                        <div>{day.label}</div>
                                                        <div className="text-xs text-gray-500">{day.dateString}</div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="bg-red-50">
                                                <td colSpan={7} className="border p-3 font-medium text-red-700">
                                                    Morning (7AM-11AM)
                                                </td>
                                            </tr>
                                            {hourSlots.Morning.map((hourSlot, idx) => (
                                                <tr key={`Morning-${idx}`} className="hover:bg-gray-50">
                                                    <td className="border p-3 text-sm font-medium">{hourSlot.label}</td>
                                                    {weekDates.map(day => {
                                                        const hourKey = `${hourSlot.startHour}-${hourSlot.endHour}`;
                                                        // Check if there's a capacity matching this specific day, time slot and hour
                                                        const capacity = groupedCapacities[day.value]?.['Morning']?.[hourKey];

                                                        // Check if this is the selected slot
                                                        const isSelected = selectedCapacity?.id === capacity?.id &&
                                                            selectedHourSlot?.startHour === hourSlot.startHour &&
                                                            selectedHourSlot?.endHour === hourSlot.endHour &&
                                                            selectedDay === day.value;

                                                        // Calculate button color based on selection state
                                                        const buttonType = isSelected ? 'primary' : 'default';

                                                        // Check if this time slot is in the past
                                                        const slotDateTime = day.date.hour(hourSlot.startHour);
                                                        const isPastSlot = isDateInPast(slotDateTime);

                                                        // Check if capacity is available
                                                        const isAvailable = capacity?.isActive && !isPastSlot;

                                                        return (
                                                            <td key={`Morning-${day.value}-${hourSlot.startHour}`} className="border p-3 text-center">
                                                                <div className="flex flex-col items-center">
                                                                    <div className="flex items-center gap-1 mb-1">
                                                                        {isAvailable ? (
                                                                            <Tag color="green" className="flex items-center">
                                                                                <CheckCircleOutlined /> Available
                                                                            </Tag>
                                                                        ) : (
                                                                            <Tag color="red" className="flex items-center">
                                                                                <CloseCircleOutlined /> {isPastSlot ? 'Past' : 'Unavailable'}
                                                                            </Tag>
                                                                        )}
                                                                        <span className="font-medium">Capacity: {capacity?.totalCapacity || 0}</span>
                                                                    </div>
                                                                    <Button
                                                                        type={buttonType}
                                                                        size="small"
                                                                        onClick={() => handleSelectCapacity(capacity, hourSlot, day.value)}
                                                                        disabled={!isAvailable}
                                                                        className={isSelected ? "bg-red-600 hover:bg-red-700" : ""}
                                                                    >
                                                                        Select
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}

                                            <tr className="bg-orange-50">
                                                <td colSpan={7} className="border p-3 font-medium text-orange-700">
                                                    Afternoon (1PM-5PM)
                                                </td>
                                            </tr>
                                            {hourSlots.Afternoon.map((hourSlot, idx) => (
                                                <tr key={`Afternoon-${idx}`} className="hover:bg-gray-50">
                                                    <td className="border p-3 text-sm font-medium">{hourSlot.label}</td>
                                                    {weekDates.map(day => {
                                                        const hourKey = `${hourSlot.startHour}-${hourSlot.endHour}`;
                                                        // Check if there's a capacity matching this specific day, time slot and hour
                                                        const capacity = groupedCapacities[day.value]?.['Afternoon']?.[hourKey];

                                                        // Check if this is the selected slot
                                                        const isSelected = selectedCapacity?.id === capacity?.id &&
                                                            selectedHourSlot?.startHour === hourSlot.startHour &&
                                                            selectedHourSlot?.endHour === hourSlot.endHour &&
                                                            selectedDay === day.value;

                                                        // Calculate button color based on selection state
                                                        const buttonType = isSelected ? 'primary' : 'default';

                                                        // Check if this time slot is in the past
                                                        const slotDateTime = day.date.hour(hourSlot.startHour);
                                                        const isPastSlot = isDateInPast(slotDateTime);

                                                        // Check if capacity is available
                                                        const isAvailable = capacity?.isActive && !isPastSlot;

                                                        return (
                                                            <td key={`Afternoon-${day.value}-${hourSlot.startHour}`} className="border p-3 text-center">
                                                                <div className="flex flex-col items-center">
                                                                    <div className="flex items-center gap-1 mb-1">
                                                                        {isAvailable ? (
                                                                            <Tag color="green" className="flex items-center">
                                                                                <CheckCircleOutlined /> Available
                                                                            </Tag>
                                                                        ) : (
                                                                            <Tag color="red" className="flex items-center">
                                                                                <CloseCircleOutlined /> {isPastSlot ? 'Past' : 'Unavailable'}
                                                                            </Tag>
                                                                        )}
                                                                        <span className="font-medium">Capacity: {capacity?.totalCapacity || 0}</span>
                                                                    </div>
                                                                    <Button
                                                                        type={buttonType}
                                                                        size="small"
                                                                        onClick={() => handleSelectCapacity(capacity, hourSlot, day.value)}
                                                                        disabled={!isAvailable}
                                                                        className={isSelected ? "bg-red-600 hover:bg-red-700" : ""}
                                                                    >
                                                                        Select
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}

                                            <tr className="bg-blue-50">
                                                <td colSpan={7} className="border p-3 font-medium text-blue-700">
                                                    Evening (6PM-7PM)
                                                </td>
                                            </tr>
                                            {hourSlots.Evening.map((hourSlot, idx) => (
                                                <tr key={`Evening-${idx}`} className="hover:bg-gray-50">
                                                    <td className="border p-3 text-sm font-medium">{hourSlot.label}</td>
                                                    {weekDates.map(day => {
                                                        const hourKey = `${hourSlot.startHour}-${hourSlot.endHour}`;
                                                        // Check if there's a capacity matching this specific day, time slot and hour
                                                        const capacity = groupedCapacities[day.value]?.['Evening']?.[hourKey];

                                                        // Check if this is the selected slot
                                                        const isSelected = selectedCapacity?.id === capacity?.id &&
                                                            selectedHourSlot?.startHour === hourSlot.startHour &&
                                                            selectedHourSlot?.endHour === hourSlot.endHour &&
                                                            selectedDay === day.value;

                                                        // Calculate button color based on selection state
                                                        const buttonType = isSelected ? 'primary' : 'default';

                                                        // Check if this time slot is in the past
                                                        const slotDateTime = day.date.hour(hourSlot.startHour);
                                                        const isPastSlot = isDateInPast(slotDateTime);

                                                        // Check if capacity is available
                                                        const isAvailable = capacity?.isActive && !isPastSlot;

                                                        return (
                                                            <td key={`Evening-${day.value}-${hourSlot.startHour}`} className="border p-3 text-center">
                                                                <div className="flex flex-col items-center">
                                                                    <div className="flex items-center gap-1 mb-1">
                                                                        {isAvailable ? (
                                                                            <Tag color="green" className="flex items-center">
                                                                                <CheckCircleOutlined /> Available
                                                                            </Tag>
                                                                        ) : (
                                                                            <Tag color="red" className="flex items-center">
                                                                                <CloseCircleOutlined /> {isPastSlot ? 'Past' : 'Unavailable'}
                                                                            </Tag>
                                                                        )}
                                                                        <span className="font-medium">Capacity: {capacity?.totalCapacity || 0}</span>
                                                                    </div>
                                                                    <Button
                                                                        type={buttonType}
                                                                        size="small"
                                                                        onClick={() => handleSelectCapacity(capacity, hourSlot, day.value)}
                                                                        disabled={!isAvailable}
                                                                        className={isSelected ? "bg-red-600 hover:bg-red-700" : ""}
                                                                    >
                                                                        Select
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {selectedCapacity && selectedDate && (
                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                                    <p className="font-medium text-green-700">
                                        Selected time slot: {selectedDate.format('MMMM D, YYYY')} - {selectedTimeSlot}
                                        {selectedHourSlot ? ` (${selectedHourSlot.startHour}:00 - ${selectedHourSlot.endHour}:00)` : ''}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Form>
                )}

                {/* Step 3: Confirm */}
                {currentAssignmentStep === 3 && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
                        <div className="p-4">
                            <h3 className="text-lg font-medium text-gray-800 mb-2">
                                Confirm Appointment Details
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Review and confirm the appointment details
                            </p>

                            <Card className="mb-4">
                                <Descriptions title="Selected Donors" column={1} bordered>
                                    <Descriptions.Item label="Number of Donors">
                                        {selectedDonors.length}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Donors">
                                        <ul className="list-disc pl-4">
                                            {selectedDonors.map(donor => (
                                                <li key={donor.id}>
                                                    {donor.firstName} {donor.lastName} ({donor.bloodGroupName})
                                                </li>
                                            ))}
                                        </ul>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>

                            <Card>
                                <Descriptions title="Appointment Details" column={1} bordered>
                                    <Descriptions.Item label="Date">
                                        {selectedAppointmentDate.format('dddd, MMMM D, YYYY')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Time Slot">
                                        {selectedAppointmentTimeSlot}
                                        {selectedHourSlot && ` (${selectedHourSlot.startHour}:00 - ${selectedHourSlot.endHour}:00)`}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Location">
                                        {selectedRequest?.locationName}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Emergency Request">
                                        <Tag color="red">Yes</Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Priority">
                                        <Tag color="orange">High</Tag>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Footer buttons */}
                <div className="flex justify-between mt-6">
                    <div>
                        {currentAssignmentStep > 1 ? (
                            <Button onClick={handlePrevAssignmentStep}>
                                Back
                            </Button>
                        ) : (
                            <Button onClick={() => setDonorSearchModalVisible(false)}>
                                Cancel
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {currentAssignmentStep === 1 && (
                            <>
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    loading={searchingDonors}
                                    onClick={() => selectedRequest && searchForNearbyDonors(selectedRequest)}
                                >
                                    Refresh Search
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={handleNextStep}
                                    disabled={selectedDonors.length === 0}
                                >
                                    Next
                                </Button>
                            </>
                        )}

                        {currentAssignmentStep === 2 && (
                            <Button
                                type="primary"
                                onClick={handleNextStep}
                                disabled={!selectedAppointmentDate || !selectedAppointmentTimeSlot || !selectedHourSlot}
                            >
                                Next
                            </Button>
                        )}

                        {currentAssignmentStep === 3 && (
                            <>
                                <Button
                                    type="primary"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={markRequestAsFulfilled}
                                >
                                    Mark as Fulfilled
                                </Button>
                                <Button
                                    type="primary"
                                    danger
                                    loading={assigningDonors}
                                    onClick={assignSelectedDonors}
                                >
                                    Assign {selectedDonors.length} Donor(s)
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Status Update Modal */}
            <Modal
                title={
                    <div className="flex items-center">
                        {statusToUpdate === 'PickedUp' ? (
                            <CheckCircleOutlined className="mr-2 text-green-600" />
                        ) : (
                            <CloseCircleOutlined className="mr-2 text-red-600" />
                        )}
                        {statusToUpdate === 'PickedUp' ? 'Mark as Picked Up' : 'Cancel Emergency Request'}
                    </div>
                }
                open={statusUpdateModalVisible}
                onCancel={() => setStatusUpdateModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setStatusUpdateModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={statusUpdateLoading}
                        onClick={handleUpdateStatus}
                        className={statusToUpdate === 'PickedUp' ? 'bg-green-600 hover:bg-green-700' : ''}
                        danger={statusToUpdate === 'Cancelled'}
                    >
                        {statusToUpdate === 'PickedUp' ? 'Mark as Picked Up' : 'Mark as Cancelled'}
                    </Button>,
                ]}
            >
                <div className="mb-4">
                    {statusToUpdate === 'PickedUp' ? (
                        <Alert
                            message="Mark as Picked Up"
                            description="Mark this emergency request as picked up when the recipient has picked up the blood units."
                            type="info"
                            showIcon
                            className="mb-4"
                        />
                    ) : (
                        <Alert
                            message="Cancel Request"
                            description="Cancelling this request will mark it as inactive and no further actions can be taken."
                            type="warning"
                            showIcon
                            className="mb-4"
                        />
                    )}
                </div>

                {selectedRequest && (
                    <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <div className="font-medium mb-2">Request Details:</div>
                        <div><strong>Patient:</strong> {selectedRequest.patientName}</div>
                        <div><strong>Blood Group:</strong> {selectedRequest.bloodGroupName}</div>
                        <div><strong>Component:</strong> {selectedRequest.componentTypeName}</div>
                        <div><strong>Units:</strong> {selectedRequest.quantityUnits}</div>
                        <div><strong>Hospital:</strong> {selectedRequest.hospitalName || 'Not specified'}</div>
                    </div>
                )}

                <div className="mb-4">
                    <div className="mb-2">Notes (optional):</div>
                    <Input.TextArea
                        rows={4}
                        placeholder="Enter any additional notes about this status change..."
                        value={statusUpdateNotes}
                        onChange={(e) => setStatusUpdateNotes(e.target.value)}
                    />
                </div>
            </Modal>
        </div>
    );
} 