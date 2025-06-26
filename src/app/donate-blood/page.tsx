'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import { Card, Steps, Button, Alert, Spin, Form, Select, DatePicker, Input, Checkbox, Result } from 'antd';
import { useDonorProfile } from '@/hooks/api';
import { useLocations } from '@/hooks/api/useLocations';
import { useBloodGroups } from '@/hooks/api/useBloodGroups';
import { useComponentTypes } from '@/hooks/api/useComponentTypes';
import { useDonationAppointment } from '@/hooks/api/useDonationAppointment';
import { EligibilityResponse, DonationAppointmentRequest, AvailableTimeSlot } from '@/services/api';
import type { Dayjs } from 'dayjs';
import ProtectedRoute from '@/components/ProtectedRoute';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

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
  const { locations, isLoading: isLoadingLocations } = useLocations();
  const { bloodGroups, isLoading: isLoadingBloodGroups } = useBloodGroups();
  const { componentTypes, isLoading: isLoadingComponentTypes } = useComponentTypes();
  const { 
    availableTimeSlots, 
    fetchAvailableTimeSlots, 
    submitDonationRequest, 
    isLoading: isLoadingTimeSlots, 
    isSubmitting 
  } = useDonationAppointment();
  
  // State
  const [eligibilityData, setEligibilityData] = useState<EligibilityResponse | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [availableSlotsForSelectedDate, setAvailableSlotsForSelectedDate] = useState<AvailableTimeSlot | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

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

  // Handle location and date selection
  useEffect(() => {
    if (selectedLocation && selectedDate) {
      fetchTimeSlots();
    }
  }, [selectedLocation, selectedDate]);

  // Fetch available time slots when location and date are selected
  const fetchTimeSlots = async () => {
    if (!selectedLocation || !selectedDate) return;
    
    try {
      setIsCheckingAvailability(true);
      await fetchAvailableTimeSlots(selectedLocation, selectedDate);
      const slotsForDate = availableTimeSlots.find(slot => 
        format(new Date(slot.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
      );
      
      setAvailableSlotsForSelectedDate(slotsForDate || null);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

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
          setSelectedDate(values.preferredDate.toDate());
        }
        next();
      });
    } else {
      // Final submission
      const requestData: DonationAppointmentRequest = {
        preferredDate: values.preferredDate.format('YYYY-MM-DDTHH:mm:ss'),
        preferredTimeSlot: selectedTimeSlot,
        locationId: selectedLocation,
        bloodGroupId: values.bloodGroupId,
        componentTypeId: values.componentTypeId,
        notes: values.notes,
        isUrgent: values.isUrgent || false
      };

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
        <div className="flex justify-center items-center py-12">
          <Spin size="large" tip="Checking eligibility..." />
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
              <p>{eligibilityData.message}</p>
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
                    <li>Date: {format(new Date(eligibilityData.pendingAppointment.preferredDate), 'dd/MM/yyyy')}</li>
                    <li>Time: {eligibilityData.pendingAppointment.preferredTimeSlot}</li>
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
        <div className="flex justify-center items-center py-12">
          <Spin size="large" tip="Loading..." />
        </div>
      );
    }

    const disabledDate = (current: Dayjs) => {
      // Disable past dates and dates more than 1 month in the future
      const today = dayjs().startOf('day');
      const oneMonthLater = dayjs().add(1, 'month').endOf('day');
      return current.isBefore(today) || current.isAfter(oneMonthLater);
    };

    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          preferredDate: null,
          locationId: '',
          bloodGroupId: '',
          componentTypeId: '',
        }}
      >
        <div className="space-y-6">
          <Form.Item
            name="locationId"
            label="Select Donation Location"
            rules={[{ required: true, message: 'Please select a donation location' }]}
          >
            <Select placeholder="Select a donation location">
              {locations.map(location => (
                <Option key={location.id} value={location.id}>{location.name} - {location.address}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="preferredDate"
            label="Select Preferred Date"
            rules={[{ required: true, message: 'Please select your preferred date' }]}
          >
            <DatePicker 
              className="w-full" 
              format="DD/MM/YYYY"
              disabledDate={disabledDate}
            />
          </Form.Item>

          <Form.Item
            name="bloodGroupId"
            label="Blood Group (Optional)"
          >
            <Select placeholder="Select blood group">
              {bloodGroups?.map(group => (
                <Option key={group.id} value={group.id}>{group.groupName}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="componentTypeId"
            label="Blood Component Type (Optional)"
          >
            <Select placeholder="Select blood component type">
              {componentTypes?.map(type => (
                <Option key={type.id} value={type.id}>{type.name}</Option>
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
    if (isLoadingTimeSlots || isCheckingAvailability) {
      return (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" tip="Loading available time slots..." />
        </div>
      );
    }

    if (!availableSlotsForSelectedDate) {
      return (
        <div className="space-y-4">
          <Alert
            type="warning"
            message="No available slots"
            description={`There are no available time slots for the selected date. Please go back and choose a different date.`}
            showIcon
          />
          <div className="flex">
            <Button onClick={prev} type="primary">
              Go Back to Select Another Date
            </Button>
          </div>
        </div>
      );
    }

    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <div className="space-y-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium">
              Available Time Slots for {selectedDate ? format(selectedDate, 'EEEE, MMMM dd, yyyy') : ''}
            </h3>
            <p className="text-gray-500">
              Please select your preferred time slot
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {availableSlotsForSelectedDate?.availableSlots.map((slot: TimeSlotType) => (
              <div 
                key={slot.timeSlot}
                onClick={() => setSelectedTimeSlot(slot.timeSlot)}
                className={`border rounded-md p-4 cursor-pointer text-center transition-colors ${
                  selectedTimeSlot === slot.timeSlot ? 'bg-blue-50 border-blue-500' : ''
                } ${!slot.isAvailable ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:bg-gray-50'}`}
                aria-disabled={!slot.isAvailable}
              >
                <p className="font-medium">{slot.timeSlot}</p>
                <p className="text-sm text-gray-500">
                  {slot.availableCapacity} of {slot.totalCapacity} slots available
                </p>
              </div>
            ))}
          </div>

          <Form.Item
            name="notes"
            label="Additional Notes (Optional)"
          >
            <TextArea rows={4} placeholder="Please share any additional information that might be relevant for your blood donation" />
          </Form.Item>

          <Form.Item name="isUrgent" valuePropName="checked">
            <Checkbox>This is an urgent donation (emergency)</Checkbox>
          </Form.Item>

          <div className="flex justify-between">
            <Button onClick={prev}>
              Previous
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              disabled={!selectedTimeSlot}
            >
              Next
            </Button>
          </div>
        </div>
      </Form>
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
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Confirm Your Appointment Details</h3>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <dl className="divide-y divide-gray-200">
              <div className="py-2 grid grid-cols-3">
                <dt className="font-medium text-gray-500">Location</dt>
                <dd className="col-span-2">{locationName}</dd>
              </div>
              <div className="py-2 grid grid-cols-3">
                <dt className="font-medium text-gray-500">Date</dt>
                <dd className="col-span-2">{selectedDate ? format(selectedDate, 'EEEE, MMMM dd, yyyy') : ''}</dd>
              </div>
              <div className="py-2 grid grid-cols-3">
                <dt className="font-medium text-gray-500">Time Slot</dt>
                <dd className="col-span-2">{selectedTimeSlot}</dd>
              </div>
              <div className="py-2 grid grid-cols-3">
                <dt className="font-medium text-gray-500">Blood Group</dt>
                <dd className="col-span-2">{bloodGroupName}</dd>
              </div>
              <div className="py-2 grid grid-cols-3">
                <dt className="font-medium text-gray-500">Component Type</dt>
                <dd className="col-span-2">{componentTypeName}</dd>
              </div>
              <div className="py-2 grid grid-cols-3">
                <dt className="font-medium text-gray-500">Notes</dt>
                <dd className="col-span-2">{form.getFieldValue('notes') || 'None'}</dd>
              </div>
              <div className="py-2 grid grid-cols-3">
                <dt className="font-medium text-gray-500">Urgent</dt>
                <dd className="col-span-2">{form.getFieldValue('isUrgent') ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </div>

          <Alert
            message="Please review your appointment details"
            description="Once submitted, you will receive a confirmation and the blood center will review your request."
            type="info"
            showIcon
          />

          <div className="flex justify-between">
            <Button onClick={prev}>
              Previous
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={isSubmitting}
            >
              Confirm & Submit
            </Button>
          </div>
        </div>
      </Form>
    );
  };

  // Render success step
  const renderSuccessStep = () => {
    return (
      <Result
        status="success"
        title="Appointment Request Submitted!"
        subTitle="Your blood donation appointment request has been submitted successfully. The blood center will review your request and confirm your appointment."
        extra={[
          <Button type="primary" key="console" onClick={() => router.push('/member/appointments')}>
            View My Appointments
          </Button>,
          <Button key="buy" onClick={() => router.push('/member/dashboard')}>
            Go to Dashboard
          </Button>,
        ]}
      />
    );
  };

  // Determine which step content to render
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
      <div className="container mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Donate Blood</h1>
          <p className="text-gray-600">Follow these steps to schedule your blood donation appointment</p>
        </div>

        <Card className="mb-6">
          <Steps
            current={currentStep}
            items={[
              {
                title: 'Eligibility',
                description: 'Check eligibility',
              },
              {
                title: 'Location',
                description: 'Select location & date',
              },
              {
                title: 'Time Slot',
                description: 'Choose available time',
              },
              {
                title: 'Confirmation',
                description: 'Review & submit',
              },
              {
                title: 'Success',
                description: 'Appointment booked',
              },
            ]}
          />
        </Card>

        <Card>
          {renderStepContent()}
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default DonateBloodPage; 