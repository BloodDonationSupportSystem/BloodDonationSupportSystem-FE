'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Tabs, Select, Button, Card, Spin, Table, Space, Alert, Divider, Row, Col, Tag, Empty } from 'antd';
import { SearchOutlined, InfoCircleOutlined, TableOutlined, ExperimentOutlined } from '@ant-design/icons';
import axios from 'axios';
import apiClient from '@/services/api/apiConfig';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Interface definitions
interface BloodGroup {
    id: string;
    groupName: string;
    description: string;
}

interface ComponentType {
    id: string;
    name: string;
    shelfLifeDays: number;
}

interface BloodCompatibilityResponse {
    success: boolean;
    data: BloodGroup[];
    message: string;
    statusCode: number;
}

interface MatrixCompatibility {
    bloodGroupId: string;
    bloodGroupName: string;
    canDonateTo: { bloodGroupId: string; bloodGroupName: string }[];
    canReceiveFrom: { bloodGroupId: string; bloodGroupName: string }[];
    componentCompatibility: {
        componentTypeId: string;
        componentTypeName: string;
        compatibleDonors: { bloodGroupId: string; bloodGroupName: string }[];
    }[];
}

interface MatrixResponse {
    success: boolean;
    data: MatrixCompatibility[];
    message: string;
    statusCode: number;
}

