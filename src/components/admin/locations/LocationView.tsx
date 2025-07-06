'use client';

import React from 'react';
import { Card, Descriptions, Typography, Row, Col } from 'antd';
import { Location } from '@/types/location';
import LocationViewer from '@/components/LocationViewer';
import { formatDate } from '@/utils/formatDate';

interface LocationViewProps {
    location: Location;
}

export default function LocationView({ location }: LocationViewProps) {
    return (
        <div className="space-y-4">
            <Card
                title={
                    <div className="flex items-center text-red-600">
                        <span className="mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                        </span>
                        Location Details
                    </div>
                }
                bordered={false}
            >
                <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Name">{location.name}</Descriptions.Item>
                    <Descriptions.Item label="Description">
                        {location.description || <Typography.Text type="secondary">No description</Typography.Text>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Created At">
                        {location.createdAt ? formatDate(location.createdAt) : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Updated At">
                        {location.updatedAt ? formatDate(location.updatedAt) : 'N/A'}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Row gutter={16}>
                <Col span={24}>
                    <LocationViewer
                        latitude={location.latitude}
                        longitude={location.longitude}
                        address={location.address}
                        height={400}
                    />
                </Col>
            </Row>
        </div>
    );
} 