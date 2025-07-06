'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';

// Define types for location markers
interface LocationMarker {
    id: string;
    name: string;
    address: string;
    position: [number, number]; // [latitude, longitude]
    contactPhone?: string;
    contactEmail?: string;
}

interface MapComponentProps {
    markers: LocationMarker[];
    center?: [number, number]; // Optional center position
    zoom?: number; // Optional zoom level
    height?: string; // Optional height
}

// Fix for Leaflet marker icons
// This is needed because Leaflet's default icon paths are not compatible with Next.js
const markerIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(
    () => import('react-leaflet').then(mod => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then(mod => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then(mod => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import('react-leaflet').then(mod => mod.Popup),
    { ssr: false }
);

const MapComponent: React.FC<MapComponentProps> = ({
    markers,
    center = [10.762622, 106.660172], // Default center (Ho Chi Minh City)
    zoom = 12,
    height = '400px'
}) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Import Leaflet CSS on client-side only
        import('leaflet/dist/leaflet.css');
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div style={{ height, width: '100%', background: '#f0f0f0' }}>Loading map...</div>;
    }

    return (
        <div style={{ height, width: '100%' }}>
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        position={marker.position}
                        icon={markerIcon}
                    >
                        <Popup>
                            <div>
                                <h3 className="font-bold">{marker.name}</h3>
                                <p>{marker.address}</p>
                                {marker.contactPhone && <p>Phone: {marker.contactPhone}</p>}
                                {marker.contactEmail && <p>Email: {marker.contactEmail}</p>}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapComponent; 