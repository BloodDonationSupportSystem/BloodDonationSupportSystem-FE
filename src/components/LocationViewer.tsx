'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl from '@openmapvn/openmapvn-gl';
import '@openmapvn/openmapvn-gl/dist/maplibre-gl.css';
import { Card, Typography } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface LocationViewerProps {
    latitude: string;
    longitude: string;
    address: string;
    height?: string | number;
    className?: string;
}

export default function LocationViewer({
    latitude,
    longitude,
    address,
    height = '300px',
    className = '',
}: LocationViewerProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        if (!latitude || !longitude || !mapContainerRef.current) return;

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) return;

        mapRef.current = new maplibregl.Map({
            container: mapContainerRef.current,
            style: `https://maptiles.openmap.vn/styles/day-v1/style.json?apikey=Fca7FB9MxT00OntvC6WjZruBko5MBDRF`,
            center: [lng, lat],
            zoom: 15,
            interactive: false, // Disable map interactions for view-only mode
        });

        // Add marker
        new maplibregl.Marker({
            color: '#e53e3e'
        })
            .setLngLat([lng, lat])
            .addTo(mapRef.current);

        // Clean up on unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }
        };
    }, [latitude, longitude]);

    if (!latitude || !longitude) {
        return (
            <Card className={`location-viewer ${className}`} style={{ height }}>
                <div className="flex items-center justify-center h-full">
                    <Text type="secondary">No location data available</Text>
                </div>
            </Card>
        );
    }

    return (
        <Card
            className={`location-viewer ${className}`}
            style={{ height }}
            title={
                <div className="flex items-center">
                    <EnvironmentOutlined className="mr-2 text-red-600" />
                    <span>Location</span>
                </div>
            }
        >
            <div className="mb-3">
                <Text className="block text-gray-500 text-sm">Address:</Text>
                <Text>{address}</Text>
            </div>
            <div className="mb-3">
                <Text className="block text-gray-500 text-sm">Coordinates:</Text>
                <Text>{latitude}, {longitude}</Text>
            </div>
            <div
                ref={mapContainerRef}
                className="w-full rounded-md overflow-hidden"
                style={{ height: 'calc(100% - 100px)', minHeight: '150px' }}
            />
        </Card>
    );
} 