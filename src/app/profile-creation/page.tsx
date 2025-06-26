'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Typography, Card, Row, Col, Button, Steps, DatePicker, Input, Select, Radio, Switch, Alert, Spin, notification, message } from 'antd';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { UserOutlined, HeartOutlined, EnvironmentOutlined, MedicineBoxOutlined, CompassOutlined, LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useBloodGroups } from '@/hooks/api/useBloodGroups';
import { createDonorProfile, DonorProfileRequest } from '@/services/api/donorProfileService';
import { useAuth } from '@/context/AuthContext';
import type { Map, Marker, LeafletMouseEvent, DragEndEvent } from 'leaflet';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

export default function ProfileCreationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: string; lng: string } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  const router = useRouter();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const { data: bloodGroups, isLoading: bloodGroupsLoading } = useBloodGroups();

  // Form setup with React Hook Form
  const { control, handleSubmit, formState: { errors }, watch, setValue, getValues } = useForm<DonorProfileRequest>({
    defaultValues: {
      dateOfBirth: null,
      gender: true, // Default to male
      lastDonationDate: null,
      healthStatus: 'Healthy',
      lastHealthCheckDate: null,
      totalDonations: 0,
      address: '', // Keep this empty string to initialize the field
      latitude: '',
      longitude: '',
      userId: '',
      bloodGroupId: '',
      nextAvailableDonationDate: null,
      isAvailableForEmergency: true,
      preferredDonationTime: 'Morning'
    }
  });

  // Set userId when auth data is loaded
  useEffect(() => {
    if (user && user.id) {
      setValue('userId', user.id);
    }
  }, [user, setValue]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      toast.error('You must be logged in to create a donor profile');
      router.push('/login');
    }
  }, [isLoggedIn, authLoading, router]);

  const watchDonationCount = watch('totalDonations');
  const watchLastDonation = watch('lastDonationDate');
  const watchAddress = watch('address');

  // Set next available donation date based on last donation date
  useEffect(() => {
    if (watchLastDonation && watchDonationCount > 0) {
      try {
        // 56 days (8 weeks) is the standard waiting period between whole blood donations
        const nextDate = dayjs(watchLastDonation).add(56, 'day').format('YYYY-MM-DD');
        if (nextDate && nextDate !== 'Invalid Date') {
          setValue('nextAvailableDonationDate', nextDate);
        }
      } catch (error) {
        console.error('Error calculating next donation date:', error);
      }
    } else {
      // If last donation date is cleared or total donations is 0, also clear next available date
      setValue('nextAvailableDonationDate', null);
    }
  }, [watchLastDonation, watchDonationCount, setValue]);

  // Clear lastDonationDate when totalDonations is set to 0
  useEffect(() => {
    if (watchDonationCount <= 0) {
      setValue('lastDonationDate', null);
    }
  }, [watchDonationCount, setValue]);

  // Reset address field when entering location step
  useEffect(() => {
    if (currentStep === 2) {
      // Check if address field has been prefilled with health status value
      const currentAddress = getValues('address');
      const healthStatus = getValues('healthStatus');
      if (currentAddress === healthStatus) {
        setValue('address', '');
      }
    }
  }, [currentStep, getValues, setValue]);

  // Add a new effect to clear form fields when switching steps
  useEffect(() => {
    // When step changes, check for any cross-contamination between fields
    const clearCrossContaminatedFields = () => {
      // Step 1 (Health Info) - Check if any fields were pre-filled with values from Step 0
      if (currentStep === 1) {
        const healthStatus = getValues('healthStatus');
        const bloodGroupId = getValues('bloodGroupId');
        
        // If healthStatus is same as bloodGroupId, it was likely pre-filled
        if (healthStatus === bloodGroupId) {
          setValue('healthStatus', 'Healthy'); // Reset to default
        }
        
        // Check if lastHealthCheckDate got pre-filled with dateOfBirth
        const lastHealthCheckDate = getValues('lastHealthCheckDate');
        const dateOfBirth = getValues('dateOfBirth');
        if (lastHealthCheckDate === dateOfBirth) {
          setValue('lastHealthCheckDate', null);
        }
      }
      
      // Step 2 (Location) - Check if any fields were pre-filled with values from Step 1
      if (currentStep === 2) {
        const address = getValues('address');
        const healthStatus = getValues('healthStatus');
        const totalDonations = getValues('totalDonations').toString();
        
        // If address is same as healthStatus or totalDonations, it was likely pre-filled
        if (address === healthStatus || address === totalDonations) {
          setValue('address', '');
        }
      }
      
      // Step 3 (Preferences) - Check if any fields were pre-filled with values from Step 2
      if (currentStep === 3) {
        const preferredDonationTime = getValues('preferredDonationTime');
        const address = getValues('address');
        
        // If preferredDonationTime contains part of address, it was likely pre-filled
        if (preferredDonationTime !== 'Morning' && 
            preferredDonationTime !== 'Afternoon' && 
            preferredDonationTime !== 'Evening' && 
            preferredDonationTime !== 'Weekend' && 
            preferredDonationTime !== 'Any') {
          setValue('preferredDonationTime', 'Morning'); // Reset to default
        }
      }
    };
    
    clearCrossContaminatedFields();
  }, [currentStep, getValues, setValue]);

  // Load leaflet map when on location step
  useEffect(() => {
    if (currentStep === 2 && mapContainerRef.current) {
      // Reset map reference when leaving the location step
      const initializeMap = async () => {
        try {
          // Dynamically import leaflet
          const L = await import('leaflet');
          // Also import the CSS
          await import('leaflet/dist/leaflet.css');
          
          if (!mapContainerRef.current) return;
          
          // If map already exists, remove it to prevent duplicates
          if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
            markerRef.current = null;
          }
          
          // Create map
          const map = L.map(mapContainerRef.current).setView([10.8231, 106.6297], 13); // Default view on Ho Chi Minh City
          
          // Add OpenStreetMap tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
          
          // Wait for the map to be fully initialized
          await new Promise(resolve => {
            map.whenReady(() => {
              resolve(true);
            });
          });
          
          // Custom marker icon
          const customIcon = L.icon({
            iconUrl: '/images/map/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
          
          // Create a marker but don't add it to the map yet
          const marker = L.marker([10.8231, 106.6297], {
            draggable: true,
            icon: customIcon
          });
          
          // Update coordinates when marker is dragged
          marker.on('dragend', function(e: DragEndEvent) {
            const position = marker.getLatLng();
            setValue('latitude', position.lat.toString());
            setValue('longitude', position.lng.toString());
            setLocation({ lat: position.lat.toString(), lng: position.lng.toString() });
          });
          
          // Click on map to set marker
          map.on('click', function(e: LeafletMouseEvent) {
            const { lat, lng } = e.latlng;
            
            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng]);
              if (!map.hasLayer(markerRef.current)) {
                markerRef.current.addTo(map);
              }
            } else {
              markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(map);
            }
            
            setValue('latitude', lat.toString());
            setValue('longitude', lng.toString());
            setLocation({ lat: lat.toString(), lng: lng.toString() });
          });
          
          // Save references
          mapRef.current = map;
          markerRef.current = marker;
          
          // If we already have coordinates, show the marker
          const { latitude, longitude } = getValues();
          if (latitude && longitude) {
            marker.setLatLng([parseFloat(latitude), parseFloat(longitude)]).addTo(map);
            map.setView([parseFloat(latitude), parseFloat(longitude)], 15);
          }
          
          // Force map to update its size after rendering
          setTimeout(() => {
            map.invalidateSize();
          }, 200);
          
          // Get user's current location if possible
          if (!location && !latitude && !longitude) {
            getUserLocation();
          }
        } catch (error) {
          console.error("Error initializing map:", error);
        }
      };
      
      initializeMap();
      
      // Cleanup function to remove map when component unmounts or step changes
      return () => {
        if (mapRef.current) {
          // Don't actually remove the map here, we'll handle it in the initialization
        }
      };
    }
  }, [currentStep, location, setValue, getValues]);

  // If address changes, try to geocode it
  useEffect(() => {
    if (currentStep === 2 && watchAddress && mapRef.current) {
      // You could implement geocoding here with a service like Nominatim
      // This is a simplified example - in production you might want to use a geocoding service
      // geocodeAddress(watchAddress);
    }
  }, [watchAddress, currentStep]);

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    
    setIsLoadingLocation(true);
    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Update form values
        setValue('latitude', latitude.toString());
        setValue('longitude', longitude.toString());
        setLocation({ lat: latitude.toString(), lng: longitude.toString() });
        
        // Update map and marker
        if (mapRef.current && markerRef.current) {
          try {
            markerRef.current.setLatLng([latitude, longitude]);
            if (!mapRef.current.hasLayer(markerRef.current)) {
              markerRef.current.addTo(mapRef.current);
            }
            mapRef.current.setView([latitude, longitude], 15);
          } catch (error) {
            console.error("Error updating map with location:", error);
            
            // If there was an error with the marker, try to create a new one
            if (mapRef.current) {
              try {
                // Dynamic import for leaflet
                import('leaflet').then((L) => {
                  // Create custom icon
                  const customIcon = L.icon({
                    iconUrl: '/img/map/marker-icon.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                  });
                  
                  // Remove old marker if it exists
                  if (markerRef.current && mapRef.current.hasLayer(markerRef.current)) {
                    mapRef.current.removeLayer(markerRef.current);
                  }
                  
                  // Create new marker
                  markerRef.current = L.marker([latitude, longitude], { icon: customIcon }).addTo(mapRef.current);
                  mapRef.current.setView([latitude, longitude], 15);
                });
              } catch (err) {
                console.error("Failed to recreate marker:", err);
              }
            }
          }
        }
        
        setIsLoadingLocation(false);
        
        // Only show toast if it's a user-initiated action (not automatic on page load)
        if (document.hasFocus()) {
          toast.success('Location successfully detected');
        }
      },
      (error) => {
        console.error('Error getting user location:', error);
        setLocationError('Failed to get your location. Please set it manually on the map.');
        setIsLoadingLocation(false);
        
        // Only show toast if it's a user-initiated action
        if (document.hasFocus()) {
          toast.error('Failed to get your location. Please set it manually on the map.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const onSubmit: SubmitHandler<DonorProfileRequest> = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('You are not authenticated. Please log in again.');
        router.push('/login');
        return;
      }

      // Format and prepare data for API
      const formattedData = {
        ...data,
        dateOfBirth: data.dateOfBirth || dayjs().subtract(18, 'year').format('YYYY-MM-DD'),
        lastDonationDate: data.lastDonationDate || null,
        lastHealthCheckDate: data.lastHealthCheckDate || null,
        nextAvailableDonationDate: data.nextAvailableDonationDate || null
      };

      // Log the request for debugging
      console.log('Submitting profile data:', formattedData);

      const response = await createDonorProfile(formattedData);
      
      if (response.success) {
        toast.success('Donor profile created successfully');
        // Navigate to the profile page or dashboard
        router.push('/member/dashboard');
      } else {
        console.error('API Error:', response);
        setSubmitError(response.message || response.errors?.join(', ') || 'Failed to create profile');
        toast.error(`Failed to create profile: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    // If moving from health info to location step, ensure address is not prefilled with health status
    if (currentStep === 1) {
      const currentAddress = getValues('address');
      // Only reset if address matches health status (indicating an unwanted prefill)
      if (currentAddress === getValues('healthStatus')) {
        setValue('address', '');
      }
    }
    
    // Perform manual validation for the current step before proceeding
    let canProceed = true;
    
    if (currentStep === 0) {
      // Validate Personal Info step
      const dateOfBirth = getValues('dateOfBirth');
      const bloodGroupId = getValues('bloodGroupId');
      
      if (!dateOfBirth) {
        toast.error('Please enter your date of birth');
        canProceed = false;
      }
      
      if (!bloodGroupId) {
        toast.error('Please select your blood group');
        canProceed = false;
      }
    } else if (currentStep === 1) {
      // Validate Health Info step (no required fields except when total donations > 0)
      const totalDonations = getValues('totalDonations');
      const lastDonationDate = getValues('lastDonationDate');
      
      if (totalDonations > 0 && !lastDonationDate) {
        toast.error('Please enter your last donation date');
        canProceed = false;
      }
      
      // If totalDonations is 0, clear lastDonationDate to prevent inconsistency
      if (totalDonations <= 0 && lastDonationDate) {
        setValue('lastDonationDate', null);
      }
    } else if (currentStep === 2) {
      // Validate Location step
      const address = getValues('address');
      const latitude = getValues('latitude');
      const longitude = getValues('longitude');
      
      if (!address) {
        toast.error('Please enter your address');
        canProceed = false;
      }
      
      if (!latitude || !longitude) {
        toast.error('Please set your location on the map');
        canProceed = false;
      }
    }
    
    if (canProceed) {
      // Prevent field cross-contamination when moving to next step
      const nextStepIndex = currentStep + 1;
      
      // Reset fields in the next step that might have been pre-filled
      if (nextStepIndex === 1) { // Moving to Health Info
        // Check if health fields got pre-filled with personal info values
        const healthStatus = getValues('healthStatus');
        const bloodGroupId = getValues('bloodGroupId');
        if (healthStatus === bloodGroupId) {
          setValue('healthStatus', 'Healthy');
        }
      } 
      else if (nextStepIndex === 2) { // Moving to Location
        // Clear address field to prevent pre-filling from health status
        setValue('address', '');
      }
      else if (nextStepIndex === 3) { // Moving to Preferences
        // Ensure preferredDonationTime is a valid option
        const preferredDonationTime = getValues('preferredDonationTime');
        const validOptions = ['Morning', 'Afternoon', 'Evening', 'Weekend', 'Any'];
        if (!validOptions.includes(preferredDonationTime)) {
          setValue('preferredDonationTime', 'Morning');
        }
      }
      
      setCurrentStep(nextStepIndex);
    }
  };

  const prevStep = () => {
    // When moving back to a previous step, ensure fields are not cross-contaminated
    const prevStepIndex = currentStep - 1;
    
    // Check for any field contamination when moving back
    if (prevStepIndex === 0) { // Moving back to Personal Info
      // No specific checks needed for first step
    }
    else if (prevStepIndex === 1) { // Moving back to Health Info
      // Check if health fields got contaminated
      const healthStatus = getValues('healthStatus');
      const address = getValues('address');
      if (healthStatus === address) {
        setValue('healthStatus', 'Healthy');
      }
    }
    else if (prevStepIndex === 2) { // Moving back to Location
      // Check if location fields got contaminated
      const address = getValues('address');
      const preferredDonationTime = getValues('preferredDonationTime');
      if (address === preferredDonationTime) {
        setValue('address', '');
      }
    }
    
    setCurrentStep(prevStepIndex);
  };

  if (authLoading || bloodGroupsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const steps = [
    {
      title: 'Personal Info',
      icon: <UserOutlined />,
      content: (
        <div className="space-y-6">
          <Title level={4}>Personal Information</Title>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div className="mb-4">
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  rules={{ required: 'Date of birth is required' }}
                  render={({ field: { onChange, value, ...restField } }) => (
                    <DatePicker
                      id="dateOfBirth"
                      className="w-full"
                      format="YYYY-MM-DD"
                      value={value ? dayjs(value) : null}
                      onChange={(date) => onChange(date ? date.format('YYYY-MM-DD') : null)}
                      disabledDate={(current) => current && current > dayjs().subtract(18, 'year')}
                      style={{ width: '100%' }}
                      allowClear={true}
                      {...restField}
                    />
                  )}
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                )}
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Radio.Group 
                      {...field} 
                      onChange={e => field.onChange(e.target.value)}
                      value={field.value}
                    >
                      <Radio value={true}>Male</Radio>
                      <Radio value={false}>Female</Radio>
                    </Radio.Group>
                  )}
                />
              </div>
            </Col>
          </Row>
          
          <div className="mb-4">
            <label htmlFor="bloodGroupId" className="block text-sm font-medium text-gray-700 mb-1">
              Blood Group <span className="text-red-500">*</span>
            </label>
            <Controller
              name="bloodGroupId"
              control={control}
              rules={{ required: 'Blood group is required' }}
              render={({ field }) => (
                <Select
                  id="bloodGroupId"
                  placeholder="Select your blood group"
                  className="w-full"
                  {...field}
                >
                  {bloodGroups?.map(group => (
                    <Option key={group.id} value={group.id}>
                      {group.groupName} - {group.description}
                    </Option>
                  ))}
                </Select>
              )}
            />
            {errors.bloodGroupId && (
              <p className="mt-1 text-sm text-red-600">{errors.bloodGroupId.message}</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Health Info',
      icon: <MedicineBoxOutlined />,
      content: (
        <div className="space-y-6">
          <Title level={4}>Health Information</Title>
          
          <div className="mb-4">
            <label htmlFor="healthStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Current Health Status <span className="text-red-500">*</span>
            </label>
            <Controller
              name="healthStatus"
              control={control}
              rules={{ required: 'Health status is required' }}
              render={({ field }) => {
                // Check if healthStatus has been pre-filled with an invalid value
                const currentValue = field.value;
                const validOptions = ['Excellent', 'Good', 'Fair', 'Poor', 'Healthy'];
                const bloodGroupId = getValues('bloodGroupId');
                
                // If value is not in valid options or matches bloodGroupId, reset to default
                if (!validOptions.includes(currentValue) || currentValue === bloodGroupId) {
                  setTimeout(() => setValue('healthStatus', 'Healthy'), 0);
                }
                
                return (
                <Select
                  id="healthStatus"
                  placeholder="Select your current health status"
                  className="w-full"
                  {...field}
                    onFocus={() => {
                      // Double-check on focus that we have a valid option
                      const value = field.value;
                      if (!validOptions.includes(value) || value === bloodGroupId) {
                        setValue('healthStatus', 'Healthy');
                      }
                    }}
                >
                  <Option value="Excellent">Excellent</Option>
                  <Option value="Good">Good</Option>
                  <Option value="Fair">Fair</Option>
                  <Option value="Poor">Poor (Not eligible for donation)</Option>
                </Select>
                );
              }}
            />
            {errors.healthStatus && (
              <p className="mt-1 text-sm text-red-600">{errors.healthStatus.message}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="lastHealthCheckDate" className="block text-sm font-medium text-gray-700 mb-1">
              Last Health Check Date
            </label>
                          <Controller
              name="lastHealthCheckDate"
              control={control}
              render={({ field: { onChange, value, ...restField } }) => (
                <DatePicker
                  id="lastHealthCheckDate"
                  className="w-full"
                  format="YYYY-MM-DD"
                  onChange={(date) => onChange(date ? date.format('YYYY-MM-DD') : null)}
                  disabledDate={(current) => current && current > dayjs()}
                  style={{ width: '100%' }}
                  allowClear={true}
                  {...restField}
                />
              )}
            />
          </div>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div className="mb-4">
                <label htmlFor="totalDonations" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Previous Donations
                </label>
                <Controller
                  name="totalDonations"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="totalDonations"
                      type="number"
                      min={0}
                      className="w-full"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="mb-4">
                <label htmlFor="lastDonationDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Donation Date {watchDonationCount > 0 && <span className="text-red-500">*</span>}
                </label>
                <Controller
                  name="lastDonationDate"
                  control={control}
                  rules={{ 
                    required: watchDonationCount > 0 ? 'Last donation date is required if you have donated before' : false 
                  }}
                  render={({ field: { onChange, value, ...restField } }) => (
                    <DatePicker
                      id="lastDonationDate"
                      className="w-full"
                      format="YYYY-MM-DD"
                      value={value ? dayjs(value) : null}
                      onChange={(date) => onChange(date ? date.format('YYYY-MM-DD') : null)}
                      disabledDate={(current) => current && current > dayjs()}
                      style={{ width: '100%' }}
                      allowClear={true}
                      disabled={watchDonationCount <= 0}
                      {...restField}
                    />
                  )}
                />
                {errors.lastDonationDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastDonationDate.message}</p>
                )}
              </div>
            </Col>
          </Row>
          
          <div className="mb-4">
            <label htmlFor="nextAvailableDonationDate" className="block text-sm font-medium text-gray-700 mb-1">
              Next Available Donation Date (Auto-calculated)
            </label>
                          <Controller
              name="nextAvailableDonationDate"
              control={control}
              render={({ field: { value, ...restField } }) => (
                <DatePicker
                  id="nextAvailableDonationDate"
                  className="w-full"
                  format="YYYY-MM-DD"
                  value={value ? dayjs(value) : null}
                  disabled={true}
                  style={{ width: '100%' }}
                  allowClear={false}
                  {...restField}
                />
              )}
            />
          </div>
        </div>
      )
    },
    {
      title: 'Location',
      icon: <EnvironmentOutlined />,
      content: (
        <div className="space-y-6">
          <Title level={4}>Location Information</Title>
          
          <div className="mb-4">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <Controller
              name="address"
              control={control}
              rules={{ required: 'Address is required' }}
              render={({ field }) => {
                // Check if address has been pre-filled with a value from another field
                const currentValue = field.value;
                const healthStatus = getValues('healthStatus');
                const totalDonations = getValues('totalDonations').toString();
                
                // If address matches a value from another field, clear it
                if (currentValue === healthStatus || 
                    currentValue === totalDonations || 
                    (typeof currentValue === 'number')) {
                  setTimeout(() => setValue('address', ''), 0);
                }
                
                return (
                <TextArea
                  id="address"
                  rows={3}
                  className="w-full"
                  placeholder="Enter your full address"
                  {...field}
                    onFocus={() => {
                      // Double-check on focus that we don't have contaminated data
                      const value = field.value;
                      if (value === healthStatus || 
                          value === totalDonations || 
                          (typeof value === 'number')) {
                        setValue('address', '');
                      }
                    }}
                />
                );
              }}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Your Location <span className="text-red-500">*</span>
              </label>
              <Button
                type="primary"
                icon={isLoadingLocation ? <LoadingOutlined /> : <CompassOutlined />}
                size="small"
                onClick={getUserLocation}
                loading={isLoadingLocation}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Detect My Location
              </Button>
            </div>
            
            {locationError && (
              <Alert 
                message={locationError} 
                type="error" 
                showIcon 
                className="mb-3" 
                closable 
                onClose={() => setLocationError(null)}
              />
            )}
            
            {/* Hidden inputs for latitude and longitude */}
            <Controller
              name="latitude"
              control={control}
              rules={{ required: 'Latitude is required' }}
              render={({ field }) => <input type="hidden" {...field} />}
            />
            <Controller
              name="longitude"
              control={control}
              rules={{ required: 'Longitude is required' }}
              render={({ field }) => <input type="hidden" {...field} />}
            />
            
            {/* Map container */}
            <div 
              ref={mapContainerRef} 
              className="w-full h-80 rounded-lg border border-gray-300 relative z-0 mb-2"
            />
            
            {location ? (
              <div className="text-sm text-gray-600 flex items-center">
                <CheckCircleOutlined className="text-green-500 mr-1" />
                Location set: {parseFloat(location.lat).toFixed(6)}, {parseFloat(location.lng).toFixed(6)}
              </div>
            ) : (
              <div className="text-sm text-red-500 flex items-center">
                <EnvironmentOutlined className="mr-1" />
                Please set your location by clicking on the map or using the "Detect My Location" button
              </div>
            )}
            
            {(errors.latitude || errors.longitude) && (
              <p className="mt-1 text-sm text-red-600">Please set your location on the map</p>
            )}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <Text className="text-blue-600 font-medium">
              Note: Your location information helps us connect you with nearby donation centers and 
              blood recipients in need. Your privacy is important to us, and this information will 
              only be used for blood donation purposes.
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Preferences',
      icon: <HeartOutlined />,
      content: (
        <div className="space-y-6">
          <Title level={4}>Donation Preferences</Title>
          
          <div className="mb-6">
            <label htmlFor="preferredDonationTime" className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Donation Time <span className="text-red-500">*</span>
            </label>
            <Controller
              name="preferredDonationTime"
              control={control}
              rules={{ required: 'Preferred donation time is required' }}
              render={({ field }) => {
                // Check if preferredDonationTime has been pre-filled with an invalid value
                const currentValue = field.value;
                const validOptions = ['Morning', 'Afternoon', 'Evening', 'Weekend', 'Any'];
                
                // If value is not in valid options, reset to default
                if (!validOptions.includes(currentValue)) {
                  setTimeout(() => setValue('preferredDonationTime', 'Morning'), 0);
                }
                
                return (
                <Select
                  id="preferredDonationTime"
                  className="w-full"
                  {...field}
                    onFocus={() => {
                      // Double-check on focus that we have a valid option
                      const value = field.value;
                      if (!validOptions.includes(value)) {
                        setValue('preferredDonationTime', 'Morning');
                      }
                    }}
                >
                  <Option value="Morning">Morning (8:00 AM - 12:00 PM)</Option>
                  <Option value="Afternoon">Afternoon (12:00 PM - 4:00 PM)</Option>
                  <Option value="Evening">Evening (4:00 PM - 8:00 PM)</Option>
                  <Option value="Weekend">Weekends Only</Option>
                  <Option value="Any">Any Time</Option>
                </Select>
                );
              }}
            />
            {errors.preferredDonationTime && (
              <p className="mt-1 text-sm text-red-600">{errors.preferredDonationTime.message}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label className="flex items-center space-x-2">
              <Controller
                name="isAvailableForEmergency"
                control={control}
                render={({ field }) => (
                  <Switch 
                    checked={field.value} 
                    onChange={field.onChange}
                  />
                )}
              />
              <span className="text-sm font-medium text-gray-700">
                Available for Emergency Donations
              </span>
            </label>
            <Text className="text-gray-500 text-sm block mt-1">
              If enabled, you may be contacted for urgent blood donation needs in your area.
            </Text>
          </div>
          
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <Title level={5} className="text-red-600 mb-1">Important Information</Title>
            <Paragraph className="text-red-600 mb-0">
              By completing this profile, you agree to be contacted for blood donation purposes.
              Your information will be kept confidential and used only to facilitate blood donation
              and related services. You can update your preferences or opt out at any time.
            </Paragraph>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card className="shadow-sm">
          <Title level={2} className="text-center mb-6 text-red-600">Create Donor Profile</Title>
          <Paragraph className="text-center text-gray-600 mb-8">
            Complete your donor profile to help us match you with donation opportunities
            and blood recipients in need.
          </Paragraph>
          
          <Steps 
            current={currentStep} 
            className="mb-8"
            items={steps.map(step => ({
              title: step.title,
              icon: step.icon
            }))}
          />
          
          {submitError && (
            <Alert
              message="Error"
              description={submitError}
              type="error"
              showIcon
              className="mb-6"
              closable
              onClose={() => setSubmitError(null)}
            />
          )}
          
          <div className="mb-6">
            {steps[currentStep].content}
          </div>
          
          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <Button 
                onClick={prevStep}
              >
                Previous
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button 
                type="primary"
                onClick={nextStep} 
                className="ml-auto bg-red-600 hover:bg-red-700"
                disabled={currentStep === 2 && (!location || !getValues('address'))}
              >
                Next
              </Button>
            ) : (
              <Button 
                type="primary" 
                onClick={handleSubmit(onSubmit)}
                loading={isSubmitting}
                className="ml-auto bg-red-600 hover:bg-red-700"
              >
                Submit
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 