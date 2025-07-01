'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { Card, Steps, Button, Alert, Spin, Form, Select, DatePicker, Input, Checkbox, Result, Calendar, Badge, Row, Col, Tag, Empty } from 'antd';
import { EnvironmentOutlined, CalendarOutlined, ClockCircleOutlined, LeftOutlined, RightOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useDonorProfile } from '@/hooks/api';
import { useLocations } from '@/hooks/api/useLocations';
import { useBloodGroups } from '@/hooks/api/useBloodGroups';
import { useComponentTypes } from '@/hooks/api/useComponentTypes';
import { useDonationAppointment } from '@/hooks/api/useDonationAppointment';
import { EligibilityResponse, DonationAppointmentRequest, AvailableTimeSlot, TimeSlot, Capacity } from '@/services/api';
import type { Dayjs } from 'dayjs';
import ProtectedRoute from '@/components/ProtectedRoute';
import React from 'react';

// Configure dayjs to use timezone
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh'); // Set Vietnam timezone

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

// Time slots configuration
const timeSlots = [
  { label: 'Morning (7AM-12PM)', value: 'Morning' },
  { label: 'Afternoon (1PM-6PM)', value: 'Afternoon' },
  { label: 'Evening (6PM-9PM)', value: 'Evening' }
];

// Hour slots with start and end times in 24-hour format
const hourSlots = {
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
    { label: '4PM - 5PM', startHour: 16, endHour: 17 },
    { label: '5PM - 6PM', startHour: 17, endHour: 18 }
  ],
  Evening: [
    { label: '6PM - 7PM', startHour: 18, endHour: 19 },
    { label: '7PM - 8PM', startHour: 19, endHour: 20 },
    { label: '8PM - 9PM', startHour: 20, endHour: 21 }
  ]
};

// Days of week
const daysOfWeek = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 }
];

// Define type for time slot
interface TimeSlotType {
  timeSlot: string;
  availableCapacity: number;
  totalCapacity: number;
  isAvailable: boolean;
}

