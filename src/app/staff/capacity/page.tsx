'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import StaffLayout from '@/components/Layout/StaffLayout';
import { useStaffById } from '@/hooks/api/useUsers';
import { useLocationCapacities } from '@/hooks/api/useLocations';
import {
  Button,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Select,
  Input,
  Switch,
  Spin,
  Alert,
  Tag,
  Tooltip,
  Empty,
  message
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  LeftOutlined,
  RightOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Capacity, CreateCapacityRequest, UpdateCapacityRequest, CreateMultipleCapacitiesRequest } from '@/services/api/locationService';

// Configure dayjs to use timezone
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh'); // Set Vietnam timezone

const { Option } = Select;
const { TextArea } = Input;

// Time slots configuration
const timeSlots = [
  { label: 'Morning (7AM-12PM)', value: 'Morning' },
  { label: 'Afternoon (12PM-6PM)', value: 'Afternoon' },
  { label: 'Evening (6PM-7PM)', value: 'Evening' }
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
    // { label: '7PM - 8PM', startHour: 19, endHour: 20 },
    // { label: '8PM - 9PM', startHour: 20, endHour: 21 }
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

export default function StaffCapacityPage() {
  const { user } = useAuth();
  const userId = user?.id || '';
  const { staff, loading: staffLoading, error: staffError } = useStaffById(userId);

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedCapacity, setSelectedCapacity] = useState<Capacity | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isMultipleModalVisible, setIsMultipleModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [form] = Form.useForm();
  const [multipleForm] = Form.useForm();

  // Week navigation state
  const [currentWeekStart, setCurrentWeekStart] = useState<dayjs.Dayjs>(dayjs().tz().startOf('week'));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedHourSlot, setSelectedHourSlot] = useState<{ startHour: number, endHour: number } | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  // Get the location capacities
  const {
    capacities,
    isLoading: capacitiesLoading,
    error: capacitiesError,
    fetchCapacities,
    createCapacity,
    createMultipleCapacities,
    updateCapacity,
    deleteCapacity
  } = useLocationCapacities();

  // When staff data is loaded, set the selected location to the first one
  useEffect(() => {
    if (staff && staff.locations && staff.locations.length > 0) {
      setSelectedLocation(staff.locations[0].locationId);
    }
  }, [staff]);

  // When selected location changes, fetch capacities
  useEffect(() => {
    if (selectedLocation) {
      fetchCapacities(selectedLocation);
    }
  }, [selectedLocation, fetchCapacities]);

  // Generate dates for the current week
  const weekDates = React.useMemo(() => {
    return daysOfWeek.map(day => {
      const date = currentWeekStart.add(day.value, 'day');
      return {
        ...day,
        date,
        dateString: date.format('MMM D, YYYY')
      };
    });
  }, [currentWeekStart]);

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

  const handleCreateCapacity = (timeSlot: string, dayOfWeek: number, hourSlot: { startHour: number, endHour: number }) => {
    setModalMode('create');
    setSelectedCapacity(null);
    setSelectedTimeSlot(timeSlot);
    setSelectedHourSlot(hourSlot);
    setSelectedDay(dayOfWeek);

    // Calculate the specific date for the selected day
    const selectedDayDate = weekDates.find(d => d.value === dayOfWeek)?.date || null;
    setSelectedDate(selectedDayDate);

    form.resetFields();
    form.setFieldsValue({
      timeSlot,
      dayOfWeek,
      isActive: true
    });

    setIsModalVisible(true);
  };

  const handleEditCapacity = (capacity: Capacity) => {
    setModalMode('edit');
    setSelectedCapacity(capacity);
    form.setFieldsValue({
      timeSlot: capacity.timeSlot,
      totalCapacity: capacity.totalCapacity,
      dayOfWeek: capacity.dayOfWeek,
      notes: capacity.notes,
      isActive: capacity.isActive
    });
    setIsModalVisible(true);
  };

  const handleDeleteCapacity = async (capacity: Capacity) => {
    if (selectedLocation && capacity.id) {
      const success = await deleteCapacity(selectedLocation, capacity.id);
      if (success) {
        // Capacity deleted successfully
      }
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (modalMode === 'create' && selectedLocation && selectedDate && selectedHourSlot) {
        // Create a date object for the effective date (start time)
        const effectiveDate = selectedDate.hour(selectedHourSlot.startHour).minute(0).second(0).millisecond(0);

        // Create a date object for the expiry date (end time)
        const expiryDate = selectedDate.hour(selectedHourSlot.endHour).minute(0).second(0).millisecond(0);

        const data: CreateCapacityRequest = {
          locationId: selectedLocation,
          timeSlot: values.timeSlot,
          totalCapacity: values.totalCapacity,
          dayOfWeek: values.dayOfWeek,
          effectiveDate: effectiveDate.toISOString(),
          expiryDate: expiryDate.toISOString(),
          notes: values.notes || '',
          isActive: true
        };

        console.log('Creating capacity with data:', data);

        const success = await createCapacity(selectedLocation, data);
        if (success) {
          console.log('Capacity created successfully');
          message.success('Capacity slot created successfully');
          setIsModalVisible(false);
        } else {
          console.error('Failed to create capacity');
          message.error('Failed to create capacity slot');
        }
      } else if (modalMode === 'edit' && selectedLocation && selectedCapacity?.id) {
        const data: UpdateCapacityRequest = {
          timeSlot: values.timeSlot,
          totalCapacity: values.totalCapacity,
          dayOfWeek: values.dayOfWeek,
          effectiveDate: selectedCapacity.effectiveDate,
          expiryDate: selectedCapacity.expiryDate,
          notes: values.notes || '',
          isActive: values.isActive
        };

        console.log('Updating capacity with data:', data);

        const success = await updateCapacity(selectedLocation, selectedCapacity.id, data);
        if (success) {
          console.log('Capacity updated successfully');
          message.success('Capacity slot updated successfully');
          setIsModalVisible(false);
        } else {
          console.error('Failed to update capacity');
          message.error('Failed to update capacity slot');
        }
      }
    } catch (error) {
      console.error('Form validation failed:', error);
      message.error('Form validation failed');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleMultipleModalOk = async () => {
    try {
      const values = await multipleForm.validateFields();

      if (selectedLocation) {
        // Get start and end dates from the date range
        const effectiveDate = values.dateRange[0].hour(7).minute(0).second(0).millisecond(0);
        const expiryDate = values.dateRange[1].hour(19).minute(0).second(0).millisecond(0);

        const data: CreateMultipleCapacitiesRequest = {
          locationId: selectedLocation,
          totalCapacity: values.totalCapacity,
          startDayOfWeek: values.startDayOfWeek,
          endDayOfWeek: values.endDayOfWeek,
          effectiveDate: effectiveDate.toISOString(),
          expiryDate: expiryDate.toISOString(),
          notes: values.notes || '',
          isActive: true
        };

        // Call the API to create multiple capacities
        const success = await createMultipleCapacities(selectedLocation, data);
        if (success) {
          setIsMultipleModalVisible(false);
          multipleForm.resetFields();
          // Refresh the capacities after successful creation
          fetchCapacities(selectedLocation);
        }
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleMultipleModalCancel = () => {
    setIsMultipleModalVisible(false);
    multipleForm.resetFields();
  };

  const handleOpenMultipleModal = () => {
    // Use the currently viewed week instead of the current date
    const monday = currentWeekStart.clone().add(1, 'day'); // Week starts on Sunday, so add 1 day for Monday
    const saturday = currentWeekStart.clone().add(6, 'day');

    multipleForm.resetFields();
    multipleForm.setFieldsValue({
      startDayOfWeek: 1, // Monday
      endDayOfWeek: 6, // Saturday
      totalCapacity: 10, // Default capacity
      isActive: true,
      dateRange: [monday, saturday],
      notes: 'Weekly capacity for blood donation center'
    });
    setIsMultipleModalVisible(true);
  };

  const handleLocationChange = (locationId: string) => {
    setSelectedLocation(locationId);
  };

  const navigateToPreviousWeek = () => {
    setCurrentWeekStart(currentWeekStart.clone().subtract(1, 'week'));
  };

  const navigateToNextWeek = () => {
    setCurrentWeekStart(currentWeekStart.clone().add(1, 'week'));
  };

  const navigateToCurrentWeek = () => {
    setCurrentWeekStart(dayjs().tz().startOf('week'));
  };

  // Refetch capacities when navigating between weeks
  useEffect(() => {
    if (selectedLocation) {
      fetchCapacities(selectedLocation);
    }
  }, [currentWeekStart, selectedLocation, fetchCapacities]);

  if (staffLoading) {
    return (
      <StaffLayout title="Capacity Management" breadcrumbItems={[{ title: 'Capacity Management' }]}>
        <div className="flex justify-center items-center h-64">
          <Spin tip="Loading staff information...">
            <div className="p-5"></div>
          </Spin>
        </div>
      </StaffLayout>
    );
  }

  if (staffError) {
    return (
      <StaffLayout title="Capacity Management" breadcrumbItems={[{ title: 'Capacity Management' }]}>
        <Alert
          message="Error"
          description={`Failed to load staff information: ${staffError}`}
          type="error"
          showIcon
        />
      </StaffLayout>
    );
  }

  if (!staff || !staff.locations || staff.locations.length === 0) {
    return (
      <StaffLayout title="Capacity Management" breadcrumbItems={[{ title: 'Capacity Management' }]}>
        <Alert
          message="No Locations Assigned"
          description="You don't have any locations assigned to manage. Please contact your administrator."
          type="info"
          showIcon
        />
      </StaffLayout>
    );
  }

  // Get the selected location name
  const selectedLocationName = staff.locations.find(loc => loc.locationId === selectedLocation)?.locationName || '';
  const staffFullName = `${staff.staff.lastName} ${staff.staff.firstName}`;

  return (
    <StaffLayout
      title="Capacity Management"
      breadcrumbItems={[{ title: 'Capacity Management' }]}
    >
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Manage Donation Time Slots</h2>
            <p className="text-gray-500 mb-3">Create and manage available time slots for blood donation at your location</p>

            <div className="flex flex-wrap gap-3 mt-3">
              <div className="inline-flex items-center border border-gray-300 rounded-md px-4 py-2.5 bg-white shadow-sm hover:border-red-400 transition-colors">
                <UserOutlined className="text-red-500 mr-3 text-lg" />
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs leading-tight">Staff</span>
                  <div className="font-medium text-gray-800">{staffFullName}</div>
                </div>
              </div>
              <div className="inline-flex items-center border border-gray-300 rounded-md px-4 py-2.5 bg-white shadow-sm hover:border-red-400 transition-colors">
                <EnvironmentOutlined className="text-red-500 mr-3 text-lg" />
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs leading-tight">Location</span>
                  <div className="font-medium text-gray-800">{selectedLocationName}</div>
                </div>
              </div>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenMultipleModal}
            className="bg-red-500 hover:bg-red-600"
          >
            Add Multiple Slots
          </Button>
        </div>

        {staff?.locations.length > 1 && (
          <div className="mb-4">
            <Select
              style={{ width: 300 }}
              placeholder="Select a location"
              value={selectedLocation}
              onChange={handleLocationChange}
            >
              {staff.locations.map(location => (
                <Option key={location.locationId} value={location.locationId}>
                  {location.locationName}
                </Option>
              ))}
            </Select>
          </div>
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
              {currentWeekStart.format('MMM D')} - {currentWeekStart.add(6, 'day').format('MMM D, YYYY')}
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

        {capacitiesLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spin tip="Loading capacities...">
              <div className="p-5"></div>
            </Spin>
          </div>
        ) : capacitiesError ? (
          <Alert
            message="Error"
            description={`Failed to load capacities: ${capacitiesError}`}
            type="error"
            showIcon
            className="mb-4"
          />
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
                  <td colSpan={8} className="border p-3 font-medium text-red-700">
                    Morning (6AM-11AM)
                  </td>
                </tr>
                {hourSlots.Morning.map((hourSlot, idx) => (
                  <tr key={`Morning-${idx}`} className="hover:bg-gray-50">
                    <td className="border p-3 text-sm font-medium">{hourSlot.label}</td>
                    {weekDates.map(day => {
                      const hourKey = `${hourSlot.startHour}-${hourSlot.endHour}`;
                      // Check if there's a capacity matching this specific day, time slot and hour
                      const capacity = groupedCapacities[day.value]?.['Morning']?.[hourKey];

                      return (
                        <td key={`Morning-${day.value}-${hourKey}`} className="border p-3 text-center">
                          {capacity ? (
                            <div className="flex flex-col items-center">
                              <div className="flex items-center gap-1 mb-1">
                                {capacity.isActive ? (
                                  <Tag color="green" className="flex items-center">
                                    <CheckCircleOutlined /> Active
                                  </Tag>
                                ) : (
                                  <Tag color="red" className="flex items-center">
                                    <CloseCircleOutlined /> Inactive
                                  </Tag>
                                )}
                                <span className="font-medium">Capacity: {capacity.totalCapacity}</span>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  type="text"
                                  icon={<EditOutlined />}
                                  size="small"
                                  onClick={() => handleEditCapacity(capacity)}
                                />
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  size="small"
                                  onClick={() => handleDeleteCapacity(capacity)}
                                />
                              </div>
                            </div>
                          ) : (
                            <Button
                              type="dashed"
                              size="small"
                              onClick={() => handleCreateCapacity('Morning', day.value, hourSlot)}
                            >
                              Add Slot
                            </Button>
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

                      return (
                        <td key={`Afternoon-${day.value}-${hourKey}`} className="border p-3 text-center">
                          {capacity ? (
                            <div className="flex flex-col items-center">
                              <div className="flex items-center gap-1 mb-1">
                                {capacity.isActive ? (
                                  <Tag color="green" className="flex items-center">
                                    <CheckCircleOutlined /> Active
                                  </Tag>
                                ) : (
                                  <Tag color="red" className="flex items-center">
                                    <CloseCircleOutlined /> Inactive
                                  </Tag>
                                )}
                                <span className="font-medium">Capacity: {capacity.totalCapacity}</span>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  type="text"
                                  icon={<EditOutlined />}
                                  size="small"
                                  onClick={() => handleEditCapacity(capacity)}
                                />
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  size="small"
                                  onClick={() => handleDeleteCapacity(capacity)}
                                />
                              </div>
                            </div>
                          ) : (
                            <Button
                              type="dashed"
                              size="small"
                              onClick={() => handleCreateCapacity('Afternoon', day.value, hourSlot)}
                            >
                              Add Slot
                            </Button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                <tr className="bg-blue-50">
                  <td colSpan={8} className="border p-3 font-medium text-blue-700">
                    Evening (6PM-7PM)
                  </td>
                </tr>
                {hourSlots.Evening.map((hourSlot, idx) => (
                  <tr key={`Evening-${idx}`} className="hover:bg-gray-50">
                    <td className="border p-3 text-sm font-medium">{hourSlot.label}</td>
                    {weekDates.map(day => {
                      const hourKey = `${hourSlot.startHour}-${hourSlot.endHour}`;
                      const capacity = groupedCapacities[day.value]?.['Evening']?.[hourKey];

                      return (
                        <td key={`Evening-${day.value}-${hourKey}`} className="border p-3 text-center">
                          {capacity ? (
                            <div className="flex flex-col items-center">
                              <div className="flex items-center gap-1 mb-1">
                                {capacity.isActive ? (
                                  <Tag color="green" className="flex items-center">
                                    <CheckCircleOutlined /> Active
                                  </Tag>
                                ) : (
                                  <Tag color="red" className="flex items-center">
                                    <CloseCircleOutlined /> Inactive
                                  </Tag>
                                )}
                                <span className="font-medium">Capacity: {capacity.totalCapacity}</span>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  type="text"
                                  icon={<EditOutlined />}
                                  size="small"
                                  onClick={() => handleEditCapacity(capacity)}
                                />
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  size="small"
                                  onClick={() => handleDeleteCapacity(capacity)}
                                />
                              </div>
                            </div>
                          ) : (
                            <Button
                              type="dashed"
                              size="small"
                              onClick={() => handleCreateCapacity('Evening', day.value, hourSlot)}
                            >
                              Add Slot
                            </Button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        title={modalMode === 'create' ? 'Add New Capacity Slot' : 'Edit Capacity Slot'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okButtonProps={{ className: 'bg-red-500 hover:bg-red-600' }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            isActive: true
          }}
        >
          {modalMode === 'create' && selectedTimeSlot && selectedDay !== null && (
            <>
              <div className="bg-gray-50 p-4 mb-4 rounded-md">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Form.Item
                      name="timeSlot"
                      label="Time Slot"
                      rules={[{ required: true, message: 'Please select a time slot' }]}
                    >
                      <Select placeholder="Select time slot" disabled>
                        {timeSlots.map(slot => (
                          <Option key={slot.value} value={slot.value}>
                            {slot.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                  <div className="flex-1">
                    <Form.Item
                      name="dayOfWeek"
                      label="Day of Week"
                      rules={[{ required: true, message: 'Please select a day' }]}
                    >
                      <Select placeholder="Select day of week" disabled>
                        {daysOfWeek.map(day => (
                          <Option key={day.value} value={day.value}>
                            {day.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                </div>
                {selectedHourSlot && selectedDate && (
                  <div className="text-gray-700 text-sm">
                    <p>Creating slot for {selectedDate.format('MMM D, YYYY')} from {selectedHourSlot.startHour}:00 to {selectedHourSlot.endHour}:00 (Vietnam time)</p>
                  </div>
                )}
              </div>
            </>
          )}

          {modalMode === 'edit' && (
            <>
              <Form.Item
                name="timeSlot"
                label="Time Slot"
                rules={[{ required: true, message: 'Please select a time slot' }]}
              >
                <Select placeholder="Select time slot" disabled>
                  {timeSlots.map(slot => (
                    <Option key={slot.value} value={slot.value}>
                      {slot.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="dayOfWeek"
                label="Day of Week"
                rules={[{ required: true, message: 'Please select a day' }]}
              >
                <Select placeholder="Select day of week" disabled>
                  {daysOfWeek.map(day => (
                    <Option key={day.value} value={day.value}>
                      {day.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}

          <Form.Item
            name="totalCapacity"
            label="Total Capacity"
            rules={[{ required: true, message: 'Please enter the total capacity' }]}
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea rows={3} placeholder="Optional notes about this time slot" />
          </Form.Item>

          {modalMode === 'edit' && (
            <Form.Item
              name="isActive"
              label="Active"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title="Add Multiple Capacity Slots for a Week"
        open={isMultipleModalVisible}
        onOk={handleMultipleModalOk}
        onCancel={handleMultipleModalCancel}
        width={600}
        okButtonProps={{ className: 'bg-red-500 hover:bg-red-600' }}
      >
        <Form
          form={multipleForm}
          layout="vertical"
          initialValues={{
            startDayOfWeek: 1, // Monday
            endDayOfWeek: 6, // Saturday
            isActive: true,
            totalCapacity: 10,
            dateRange: [dayjs().startOf('week').add(1, 'day'), dayjs().startOf('week').add(6, 'day')]
          }}
        >
          <div className="bg-red-50 p-4 mb-4 rounded-md">
            <p className="text-red-700 text-sm">
              This will create capacity slots for all days between the selected start and end day of week,
              within the date range you specify. The API will automatically create slots for all time periods.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Form.Item
                name="startDayOfWeek"
                label="Start Day of Week"
                rules={[{ required: true, message: 'Please select a start day' }]}
              >
                <Select placeholder="Select start day">
                  {daysOfWeek.map(day => (
                    <Option key={day.value} value={day.value}>
                      {day.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            <div className="flex-1">
              <Form.Item
                name="endDayOfWeek"
                label="End Day of Week"
                rules={[{ required: true, message: 'Please select an end day' }]}
              >
                <Select placeholder="Select end day">
                  {daysOfWeek.map(day => (
                    <Option key={day.value} value={day.value}>
                      {day.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>

          <Form.Item
            name="dateRange"
            label="Date Range"
            rules={[{ required: true, message: 'Please select a date range' }]}
            tooltip="Select the week you want to create capacity slots for"
          >
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              allowClear={false}
            />
          </Form.Item>

          <Form.Item
            name="totalCapacity"
            label="Total Capacity"
            rules={[{ required: true, message: 'Please enter the total capacity' }]}
            tooltip="Maximum number of donors that can be scheduled in each time slot"
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea rows={3} placeholder="Optional notes about these time slots" defaultValue="Weekly capacity for blood donation center" />
          </Form.Item>
        </Form>
      </Modal>
    </StaffLayout>
  );
} 