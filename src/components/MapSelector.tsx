'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input, Button, Space, Spin, Alert, Typography, Card, Select, Empty } from 'antd';
import { SearchOutlined, AimOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import maplibregl from '@openmapvn/openmapvn-gl';
import '@openmapvn/openmapvn-gl/dist/maplibre-gl.css';
import {
    searchLocationSuggestions,
    getPlaceDetailsGoogle,
    resetSessionToken,
    AutocompletePrediction,
    PlaceDetailGoogle
} from '@/services/api/mapService';
import debounce from 'lodash/debounce';

const { Title, Text } = Typography;
const { Option } = Select;

interface MapSelectorProps {
    onSelect: (latitude: string, longitude: string, address: string) => void;
    initialLatitude?: string;
    initialLongitude?: string;
    initialAddress?: string;
}

export default function MapSelector({
    onSelect,
    initialLatitude = '10.762622',
    initialLongitude = '106.660172',
    initialAddress = ''
}: MapSelectorProps) {
    // Default to Ho Chi Minh City coordinates
    const [position, setPosition] = useState<[number, number]>([
        parseFloat(initialLongitude) || 106.660172,
        parseFloat(initialLatitude) || 10.762622
    ]);
    const [address, setAddress] = useState<string>(initialAddress || '');
    const [searchText, setSearchText] = useState<string>('');
    const [suggestions, setSuggestions] = useState<AutocompletePrediction[]>([]);
    const [selectedSuggestion, setSelectedSuggestion] = useState<AutocompletePrediction | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    // Reset session token when component mounts
    useEffect(() => {
        resetSessionToken();
    }, []);

    // Initialize map when component mounts
    useEffect(() => {
        if (mapContainerRef.current) {
            mapRef.current = new maplibregl.Map({
                container: mapContainerRef.current,
                style: `https://maptiles.openmap.vn/styles/day-v1/style.json?apikey=Fca7FB9MxT00OntvC6WjZruBko5MBDRF`,
                center: position,
                zoom: 15,
                maplibreLogo: true,
            });

            // Add navigation controls
            mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');

            // Add marker
            markerRef.current = new maplibregl.Marker({
                draggable: true,
                color: '#e53e3e'
            })
                .setLngLat(position)
                .addTo(mapRef.current);

            // Get address on marker dragend
            markerRef.current.on('dragend', async () => {
                const lngLat = markerRef.current.getLngLat();
                setPosition([lngLat.lng, lngLat.lat]);
                await fetchAddress(lngLat.lat, lngLat.lng);
            });

            // Handle map click
            mapRef.current.on('click', async (e: any) => {
                const { lng, lat } = e.lngLat;
                setPosition([lng, lat]);
                markerRef.current.setLngLat([lng, lat]);
                await fetchAddress(lat, lng);
            });

            // Clean up on unmount
            return () => {
                if (mapRef.current) {
                    mapRef.current.remove();
                }
            };
        }
    }, []);

    // Fetch address from coordinates
    const fetchAddress = async (lat: number, lng: number) => {
        setLoading(true);
        setError(null);

        try {
            // Use OpenStreetMap Nominatim for reverse geocoding
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch address');
            }

            const data = await response.json();
            if (data && data.display_name) {
                setAddress(data.display_name);
            } else {
                setAddress(`${lat}, ${lng}`);
            }
        } catch (err) {
            console.error('Error fetching address:', err);
            setError('Failed to get address for this location');
            setAddress(`${lat}, ${lng}`);
        } finally {
            setLoading(false);
        }
    };

    // Debounced function for searching locations
    const debouncedSearch = useCallback(
        debounce(async (value: string) => {
            if (!value || value.length < 3) {
                setSuggestions([]);
                return;
            }

            setLoading(true);
            try {
                const response = await searchLocationSuggestions(value);
                if (response.status === 'OK') {
                    setSuggestions(response.predictions);
                } else {
                    setSuggestions([]);
                }
            } catch (err) {
                console.error('Error searching for locations:', err);
                setError('Failed to search for locations');
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 500),
        []
    );

    // Handle search input change
    const handleSearchChange = (value: string) => {
        setSearchText(value);
        debouncedSearch(value);
    };

    // Handle suggestion selection
    const handleSuggestionSelect = async (placeId: string) => {
        setLoading(true);
        setError(null);

        try {
            const selected = suggestions.find(s => s.place_id === placeId);
            if (selected) {
                setSelectedSuggestion(selected);

                // Get place details
                const placeDetails = await getPlaceDetailsGoogle(placeId);

                if (placeDetails.status === 'OK' && placeDetails.result) {
                    const { lat, lng } = placeDetails.result.geometry.location;
                    setPosition([lng, lat]);
                    setAddress(placeDetails.result.formatted_address);

                    // Update map and marker
                    if (mapRef.current && markerRef.current) {
                        mapRef.current.flyTo({
                            center: [lng, lat],
                            zoom: 16
                        });
                        markerRef.current.setLngLat([lng, lat]);
                    }
                }
            }
        } catch (err) {
            console.error('Error getting place details:', err);
            setError('Failed to get place details');
        } finally {
            setLoading(false);
        }
    };

    // Get current location
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setPosition([lng, lat]);

                    // Update map and marker
                    if (mapRef.current && markerRef.current) {
                        mapRef.current.flyTo({
                            center: [lng, lat],
                            zoom: 16
                        });
                        markerRef.current.setLngLat([lng, lat]);
                    }

                    await fetchAddress(lat, lng);
                },
                (error) => {
                    console.error('Error getting current location:', error);
                    setError('Failed to get your current location');
                    setLoading(false);
                }
            );
        } else {
            setError('Geolocation is not supported by your browser');
        }
    };

    // Handle confirm selection
    const handleConfirm = () => {
        onSelect(position[1].toString(), position[0].toString(), address);
    };

    return (
        <div className="map-selector-container">
            <div className="p-4 bg-white border-b">
                <Title level={5} className="mb-3">Find a location</Title>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <Select
                            showSearch
                            value={searchText}
                            placeholder="Search for an address"
                            defaultActiveFirstOption={false}
                            showArrow={false}
                            filterOption={false}
                            onSearch={handleSearchChange}
                            onChange={handleSuggestionSelect}
                            notFoundContent={loading ? <Spin size="small" /> : <Empty description="No locations found" />}
                            style={{ width: '100%' }}
                            size="large"
                            loading={loading}
                            suffixIcon={<SearchOutlined />}
                        >
                            {suggestions.map(suggestion => (
                                <Option key={suggestion.place_id} value={suggestion.place_id}>
                                    <div className="flex flex-col">
                                        <Text strong>{suggestion.structured_formatting.main_text}</Text>
                                        <Text type="secondary" className="text-xs">
                                            {suggestion.structured_formatting.secondary_text}
                                        </Text>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex justify-between md:justify-end space-x-2">
                        <Button
                            onClick={getCurrentLocation}
                            loading={loading}
                            icon={<AimOutlined />}
                            size="large"
                        >
                            Current Location
                        </Button>

                        <Button
                            type="primary"
                            onClick={handleConfirm}
                            icon={<CheckCircleOutlined />}
                            size="large"
                        >
                            Confirm
                        </Button>
                    </div>
                </div>

                {error && <Alert message={error} type="error" showIcon className="mt-4" />}

                <Card size="small" className="mt-4">
                    <div className="flex items-center mb-2">
                        <InfoCircleOutlined className="mr-2 text-blue-500" />
                        <Text strong>Selected Location</Text>
                    </div>
                    <div className="pl-6">
                        <div className="mb-2">
                            <Text type="secondary">Address:</Text><br />
                            {loading ? <Spin size="small" /> : <Text>{address || 'No address selected'}</Text>}
                        </div>
                        <div>
                            <Text type="secondary">Coordinates:</Text><br />
                            <Text>{position[1].toFixed(6)}, {position[0].toFixed(6)}</Text>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="relative flex-grow">
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} ref={mapContainerRef} />
                <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-75 p-2 rounded-md text-xs text-center">
                    Click on the map to select a location or drag the marker
                </div>
            </div>
        </div>
    );
} 