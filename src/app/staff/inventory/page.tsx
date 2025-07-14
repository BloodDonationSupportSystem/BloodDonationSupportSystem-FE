'use client';

import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Select, DatePicker, Input, Spin, Tabs, Statistic, Row, Col, Alert, Empty, Badge } from 'antd';
import { SearchOutlined, ReloadOutlined, WarningOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import StaffLayout from '@/components/Layout/StaffLayout';
import { useBloodInventory } from '@/hooks/api/useBloodInventory';
import { BloodInventory, BloodInventoryParams } from '@/services/api/bloodInventoryService';
import { useBloodGroups } from '@/hooks/api/useBloodGroups';
import { useComponentTypes } from '@/hooks/api/useComponentTypes';
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

export default function StaffInventoryPage() {
    // States for filters
    const [bloodGroupFilter, setBloodGroupFilter] = useState<string | null>(null);
    const [componentTypeFilter, setComponentTypeFilter] = useState<string | null>(null);
    const [expirationDateRange, setExpirationDateRange] = useState<any>(null);
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [sortedInfo, setSortedInfo] = useState<any>({});
    const [filteredInfo, setFilteredInfo] = useState<any>({});

    // Use hooks for blood groups and component types
    const { bloodGroups, isLoading: isLoadingBloodGroups } = useBloodGroups();
    const { componentTypes, isLoading: isLoadingComponentTypes } = useComponentTypes();

    // Use the blood inventory hook
    const {
        inventories,
        isLoading,
        error,
        pagination,
        fetchInventories,
        inventorySummary
    } = useBloodInventory();

    // Initial data load
    useEffect(() => {
        // Load initial data
        const params: BloodInventoryParams = {
            pageNumber: 1,
            pageSize: pagination.pageSize,
            isExpired: false,
            isExpiringSoon: false
        };

        console.log("Initial data load with params:", params);
        fetchInventories(params);
    }, []);

    // Handle tab change
    const handleTabChange = (key: string) => {
        console.log("Tab changed to:", key);

        // Reset pagination to first page when changing tabs
        pagination.current = 1;

        // Clear table filters when changing tabs
        setFilteredInfo({});
        setSortedInfo({});

        // Prepare params - ONLY include pagination
        const params: BloodInventoryParams = {
            pageNumber: 1,
            pageSize: pagination.pageSize
        };

        // Clear other filters when changing tabs to avoid conflicting filters
        setBloodGroupFilter(null);
        setComponentTypeFilter(null);
        setExpirationDateRange(null);
        setSearchText('');

        // Update the active tab
        setActiveTab(key);

        // Apply tab-based filters based on the new tab
        switch (key) {
            case 'expired':
                params.isExpired = true;
                params.isExpiringSoon = false;
                params.status = undefined;
                break;
            case 'expiring':
                params.isExpired = false;
                params.isExpiringSoon = true;
                params.status = undefined;
                break;
            case 'available':
                params.isExpired = false;
                params.isExpiringSoon = false;
                params.status = 'Available';
                break;
            case 'used':
                params.isExpired = false;
                params.isExpiringSoon = false;
                params.status = 'Used';
                break;
            case 'dispatched':
                params.isExpired = false;
                params.isExpiringSoon = false;
                params.status = 'Dispatched';
                break;
            default:
                // All tab - clear all specific filters
                params.isExpired = false;
                params.isExpiringSoon = false;
                params.status = undefined;
                break;
        }

        // Explicitly ensure filter params are undefined
        params.bloodGroupId = undefined;
        params.componentTypeId = undefined;
        params.expirationStartDate = undefined;
        params.expirationEndDate = undefined;

        // Call API directly
        console.log("Calling API after tab change with params:", params);
        fetchInventories(params);
    };

    // Handle blood group filter change
    const handleBloodGroupFilterChange = (value: string | null) => {
        console.log("Blood group filter changed to:", value);

        // Reset pagination
        pagination.current = 1;

        // Prepare params
        const params: BloodInventoryParams = {
            pageNumber: 1,
            pageSize: pagination.pageSize
        };

        // Apply filters
        if (value) {
            params.bloodGroupId = value;
        } else {
            params.bloodGroupId = undefined;
        }

        if (componentTypeFilter) {
            params.componentTypeId = componentTypeFilter;
        }

        if (expirationDateRange && expirationDateRange[0] && expirationDateRange[1]) {
            params.expirationStartDate = expirationDateRange[0].format('YYYY-MM-DD');
            params.expirationEndDate = expirationDateRange[1].format('YYYY-MM-DD');
        }

        // Apply tab-based filters
        applyTabFilters(params);

        // Update state
        setBloodGroupFilter(value);

        // Call API directly
        console.log("Calling API after blood group filter change with params:", params);
        fetchInventories(params);
    };

    // Handle component type filter change
    const handleComponentTypeFilterChange = (value: string | null) => {
        console.log("Component type filter changed to:", value);

        // Reset pagination
        pagination.current = 1;

        // Prepare params
        const params: BloodInventoryParams = {
            pageNumber: 1,
            pageSize: pagination.pageSize
        };

        // Apply filters
        if (bloodGroupFilter) {
            params.bloodGroupId = bloodGroupFilter;
        }

        if (value) {
            params.componentTypeId = value;
        } else {
            params.componentTypeId = undefined;
        }

        if (expirationDateRange && expirationDateRange[0] && expirationDateRange[1]) {
            params.expirationStartDate = expirationDateRange[0].format('YYYY-MM-DD');
            params.expirationEndDate = expirationDateRange[1].format('YYYY-MM-DD');
        }

        // Apply tab-based filters
        applyTabFilters(params);

        // Update state
        setComponentTypeFilter(value);

        // Call API directly
        console.log("Calling API after component type filter change with params:", params);
        fetchInventories(params);
    };

    // Handle date range filter change
    const handleDateRangeChange = (dates: any) => {
        console.log("Date range changed to:", dates);

        // Reset pagination
        pagination.current = 1;

        // Prepare params
        const params: BloodInventoryParams = {
            pageNumber: 1,
            pageSize: pagination.pageSize
        };

        // Apply filters
        if (bloodGroupFilter) {
            params.bloodGroupId = bloodGroupFilter;
        }

        if (componentTypeFilter) {
            params.componentTypeId = componentTypeFilter;
        }

        if (dates && dates[0] && dates[1]) {
            params.expirationStartDate = dates[0].format('YYYY-MM-DD');
            params.expirationEndDate = dates[1].format('YYYY-MM-DD');
        } else {
            params.expirationStartDate = undefined;
            params.expirationEndDate = undefined;
        }

        // Apply tab-based filters
        applyTabFilters(params);

        // Update state
        setExpirationDateRange(dates);

        // Call API directly
        console.log("Calling API after date range filter change with params:", params);
        fetchInventories(params);
    };

    // Handle table change
    const handleTableChange = (paginationParams: any, filters: any, sorter: any) => {
        console.log("Table changed - Pagination:", paginationParams, "Filters:", filters, "Sorter:", sorter);

        // Update filter and sort info
        setFilteredInfo(filters);
        setSortedInfo(sorter);

        // Update pagination
        pagination.current = paginationParams.current;
        pagination.pageSize = paginationParams.pageSize;

        // Prepare params
        const params: BloodInventoryParams = {
            pageNumber: paginationParams.current,
            pageSize: paginationParams.pageSize
        };

        // Apply manual filters
        if (bloodGroupFilter) {
            params.bloodGroupId = bloodGroupFilter;
        } else {
            params.bloodGroupId = undefined;
        }

        if (componentTypeFilter) {
            params.componentTypeId = componentTypeFilter;
        } else {
            params.componentTypeId = undefined;
        }

        if (expirationDateRange && expirationDateRange[0] && expirationDateRange[1]) {
            params.expirationStartDate = expirationDateRange[0].format('YYYY-MM-DD');
            params.expirationEndDate = expirationDateRange[1].format('YYYY-MM-DD');
        } else {
            params.expirationStartDate = undefined;
            params.expirationEndDate = undefined;
        }

        // Apply tab-based filters
        applyTabFilters(params);

        // Apply sorting if available
        if (sorter && sorter.columnKey && sorter.order) {
            params.sortBy = sorter.columnKey;
            params.sortAscending = sorter.order === 'ascend';
        }

        // Call API directly
        console.log("Calling API after table change with params:", params);
        fetchInventories(params);
    };

    // Helper function to apply tab-based filters
    const applyTabFilters = (params: BloodInventoryParams) => {
        // First reset all tab-specific filters
        params.isExpired = false;
        params.isExpiringSoon = false;
        params.status = undefined;

        // Then apply specific tab filters
        switch (activeTab) {
            case 'expired':
                params.isExpired = true;
                params.isExpiringSoon = false;
                params.status = undefined;
                break;
            case 'expiring':
                params.isExpired = false;
                params.isExpiringSoon = true;
                params.status = undefined;
                break;
            case 'available':
                params.isExpired = false;
                params.isExpiringSoon = false;
                params.status = 'Available';
                break;
            case 'used':
                params.isExpired = false;
                params.isExpiringSoon = false;
                params.status = 'Used';
                break;
            case 'dispatched':
                params.isExpired = false;
                params.isExpiringSoon = false;
                params.status = 'Dispatched';
                break;
            default:
                // All tab - clear all specific filters
                params.isExpired = false;
                params.isExpiringSoon = false;
                params.status = undefined;
                break;
        }
    };

    // Clear all filters
    const clearFilters = () => {
        console.log("Clearing all filters");

        // Reset pagination
        pagination.current = 1;

        // Prepare params - ONLY include pagination and tab-based filters
        const params: BloodInventoryParams = {
            pageNumber: 1,
            pageSize: pagination.pageSize
        };

        // Apply tab-based filters only
        applyTabFilters(params);

        console.log("Calling API after clearing filters with params:", params);

        // Clear all filter states - do this after preparing params
        setBloodGroupFilter(null);
        setComponentTypeFilter(null);
        setExpirationDateRange(null);
        setSearchText('');
        setFilteredInfo({});
        setSortedInfo({});

        // Explicitly ensure these are undefined in the API call
        params.bloodGroupId = undefined;
        params.componentTypeId = undefined;
        params.expirationStartDate = undefined;
        params.expirationEndDate = undefined;

        // Actually call the API with the cleared filters
        fetchInventories(params);
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
        // Changed to track status separately
        const grouped: Record<string, Record<string, Record<string, {
            quantity: number,
            expiring: boolean,
            expired: boolean,
            actualQuantity: number,
            status: string
        }>>> = {};

        inventories.forEach(inventory => {
            const bloodGroup = inventory.bloodGroupName || 'Unknown';
            const componentType = inventory.componentTypeName || 'Unknown';
            const status = inventory.status || 'Available';

            if (!grouped[bloodGroup]) {
                grouped[bloodGroup] = {};
            }

            if (!grouped[bloodGroup][componentType]) {
                grouped[bloodGroup][componentType] = {};
            }

            if (!grouped[bloodGroup][componentType][status]) {
                grouped[bloodGroup][componentType][status] = {
                    quantity: 0,
                    expiring: false,
                    expired: false,
                    actualQuantity: 0,
                    status: status
                };
            }

            grouped[bloodGroup][componentType][status].quantity += inventory.quantityUnits;

            // Use actual donated quantity if available
            if (inventory.donationEvent?.quantityDonated) {
                grouped[bloodGroup][componentType][status].actualQuantity += inventory.donationEvent.quantityDonated;
            } else {
                // Default to 450ml per unit if not specified
                grouped[bloodGroup][componentType][status].actualQuantity += inventory.quantityUnits * 450;
            }

            // Check if any units are expiring or expired
            if (isExpired(inventory.expirationDate)) {
                grouped[bloodGroup][componentType][status].expired = true;
                if (status.toLowerCase() !== 'used' && status.toLowerCase() !== 'dispatched') {
                    grouped[bloodGroup][componentType][status].status = 'Expired';
                }
            } else if (isExpiringSoon(inventory.expirationDate) && !grouped[bloodGroup][componentType][status].expired) {
                grouped[bloodGroup][componentType][status].expiring = true;
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
            filters: bloodGroups.map(group => ({ text: group.groupName, value: group.id })),
            filteredValue: filteredInfo.bloodGroupName || null,
            onFilter: (value: any, record: BloodInventory) => record.bloodGroupId === value,
        },
        {
            title: 'Component Type',
            dataIndex: 'componentTypeName',
            key: 'componentTypeName',
            render: (text: string) => <Tag color="blue">{text}</Tag>,
            filters: componentTypes.map(type => ({ text: type.name, value: type.id })),
            filteredValue: filteredInfo.componentTypeName || null,
            onFilter: (value: any, record: BloodInventory) => record.componentTypeId === value,
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
                let statusColor = '';
                let statusText = '';

                // First determine the status based on the database status field
                switch (record.status?.toLowerCase()) {
                    case 'available':
                        statusColor = 'green';
                        statusText = 'Available';
                        break;
                    case 'used':
                        statusColor = 'blue';
                        statusText = 'Used';
                        break;
                    case 'dispatched':
                        statusColor = 'purple';
                        statusText = 'Dispatched';
                        break;
                    default:
                        // If status is not one of the above, check expiration
                        if (isExpired(record.expirationDate)) {
                            statusColor = 'red';
                            statusText = 'Expired';
                        } else if (isExpiringSoon(record.expirationDate)) {
                            statusColor = 'orange';
                            statusText = 'Expiring Soon';
                        } else {
                            statusColor = 'green';
                            statusText = 'Available';
                        }
                }

                // Override status display if expired, regardless of database status
                if (isExpired(record.expirationDate) && record.status?.toLowerCase() !== 'used' && record.status?.toLowerCase() !== 'dispatched') {
                    statusColor = 'red';
                    statusText = 'Expired';
                }

                statusTag = <Tag color={statusColor}>{statusText}</Tag>;

                return (
                    <div>
                        {statusTag}
                        <div className="text-xs text-gray-500 mt-1">{record.status}</div>
                    </div>
                );
            },
            filters: [
                { text: 'Available', value: 'Available' },
                { text: 'Used', value: 'Used' },
                { text: 'Dispatched', value: 'Dispatched' },
                { text: 'Expiring Soon', value: 'expiring' },
                { text: 'Expired', value: 'expired' },
            ],
            filteredValue: filteredInfo.status || null,
            onFilter: (value: any, record: BloodInventory) => {
                if (value === 'expired') {
                    return isExpired(record.expirationDate);
                } else if (value === 'expiring') {
                    return isExpiringSoon(record.expirationDate) && !isExpired(record.expirationDate);
                } else if (value === 'Available' || value === 'Used' || value === 'Dispatched') {
                    return record.status === value;
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
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
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
                            title="Available"
                            value={inventorySummary.availableCount}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                    <Card>
                        <Statistic
                            title="Used"
                            value={inventorySummary.usedCount}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                    <Card>
                        <Statistic
                            title="Dispatched"
                            value={inventorySummary.dispatchedCount}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#722ed1' }}
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
                </div>

                {/* Blood visualization */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Blood Inventory Visualization</h3>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex flex-wrap justify-center">
                            {Object.entries(groupedInventories).map(([bloodGroup, components]) => (
                                <div key={bloodGroup} className="m-4">
                                    <div className="flex flex-col">
                                        <div className="text-center font-bold mb-2">{bloodGroup}</div>
                                        <div className="flex">
                                            {Object.entries(components).map(([componentType, statusGroups]) => (
                                                <div key={`${bloodGroup}-${componentType}`} className="mx-2">
                                                    <div className="text-center text-sm mb-1">{componentType}</div>
                                                    <div className="flex">
                                                        {Object.entries(statusGroups).map(([status, data]) => (
                                                            <BloodVialCanvas
                                                                key={`${bloodGroup}-${componentType}-${status}`}
                                                                bloodType={bloodGroup}
                                                                componentType={componentType}
                                                                quantity={data.quantity}
                                                                actualQuantity={data.actualQuantity}
                                                                expiring={data.expiring}
                                                                expired={data.expired}
                                                                status={data.status}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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
                                onChange={handleBloodGroupFilterChange}
                                value={bloodGroupFilter}
                                loading={isLoadingBloodGroups}
                            >
                                {bloodGroups.map(group => (
                                    <Option key={group.id} value={group.id}>{group.groupName}</Option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Component Type</label>
                            <Select
                                style={{ width: 150 }}
                                placeholder="Component Type"
                                allowClear
                                onChange={handleComponentTypeFilterChange}
                                value={componentTypeFilter}
                                loading={isLoadingComponentTypes}
                            >
                                {componentTypes.map(type => (
                                    <Option key={type.id} value={type.id}>{type.name}</Option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                            <RangePicker
                                style={{ width: '100%' }}
                                value={expirationDateRange}
                                onChange={handleDateRangeChange}
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
                    onChange={handleTabChange}
                    className="mb-6"
                    type="card"
                >
                    <TabPane tab="All" key="all" />
                    <TabPane tab="Available" key="available" />
                    <TabPane tab="Used" key="used" />
                    <TabPane tab="Dispatched" key="dispatched" />
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