export default function BloodCompatibilityPage() {
    // State variables
    const [bloodGroups, setBloodGroups] = useState<BloodGroup[]>([]);
    const [componentTypes, setComponentTypes] = useState<ComponentType[]>([]);
    const [selectedBloodGroupId, setSelectedBloodGroupId] = useState<string>('');
    const [selectedComponentTypeId, setSelectedComponentTypeId] = useState<string>('');
    const [compatibleGroups, setCompatibleGroups] = useState<BloodGroup[]>([]);
    const [compatibilityMatrix, setCompatibilityMatrix] = useState<MatrixCompatibility[]>([]);
    const [activeTab, setActiveTab] = useState('whole-blood');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch blood groups and component types on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);

                // Fetch blood groups
                const bloodGroupsResponse = await apiClient.get<BloodCompatibilityResponse>('/BloodGroups');
                if (bloodGroupsResponse.data.success) {
                    setBloodGroups(bloodGroupsResponse.data.data);
                } else {
                    setError('Failed to load blood groups');
                }

                // Fetch component types
                const componentTypesResponse = await apiClient.get<{ success: boolean; data: ComponentType[] }>('/ComponentTypes');
                if (componentTypesResponse.data.success) {
                    setComponentTypes(componentTypesResponse.data.data);
                } else {
                    setError('Failed to load component types');
                }

            } catch (err) {
                console.error('Error fetching initial data:', err);
                setError('Failed to load necessary data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Fetch compatibility matrix
    useEffect(() => {
        const fetchCompatibilityMatrix = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get<MatrixResponse>('/BloodCompatibility/matrix');
                if (response.data.success) {
                    setCompatibilityMatrix(response.data.data);
                } else {
                    setError('Failed to load compatibility matrix');
                }
            } catch (err) {
                console.error('Error fetching compatibility matrix:', err);
                setError('Failed to load compatibility matrix. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === 'matrix') {
            fetchCompatibilityMatrix();
        }
    }, [activeTab]);

    // Handle search for compatible blood groups
    const handleSearch = async () => {
        if (!selectedBloodGroupId) {
            setError('Please select a blood group');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let response;

            if (activeTab === 'whole-blood') {
                // Fetch whole blood compatibility
                response = await apiClient.get<BloodCompatibilityResponse>(
                    `/BloodCompatibility/whole-blood/${selectedBloodGroupId}`
                );
            } else if (activeTab === 'components') {
                if (!selectedComponentTypeId) {
                    setError('Please select a component type');
                    setLoading(false);
                    return;
                }

                // Fetch component compatibility
                response = await apiClient.get<BloodCompatibilityResponse>(
                    `/BloodCompatibility/component/${selectedBloodGroupId}/${selectedComponentTypeId}`
                );
            } else {
                setLoading(false);
                return;
            }

            if (response.data.success) {
                setCompatibleGroups(response.data.data);
            } else {
                setError(response.data.message || 'Failed to fetch compatibility data');
            }
        } catch (err) {
            console.error('Error searching for compatible blood groups:', err);
            setError('An error occurred while fetching compatibility data');
        } finally {
            setLoading(false);
        }
    };

    // Render compatible blood groups
    const renderCompatibleGroups = () => {
        if (compatibleGroups.length === 0) {
            return (
                <Alert
                    message="No compatible blood groups found"
                    description="No compatible blood groups were found for the selected criteria."
                    type="info"
                    showIcon
                />
            );
        }

        return (
            <div className="mt-4">
                <Title level={4}>Compatible Blood Groups</Title>
                <div className="flex flex-wrap gap-3 mt-4">
                    {compatibleGroups.map(group => (
                        <Tag key={group.id} color="red" className="text-base py-2 px-4">
                            {group.groupName}
                        </Tag>
                    ))}
                </div>
                <Paragraph className="mt-4 text-gray-600">
                    <InfoCircleOutlined className="mr-2" />
                    {activeTab === 'whole-blood'
                        ? 'These blood groups are compatible for whole blood transfusion to the selected recipient blood group.'
                        : 'These blood groups are compatible for the selected component type transfusion to the selected recipient blood group.'}
                </Paragraph>
            </div>
        );
    };

    // Render compatibility matrix
    const renderCompatibilityMatrix = () => {
        if (loading) {
            return <Spin size="large" className="my-8 flex justify-center" />;
        }

        if (compatibilityMatrix.length === 0) {
            return (
                <Alert
                    message="No compatibility data available"
                    description="The compatibility matrix data is not available at the moment."
                    type="info"
                    showIcon
                />
            );
        }

        const columns = [
            {
                title: 'Blood Group',
                dataIndex: 'bloodGroupName',
                key: 'bloodGroupName',
                render: (text: string) => <Tag color="red">{text}</Tag>,
            },
            {
                title: 'Can Donate To',
                dataIndex: 'canDonateTo',
                key: 'canDonateTo',
                render: (donors: { bloodGroupName: string }[]) => (
                    <div className="flex flex-wrap gap-1">
                        {donors.map(donor => (
                            <Tag key={donor.bloodGroupName} color="green">
                                {donor.bloodGroupName}
                            </Tag>
                        ))}
                    </div>
                ),
            },
            {
                title: 'Can Receive From',
                dataIndex: 'canReceiveFrom',
                key: 'canReceiveFrom',
                render: (recipients: { bloodGroupName: string }[]) => (
                    <div className="flex flex-wrap gap-1">
                        {recipients.map(recipient => (
                            <Tag key={recipient.bloodGroupName} color="blue">
                                {recipient.bloodGroupName}
                            </Tag>
                        ))}
                    </div>
                ),
            },
        ];

        return (
            <Table
                dataSource={compatibilityMatrix}
                columns={columns}
                rowKey="bloodGroupId"
                pagination={false}
                className="mt-4"
            />
        );
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="text-center mb-6">
                <Title level={2}>Blood Compatibility Lookup</Title>
                <Paragraph className="text-gray-500">
                    Find compatible blood types for transfusion based on whole blood or specific blood components
                </Paragraph>
            </div>

            <Card className="mb-6">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    className="mb-6"
                    items={[
                        {
                            key: 'whole-blood',
                            label: (
                                <span>
                                    <ExperimentOutlined className="mr-2" />
                                    Whole Blood
                                </span>
                            ),
                            children: (
                                <Paragraph>
                                    Whole blood contains all components including red cells, white cells, and plasma.
                                    Use this tab to find compatible blood groups for whole blood transfusion.
                                </Paragraph>
                            )
                        },
                        {
                            key: 'components',
                            label: (
                                <span>
                                    <ExperimentOutlined className="mr-2" />
                                    Blood Components
                                </span>
                            ),
                            children: (
                                <Paragraph>
                                    Blood components have different compatibility rules compared to whole blood.
                                    Use this tab to find compatible blood groups for specific blood component transfusion.
                                </Paragraph>
                            )
                        },
                        {
                            key: 'matrix',
                            label: (
                                <span>
                                    <TableOutlined className="mr-2" />
                                    Compatibility Matrix
                                </span>
                            ),
                            children: (
                                <Paragraph>
                                    View the complete blood compatibility matrix showing which blood groups can donate to
                                    and receive from other blood groups.
                                </Paragraph>
                            )
                        }
                    ]}
                />

                {activeTab !== 'matrix' && (
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Recipient Blood Group
                            </label>
                            <Select
                                placeholder="Select Blood Group"
                                style={{ width: '100%' }}
                                value={selectedBloodGroupId || undefined}
                                onChange={setSelectedBloodGroupId}
                            >
                                {bloodGroups.map(group => (
                                    <Option key={group.id} value={group.id}>
                                        {group.groupName} - {group.description}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        {activeTab === 'components' && (
                            <div className="flex-grow">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Component Type
                                </label>
                                <Select
                                    placeholder="Select Component Type"
                                    style={{ width: '100%' }}
                                    value={selectedComponentTypeId || undefined}
                                    onChange={setSelectedComponentTypeId}
                                >
                                    {componentTypes.map(component => (
                                        <Option key={component.id} value={component.id}>
                                            {component.name} (Shelf Life: {component.shelfLifeDays} days)
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        )}

                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={handleSearch}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={loading}
                        >
                            Find Compatible Blood Groups
                        </Button>
                    </div>
                )}
            </Card>

            {loading ? (
                <div className="flex justify-center my-8">
                    <Spin size="large" tip="Loading compatibility data..." />
                </div>
            ) : error ? (
                <Alert message="Error" description={error} type="error" showIcon className="mb-6" />
            ) : (
                <Card>
                    {activeTab === 'matrix' ? renderCompatibilityMatrix() : renderCompatibleGroups()}
                </Card>
            )}

            <Card className="mt-6 bg-blue-50">
                <div className="flex items-start">
                    <InfoCircleOutlined className="text-blue-500 text-xl mt-1 mr-3" />
                    <div>
                        <Title level={5} className="text-blue-700">Important Medical Information</Title>
                        <Paragraph className="text-blue-600">
                            This tool provides general guidance on blood type compatibility. In clinical settings,
                            additional tests like cross-matching are performed to ensure safe transfusions.
                            Always consult healthcare professionals for medical decisions regarding blood transfusions.
                        </Paragraph>
                    </div>
                </div>
            </Card>
        </div>
    );
} 