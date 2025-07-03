'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Button, Alert, message, Spin } from 'antd';
import { useBloodGroups } from '@/hooks/api/useBloodGroups';
import { useComponentTypes } from '@/hooks/api/useComponentTypes';
import { useRegularBloodRequest, BloodRequestFormValues } from '@/hooks/api/useBloodRequest';
import { useLocations } from '@/hooks/api/useLocations';
import { EnvironmentOutlined, LoadingOutlined } from '@ant-design/icons';
import { getAddressFromCoordinates } from '@/utils/geocoding';

const { Option } = Select;
const { TextArea } = Input;

const RegularBloodRequestForm = () => {
    const [form] = Form.useForm();
    const { loading, error, isLoggedIn, submitRequest } = useRegularBloodRequest();
    const { bloodGroups, isLoading: loadingBloodGroups } = useBloodGroups();
    const { componentTypes, isLoading: loadingComponentTypes } = useComponentTypes();
    const {
        locations,
        isLoading: loadingLocations,
        getUserLocation,
        userCoordinates,
        isGettingUserLocation
    } = useLocations();
    const [gettingLocation, setGettingLocation] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<any>(null);

    // When location is selected, update address only
    const handleLocationChange = (locationId: string) => {
        const location = locations.find(loc => loc.id === locationId);
        if (location) {
            setSelectedLocation(location);
            form.setFieldsValue({
                address: location.address,
                locationId: locationId
            });
        }
    };

    // Try to get user location on component mount
    useEffect(() => {
        // Automatically get user location when form loads
        if (!userCoordinates.latitude && !isGettingUserLocation) {
            getUserLocation();
        }
    }, [userCoordinates.latitude, isGettingUserLocation, getUserLocation]);

    // Get current user location and address
    const handleGetCurrentLocation = async () => {
        try {
            setGettingLocation(true);
            await getUserLocation();
            if (userCoordinates.latitude && userCoordinates.longitude) {
                // Set coordinates
                form.setFieldsValue({
                    latitude: userCoordinates.latitude.toString(),
                    longitude: userCoordinates.longitude.toString()
                });

                // Try to get address from coordinates
                const address = await getAddressFromCoordinates(
                    userCoordinates.latitude,
                    userCoordinates.longitude
                );

                if (address) {
                    // If we got an address, set it as user's current address
                    form.setFieldsValue({
                        userCurrentAddress: address
                    });
                    message.success('Location found successfully');
                }
            }
        } catch (err) {
            console.error('Error getting location:', err);
            message.error('Failed to get your current location');
        } finally {
            setGettingLocation(false);
        }
    };

    const onFinish = async (values: BloodRequestFormValues) => {
        // Make sure the hospital information is included
        if (selectedLocation) {
            values.address = selectedLocation.address;
        }

        // Log the request data being submitted
        console.log('Submitting regular blood request:', {
            patientName: values.patientName,
            bloodGroup: values.bloodGroupId,
            component: values.componentTypeId,
            quantity: values.quantityUnits,
            neededBy: values.neededByDate,
            hospital: selectedLocation?.name,
            address: values.address
        });

        const success = await submitRequest(values);
        if (success) {
            console.log('Regular blood request submitted successfully');
            form.resetFields();
            setSelectedLocation(null);
        } else {
            console.error('Failed to submit regular blood request');
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {!isLoggedIn && (
                <Alert
                    message="Login Required"
                    description={
                        <div>
                            You need to be logged in to submit a blood request.{' '}
                            <a href="/login" className="text-blue-600 hover:underline">
                                Login here
                            </a>
                        </div>
                    }
                    type="warning"
                    showIcon
                    className="mb-6"
                />
            )}

            {error && (
                <Alert message={error} type="error" showIcon className="mb-6" />
            )}

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    quantityUnits: 1,
                }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                        name="patientName"
                        label="Patient Name"
                        rules={[{ required: true, message: 'Please enter patient name' }]}
                    >
                        <Input placeholder="Enter patient name" />
                    </Form.Item>

                    <Form.Item
                        name="contactInfo"
                        label="Contact Information"
                        rules={[{ required: true, message: 'Please enter contact information' }]}
                    >
                        <Input placeholder="Enter phone number or email" />
                    </Form.Item>

                    <Form.Item
                        name="bloodGroupId"
                        label="Blood Group"
                        rules={[{ required: true, message: 'Please select a blood group' }]}
                    >
                        <Select placeholder="Select blood group" loading={loadingBloodGroups}>
                            {bloodGroups.map(group => (
                                <Option key={group.id} value={group.id}>{group.groupName}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="componentTypeId"
                        label="Blood Component"
                        rules={[{ required: true, message: 'Please select a blood component' }]}
                    >
                        <Select placeholder="Select blood component" loading={loadingComponentTypes}>
                            {componentTypes.map(component => (
                                <Option key={component.id} value={component.id}>{component.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="quantityUnits"
                        label="Quantity (Units)"
                        rules={[{ required: true, message: 'Please enter quantity' }]}
                    >
                        <InputNumber min={1} max={10} className="w-full" />
                    </Form.Item>

                    <Form.Item
                        name="neededByDate"
                        label="Needed By Date"
                        rules={[{ required: true, message: 'Please select a date' }]}
                    >
                        <DatePicker className="w-full" disabledDate={(current) => current && current.isBefore(new Date(), 'day')} />
                    </Form.Item>

                    {/* Location selection with distance information */}
                    <div className="col-span-1 md:col-span-2">
                        {/* Location selection help messages */}
                        {userCoordinates.latitude && userCoordinates.longitude && locations.some(location => location.distance !== undefined) ? (
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
                                description="Please wait while we find your position to show the nearest hospitals."
                                type="info"
                                showIcon
                                className="mb-4"
                            />
                        ) : (
                            <Alert
                                message={
                                    <div className="flex justify-between items-center">
                                        <span>Finding hospitals near you</span>
                                        <Button
                                            type="primary"
                                            size="small"
                                            onClick={() => getUserLocation()}
                                            loading={isGettingUserLocation}
                                            className="ml-2"
                                        >
                                            Get My Location
                                        </Button>
                                    </div>
                                }
                                description="We're trying to access your location to show hospitals sorted by distance."
                                type="info"
                                showIcon
                                className="mb-4"
                            />
                        )}

                        <Form.Item
                            name="locationId"
                            label="Select Hospital"
                            rules={[{ required: true, message: 'Please select a hospital' }]}
                            extra={
                                isGettingUserLocation ? (
                                    <div className="mt-2 flex items-center">
                                        <Spin size="small" className="mr-2" />
                                        <span className="text-gray-500">Getting your location...</span>
                                    </div>
                                ) : !userCoordinates.latitude ? (
                                    <div className="mt-2 flex items-center">
                                        <span className="text-yellow-600 mr-2">Unable to get your location automatically.</span>
                                        <Button
                                            size="small"
                                            type="link"
                                            onClick={() => getUserLocation()}
                                            className="p-0"
                                        >
                                            Try again
                                        </Button>
                                    </div>
                                ) : null
                            }
                        >
                            {/* Button to get current location */}
                            <div className="col-span-1 md:col-span-2 mb-4">
                                <div className="mb-2 text-sm text-gray-500">Please click the button below to get your current location coordinates (required)</div>
                                <Button
                                    type="primary"
                                    icon={gettingLocation ? <LoadingOutlined /> : <EnvironmentOutlined />}
                                    onClick={handleGetCurrentLocation}
                                    loading={gettingLocation}
                                    className="w-full"
                                >
                                    {gettingLocation ? 'Getting your location...' : 'Get My Current Location'}
                                </Button>
                            </div>

                            {/* User's current address based on coordinates */}
                            <div className="col-span-1 md:col-span-2">
                                <Form.Item
                                    name="userCurrentAddress"
                                    label="Your Current Address"
                                >
                                    <Input.TextArea rows={2} placeholder="Your current address will appear here" disabled />
                                </Form.Item>
                            </div>

                            {/* Hidden coordinates fields */}
                            <Form.Item
                                name="latitude"
                                label="Latitude"
                                hidden
                                rules={[{ required: true, message: 'Please enter latitude' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="longitude"
                                label="Longitude"
                                hidden
                                rules={[{ required: true, message: 'Please enter longitude' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Select
                                placeholder="Select hospital"
                                loading={loadingLocations}
                                onChange={handleLocationChange}
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
                    </div>

                    <Form.Item
                        name="address"
                        label="Hospital Address"
                        rules={[{ required: true, message: 'Please select a hospital to populate this field' }]}
                        className="col-span-1 md:col-span-2"
                    >
                        <Input placeholder="Hospital address will appear here" disabled />
                    </Form.Item>

                    <Form.Item
                        name="medicalNotes"
                        label="Medical Notes"
                        className="col-span-1 md:col-span-2"
                    >
                        <TextArea rows={4} placeholder="Enter any relevant medical information" />
                    </Form.Item>
                </div>

                {selectedLocation ? (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="font-medium text-green-700">Hospital Selected:</div>
                        <div className="text-green-800 font-bold text-lg">{selectedLocation.name}</div>
                        <div className="text-sm text-green-700">{selectedLocation.address}</div>
                        {selectedLocation.distance !== undefined && (
                            <div className="mt-1 text-sm text-green-700">Distance: {selectedLocation.distance} km</div>
                        )}
                    </div>
                ) : null}

                <Form.Item className="mt-6">
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        disabled={!isLoggedIn}
                        className="bg-red-600 hover:bg-red-700 w-full py-2 h-auto text-base"
                    >
                        Submit Blood Request
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default RegularBloodRequestForm; 