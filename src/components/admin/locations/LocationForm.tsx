'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Row, Col, Space, Tooltip } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { Location } from '@/types/location';
import LocationAutocomplete, { LocationAutocompleteValue } from '@/components/LocationAutocomplete';
import MapModal from './MapModal';

interface LocationFormProps {
    initialValues?: Partial<Location>;
    onFinish: (values: any) => void;
    loading?: boolean;
}

export default function LocationForm({ initialValues, onFinish, loading = false }: LocationFormProps) {
    const [form] = Form.useForm();
    const [mapModalVisible, setMapModalVisible] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{
        latitude: string;
        longitude: string;
        address: string;
    } | null>(null);

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
            });

            if (initialValues.latitude && initialValues.longitude) {
                setSelectedLocation({
                    latitude: initialValues.latitude,
                    longitude: initialValues.longitude,
                    address: initialValues.address || '',
                });
            }
        }
    }, [initialValues, form]);

    const handleMapSelect = (latitude: string, longitude: string, address: string) => {
        setSelectedLocation({ latitude, longitude, address });
        form.setFieldsValue({
            latitude,
            longitude,
            address,
        });
        setMapModalVisible(false);
    };

    const handleLocationSelect = (value: LocationAutocompleteValue | undefined) => {
        if (value) {
            setSelectedLocation({
                latitude: value.latitude.toString(),
                longitude: value.longitude.toString(),
                address: value.address,
            });

            form.setFieldsValue({
                latitude: value.latitude.toString(),
                longitude: value.longitude.toString(),
                address: value.address,
            });
        } else {
            setSelectedLocation(null);
            form.setFieldsValue({
                latitude: '',
                longitude: '',
                address: '',
            });
        }
    };

    return (
        <>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={initialValues}
                requiredMark={false}
            >
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: 'Please enter location name' }]}
                >
                    <Input placeholder="Enter location name" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                >
                    <Input.TextArea rows={3} placeholder="Enter location description" />
                </Form.Item>

                <Form.Item
                    label={
                        <span>
                            Location
                            <Tooltip title="Select location from map or search">
                                <Button
                                    type="link"
                                    icon={<EnvironmentOutlined />}
                                    onClick={() => setMapModalVisible(true)}
                                    size="small"
                                    className="ml-2"
                                >
                                    Select on map
                                </Button>
                            </Tooltip>
                        </span>
                    }
                >
                    <LocationAutocomplete
                        value={selectedLocation ? {
                            address: selectedLocation.address,
                            latitude: parseFloat(selectedLocation.latitude),
                            longitude: parseFloat(selectedLocation.longitude),
                            placeId: ''
                        } : undefined}
                        onChange={handleLocationSelect}
                        placeholder="Search for a location"
                    />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="latitude"
                            label="Latitude"
                            rules={[{ required: true, message: 'Please enter latitude' }]}
                            hidden
                        >
                            <Input placeholder="Enter latitude" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="longitude"
                            label="Longitude"
                            rules={[{ required: true, message: 'Please enter longitude' }]}
                            hidden
                        >
                            <Input placeholder="Enter longitude" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="address"
                    label="Address"
                    rules={[{ required: true, message: 'Please enter address' }]}
                >
                    <Input.TextArea rows={2} placeholder="Enter address" />
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {initialValues?.id ? 'Update' : 'Create'}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>

            <MapModal
                visible={mapModalVisible}
                onClose={() => setMapModalVisible(false)}
                onSelect={handleMapSelect}
                initialLatitude={selectedLocation?.latitude}
                initialLongitude={selectedLocation?.longitude}
                initialAddress={selectedLocation?.address}
            />
        </>
    );
} 