'use client';

import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Select, DatePicker, Input, Spin, Tabs, Statistic, Row, Col, Alert, Empty, Badge } from 'antd';
import { SearchOutlined, ReloadOutlined, WarningOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import StaffLayout from '@/components/Layout/StaffLayout';
import { useBloodInventory } from '@/hooks/api/useBloodInventory';
import { BloodInventory, BloodInventoryParams } from '@/services/api/bloodInventoryService';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import BloodVialCanvas from '@/components/BloodVialCanvas';

// Configure dayjs to use timezone
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// Define blood groups for filtering
const bloodGroups = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
];

// Define component types for filtering
const componentTypes = [
    { value: 'Whole Blood', label: 'Whole Blood' },
    { value: 'Plasma', label: 'Plasma' },
    { value: 'Platelets', label: 'Platelets' },
    { value: 'Red Cells', label: 'Red Cells' },
];

export default function StaffInventoryPage() {
    // States for filters
    const [bloodGroupFilter, setBloodGroupFilter] = useState<string | null>(null);
    const [componentTypeFilter, setComponentTypeFilter] = useState<string | null>(null);
    const [expirationDateRange, setExpirationDateRange] = useState<any>(null);
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [sortedInfo, setSortedInfo] = useState<any>({});
    const [filteredInfo, setFilteredInfo] = useState<any>({});

    // Use the blood inventory hook
    const {
        inventories,
        isLoading,
        error,
        pagination,
        fetchInventories,
        inventorySummary
    } = useBloodInventory();

    // Apply filters when they change
    useEffect(() => {
        const params: BloodInventoryParams = {
            pageNumber: pagination.current,
            pageSize: pagination.pageSize
        };

        if (bloodGroupFilter) {
            params.bloodGroupId = bloodGroupFilter;
        }

        if (componentTypeFilter) {
            params.componentTypeId = componentTypeFilter;
        }

        if (expirationDateRange && expirationDateRange[0] && expirationDateRange[1]) {
            params.expirationStartDate = expirationDateRange[0].format('YYYY-MM-DD');
            params.expirationEndDate = expirationDateRange[1].format('YYYY-MM-DD');
        }

        if (activeTab === 'expired') {
            params.isExpired = true;
        }

        fetchInventories(params);
    }, [bloodGroupFilter, componentTypeFilter, expirationDateRange, activeTab, pagination.current, pagination.pageSize]);

    // Handle table change
    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
    };

    // Clear all filters
    const clearFilters = () => {
        setBloodGroupFilter(null);
        setComponentTypeFilter(null);
        setExpirationDateRange(null);
        setSearchText('');
        setFilteredInfo({});
        setSortedInfo({});
        fetchInventories({
            pageNumber: 1,
            pageSize: pagination.pageSize
        });
    };

    // Check if a blood unit is expiring soon (within 7 days)
    const isExpiringSoon = (expirationDate: string) => {
        const today = dayjs();
        const expDate = dayjs(expirationDate);
        const daysUntilExpiration = expDate.diff(today, 'day');
        return daysUntilExpiration <= 7 && daysUntilExpiration >= 0;
    };

    // Check if a blood unit is expired
    const isExpired = (expirationDate: string) => {
        const today = dayjs();
        const expDate = dayjs(expirationDate);
        return expDate.isBefore(today);
    };

    // Filter inventories based on search text
    const getFilteredInventories = () => {
        if (!searchText) return inventories;

        const searchLower = searchText.toLowerCase();
        return inventories.filter(inventory =>
            (inventory.bloodGroupName && inventory.bloodGroupName.toLowerCase().includes(searchLower)) ||
            (inventory.componentTypeName && inventory.componentTypeName.toLowerCase().includes(searchLower)) ||
            (inventory.donorName && inventory.donorName.toLowerCase().includes(searchLower))
        );
    };

    // Group inventories by blood group and component type for visualization
    const groupedInventories = React.useMemo(() => {
        const grouped: Record<string, Record<string, { quantity: number, expiring: boolean, expired: boolean, actualQuantity: number }>> = {};

        inventories.forEach(inventory => {
            const bloodGroup = inventory.bloodGroupName || 'Unknown';
            const componentType = inventory.componentTypeName || 'Unknown';

            if (!grouped[bloodGroup]) {
                grouped[bloodGroup] = {};
            }

            if (!grouped[bloodGroup][componentType]) {
                grouped[bloodGroup][componentType] = {
                    quantity: 0,
                    expiring: false,
                    expired: false,
                    actualQuantity: 0
                };
            }

            grouped[bloodGroup][componentType].quantity += inventory.quantityUnits;

            // Use actual donated quantity if available
            if (inventory.donationEvent?.quantityDonated) {
                grouped[bloodGroup][componentType].actualQuantity += inventory.donationEvent.quantityDonated;
            } else {
                // Default to 450ml per unit if not specified
                grouped[bloodGroup][componentType].actualQuantity += inventory.quantityUnits * 450;
            }

            // Check if any units are expiring or expired
            if (isExpired(inventory.expirationDate)) {
                grouped[bloodGroup][componentType].expired = true;
            } else if (isExpiringSoon(inventory.expirationDate) && !grouped[bloodGroup][componentType].expired) {
                grouped[bloodGroup][componentType].expiring = true;
            }
        });

        return grouped;
    }, [inventories]);

    // Table columns
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: true,
            sortOrder: sortedInfo.columnKey === 'id' && sortedInfo.order,
        },
        {
            title: 'Blood Group',
            dataIndex: 'bloodGroupName',
            key: 'bloodGroupName',
            render: (text: string) => <Tag color="red">{text}</Tag>,
            filters: bloodGroups.map(group => ({ text: group.label, value: group.value })),
            filteredValue: filteredInfo.bloodGroupName || null,
            onFilter: (value: any, record: BloodInventory) => record.bloodGroupName === value,
        },
        {
            title: 'Component Type',
            dataIndex: 'componentTypeName',
            key: 'componentTypeName',
            render: (text: string) => <Tag color="blue">{text}</Tag>,
            filters: componentTypes.map(type => ({ text: type.label, value: type.value })),
            filteredValue: filteredInfo.componentTypeName || null,
            onFilter: (value: any, record: BloodInventory) => record.componentTypeName === value,
        },
        {
            title: 'Donor',
            dataIndex: 'donorName',
            key: 'donorName',
            render: (text: string, record: BloodInventory) => (
                <div>
                    <div>{text}</div>
                    {record.donationEvent?.donorPhone && (
                        <div className="text-xs text-gray-500">SĐT: {record.donationEvent.donorPhone}</div>
                    )}
                </div>
            ),
        },
        {
            title: 'Quantity',
            key: 'quantity',
            render: (text: string, record: BloodInventory) => (
                <div>
                    <div>{record.quantityUnits} {record.quantityUnits > 1 ? 'units' : 'unit'}</div>
                    {record.donationEvent?.quantityDonated && (
                        <div className="text-xs text-gray-500">{record.donationEvent.quantityDonated} ml</div>
                    )}
                </div>
            ),
            sorter: (a: BloodInventory, b: BloodInventory) => a.quantityUnits - b.quantityUnits,
            sortOrder: sortedInfo.columnKey === 'quantity' && sortedInfo.order,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text: string, record: BloodInventory) => {
                let statusTag;
                if (isExpired(record.expirationDate)) {
                    statusTag = <Tag color="red">Expired</Tag>;
                } else if (isExpiringSoon(record.expirationDate)) {
                    statusTag = <Tag color="orange">Expiring Soon</Tag>;
                } else {
                    statusTag = <Tag color="green">Available</Tag>;
                }

                return (
                    <div>
                        {statusTag}
                        <div className="text-xs text-gray-500 mt-1">{record.status}</div>
                    </div>
                );
            },
            filters: [
                { text: 'Available', value: 'available' },
                { text: 'Expiring Soon', value: 'expiring' },
                { text: 'Expired', value: 'expired' },
            ],
            filteredValue: filteredInfo.status || null,
            onFilter: (value: any, record: BloodInventory) => {
                if (value === 'expired') {
                    return isExpired(record.expirationDate);
                } else if (value === 'expiring') {
                    return isExpiringSoon(record.expirationDate);
                } else {
                    return !isExpired(record.expirationDate) && !isExpiringSoon(record.expirationDate);
                }
            },
        },
        {
            title: 'Expiration Date',
            dataIndex: 'expirationDate',
            key: 'expirationDate',
            render: (text: string) => dayjs(text).format('DD/MM/YYYY'),
            sorter: (a: BloodInventory, b: BloodInventory) =>
                dayjs(a.expirationDate).unix() - dayjs(b.expirationDate).unix(),
            sortOrder: sortedInfo.columnKey === 'expirationDate' && sortedInfo.order,
        },
        {
            title: 'Donation Date',
            key: 'donationDate',
            render: (text: string, record: BloodInventory) =>
                record.donationEvent?.donationDate ?
                    dayjs(record.donationEvent.donationDate).format('DD/MM/YYYY') :
                    'N/A',
            sorter: (a: BloodInventory, b: BloodInventory) => {
                const dateA = a.donationEvent?.donationDate ? dayjs(a.donationEvent.donationDate).unix() : 0;
                const dateB = b.donationEvent?.donationDate ? dayjs(b.donationEvent.donationDate).unix() : 0;
                return dateA - dateB;
            },
            sortOrder: sortedInfo.columnKey === 'donationDate' && sortedInfo.order,
        },
        {
            title: 'Location',
            key: 'location',
            render: (text: string, record: BloodInventory) =>
                record.donationEvent?.locationName || 'Unknown',
        },
        {
            title: 'Source',
            dataIndex: 'inventorySource',
            key: 'inventorySource',
        },
    ];

    return (
        <StaffLayout title="Blood Inventory" breadcrumbItems={[{ title: 'Inventory' }]}>
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-semibold">Manage Blood Inventory</h2>
                        <p className="text-gray-500">View and track all blood units in inventory</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <Statistic
                            title="Total Blood Units"
                            value={inventorySummary.totalUnits}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                    <Card>
                        <Statistic
                            title="Expiring Soon"
                            value={inventorySummary.expiringCount}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                    <Card>
                        <Statistic
                            title="Expired"
                            value={inventorySummary.expiredCount}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                    <Card>
                        <Statistic
                            title="Blood Types"
                            value={inventorySummary.bloodTypeCount}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </div>

                {/* Blood visualization */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Blood Inventory Visualization</h3>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex flex-wrap justify-center">
                            {Object.entries(groupedInventories).map(([bloodGroup, components]) => (
                                <div key={bloodGroup} className="m-4">
                                    <div className="text-center font-bold mb-2">{bloodGroup}</div>
                                    <div className="flex">
                                        {Object.entries(components).map(([componentType, data]) => (
                                            <BloodVialCanvas
                                                key={`${bloodGroup}-${componentType}`}
                                                bloodType={bloodGroup}
                                                componentType={componentType}
                                                quantity={data.quantity}
                                                actualQuantity={data.actualQuantity}
                                                expiring={data.expiring}
                                                expired={data.expired}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                            <Select
                                style={{ width: 120 }}
                                placeholder="Blood Group"
                                allowClear
                                onChange={setBloodGroupFilter}
                                value={bloodGroupFilter}
                            >
                                {bloodGroups.map(group => (
                                    <Option key={group.value} value={group.value}>{group.label}</Option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Component Type</label>
                            <Select
                                style={{ width: 150 }}
                                placeholder="Component Type"
                                allowClear
                                onChange={setComponentTypeFilter}
                                value={componentTypeFilter}
                            >
                                {componentTypes.map(type => (
                                    <Option key={type.value} value={type.value}>{type.label}</Option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                            <RangePicker
                                style={{ width: '100%' }}
                                value={expirationDateRange}
                                onChange={(dates) => setExpirationDateRange(dates)}
                            />
                        </div>
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <Input
                                placeholder="Search by blood group, component type, or donor"
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                        <div className="self-end">
                            <Button icon={<ReloadOutlined />} onClick={clearFilters}>Reset Filters</Button>
                        </div>
                    </div>
                </Card>

                {/* Tabs */}
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    className="mb-6"
                    type="card"
                >
                    <TabPane tab="All" key="all" />
                    <TabPane tab="Expiring Soon" key="expiring" />
                    <TabPane tab="Expired" key="expired" />
                </Tabs>

                {/* Table */}
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Spin size="large" />
                    </div>
                ) : error ? (
                    <Alert
                        message="Error"
                        description={error}
                        type="error"
                        showIcon
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={getFilteredInventories()}
                        rowKey="id"
                        onChange={handleTableChange}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} items`,
                        }}
                    />
                )}
            </div>
        </StaffLayout>
    );
} 