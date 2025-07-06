'use client';

import React from 'react';
import { Modal } from 'antd';
import MapSelector from '@/components/MapSelector';

interface MapModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (latitude: string, longitude: string, address: string) => void;
    initialLatitude?: string;
    initialLongitude?: string;
    initialAddress?: string;
}

export default function MapModal({
    visible,
    onClose,
    onSelect,
    initialLatitude,
    initialLongitude,
    initialAddress,
}: MapModalProps) {
    return (
        <Modal
            title={
                <div className="flex items-center text-red-600">
                    <span className="mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                    </span>
                    Select Location on Map
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width="90%"
            style={{ top: 20 }}
            bodyStyle={{ padding: 0, height: 'calc(90vh - 100px)' }}
            maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }}
            className="map-modal"
        >
            <div className="h-full">
                <MapSelector
                    onSelect={onSelect}
                    initialLatitude={initialLatitude}
                    initialLongitude={initialLongitude}
                    initialAddress={initialAddress}
                />
            </div>
        </Modal>
    );
} 