const DonateBloodPage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  
  // Custom hooks
  const { checkEligibility, isCheckingEligibility } = useDonorProfile();
  const { 
    locations, 
    isLoading: isLoadingLocations, 
    isGettingUserLocation,
    getUserLocation,
    userCoordinates,
    getLocationCapacities
  } = useLocations();
  const { bloodGroups, isLoading: isLoadingBloodGroups } = useBloodGroups();
  const { componentTypes, isLoading: isLoadingComponentTypes } = useComponentTypes();
  const { 
    submitDonationRequest, 
    isSubmitting 
  } = useDonationAppointment();
  
  // State
  const [eligibilityData, setEligibilityData] = useState<EligibilityResponse | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [loadingCapacities, setLoadingCapacities] = useState(false);
  
  // State for capacity schedule view
  const [currentWeekStart, setCurrentWeekStart] = useState<dayjs.Dayjs>(dayjs().tz().startOf('week'));
  const [capacities, setCapacities] = useState<Capacity[]>([]);
  const [selectedCapacity, setSelectedCapacity] = useState<Capacity | null>(null);
  const [selectedHourSlot, setSelectedHourSlot] = useState<{startHour: number, endHour: number} | null>(null);
  
  // Use refs to track if we've already made requests to avoid infinite loops
  const hasRequestedCapacitiesRef = React.useRef<boolean>(false);
  const previousWeekStartRef = React.useRef<string>('');
  const hasLocationRequestedRef = React.useRef<boolean>(false);
  
  // Fetch capacities function
  const fetchLocationCapacities = async () => {
    if (!selectedLocation) return;
    
    try {
      setLoadingCapacities(true);
      const locationCapacities = await getLocationCapacities(selectedLocation);
      
      if (locationCapacities) {
        setCapacities(locationCapacities);
      }
    } catch (error) {
      console.error('Error fetching location capacities:', error);
    } finally {
      setLoadingCapacities(false);
    }
  };

  // Check eligibility on component mount
  useEffect(() => {
    const checkDonorEligibility = async () => {
      const result = await checkEligibility();
      if (result) {
        setEligibilityData(result);
      }
    };
    
    checkDonorEligibility();
  }, []);

  // Handle location and date selection for time slots
  useEffect(() => {
    if (selectedLocation && selectedDate) {
      fetchLocationCapacities();
    }
  }, [selectedLocation, selectedDate]);

  // Handle location step with geolocation
  useEffect(() => {
    // Only trigger getUserLocation once when first entering the location step
    if (currentStep === 1 && !userCoordinates.latitude && !hasLocationRequestedRef.current && !isGettingUserLocation) {
      hasLocationRequestedRef.current = true;
      console.log('Automatically requesting user location on location step');
      getUserLocation();
    }
  }, [currentStep, userCoordinates.latitude, isGettingUserLocation]);
  
  // Reset the location request flag when leaving the location step
  useEffect(() => {
    if (currentStep !== 1) {
      hasLocationRequestedRef.current = false;
    }
  }, [currentStep]);

  // Handle "Find Nearby Locations" button click
  const handleFindNearbyLocations = async () => {
    // Set the flag to true to prevent duplicate requests
    hasLocationRequestedRef.current = true;
    
    try {
      await getUserLocation();
    } catch (error) {
      console.error('Error getting user location:', error);
      hasLocationRequestedRef.current = false; // Reset flag if error occurs
    }
  };

  // Handle capacity loading based on step changes
  useEffect(() => {
    const currentWeekStartStr = currentWeekStart.format('YYYY-MM-DD');
    
    if (currentStep === 2 && selectedLocation) {
      // Only fetch if we haven't fetched before or week has changed
      if (!hasRequestedCapacitiesRef.current || 
          previousWeekStartRef.current !== currentWeekStartStr) {
        
        // Set the flags first to prevent duplicate requests
        hasRequestedCapacitiesRef.current = true;
        previousWeekStartRef.current = currentWeekStartStr;
        
        // Then fetch the data
        fetchLocationCapacities();
      }
    }
    
    // Reset the flag when we leave the schedule step
    if (currentStep !== 2) {
      hasRequestedCapacitiesRef.current = false;
    }
  }, [currentStep, selectedLocation, currentWeekStart]);

  // Group capacities by day of week, time slot, and hour for display
  const groupedCapacities = React.useMemo(() => {
    if (!capacities) return {};
    
    const grouped: Record<number, Record<string, Record<string, Capacity>>> = {};
    
    // Get the range of dates for the current week view
    const weekStartDate = currentWeekStart.startOf('day');
    const weekEndDate = currentWeekStart.clone().add(6, 'day').endOf('day');
    
    capacities.forEach(capacity => {
      // Extract hour information from effectiveDate and expiryDate
      const effectiveDate = dayjs(capacity.effectiveDate).tz();
      const expiryDate = dayjs(capacity.expiryDate).tz();
      const startHour = effectiveDate.hour();
      const endHour = expiryDate.hour();
      
      // Check if this capacity is relevant for the current week view
      // A capacity is relevant if its date range overlaps with the current week
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
    });
    
    return grouped;
  }, [capacities, currentWeekStart]);
  
  // Generate dates for the current week
  const weekDates = React.useMemo(() => {
    // Make a shallow copy of daysOfWeek to avoid modifying the original
    return daysOfWeek.map(day => {
      // Create a new date object for each day
      const date = currentWeekStart.clone().add(day.value, 'day');
      return {
        ...day,
        date,
        dateString: date.format('MMM D, YYYY')
      };
    });
  }, [currentWeekStart]);

  // Handle next step
  const next = () => {
    setCurrentStep(currentStep + 1);
  };

  // Handle previous step
  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    if (currentStep < 3) {
      // Save form data
      form.validateFields().then(() => {
        if (currentStep === 1) {
          setSelectedLocation(values.locationId);
        }
        next();
      });
    } else {
      // Final submission
      // Ensure we have the correct time format from capacity
      let timeSlot = selectedTimeSlot;
      let preferredDate = '';
      
      if (selectedCapacity) {
        // Just use the timeSlot from capacity (Morning, Afternoon, Evening)
        timeSlot = selectedCapacity.timeSlot;
        
        // For the date, use the day from selectedDate but time from capacity's effectiveDate
        if (selectedDate) {
          // Create a new dayjs object from the selected date
          const selectedDay = dayjs(selectedDate).format('YYYY-MM-DD');
          
          // Get hours, minutes, seconds from the capacity's effectiveDate
          const effectiveDateTime = dayjs(selectedCapacity.effectiveDate);
          
          // Adjust for timezone: Convert from Vietnam time (UTC+7) to UTC
          // We need to create a timezone-aware date first
          const vietnamDateTime = dayjs.tz(`${selectedDay}T${effectiveDateTime.format('HH:mm:ss.SSS')}`, 'Asia/Ho_Chi_Minh');
          
          // Then convert to UTC by subtracting 7 hours
          const utcDateTime = vietnamDateTime.subtract(7, 'hour');
          
          // Format the date in ISO format with UTC timezone indicator
          preferredDate = utcDateTime.format('YYYY-MM-DDTHH:mm:ss.SSS') + '+00:00';
          
          console.log('Giờ Việt Nam đã chọn:', vietnamDateTime.format('YYYY-MM-DD HH:mm:ss'));
          console.log('Giờ UTC để lưu vào database:', preferredDate);
        }
      } else if (selectedDate) {
        // Fallback if no capacity is selected
        // Convert from Vietnam time to UTC before formatting
        const vietnamTime = dayjs(selectedDate).tz('Asia/Ho_Chi_Minh');
        const utcTime = vietnamTime.subtract(7, 'hour');
        preferredDate = utcTime.format('YYYY-MM-DDTHH:mm:ss.SSS') + '+00:00';
      }
      
      const requestData: DonationAppointmentRequest = {
        preferredDate: preferredDate,
        preferredTimeSlot: timeSlot,
        locationId: selectedLocation,
        bloodGroupId: values.bloodGroupId || undefined,
        componentTypeId: values.componentTypeId || undefined,
        notes: values.notes || '',
        isUrgent: values.isUrgent || false
      };

      console.log('Submitting request:', requestData);

      const success = await submitDonationRequest(requestData);
      if (success) {
        next(); // Move to success step
      }
    }
  };

  // Render eligibility check step
  const renderEligibilityStep = () => {
    if (isCheckingEligibility) {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <Spin size="large" />
        </div>
      );
    }

    if (!eligibilityData) {
      return (
        <Alert 
          type="error" 
          message="Error checking eligibility" 
          description="We couldn't check your eligibility at this time. Please try again later." 
          showIcon 
        />
      );
    }

    if (!eligibilityData.isEligible) {
      return (
        <Alert
          type="warning"
          message="You are not eligible to donate blood at this time"
          description={
            <div className="space-y-4">
              {/* <p>{eligibilityData.message}</p> */}
              {eligibilityData.nextAvailableDonationDate && (
                <p>
                  You can donate blood after: <strong>{format(new Date(eligibilityData.nextAvailableDonationDate), 'dd/MM/yyyy')}</strong>
                </p>
              )}
              {eligibilityData.pendingAppointment && (
                <div>
                  <p>You have a pending appointment:</p>
                  <ul className="list-disc pl-5">
                    <li>Status: {eligibilityData.pendingAppointment.status}</li>
                    <li>
                      Date: {format(new Date(eligibilityData.pendingAppointment.preferredDate), 'dd/MM/yyyy')}
                    </li>
                    <li>
                      Time: {dayjs(eligibilityData.pendingAppointment.preferredDate).tz('Asia/Ho_Chi_Minh').format('HH:mm:ss')} - {eligibilityData.pendingAppointment.preferredTimeSlot}
                    </li>
                    <li>Location: {eligibilityData.pendingAppointment.locationName}</li>
                  </ul>
                </div>
              )}
            </div>
          }
          showIcon
        />
      );
    }

    return (
      <div className="space-y-6">
        <Alert
          type="success"
          message="You are eligible to donate blood"
          description="You can proceed to book an appointment for blood donation."
          showIcon
        />
        
        <div className="flex justify-end">
          <Button type="primary" onClick={next}>
            Book Appointment
          </Button>
        </div>
      </div>
    );
  };

  // Render location and date selection step
  const renderLocationStep = () => {
    const isLoading = isLoadingLocations || isLoadingBloodGroups || isLoadingComponentTypes;
    
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <Spin size="large" />
        </div>
      );
    }

    // Check if at least one location has distance information
    const hasDistanceInfo = locations.some(location => location.distance !== undefined);

    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          locationId: '',
          bloodGroupId: '',
          componentTypeId: '',
        }}
      >
        <div className="space-y-6">
          {/* Only show success message when we have distance data */}
          {userCoordinates.latitude && userCoordinates.longitude && hasDistanceInfo ? (
            <Alert
              message="Locations sorted by distance"
              description="Showing locations sorted from nearest to farthest from your current position."
              type="success"
              showIcon
              className="mb-4"
            />
          ) : isGettingUserLocation ? (
            <Alert
              message="Getting your location"
              description="Please wait while we find your position to show the nearest donation centers."
              type="info"
              showIcon
              className="mb-4"
            />
          ) : (
            <Alert
              message="Find donation centers near you"
              description="Click the button below to find donation centers sorted by distance from your current location."
              type="info"
              showIcon
              className="mb-4"
            />
          )}
          <Form.Item
            name="locationId"
            label="Select Donation Location"
            rules={[{ required: true, message: 'Please select a donation location' }]}
            extra={
              !userCoordinates.latitude && !isGettingUserLocation ? (
                <Button 
                  type="primary" 
                  icon={<EnvironmentOutlined />} 
                  onClick={handleFindNearbyLocations} 
                  className="mt-2"
                >
                  Find Nearby Locations
                </Button>
              ) : isGettingUserLocation ? (
                <div className="mt-2 flex items-center">
                  <Spin size="small" className="mr-2" />
                  <span className="text-gray-500">Getting your location...</span>
                </div>
              ) : null
            }
          >
            <Select 
              placeholder="Select a donation location"
              optionLabelProp="label"
              showSearch
              filterOption={(input, option) => 
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
              }
            >
              {locations.map(location => (
                <Option 
                  key={location.id} 
                  value={location.id}
                  label={location.name}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{location.name}</div>
                      <div className="text-xs text-gray-500">{location.address}</div>
                    </div>
                    {location.distance !== undefined && (
                      <div className="ml-2 text-sm px-3 py-1 bg-blue-100 text-blue-700 font-medium rounded-full whitespace-nowrap">
                        {location.distance} km
                      </div>
                    )}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="bloodGroupId"
            label="Blood Group (Optional)"
          >
            <Select placeholder="Select your blood group">
              {bloodGroups.map(group => (
                <Option key={group.id} value={group.id}>{group.groupName}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="componentTypeId"
            label="Blood Component Type (Optional)"
          >
            <Select placeholder="Select blood component type">
              {componentTypes.map(component => (
                <Option key={component.id} value={component.id}>{component.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <div className="flex justify-between">
            <Button onClick={prev}>
              Previous
            </Button>
            <Button type="primary" htmlType="submit">
              Next
            </Button>
          </div>
        </div>
      </Form>
    );
  };

  // Render time slot selection step
  const renderTimeSlotStep = () => {
    if (loadingCapacities) {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <Spin size="large" />
        </div>
      );
    }

    // Function to check if a date is in the past
    const isDateInPast = (date: dayjs.Dayjs): boolean => {
      const now = dayjs().tz();
      return date.isSameOrBefore(now);
    };

    // Navigation functions for week view
    const navigateToPreviousWeek = () => {
      setCurrentWeekStart(currentWeekStart.clone().subtract(1, 'week'));
    };
    
    const navigateToNextWeek = () => {
      setCurrentWeekStart(currentWeekStart.clone().add(1, 'week'));
    };
    
    const navigateToCurrentWeek = () => {
      setCurrentWeekStart(dayjs().tz().startOf('week'));
    };
    
    // Function to select a time slot from capacity
    const handleSelectCapacity = (capacity: Capacity, hourSlot: {startHour: number, endHour: number}) => {
      const hourLabel = hourSlots[capacity.timeSlot as keyof typeof hourSlots]
        .find(h => h.startHour === hourSlot.startHour && h.endHour === hourSlot.endHour)?.label || '';
      
      // Create a date object for the selected day
      const dayDate = weekDates.find(d => d.value === capacity.dayOfWeek)?.date;
      if (!dayDate) return;
      
      // Get the date part from the current day of week
      // But use the time from capacity's effectiveDate
      const effectiveDate = dayjs(capacity.effectiveDate);
      const selectedDateTime = dayDate
        .hour(effectiveDate.hour())
        .minute(effectiveDate.minute())
        .second(effectiveDate.second())
        .millisecond(effectiveDate.millisecond());
      
      setSelectedDate(selectedDateTime.toDate());
      
      // Store the display format for UI
      const displayTimeSlot = `${capacity.timeSlot} (${hourLabel})`;
      setSelectedTimeSlot(displayTimeSlot);
      setSelectedCapacity(capacity);
      setSelectedHourSlot(hourSlot);
    };

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium">Select Date and Time</h3>
          <p className="text-gray-600">
            Selected Location: {locations.find(loc => loc.id === selectedLocation)?.name}
          </p>
        </div>

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
                <td colSpan={8} className="border p-3 font-medium text-red-700">
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
                                       selectedHourSlot?.endHour === hourSlot.endHour;
                    
                    // Calculate button color based on selection state
                    const buttonType = isSelected ? 'primary' : 'default';
                    
                    // Check if this time slot is in the past
                    const slotDateTime = day.date.hour(hourSlot.startHour);
                    const isPastSlot = isDateInPast(slotDateTime);
                    
                    return (
                      <td key={`Morning-${day.value}-${hourKey}`} className="border p-3 text-center">
                        {capacity ? (
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 mb-1">
                              {capacity.isActive && !isPastSlot ? (
                                <Tag color="green" className="flex items-center">
                                  <CheckCircleOutlined /> Available
                                </Tag>
                              ) : (
                                <Tag color="red" className="flex items-center">
                                  <CloseCircleOutlined /> {isPastSlot ? 'Past' : 'Unavailable'}
                                </Tag>
                              )}
                              <span className="font-medium">Capacity: {capacity.totalCapacity}</span>
                            </div>
                            <Button 
                              type={buttonType} 
                              size="small"
                              onClick={() => handleSelectCapacity(capacity, hourSlot)}
                              disabled={!capacity.isActive || isPastSlot}
                            >
                              Select
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No slots available</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              
              <tr className="bg-orange-50">
                <td colSpan={8} className="border p-3 font-medium text-orange-700">
                  Afternoon (1PM-6PM)
                </td>
              </tr>
              {hourSlots.Afternoon.map((hourSlot, idx) => (
                <tr key={`Afternoon-${idx}`} className="hover:bg-gray-50">
                  <td className="border p-3 text-sm font-medium">{hourSlot.label}</td>
                  {weekDates.map(day => {
                    const hourKey = `${hourSlot.startHour}-${hourSlot.endHour}`;
                    const capacity = groupedCapacities[day.value]?.['Afternoon']?.[hourKey];
                    
                    // Check if this is the selected slot
                    const isSelected = selectedCapacity?.id === capacity?.id && 
                                       selectedHourSlot?.startHour === hourSlot.startHour &&
                                       selectedHourSlot?.endHour === hourSlot.endHour;
                    
                    // Calculate button color based on selection state
                    const buttonType = isSelected ? 'primary' : 'default';
                    
                    // Check if this time slot is in the past
                    const slotDateTime = day.date.hour(hourSlot.startHour);
                    const isPastSlot = isDateInPast(slotDateTime);
                    
                    return (
                      <td key={`Afternoon-${day.value}-${hourKey}`} className="border p-3 text-center">
                        {capacity ? (
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 mb-1">
                              {capacity.isActive && !isPastSlot ? (
                                <Tag color="green" className="flex items-center">
                                  <CheckCircleOutlined /> Available
                                </Tag>
                              ) : (
                                <Tag color="red" className="flex items-center">
                                  <CloseCircleOutlined /> {isPastSlot ? 'Past' : 'Unavailable'}
                                </Tag>
                              )}
                              <span className="font-medium">Capacity: {capacity.totalCapacity}</span>
                            </div>
                            <Button 
                              type={buttonType} 
                              size="small"
                              onClick={() => handleSelectCapacity(capacity, hourSlot)}
                              disabled={!capacity.isActive || isPastSlot}
                            >
                              Select
                            </Button>
                </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No slots available</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              
              <tr className="bg-blue-50">
                <td colSpan={8} className="border p-3 font-medium text-blue-700">
                  Evening (6PM-9PM)
                </td>
              </tr>
              {hourSlots.Evening.map((hourSlot, idx) => (
                <tr key={`Evening-${idx}`} className="hover:bg-gray-50">
                  <td className="border p-3 text-sm font-medium">{hourSlot.label}</td>
                  {weekDates.map(day => {
                    const hourKey = `${hourSlot.startHour}-${hourSlot.endHour}`;
                    const capacity = groupedCapacities[day.value]?.['Evening']?.[hourKey];
                    
                    // Check if this is the selected slot
                    const isSelected = selectedCapacity?.id === capacity?.id && 
                                       selectedHourSlot?.startHour === hourSlot.startHour &&
                                       selectedHourSlot?.endHour === hourSlot.endHour;
                    
                    // Calculate button color based on selection state
                    const buttonType = isSelected ? 'primary' : 'default';
                    
                    // Check if this time slot is in the past
                    const slotDateTime = day.date.hour(hourSlot.startHour);
                    const isPastSlot = isDateInPast(slotDateTime);
                    
                    return (
                      <td key={`Evening-${day.value}-${hourKey}`} className="border p-3 text-center">
                        {capacity ? (
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 mb-1">
                              {capacity.isActive && !isPastSlot ? (
                                <Tag color="green" className="flex items-center">
                                  <CheckCircleOutlined /> Available
                                </Tag>
                              ) : (
                                <Tag color="red" className="flex items-center">
                                  <CloseCircleOutlined /> {isPastSlot ? 'Past' : 'Unavailable'}
                                </Tag>
                              )}
                              <span className="font-medium">Capacity: {capacity.totalCapacity}</span>
                            </div>
                            <Button 
                              type={buttonType}
                              size="small"
                              onClick={() => handleSelectCapacity(capacity, hourSlot)}
                              disabled={!capacity.isActive || isPastSlot}
                            >
                              Select
                            </Button>
            </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No slots available</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedCapacity && selectedDate && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium">Selected Time Slot</h3>
            <div className="mt-2 space-y-2">
              <p><strong>Date:</strong> {dayjs(selectedDate).format('dddd, MMMM D, YYYY')}</p>
              <p><strong>Time:</strong> {selectedTimeSlot}</p>
              <p><strong>Location:</strong> {locations.find(loc => loc.id === selectedLocation)?.name}</p>
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-6">
          <Button onClick={prev}>
            Previous
          </Button>
          <Button 
            type="primary" 
            onClick={next}
            disabled={!selectedDate || !selectedTimeSlot}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  // Render confirmation step
  const renderConfirmationStep = () => {
    const locationName = locations.find(loc => loc.id === selectedLocation)?.name || '';
    const bloodGroupName = form.getFieldValue('bloodGroupId') ? 
      bloodGroups.find(bg => bg.id === form.getFieldValue('bloodGroupId'))?.groupName : 'Not specified';
    const componentTypeName = form.getFieldValue('componentTypeId') ?
      componentTypes.find(ct => ct.id === form.getFieldValue('componentTypeId'))?.name : 'Not specified';

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Appointment Details</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Location</p>
                <p className="font-medium">{locationName}</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">{selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''}</p>
              </div>
              <div>
                <p className="text-gray-500">Time Slot</p>
                <p className="font-medium">{selectedTimeSlot}</p>
              </div>
              <div>
                <p className="text-gray-500">Blood Group</p>
                <p className="font-medium">{bloodGroupName}</p>
              </div>
              <div>
                <p className="text-gray-500">Component Type</p>
                <p className="font-medium">{componentTypeName}</p>
              </div>
            </div>
          </div>
        </div>

        <Form
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="notes"
            label="Additional Notes (Optional)"
          >
            <TextArea rows={4} placeholder="Any additional information you'd like to provide" />
          </Form.Item>

          <Form.Item
            name="isUrgent"
            valuePropName="checked"
          >
            <Checkbox>This is an urgent donation request</Checkbox>
          </Form.Item>

          <div className="flex justify-between">
            <Button onClick={prev}>
              Previous
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={isSubmitting}
            >
              Confirm Appointment
            </Button>
          </div>
        </Form>
      </div>
    );
  };

  // Render success step
  const renderSuccessStep = () => {
    return (
      <Result
        status="success"
        title="Appointment Booked Successfully!"
        subTitle="Your blood donation appointment has been scheduled. Thank you for your contribution."
        extra={[
          <Button 
            type="primary" 
            key="dashboard" 
            onClick={() => router.push('/member/appointments')}
          >
            View My Appointments
          </Button>,
          <Button 
            key="home" 
            onClick={() => router.push('/')}
          >
            Back to Home
          </Button>,
        ]}
      />
    );
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderEligibilityStep();
      case 1:
        return renderLocationStep();
      case 2:
        return renderTimeSlotStep();
      case 3:
        return renderConfirmationStep();
      case 4:
        return renderSuccessStep();
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto shadow-sm">
          <Steps current={currentStep} className="mb-8">
            <Step title="Eligibility" description="Check eligibility" />
            <Step title="Location" description="Select donation center" />
            <Step title="Schedule" description="Choose date & time" />
            <Step title="Confirmation" description="Review & submit" />
            <Step title="Success" description="Appointment booked" />
          </Steps>
          
          {renderStepContent()}
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default DonateBloodPage; 