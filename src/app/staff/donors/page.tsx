'use client';

import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Select, Input, Card, Badge, message } from 'antd';
import { SearchOutlined, UserOutlined, HistoryOutlined } from '@ant-design/icons';
import StaffLayout from '@/components/Layout/StaffLayout';
import dayjs from 'dayjs';
import { usePaginatedDonors } from '@/hooks/api/useDonorProfile';
import { DonorProfile, DonorProfilesQueryParams } from '@/services/api/donorProfileService';
import DonorAppointmentHistory from '@/components/DonorAppointmentHistory';
import DonorProfileDetails from '@/components/DonorProfileDetails';

const { Option } = Select;

export default function StaffDonorsPage() {
  const [searchText, setSearchText] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filteredInfo, setFilteredInfo] = useState<any>({});
  const [sortedInfo, setSortedInfo] = useState<any>({});
  const [queryParams, setQueryParams] = useState<DonorProfilesQueryParams>({
    pageNumber: 1,
    pageSize: 10
  });
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<DonorProfile | null>(null);

  const { donors, isLoading, error, pagination, fetchDonors } = usePaginatedDonors(queryParams);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleTableChange = (paginationConfig: any, filters: any, sorter: any) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);

    const params: DonorProfilesQueryParams = {
      pageNumber: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    };

    // Handle sorting
    if (sorter.field && sorter.order) {
      params.sortBy = sorter.field;
      params.sortDirection = sorter.order === 'ascend' ? 'asc' : 'desc';
    }

    setQueryParams(params);
    fetchDonors(params);
  };

  const handleSearch = () => {
    console.log('Searching with bloodType:', bloodTypeFilter);

    // Create a clean params object
    const params: DonorProfilesQueryParams = {
      pageNumber: 1, // Reset to first page on new search
      pageSize: queryParams.pageSize
    };

    // Add search parameters if they exist
    if (searchText) {
      params.searchTerm = searchText;
    }

    if (bloodTypeFilter) {
      params.bloodGroupName = bloodTypeFilter;
    }

    if (statusFilter) {
      params.isEligible = statusFilter === 'Eligible';
    }

    console.log('Search params:', params);
    setQueryParams(params);
    fetchDonors(params);
  };

  // Auto-search when filter values change
  useEffect(() => {
    if (bloodTypeFilter !== null || statusFilter !== null) {
      console.log('Filter changed to:', { bloodType: bloodTypeFilter, status: statusFilter });
      handleSearch();
    }
  }, [bloodTypeFilter, statusFilter]);

  const clearFilters = () => {
    setFilteredInfo({});
    setBloodTypeFilter(null);
    setStatusFilter(null);
    setSearchText('');

    const params: DonorProfilesQueryParams = {
      pageNumber: 1,
      pageSize: queryParams.pageSize
    };

    console.log('Clearing filters, new params:', params);
    setQueryParams(params);
    fetchDonors(params);
  };

  const formatDate = (dateString: string) => {
    return dateString ? dayjs(dateString).format('YYYY-MM-DD') : '-';
  };

  const showDonorHistory = (donor: DonorProfile) => {
    setSelectedDonor(donor);
    setHistoryModalVisible(true);
  };

  const showDonorProfile = (donor: DonorProfile) => {
    setSelectedDonor(donor);
    setProfileModalVisible(true);
  };

  const columns = [
    {
      title: 'Donor ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => id.substring(0, 8),
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'id' && sortedInfo.order,
    },
    {
      title: 'Name',
      key: 'name',
      render: (text: any, record: DonorProfile) => `${record.firstName || ''} ${record.lastName || ''}`,
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
    },
    {
      title: 'Blood Type',
      dataIndex: 'bloodGroupName',
      key: 'bloodGroupName',
      render: (bloodType: string) => (
        <Tag color="red">{bloodType}</Tag>
      ),
    },
    {
      title: 'Last Donation',
      dataIndex: 'lastDonationDate',
      key: 'lastDonationDate',
      render: (date: string) => formatDate(date),
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'lastDonationDate' && sortedInfo.order,
    },
    {
      title: 'Next Eligible',
      dataIndex: 'nextAvailableDonationDate',
      key: 'nextAvailableDonationDate',
      render: (date: string) => formatDate(date),
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'nextAvailableDonationDate' && sortedInfo.order,
    },
    {
      title: 'Donations',
      dataIndex: 'totalDonations',
      key: 'totalDonations',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'totalDonations' && sortedInfo.order,
      render: (count: number) => (
        <Badge count={count || 0} style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isEligible',
      key: 'isEligible',
      render: (isEligible: boolean) => {
        const status = isEligible ? 'Eligible' : 'Ineligible';
        const color = isEligible ? 'green' : 'volcano';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Emergency',
      dataIndex: 'isAvailableForEmergency',
      key: 'isAvailableForEmergency',
      render: (isAvailable: boolean) => {
        return isAvailable ?
          <Tag color="blue">Available</Tag> :
          <Tag color="default">Unavailable</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: any, record: DonorProfile) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<UserOutlined />}
            onClick={() => showDonorProfile(record)}
          >
            Profile
          </Button>
          <Button
            size="small"
            icon={<HistoryOutlined />}
            onClick={() => showDonorHistory(record)}
          >
            History
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <StaffLayout title="Donors" breadcrumbItems={[{ title: 'Donors' }]}>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Manage Donors</h2>
            <p className="text-gray-500">View and manage all registered donors</p>
          </div>
        </div>

        <Card className="mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
              <Select
                placeholder="Filter by blood type"
                style={{ width: 150 }}
                allowClear
                value={bloodTypeFilter}
                onChange={setBloodTypeFilter}
              >
                <Option value="A+">A+</Option>
                <Option value="A-">A-</Option>
                <Option value="B+">B+</Option>
                <Option value="B-">B-</Option>
                <Option value="AB+">AB+</Option>
                <Option value="AB-">AB-</Option>
                <Option value="O+">O+</Option>
                <Option value="O-">O-</Option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select
                placeholder="Filter by status"
                style={{ width: 150 }}
                allowClear
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Option value="Eligible">Eligible</Option>
                <Option value="Ineligible">Ineligible</Option>
              </Select>
            </div>
            {/* <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                placeholder="Search by name or donor ID"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={handleSearch}
              />
            </div>
            <div className="self-end flex gap-2">
              <Button onClick={handleSearch} type="primary">Search</Button>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div> */}
          </div>
        </Card>

        <Table
          columns={columns}
          dataSource={donors}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
        />

        {selectedDonor && (
          <>
            <DonorAppointmentHistory
              visible={historyModalVisible}
              onClose={() => setHistoryModalVisible(false)}
              donorId={selectedDonor.id}
              donorName={`${selectedDonor.firstName || ''} ${selectedDonor.lastName || ''}`}
            />

            <DonorProfileDetails
              visible={profileModalVisible}
              onClose={() => setProfileModalVisible(false)}
              donor={selectedDonor}
            />
          </>
        )}
      </div>
    </StaffLayout>
  );
} 