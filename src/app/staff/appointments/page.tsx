'use client';

import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Select, DatePicker, Input, Card, Tabs, Modal, Form, Spin, Tooltip, App, Alert, Calendar, TimePicker, List, Radio, Badge, Typography, Descriptions, Empty } from 'antd';
import { SearchOutlined, CheckOutlined, CloseOutlined, CalendarOutlined, ExclamationCircleOutlined, ClockCircleOutlined, InfoCircleOutlined, UserOutlined, PlusOutlined, EnvironmentOutlined, ScheduleOutlined, TeamOutlined, LeftOutlined, RightOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import StaffLayout from '@/components/Layout/StaffLayout';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/api/apiConfig';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useRouter } from 'next/navigation';
import { useDonationAppointment } from '@/hooks/api/useDonationAppointment';
import { useBloodGroups } from '@/hooks/api/useBloodGroups';
import { useComponentTypes } from '@/hooks/api/useComponentTypes';
import { StaffAssignmentRequest } from '@/services/api/donationAppointmentService';
import { useStaffById } from '@/hooks/api/useUsers';
import { useAllDonors } from '@/hooks/api/useDonorProfile';
import { DonorProfile } from '@/services/api/donorProfileService';
import { useLocationCapacities } from '@/hooks/api/useLocations';
import { Capacity } from '@/services/api/locationService';

// Configure dayjs to use timezone
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh'); // Set Vietnam timezone

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { confirm } = Modal;
const { TextArea } = Input;

// Time slots configuration
const timeSlots = [
  { label: 'Morning (7AM-11AM)', value: 'Morning' },
  { label: 'Afternoon (1PM-5PM)', value: 'Afternoon' },
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

// Interface for appointment data from API
interface AppointmentRequest {
  id: string;
  donorId: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  totalDonations?: number;
  lastDonationDate?: string;
  nextEligibleDonationDate?: string;
  preferredDate: string;
  preferredTimeSlot: string;
  locationId: string;
  locationName: string;
  locationAddress: string;
  bloodGroupId: string | null;
  bloodGroupName: string | null;
  componentTypeId: string | null;
  componentTypeName: string | null;
  requestType: string;
  initiatedByUserId: string;
  initiatedByUserName: string;
  status: string;
  notes: string;
  rejectionReason: string | null;
  reviewedByUserId: string | null;
  reviewedByUserName: string | null;
  reviewedAt: string | null;
  confirmedDate: string | null;
  confirmedTimeSlot: string | null;
  confirmedLocationId: string | null;
  confirmedLocationName: string | null;
  donorAccepted: boolean | null;
  donorResponseAt: string | null;
  donorResponseNotes: string | null;
  workflowId: string | null;
  isUrgent: boolean;
  priority: number;
  createdTime: string;
  lastUpdatedTime: string | null;
  expiresAt: string | null;
  checkInTime?: string;
  completedTime?: string;
  cancelledTime?: string;
}

// Interface for API response
interface ApiResponse {
  data: AppointmentRequest[];
  count: number;
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
}

export default function StaffAppointmentsPage() {
  const { user } = useAuth();
  const { message } = App.useApp(); // Use App context for message notifications
  const [activeTab, setActiveTab] = useState('all');
  const [filteredInfo, setFilteredInfo] = useState<any>({});
  const [sortedInfo, setSortedInfo] = useState<any>({});
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<any>(null);

  // Status modification modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | 'checkin' | 'complete' | 'fail'>('approve');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRequest | null>(null);
  const [form] = Form.useForm();

  // Appointment detail modal
  const [isAppointmentDetailModalVisible, setIsAppointmentDetailModalVisible] = useState(false);
  const [appointmentDetail, setAppointmentDetail] = useState<AppointmentRequest | null>(null);
  const [loadingAppointmentDetail, setLoadingAppointmentDetail] = useState(false);

  // Donor profile modal
  const [isDonorProfileModalVisible, setIsDonorProfileModalVisible] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    phone: string;
    phoneNumber: string;
    bloodGroupName: string | null;
    totalDonations?: number;
    lastDonationDate?: string | null;
    nextEligibleDonationDate?: string | null;
  } | null>(null);

  // Donor assignment modal
  const [isAssignDonorModalVisible, setIsAssignDonorModalVisible] = useState(false);
  const [assignDonorForm] = Form.useForm();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [priority, setPriority] = useState<number>(1);
  const [selectedDonorProfile, setSelectedDonorProfile] = useState<DonorProfile | null>(null);

  // Week navigation for schedule view
  const [currentWeekStart, setCurrentWeekStart] = useState<dayjs.Dayjs>(dayjs().tz().startOf('week'));
  const [selectedHourSlot, setSelectedHourSlot] = useState<{ startHour: number, endHour: number } | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [capacities, setCapacities] = useState<Capacity[]>([]);
  const [loadingCapacities, setLoadingCapacities] = useState<boolean>(false);
  const [selectedCapacity, setSelectedCapacity] = useState<Capacity | null>(null);

  // Donation appointment hook
  const {
    availableTimeSlots,
    isLoading: isLoadingTimeSlots,
    fetchAvailableTimeSlots,
    submitStaffAssignment,
    isSubmitting: isSubmittingAssignment,
    error: assignmentError,
    successMessage: assignmentSuccess
  } = useDonationAppointment();

  // Blood groups and component types
  const { bloodGroups, isLoading: isLoadingBloodGroups } = useBloodGroups();
  const { componentTypes, isLoading: isLoadingComponentTypes } = useComponentTypes();

  // Get staff details
  const { staff } = useStaffById(user?.id || '');

  // Get all donors
  const {
    filteredDonors,
    isLoading: isLoadingDonors,
    error: donorsError,
    filterDonorsByBloodGroup,
    resetFilter
  } = useAllDonors();

  // Get location capacities
  const {
    capacities: locationCapacities,
    isLoading: isLoadingLocationCapacities,
    error: capacitiesError,
    fetchCapacities,
    createCapacity
  } = useLocationCapacities();

  const router = useRouter();

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Build query parameters
      let queryParams = new URLSearchParams();
      if (activeTab !== 'all') {
        queryParams.append('Status', activeTab);
      }

      const response = await apiClient.get<ApiResponse>(
        `/DonationAppointmentRequests?${queryParams.toString()}`
      );

      if (response.data.success) {
        setAppointments(response.data.data);
      } else {
        message.error(response.data.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      message.error('Failed to fetch appointments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Generate dates for the current week
  const weekDates = React.useMemo(() => {
    return daysOfWeek.map(day => {
      const date = currentWeekStart.clone().add(day.value, 'day');
      return {
        ...day,
        date,
        dateString: date.format('MMM D, YYYY')
      };
    });
  }, [currentWeekStart]);

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

  // Function to check if a date is in the past
  const isDateInPast = (date: dayjs.Dayjs): boolean => {
    const now = dayjs().tz();
    return date.isBefore(now);
  };

  // Function to select a time slot from capacity
  const handleSelectCapacity = (capacity: Capacity, hourSlot: { startHour: number, endHour: number }, day: number) => {
    // Find the date for the selected day
    const selectedDayDate = weekDates.find(d => d.value === day)?.date || dayjs();

    // Set the selected date and time slot
    setSelectedDate(selectedDayDate);
    setSelectedTimeSlot(capacity.timeSlot);
    setSelectedHourSlot(hourSlot);
    setSelectedDay(day);
    setSelectedCapacity(capacity);
  };

  // Fetch capacities when location or week changes
  useEffect(() => {
    if (currentStep === 3 && staff?.locations && staff.locations.length > 0) {
      const staffLocationId = staff.locations[0].locationId;
      setLoadingCapacities(true);

      fetchCapacities(staffLocationId)
        .then(data => {
          if (data) {
            setCapacities(data);
          }
        })
        .catch(error => {
          console.error('Error fetching capacities:', error);
        })
        .finally(() => {
          setLoadingCapacities(false);
        });
    }
  }, [currentStep, currentWeekStart, staff]);

  // Group capacities by day of week, time slot, and hour for display
  const groupedCapacities = React.useMemo(() => {
    if (!capacities || capacities.length === 0) return {};

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

  const handleStatusChange = async (appointmentId: string, newStatus: string, note?: string) => {
    try {
      const payload = {
        status: newStatus,
        note: note || '',
        updatedByUserId: user?.id
      };

      const response = await apiClient.put(
        `/DonationAppointmentRequests/${appointmentId}/status`,
        payload
      );

      if (response.data.success) {
        message.success(`Appointment ${newStatus.toLowerCase()} successfully`);
        fetchAppointments(); // Refresh data
      } else {
        message.error(response.data.message || `Failed to ${newStatus.toLowerCase()} appointment`);
      }
    } catch (error) {
      console.error(`Error updating appointment status:`, error);
      message.error(`Failed to ${newStatus.toLowerCase()} appointment. Please try again later.`);
    }
  };

  const showStatusModal = (appointment: AppointmentRequest, action: 'approve' | 'reject' | 'complete' | 'fail') => {
    setSelectedAppointment(appointment);
    setModalAction(action);
    setIsModalVisible(true);
    form.resetFields();
  };

  // Function to check in donor directly using the donation events API
  const checkInDonor = async (appointment: AppointmentRequest) => {
    try {
      const checkInTime = dayjs().toISOString();

      // Create request body
      const request = {
        appointmentId: appointment.id,
        checkInTime: checkInTime,
        notes: `Checked in by ${user?.firstName} ${user?.lastName}`
      };

      message.loading({ content: 'Checking in donor...', key: 'checkin' });

      // Call the API directly
      const response = await apiClient.post('/DonationEvents/check-in', request);

      if (response.data.success) {
        message.success({ content: 'Donor checked in successfully', key: 'checkin' });
        fetchAppointments(); // Refresh the appointments list
      } else {
        message.error({ content: response.data.message || 'Failed to check in donor', key: 'checkin' });
      }
    } catch (error) {
      console.error('Error checking in donor:', error);
      message.error({ content: 'An error occurred while checking in the donor', key: 'checkin' });
    }
  };

  // Navigate to donation workflow for checkin
  const startDonationWorkflow = (appointmentId: string) => {
    router.push(`/staff/donation-workflow?appointmentId=${appointmentId}`);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (!selectedAppointment) return;

      let newStatus = '';
      switch (modalAction) {
        case 'approve':
          newStatus = 'Approved';
          break;
        case 'reject':
          newStatus = 'Rejected';
          break;
        case 'complete':
          newStatus = 'Completed';
          break;
        case 'fail':
          newStatus = 'Failed';
          break;
      }

      handleStatusChange(selectedAppointment.id, newStatus, values.note);
      setIsModalVisible(false);
    });
  };

  const showCancelConfirm = (appointment: AppointmentRequest) => {
    confirm({
      title: 'Are you sure you want to cancel this appointment?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes, Cancel',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        handleStatusChange(appointment.id, 'Cancelled');
      }
    });
  };

  const handleChange = (pagination: any, filters: any, sorter: any) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  const clearFilters = () => {
    setFilteredInfo({});
    setSearchText('');
    setDateRange(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'green';
      case 'pending':
        return 'gold';
      case 'completed':
        return 'blue';
      case 'cancelled':
      case 'rejected':
      case 'failed':
        return 'red';
      case 'checkedin':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getDonationTypeColor = (type: string | null) => {
    if (!type) return 'default';

    switch (type.toLowerCase()) {
      case 'whole blood':
        return 'red';
      case 'platelets':
        return 'orange';
      case 'plasma':
        return 'blue';
      case 'double red cells':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getAvailableActions = (record: AppointmentRequest) => {
    const status = record.status.toLowerCase();

    if (status === 'pending') {
      return (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => showStatusModal(record, 'approve')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Approve
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseOutlined />}
            onClick={() => showStatusModal(record, 'reject')}
          >
            Reject
          </Button>
          <Button
            size="small"
            onClick={() => viewAppointmentDetail(record.id)}
          >
            View Details
          </Button>
        </Space>
      );
    } else if (status === 'approved') {
      return (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => checkInDonor(record)}
          >
            Check In
          </Button>
          <Button
            danger
            size="small"
            onClick={() => showCancelConfirm(record)}
          >
            Cancel
          </Button>
          <Button
            size="small"
            onClick={() => viewAppointmentDetail(record.id)}
          >
            View Details
          </Button>
        </Space>
      );
    } else if (status === 'checkedin') {
      return (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => startDonationWorkflow(record.id)}
          >
            Start Donation
          </Button>
          <Button
            type="primary"
            size="small"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => showStatusModal(record, 'complete')}
          >
            Complete
          </Button>
          <Button
            danger
            size="small"
            onClick={() => showStatusModal(record, 'fail')}
          >
            Mark Failed
          </Button>
          <Button
            size="small"
            onClick={() => viewAppointmentDetail(record.id)}
          >
            View Details
          </Button>
        </Space>
      );
    } else {
      return (
        <Button
          size="small"
          onClick={() => viewAppointmentDetail(record.id)}
        >
          View Details
        </Button>
      );
    }
  };

  const showDonorProfileModal = async (record: AppointmentRequest) => {
    // Split the donor name into first and last name
    const nameParts = record.donorName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    try {
      // Fetch donor profile from API
      const response = await apiClient.get(`/DonorProfiles/${record.donorId}`);

      if (response.data.success && response.data.data) {
        const donorProfile = response.data.data;
        setSelectedDonor({
          id: record.donorId,
          firstName: donorProfile.firstName || firstName,
          lastName: donorProfile.lastName || lastName,
          userName: donorProfile.userName || record.donorName,
          email: donorProfile.email || record.donorEmail,
          phone: donorProfile.phoneNumber || record.donorPhone,
          phoneNumber: donorProfile.phoneNumber || record.donorPhone,
          bloodGroupName: donorProfile.bloodGroupName || record.bloodGroupName,
          totalDonations: donorProfile.totalDonations,
          lastDonationDate: donorProfile.lastDonationDate,
          nextEligibleDonationDate: donorProfile.nextEligibleDonationDate || donorProfile.nextAvailableDonationDate
        });
      } else {
        // Fallback to basic info if API call fails
        setSelectedDonor({
          id: record.donorId,
          firstName: firstName,
          lastName: lastName,
          userName: record.donorName,
          email: record.donorEmail,
          phone: record.donorPhone,
          phoneNumber: record.donorPhone,
          bloodGroupName: record.bloodGroupName
        });
        message.warning('Không thể tải đầy đủ thông tin người hiến máu');
      }
    } catch (error: any) {
      console.error('Error fetching donor profile:', error);
      // Fallback to basic info if API call fails
      setSelectedDonor({
        id: record.donorId,
        firstName: firstName,
        lastName: lastName,
        userName: record.donorName,
        email: record.donorEmail,
        phone: record.donorPhone,
        phoneNumber: record.donorPhone,
        bloodGroupName: record.bloodGroupName
      });
      message.error('Lỗi khi tải thông tin người hiến máu');
    }

    setIsDonorProfileModalVisible(true);
  };

  const columns = [
    {
      title: 'Donor Name',
      dataIndex: 'donorName',
      key: 'donorName',
      sorter: (a: AppointmentRequest, b: AppointmentRequest) => a.donorName.localeCompare(b.donorName),
      sortOrder: sortedInfo.columnKey === 'donorName' && sortedInfo.order,
      render: (text: string, record: AppointmentRequest) => (
        <div className="flex items-center">
          <span>{text}</span>
          <Tooltip title="View donor profile">
            <InfoCircleOutlined
              className="ml-2 text-blue-500 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                showDonorProfileModal(record);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: 'Date & Time',
      key: 'date',
      render: (text: string, record: AppointmentRequest) => {
        // Convert UTC time to Vietnam time zone
        const utcDate = dayjs(record.preferredDate);
        // Không cần add 7 giờ vì đã thiết lập timezone 'Asia/Ho_Chi_Minh'
        const localDate = utcDate.tz('Asia/Ho_Chi_Minh');

        return (
          <span>
            <div className="flex items-center">
              <CalendarOutlined className="mr-1" /> {localDate.format('DD/MM/YYYY HH:mm:ss')}
            </div>
            <div className="flex items-center text-gray-500 mt-1">
              <ClockCircleOutlined className="mr-1" /> {record.preferredTimeSlot}
            </div>
          </span>
        );
      },
      sorter: (a: AppointmentRequest, b: AppointmentRequest) =>
        dayjs(a.preferredDate).unix() - dayjs(b.preferredDate).unix(),
      sortOrder: sortedInfo.columnKey === 'date' && sortedInfo.order,
    },
    {
      title: 'Facility',
      dataIndex: 'locationName',
      key: 'locationName',
      render: (text: string, record: AppointmentRequest) => (
        <span>
          <div>{text}</div>
          <div className="flex items-center text-gray-500 mt-1 text-xs">
            {record.locationAddress}
          </div>
        </span>
      ),
    },
    {
      title: 'Blood Group',
      dataIndex: 'bloodGroupName',
      key: 'bloodGroupName',
      filters: [
        { text: 'A+', value: 'A+' },
        { text: 'A-', value: 'A-' },
        { text: 'B+', value: 'B+' },
        { text: 'B-', value: 'B-' },
        { text: 'AB+', value: 'AB+' },
        { text: 'AB-', value: 'AB-' },
        { text: 'O+', value: 'O+' },
        { text: 'O-', value: 'O-' },
      ],
      filteredValue: filteredInfo.bloodGroupName || null,
      onFilter: (value: any, record: AppointmentRequest) => record.bloodGroupName === value,
    },
    {
      title: 'Donation Type',
      dataIndex: 'componentTypeName',
      key: 'componentTypeName',
      render: (text: string | null, record: AppointmentRequest) => (
        <Tag color={getDonationTypeColor(text)}>
          {text || 'Whole Blood'}
        </Tag>
      ),
      filters: [
        { text: 'Whole Blood', value: 'Whole Blood' },
        { text: 'Plasma', value: 'Plasma' },
        { text: 'Platelets', value: 'Platelets' },
      ],
      filteredValue: filteredInfo.componentTypeName || null,
      onFilter: (value: any, record: AppointmentRequest) => record.componentTypeName === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: any, record: AppointmentRequest) => getAvailableActions(record),
    },
  ];

  // Filter data based on search text and date range
  const getFilteredAppointments = () => {
    let filtered = [...appointments];

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(appt =>
        appt.donorName.toLowerCase().includes(searchLower) ||
        appt.donorId.toLowerCase().includes(searchLower) ||
        appt.donorEmail.toLowerCase().includes(searchLower) ||
        appt.locationName.toLowerCase().includes(searchLower)
      );
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');

      filtered = filtered.filter(appt => {
        const appointmentDate = dayjs(appt.preferredDate);
        return appointmentDate.isAfter(startDate) && appointmentDate.isBefore(endDate);
      });
    }

    return filtered;
  };

  const modalTitle = () => {
    switch (modalAction) {
      case 'approve': return 'Approve Appointment';
      case 'reject': return 'Reject Appointment';
      case 'complete': return 'Complete Donation';
      case 'fail': return 'Mark Donation as Failed';
      default: return 'Update Appointment';
    }
  };

  // Handle showing the donor assignment modal
  const showAssignDonorModal = () => {
    setIsAssignDonorModalVisible(true);
    setCurrentStep(1);
    assignDonorForm.resetFields();

    // Reset state
    setSelectedDate(dayjs());
    setSelectedTimeSlot('');
    setIsUrgent(false);
    setPriority(1);
    setSelectedDonorProfile(null);

    // Reset donor filter
    resetFilter();
  };

  // Handle moving to next step in the donor assignment wizard
  const handleNextStep = () => {
    assignDonorForm.validateFields().then((values) => {
      if (currentStep === 1) {
        // If blood group is selected, filter donors
        if (values.bloodGroup) {
          filterDonorsByBloodGroup(values.bloodGroup);
        }
        setCurrentStep(2);
      } else if (currentStep === 2) {
        // Ensure a donor is selected before proceeding
        if (!selectedDonorProfile) {
          message.error('Please select a donor to continue');
          return;
        }
        setCurrentStep(3);
      } else if (currentStep === 3) {
        // Ensure a time slot is selected
        if (!selectedTimeSlot || !selectedDate) {
          message.error('Please select a date and time slot to continue');
          return;
        }

        // If we have a staff location, load available time slots
        if (staff?.locations && staff.locations.length > 0) {
          const staffLocationId = staff.locations[0].locationId;
          fetchAvailableTimeSlots(staffLocationId, selectedDate.toDate());
        }
        setCurrentStep(4);
      }
    }).catch((errorInfo) => {
      console.log('Validation failed:', errorInfo);
    });
  };

  // Handle going back to previous step
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle creating a new capacity slot
  const handleCreateCapacity = (timeSlot: string, dayOfWeek: number, hourSlot: { startHour: number, endHour: number }) => {
    // Find the date for the selected day
    const selectedDayDate = weekDates.find(d => d.value === dayOfWeek)?.date || dayjs();

    // Create effective date and expiry date for the capacity
    const effectiveDate = selectedDayDate.hour(hourSlot.startHour).minute(0).second(0).millisecond(0);
    const expiryDate = selectedDayDate.hour(hourSlot.endHour).minute(0).second(0).millisecond(0);

    // Get hour slot label
    const hourSlotLabel = `${hourSlot.startHour}:00 - ${hourSlot.endHour}:00`;

    // Show modal to create capacity
    Modal.confirm({
      title: 'Create New Capacity Slot',
      content: (
        <div className="py-4">
          <p><strong>Date:</strong> {selectedDayDate.format('MMM D, YYYY')}</p>
          <p><strong>Time Slot:</strong> {timeSlot} ({hourSlotLabel})</p>
          <p><strong>Capacity:</strong> <Input type="number" min={1} defaultValue={5} id="capacityInput" /></p>
        </div>
      ),
      okText: 'Create',
      cancelText: 'Cancel',
      onOk: async () => {
        // Get capacity value from input
        const capacityInput = document.getElementById('capacityInput') as HTMLInputElement;
        const totalCapacity = parseInt(capacityInput?.value || '5', 10);

        if (staff?.locations && staff.locations.length > 0) {
          const staffLocationId = staff.locations[0].locationId;

          try {
            // Create capacity data
            const capacityData = {
              locationId: staffLocationId,
              timeSlot: timeSlot,
              totalCapacity: totalCapacity,
              dayOfWeek: dayOfWeek,
              effectiveDate: effectiveDate.toISOString(),
              expiryDate: expiryDate.toISOString(),
              notes: 'Created from appointment wizard',
              isActive: true
            };

            // Create capacity
            const success = await createCapacity(staffLocationId, capacityData);

            if (success) {
              message.success('Capacity slot created successfully');
              // Refresh capacities
              fetchCapacities(staffLocationId);
            } else {
              message.error('Failed to create capacity slot');
            }
          } catch (error) {
            console.error('Error creating capacity:', error);
            message.error('An error occurred while creating capacity slot');
          }
        }
      }
    });
  };

  // Handle donor assignment submission
  const handleDonorAssignmentSubmit = async () => {
    try {
      const formValues = await assignDonorForm.validateFields();

      if (!staff?.locations || staff.locations.length === 0) {
        message.error('You do not have any assigned locations assigned to create appointments from');
        return;
      }

      if (!selectedDonorProfile) {
        message.error('Please select a donor to continue');
        return;
      }

      if (!selectedTimeSlot) {
        message.error('Please select a time slot to continue');
        return;
      }

      const staffLocationId = staff.locations[0].locationId;

      // Format the date with the selected time
      let preferredDate = selectedDate.format('YYYY-MM-DD');

      if (selectedHourSlot) {
        // Create a date with the selected hour
        preferredDate = selectedDate.hour(selectedHourSlot.startHour).format('YYYY-MM-DD[T]HH:00:00');
      }

      const requestData: StaffAssignmentRequest = {
        donorId: selectedDonorProfile.userId,
        preferredDate: preferredDate,
        preferredTimeSlot: selectedTimeSlot,
        locationId: staffLocationId,
        bloodGroupId: selectedDonorProfile.bloodGroupId || formValues.bloodGroup,
        componentTypeId: formValues.componentType,
        notes: formValues.notes,
        isUrgent: isUrgent,
        priority: priority,
        autoExpireHours: formValues.autoExpireHours || 0
      };

      console.log('Submitting assignment request:', requestData);

      const success = await submitStaffAssignment(requestData);

      if (success) {
        message.success('Successfully assigned donor to donation appointment');
        setIsAssignDonorModalVisible(false);
        fetchAppointments(); // Refresh appointments list
      } else {
        message.error(assignmentError || 'Failed to assign donor');
      }
    } catch (error) {
      console.error('Error submitting donor assignment:', error);
    }
  };

  // Get time slots for the selected date
  const getTimeSlotsForDate = () => {
    // If no location is assigned to staff
    if (!staff?.locations || staff.locations.length === 0) {
      return [];
    }

    const locationId = staff.locations[0].locationId;
    const selectedDateStr = selectedDate.format('YYYY-MM-DD');

    // Find the available time slots for the selected date and location
    const slotsForDate = availableTimeSlots
      .filter(slot => slot.date.includes(selectedDateStr) && slot.locationId === locationId)
      .flatMap(slot =>
        slot.locations.flatMap(loc =>
          loc.timeSlots.filter(ts => ts.isAvailable)
        )
      );

    return slotsForDate;
  };

  // Function to view appointment details
  const viewAppointmentDetail = async (appointmentId: string) => {
    setLoadingAppointmentDetail(true);
    setIsAppointmentDetailModalVisible(true);

    try {
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        statusCode: number;
        errors: string[];
        data: AppointmentRequest;
        count: number;
      }>(`/DonationAppointmentRequests/${appointmentId}`);

      if (response.data.success) {
        setAppointmentDetail(response.data.data);
      } else {
        message.error(response.data.message || 'Không thể tải thông tin cuộc hẹn');
        setAppointmentDetail(null);
      }
    } catch (error: any) {
      console.error('Error fetching appointment details:', error);
      message.error('Lỗi khi tải thông tin cuộc hẹn');
      setAppointmentDetail(null);
    } finally {
      setLoadingAppointmentDetail(false);
    }
  };

  return (
    <StaffLayout title="Appointments" breadcrumbItems={[{ title: 'Appointments' }]}>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Manage Donation Appointments</h2>
            <p className="text-gray-500">View and manage all donor appointments</p>
          </div>
          <div>
            <Button
              type="primary"
              className="bg-red-600 hover:bg-red-700"
              icon={<PlusOutlined />}
              onClick={showAssignDonorModal}
            >
              Assign Donor
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
              />
            </div>
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                placeholder="Search by donor name, email or location"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div className="self-end">
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          </div>
        </Card>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="mb-6"
          type="card"
        >
          <TabPane tab="All" key="all" />
          <TabPane tab="Pending" key="Pending" />
          <TabPane tab="Approved" key="Approved" />
          <TabPane tab="Checked In" key="CheckedIn" />
          <TabPane tab="Completed" key="Completed" />
          <TabPane tab="Rejected" key="Rejected" />
          <TabPane tab="Cancelled" key="Cancelled" />
          <TabPane tab="Failed" key="Failed" />
        </Tabs>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={getFilteredAppointments()}
            rowKey="id"
            onChange={handleChange}
            pagination={{ pageSize: 10 }}
          />
        )}
      </div>

      <Modal
        title={modalTitle()}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="note"
            label="Add a note (optional)"
            rules={[
              {
                required: modalAction === 'reject' || modalAction === 'fail',
                message: `Please provide a reason for ${modalAction === 'reject' ? 'rejection' : 'failure'}`
              }
            ]}
          >
            <TextArea rows={4} placeholder="Add any relevant notes or comments" />
          </Form.Item>

          {selectedAppointment && (
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <p><strong>Donor:</strong> {selectedAppointment.donorName}</p>
              <p><strong>Date:</strong> {dayjs(selectedAppointment.preferredDate).format('MMM D, YYYY HH:mm')}</p>
              <p><strong>Location:</strong> {selectedAppointment.locationName}</p>
            </div>
          )}
        </Form>
      </Modal>

      {/* Appointment Detail Modal */}
      <Modal
        title="Chi tiết cuộc hẹn hiến máu"
        open={isAppointmentDetailModalVisible}
        onCancel={() => setIsAppointmentDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsAppointmentDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {loadingAppointmentDetail ? (
          <div className="flex justify-center items-center py-10">
            <Spin size="large" />
          </div>
        ) : appointmentDetail ? (
          <div>
            <Card className="mb-4">
              <Descriptions title="Thông tin người hiến máu" bordered column={2}>
                <Descriptions.Item label="Họ tên" span={2}>
                  <strong>{appointmentDetail.donorName}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {appointmentDetail.donorEmail}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {appointmentDetail.donorPhone}
                </Descriptions.Item>
                <Descriptions.Item label="Nhóm máu">
                  <Tag color="red">{appointmentDetail.bloodGroupName || 'Chưa xác định'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Loại hiến máu">
                  <Tag color={getDonationTypeColor(appointmentDetail.componentTypeName)}>
                    {appointmentDetail.componentTypeName || 'Máu toàn phần'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng số lần hiến máu">
                  {appointmentDetail.totalDonations || 0}
                </Descriptions.Item>
                <Descriptions.Item label="Lần hiến máu gần nhất">
                  {appointmentDetail.lastDonationDate ?
                    dayjs(appointmentDetail.lastDonationDate).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss') :
                    'Chưa có thông tin'}
                </Descriptions.Item>
                <Descriptions.Item label="Lần hiến máu tiếp theo">
                  {appointmentDetail.nextEligibleDonationDate ?
                    dayjs(appointmentDetail.nextEligibleDonationDate).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss') :
                    'Chưa có thông tin'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card className="mb-4">
              <Descriptions title="Thông tin cuộc hẹn" bordered column={2}>
                <Descriptions.Item label="Mã cuộc hẹn" span={2}>
                  {appointmentDetail.id}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(appointmentDetail.status)}>
                    {appointmentDetail.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Loại yêu cầu">
                  {appointmentDetail.requestType}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày hẹn">
                  {dayjs(appointmentDetail.preferredDate).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="Khung giờ">
                  {appointmentDetail.preferredTimeSlot}
                </Descriptions.Item>
                <Descriptions.Item label="Địa điểm" span={2}>
                  {appointmentDetail.locationName}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>
                  {appointmentDetail.locationAddress}
                </Descriptions.Item>
                <Descriptions.Item label="Khẩn cấp">
                  {appointmentDetail.isUrgent ? (
                    <Tag color="red">Khẩn cấp</Tag>
                  ) : (
                    <Tag color="green">Thường</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Độ ưu tiên">
                  {appointmentDetail.priority}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú" span={2}>
                  {appointmentDetail.notes || 'Không có ghi chú'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card className="mb-4">
              <Descriptions title="Thông tin xử lý" bordered column={2}>
                {appointmentDetail.reviewedByUserName && (
                  <>
                    <Descriptions.Item label="Người xử lý">
                      {appointmentDetail.reviewedByUserName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian xử lý">
                      {appointmentDetail.reviewedAt ?
                        dayjs(appointmentDetail.reviewedAt).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss') :
                        'Chưa xử lý'}
                    </Descriptions.Item>
                  </>
                )}
                {appointmentDetail.rejectionReason && (
                  <Descriptions.Item label="Lý do từ chối" span={2}>
                    {appointmentDetail.rejectionReason}
                  </Descriptions.Item>
                )}
                {appointmentDetail.checkInTime && (
                  <Descriptions.Item label="Thời gian check-in">
                    {dayjs(appointmentDetail.checkInTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')}
                  </Descriptions.Item>
                )}
                {appointmentDetail.completedTime && (
                  <Descriptions.Item label="Thời gian hoàn thành">
                    {dayjs(appointmentDetail.completedTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')}
                  </Descriptions.Item>
                )}
                {appointmentDetail.cancelledTime && (
                  <Descriptions.Item label="Thời gian hủy">
                    {dayjs(appointmentDetail.cancelledTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Thời gian tạo">
                  {dayjs(appointmentDetail.createdTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật lần cuối">
                  {appointmentDetail.lastUpdatedTime ?
                    dayjs(appointmentDetail.lastUpdatedTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss') :
                    'Chưa cập nhật'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        ) : (
          <Empty description="Không tìm thấy thông tin cuộc hẹn" />
        )}
      </Modal>

      {/* Donor Profile Modal */}
      <Modal
        title="Thông tin người hiến máu"
        open={isDonorProfileModalVisible}
        onCancel={() => setIsDonorProfileModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDonorProfileModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedDonor && (
          <div>
            <Card className="mb-4" bordered={false}>
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-3 rounded-full mr-4">
                  <UserOutlined style={{ fontSize: '24px', color: '#f5222d' }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold m-0">{selectedDonor.firstName} {selectedDonor.lastName}</h2>
                  <p className="text-gray-500 m-0">Email: {selectedDonor.email}</p>
                  <p className="text-gray-500 m-0">SĐT: {selectedDonor.phone}</p>
                </div>
              </div>

              <Descriptions column={2} bordered>
                <Descriptions.Item label="Mã người hiến máu" span={2}>
                  {selectedDonor.id}
                </Descriptions.Item>
                <Descriptions.Item label="Nhóm máu">
                  <Tag color="red">{selectedDonor.bloodGroupName || 'Chưa xác định'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng số lần hiến máu">
                  {selectedDonor.totalDonations || 0}
                </Descriptions.Item>
                <Descriptions.Item label="Lần hiến máu gần nhất">
                  {selectedDonor.lastDonationDate ?
                    dayjs(selectedDonor.lastDonationDate).add(7, 'hour').format('DD/MM/YYYY HH:mm:ss') :
                    'Chưa có thông tin'}
                </Descriptions.Item>
                <Descriptions.Item label="Lần hiến máu tiếp theo">
                  {selectedDonor.nextEligibleDonationDate ?
                    dayjs(selectedDonor.nextEligibleDonationDate).add(7, 'hour').format('DD/MM/YYYY HH:mm:ss') :
                    'Chưa có thông tin'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        )}
      </Modal>

      {/* Donor Assignment Modal */}
      <Modal
        title="Assign Donor to Appointment"
        open={isAssignDonorModalVisible}
        onCancel={() => setIsAssignDonorModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <div className="px-2">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div className="w-1/4 text-center">
                <div className={`rounded-full h-10 w-10 flex items-center justify-center mx-auto ${currentStep >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <div className="mt-1 text-sm">Details</div>
              </div>
              <div className="w-1/4 text-center">
                <div className={`rounded-full h-10 w-10 flex items-center justify-center mx-auto ${currentStep >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <div className="mt-1 text-sm">Donor</div>
              </div>
              <div className="w-1/4 text-center">
                <div className={`rounded-full h-10 w-10 flex items-center justify-center mx-auto ${currentStep >= 3 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <div className="mt-1 text-sm">Date</div>
              </div>
              <div className="w-1/4 text-center">
                <div className={`rounded-full h-10 w-10 flex items-center justify-center mx-auto ${currentStep >= 4 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
                  4
                </div>
                <div className="mt-1 text-sm">Time</div>
              </div>
            </div>
            <div className="relative flex items-center mt-1">
              <div className="h-1 w-full bg-gray-200">
                <div
                  className="h-1 bg-red-600 transition-all duration-300"
                  style={{ width: `${(currentStep - 1) * 33.33}%` }}
                ></div>
              </div>
            </div>
          </div>

          <Form
            form={assignDonorForm}
            layout="vertical"
            requiredMark={false}
          >
            {/* Step 1: Select donor and donation details */}
            {currentStep === 1 && (
              <div>
                <Alert
                  message="First, select blood group and donation type"
                  description="After selecting a blood group, you'll be able to choose from eligible donors in the next step."
                  type="info"
                  showIcon
                  className="mb-4"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="bloodGroup"
                    label="Blood Group"
                    rules={[{ required: true, message: 'Please select blood group' }]}
                  >
                    <Select
                      placeholder="Select blood group"
                      loading={isLoadingBloodGroups}
                      disabled={isLoadingBloodGroups}
                    >
                      {bloodGroups.map(group => (
                        <Option key={group.id} value={group.id}>{group.groupName}</Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="componentType"
                    label="Donation Type"
                    rules={[{ required: true, message: 'Please select donation type' }]}
                  >
                    <Select
                      placeholder="Select donation type"
                      loading={isLoadingComponentTypes}
                      disabled={isLoadingComponentTypes}
                    >
                      {componentTypes.map(type => (
                        <Option key={type.id} value={type.id}>{type.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                <Form.Item
                  name="notes"
                  label="Notes"
                >
                  <TextArea
                    placeholder="Add any special instructions or notes"
                    rows={3}
                  />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="urgency"
                    label="Urgency"
                    className="mb-0"
                  >
                    <Radio.Group onChange={(e) => setIsUrgent(e.target.value)} value={isUrgent}>
                      <Radio value={true}>Urgent</Radio>
                      <Radio value={false}>Normal</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    name="priority"
                    label="Priority (1-5)"
                    className="mb-0"
                  >
                    <Select
                      placeholder="Select priority"
                      onChange={(value) => setPriority(Number(value))}
                      value={priority}
                    >
                      <Option value={1}>1 (Lowest)</Option>
                      <Option value={2}>2</Option>
                      <Option value={3}>3 (Normal)</Option>
                      <Option value={4}>4</Option>
                      <Option value={5}>5 (Highest)</Option>
                    </Select>
                  </Form.Item>
                </div>

                <Form.Item
                  name="autoExpireHours"
                  label="Auto-expire after (hours)"
                  extra="Leave at 0 for no auto-expiration"
                  className="mt-4"
                >
                  <Input type="number" min={0} defaultValue={0} />
                </Form.Item>
              </div>
            )}

            {/* Step 2: Select donor */}
            {currentStep === 2 && (
              <div>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      <TeamOutlined className="mr-2 text-red-600" /> Select Donor
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Choose an eligible donor from the list below
                    </p>

                    {isLoadingDonors ? (
                      <div className="flex justify-center py-8">
                        <Spin size="large" />
                      </div>
                    ) : donorsError ? (
                      <Alert
                        message="Error loading donors"
                        description={donorsError}
                        type="error"
                        showIcon
                      />
                    ) : filteredDonors.length === 0 ? (
                      <Empty
                        description="No donors found for the selected blood group"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    ) : (
                      <div>
                        <Input
                          placeholder="Search donors by name"
                          prefix={<SearchOutlined />}
                          className="mb-4"
                          onChange={(e) => {
                            // Client-side filtering could be implemented here
                          }}
                        />

                        <List
                          dataSource={filteredDonors}
                          renderItem={(donor) => (
                            <List.Item
                              className={`border-l-4 mb-2 rounded-md cursor-pointer transition-all ${selectedDonorProfile?.id === donor.id
                                ? 'border-red-600 bg-red-50'
                                : donor.isEligible
                                  ? 'border-green-500 hover:bg-gray-50'
                                  : 'border-gray-300 bg-gray-50 opacity-70'
                                }`}
                              onClick={() => {
                                if (donor.isEligible) {
                                  setSelectedDonorProfile(donor);
                                } else {
                                  message.warning('This donor is not eligible for donation at this time');
                                }
                              }}
                            >
                              <div className="flex flex-col w-full">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    <div className="bg-red-100 p-2 rounded-full mr-3">
                                      <UserOutlined style={{ color: '#f5222d' }} />
                                    </div>
                                    <div>
                                      <div className="font-medium">{donor.userName}</div>
                                      <div className="text-xs text-gray-500">
                                        ID: {donor.id.substring(0, 8)}...
                                      </div>
                                    </div>
                                  </div>
                                  <Tag color={donor.isEligible ? 'success' : 'error'}>
                                    {donor.isEligible ? 'Eligible' : 'Not Eligible'}
                                  </Tag>
                                </div>

                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-gray-500">Blood Group:</span>{' '}
                                    <Tag color="red">{donor.bloodGroupName || 'Unknown'}</Tag>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Last Donation:</span>{' '}
                                    {donor.lastDonationDate
                                      ? dayjs(donor.lastDonationDate).format('MMM D, YYYY')
                                      : 'Never'}
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Total Donations:</span>{' '}
                                    {donor.totalDonations}
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Next Available:</span>{' '}
                                    {donor.nextAvailableDonationDate
                                      ? dayjs(donor.nextAvailableDonationDate).format('MMM D, YYYY')
                                      : 'Now'}
                                  </div>
                                </div>
                              </div>
                            </List.Item>
                          )}
                          pagination={{
                            pageSize: 5,
                            size: 'small',
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {selectedDonorProfile && (
                  <Card title="Selected Donor Details" className="mb-4">
                    <Descriptions column={2} size="small">
                      <Descriptions.Item label="First Name">{selectedDonorProfile.firstName || selectedDonorProfile.userName}</Descriptions.Item>
                      <Descriptions.Item label="Last Name">{selectedDonorProfile.lastName}</Descriptions.Item>
                      <Descriptions.Item label="Email">{selectedDonorProfile.email}</Descriptions.Item>
                      <Descriptions.Item label="Phone">{selectedDonorProfile.phoneNumber}</Descriptions.Item>
                      <Descriptions.Item label="Blood Group">
                        <Tag color="red">{selectedDonorProfile.bloodGroupName}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Gender">
                        {selectedDonorProfile.gender ? 'Male' : 'Female'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Date of Birth">
                        {dayjs(selectedDonorProfile.dateOfBirth).format('MMM D, YYYY')}
                      </Descriptions.Item>
                      <Descriptions.Item label="Total Donations">
                        {selectedDonorProfile.totalDonations}
                      </Descriptions.Item>
                      <Descriptions.Item label="Last Donation">
                        {selectedDonorProfile.lastDonationDate
                          ? dayjs(selectedDonorProfile.lastDonationDate).format('MMM D, YYYY')
                          : 'Never'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Health Status" span={2}>
                        {selectedDonorProfile.healthStatus}
                      </Descriptions.Item>
                      <Descriptions.Item label="Address" span={2}>
                        {selectedDonorProfile.address}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                )}
              </div>
            )}

            {/* Step 3: Select date */}
            {currentStep === 3 && (
              <div>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      <CalendarOutlined className="mr-2 text-red-600" /> Select Date and Time
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Choose an available time slot for the donation appointment
                    </p>

                    {staff?.locations && staff.locations.length > 0 ? (
                      <div>
                        <Alert
                          message="Location Information"
                          description={(
                            <div>
                              <p>
                                <strong>Location:</strong> {staff.locations[0].locationName}
                              </p>
                              <p className="text-gray-500 text-sm mt-1">
                                Appointments will be created at this location because you are assigned to it.
                              </p>
                            </div>
                          )}
                          type="info"
                          showIcon
                          className="mb-4"
                        />

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
                            <Spin tip="Loading available time slots...">
                              <div className="p-5"></div>
                            </Spin>
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
                                        selectedHourSlot?.endHour === hourSlot.endHour &&
                                        selectedDay === day.value;

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
                                                onClick={() => handleSelectCapacity(capacity, hourSlot, day.value)}
                                                disabled={!capacity.isActive || isPastSlot}
                                                className={isSelected ? "bg-red-600 hover:bg-red-700" : ""}
                                              >
                                                Select
                                              </Button>
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
                                    Afternoon (1PM-5PM)
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
                                        selectedHourSlot?.endHour === hourSlot.endHour &&
                                        selectedDay === day.value;

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
                                                onClick={() => handleSelectCapacity(capacity, hourSlot, day.value)}
                                                disabled={!capacity.isActive || isPastSlot}
                                                className={isSelected ? "bg-red-600 hover:bg-red-700" : ""}
                                              >
                                                Select
                                              </Button>
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
                                        selectedHourSlot?.endHour === hourSlot.endHour &&
                                        selectedDay === day.value;

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
                                                onClick={() => handleSelectCapacity(capacity, hourSlot, day.value)}
                                                disabled={!capacity.isActive || isPastSlot}
                                                className={isSelected ? "bg-red-600 hover:bg-red-700" : ""}
                                              >
                                                Select
                                              </Button>
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

                        {selectedCapacity && selectedDate && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="font-medium text-green-700">
                              Selected time slot: {selectedDate.format('MMMM D, YYYY')} - {selectedTimeSlot}
                              {selectedHourSlot ? ` (${selectedHourSlot.startHour}:00 - ${selectedHourSlot.endHour}:00)` : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Alert
                        message="No Location Assigned"
                        description="You don't have any locations assigned. Please contact your administrator."
                        type="error"
                        showIcon
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Select time slot */}
            {currentStep === 4 && (
              <div>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      <ClockCircleOutlined className="mr-2 text-red-600" /> Confirm Appointment Details
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Review and confirm the appointment details
                    </p>

                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <Descriptions title="Donor Information" column={1} bordered>
                        <Descriptions.Item label="Name">{selectedDonorProfile?.userName}</Descriptions.Item>
                        <Descriptions.Item label="Blood Group">{selectedDonorProfile?.bloodGroupName}</Descriptions.Item>
                        <Descriptions.Item label="Email">{selectedDonorProfile?.email}</Descriptions.Item>
                        <Descriptions.Item label="Phone">{selectedDonorProfile?.phoneNumber}</Descriptions.Item>
                      </Descriptions>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <Descriptions title="Appointment Details" column={1} bordered>
                        <Descriptions.Item label="Date">
                          {selectedDate.format('dddd, MMMM D, YYYY')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Time">
                          {selectedTimeSlot}
                          {selectedHourSlot && ` (${selectedHourSlot.startHour}:00 - ${selectedHourSlot.endHour}:00)`}
                        </Descriptions.Item>
                        <Descriptions.Item label="Location">
                          {staff?.locations && staff.locations.length > 0 ? staff.locations[0].locationName : 'Unknown'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Donation Type">
                          {componentTypes.find(ct => ct.id === assignDonorForm.getFieldValue('componentType'))?.name || 'Not specified'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Urgency">
                          {isUrgent ? <Tag color="red">Urgent</Tag> : <Tag color="blue">Normal</Tag>}
                        </Descriptions.Item>
                        <Descriptions.Item label="Priority">
                          {priority}
                        </Descriptions.Item>
                        <Descriptions.Item label="Notes">
                          {assignDonorForm.getFieldValue('notes') || 'No notes'}
                        </Descriptions.Item>
                      </Descriptions>
                    </div>

                    {selectedCapacity && (
                      <Alert
                        message="Selected Capacity Information"
                        description={`This time slot has a total capacity of ${selectedCapacity.totalCapacity} appointments.`}
                        type="info"
                        showIcon
                        className="mt-4"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-6">
              <div>
                {currentStep > 1 && (
                  <Button onClick={handlePrevStep}>
                    Back
                  </Button>
                )}
              </div>

              <div>
                {currentStep < 4 ? (
                  <Button
                    type="primary"
                    onClick={handleNextStep}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    onClick={handleDonorAssignmentSubmit}
                    loading={isSubmittingAssignment}
                    disabled={!selectedTimeSlot || isSubmittingAssignment}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Assign Donor
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </div>
      </Modal>
    </StaffLayout>
  );
} 